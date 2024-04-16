export const AUTH_CONFIG = {
  audience: import.meta.env.VITE_AUTH0_AUDIENCE || '{AUDIENCE}',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '{CLIENT_ID}',
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '{DOMAIN}',
  callbackUrl: `${import.meta.env.VITE_AUTH0_CALLBACK}/callback` || '{CALLBACK}',
  apiUrl: import.meta.env.VITE_AUTH0_API_ID || '{API_IDENTIFIER}'
};
export default { AUTH_CONFIG };
