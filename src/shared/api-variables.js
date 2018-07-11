/* globals process */
export const API_CONFIG = {
  apiHostname: process.env.VUE_APP_API_HOSTNAME || 'http://localhost:',
  apiPort: process.env.VUE_APP_API_PORT || 3000
};
