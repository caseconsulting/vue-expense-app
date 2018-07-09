/* globals process */
export const API_CONFIG = {
  appHostname: process.env.APP_HOSTNAME || 'http://localhost:',
  expressPort: process.env.EXPRESS_PORT || '3005'
};
