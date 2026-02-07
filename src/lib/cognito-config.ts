/**
 * AWS Cognito OAuth 2.0 configuration.
 *
 * These are all PUBLIC values (no secrets).
 * The PKCE flow does not require a client secret on the frontend.
 */
export const COGNITO_CONFIG = {
  /** Full Cognito hosted-UI domain */
  domain: 'https://webookly-auth-dev.auth.us-west-2.amazoncognito.com',

  /** Cognito App Client ID (public) */
  clientId: '26l038en94nlshm9rfmmel21no',

  /** OAuth scopes */
  scopes: 'openid email profile',

  /** AWS region */
  region: 'us-west-2',

  /** Callback URL – must match what is registered in Cognito */
  get redirectUri() {
    return `${window.location.origin}/auth/callback`;
  },

  /** Where Cognito redirects after logout */
  get logoutUri() {
    return `${window.location.origin}/`;
  },

  /**
   * Identity provider names as configured in your Cognito User Pool.
   *
   * - Google is a built-in social provider → name is always "Google".
   * - Microsoft Entra ID is added as an OIDC provider → name must
   *   match exactly what you entered when creating the provider in
   *   the Cognito console.
   *
   * If "Continue with Microsoft" doesn't redirect correctly, update
   * the `microsoft` value below to match your Cognito OIDC provider name.
   */
  identityProviders: {
    google: 'Google',
    microsoft: 'MicrosoftEntraID',
  },

  /** OAuth endpoints (derived from domain) */
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
