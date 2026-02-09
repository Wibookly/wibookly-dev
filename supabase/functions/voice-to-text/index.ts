import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as jose from "https://deno.land/x/jose@v5.2.2/index.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Cognito configuration ────────────────────────────────────────────────
const COGNITO_USER_POOL_ID = "us-west-2_mALN2509g"
const COGNITO_CLIENT_ID = "3k0v6stp6l5abmgsg6ja5rcauo"
const COGNITO_REGION = "us-west-2"
const COGNITO_ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`
const COGNITO_JWKS_URL = `${COGNITO_ISSUER}/.well-known/jwks.json`

// Cache JWKS to avoid refetching on every request
let cachedJWKS: jose.JSONWebKeySet | null = null
let jwksCachedAt = 0
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

async function getJWKS(): Promise<jose.JSONWebKeySet> {
  const now = Date.now()
  if (cachedJWKS && now - jwksCachedAt < JWKS_CACHE_TTL_MS) {
    return cachedJWKS
  }
  const response = await fetch(COGNITO_JWKS_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status}`)
  }
  cachedJWKS = await response.json()
  jwksCachedAt = now
  return cachedJWKS!
}

/**
 * Verify a Cognito ID token cryptographically:
 * 1. Fetch the JWKS from Cognito.
 * 2. Find the matching key by `kid`.
 * 3. Verify signature, expiration, issuer, audience, and token_use.
 */
async function verifyCognitoIdToken(idToken: string): Promise<Record<string, unknown>> {
  const jwks = await getJWKS()

  const header = jose.decodeProtectedHeader(idToken)
  const kid = header.kid
  if (!kid) {
    throw new Error("ID token header missing 'kid'")
  }

  const key = jwks.keys.find((k: Record<string, unknown>) => k.kid === kid)
  if (!key) {
    throw new Error(`No matching key found in JWKS for kid: ${kid}`)
  }

  const publicKey = await jose.importJWK(key as jose.JWK, header.alg as string)

  const { payload } = await jose.jwtVerify(publicKey instanceof Uint8Array ? publicKey : publicKey, publicKey, {
    issuer: COGNITO_ISSUER,
    audience: COGNITO_CLIENT_ID,
  })

  if (payload.token_use !== "id") {
    throw new Error(`Invalid token_use: expected 'id', got '${payload.token_use}'`)
  }

  if (!payload.email) {
    throw new Error("ID token missing 'email' claim")
  }

  return payload as Record<string, unknown>
}

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Authenticate via Cognito ID token ─────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const idToken = authHeader.replace('Bearer ', '')
    let claims: Record<string, unknown>
    try {
      claims = await verifyCognitoIdToken(idToken)
    } catch (verifyError) {
      console.error('Cognito JWT verification failed:', verifyError)
      const msg = verifyError instanceof Error ? verifyError.message : 'Token verification failed'
      return new Response(
        JSON.stringify({ error: `Unauthorized: ${msg}` }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claims.sub as string
    console.log(`Voice-to-text request from user: ${userId} (${claims.email})`)

    // ── Process audio ─────────────────────────────────────────────────
    const { audio } = await req.json()
    
    if (!audio) {
      throw new Error('No audio data provided')
    }

    const binaryAudio = processBase64Chunks(audio)
    
    const formData = new FormData()
    const blob = new Blob([new Uint8Array(binaryAudio).buffer as ArrayBuffer], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${errorText}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Voice-to-text error:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
