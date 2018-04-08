export const AUTH_CONFIG = {
    clientId: process.env.AUTH0_CLIENT_ID || '{CLIENT_ID}',
    domain: process.env.AUTH0_DOMAIN || '{DOMAIN}',
    callbackUrl: process.env.C9_HOSTNAME ? 'http://localhost:8080/callback' : 'http://localhost:3000/callback',
    apiUrl: process.env.AUTH0_API_ID || '{API_IDENTIFIER}'
}
