/* globals process */
export const API_CONFIG = {
  apiHostname: process.env.API_HOSTNAME || '{localhost}:',
  apiPort: process.env.API_PORT || 3005
};
