/* globals process */
const AUTH_CONFIG = {
  clientId: process.env.AUTH0_CLIENT_ID || '{CLIENT_ID}',
  domain: process.env.AUTH0_DOMAIN || '{DOMAIN}',
  callbackUrl: `${process.env.AUTH0_CALLBACK}/callback` || '{CALLBACK}',
  apiUrl: process.env.AUTH0_API_ID || '{API_IDENTIFIER}'
};
export { AUTH_CONFIG };
