/* globals process */
const AUTH_CONFIG = {
  audience: process.env.VUE_APP_AUTH0_AUDIENCE || '{AUDIENCE}',
  clientId: process.env.VUE_APP_AUTH0_CLIENT_ID || '{CLIENT_ID}',
  domain: process.env.VUE_APP_AUTH0_DOMAIN || '{DOMAIN}',
  callbackUrl: `${process.env.VUE_APP_AUTH0_CALLBACK}/callback` || '{CALLBACK}',
  apiUrl: process.env.VUE_APP_AUTH0_API_ID || '{API_IDENTIFIER}'
};
export { AUTH_CONFIG };
