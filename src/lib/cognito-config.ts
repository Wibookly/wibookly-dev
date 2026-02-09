/**
 * AWS Cognito OAuth 2.0 configuration.
 *
 * These are all PUBLIC values (no secrets).
 * The PKCE flow does not require a client secret on the frontend.
 */
export const COGNITO_CONFIG = {
  /** Full Cognito custom domain (Managed Login) */
  domain: 'https://auth.wibookly.ai',

  /** Cognito App Client ID (public SPA client, no secret) */
  clientId: '3k0v6stp6l5abmgsg6ja5rcauo',

  /** Cognito User Pool ID */
  userPoolId: 'us-west-2_mALN2509g',

  /** OAuth scopes */
  scopes: 'openid email profile',

  /** AWS region */
  region: 'us-west-2',

  /** Callback URL – must match exactly what is registered in Cognito */
  redirectUri: 'https://app.wibookly.ai/auth/callback',

  /** Where Cognito redirects after logout */
  logoutUri: 'https://app.wibookly.ai/',

  /**
   * Identity provider names as configured in Cognito User Pool.
   * Phase 1: Google only.
   */
  identityProviders: {
    google: 'Google',
  },

  /** OAuth endpoints (derived from custom domain) */
  get authorizeEndpoint() {
    return `${this.domain}/oauth2/authorize`;
  },
  get tokenEndpoint() {
    return `${this.domain}/oauth2/token`;
  },
  get logoutEndpoint() {
    return `${this.domain}/logout`;
  },
} as const;
