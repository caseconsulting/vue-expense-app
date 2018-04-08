export const AUTH_CONFIG = {
    clientId: process.env.VUE_APP_AUTH0_CLIENT_ID || '{CLIENT_ID}',
    domain: process.env.VUE_APP_AUTH0_DOMAIN || '{DOMAIN}',
    callbackUrl: process.env.VUE_APP_HOSTNAME + '#/callback' || 'http://localhost:4200/#/callback',
    apiUrl: process.env.VUE_APP_AUTH0_API_ID || '{API_IDENTIFIER}'
}
