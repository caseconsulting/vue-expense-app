import { createApp } from 'vue';
import router from './router';
import store from '../store';
import mitt from 'mitt';
import vuetify from './vuetify';

import(/* webpackMode: "eager" */ 'vuetify/dist/vuetify.min.css');

import App from './App.vue';

const emitter = mitt();
const app = createApp(App).use(router).use(store).use(vuetify);
window.emitter = emitter;
app.config.globalProperties.emitter = emitter;
// TEMPORARY FIX TO THIS ISSUE
window.addEventListener('error', (e) => {
  if (e.message.includes("Cannot read properties of undefined (reading 'includes')")) {
    const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
    const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
    if (resizeObserverErr) {
      resizeObserverErr.setAttribute('style', 'display: none');
    }
    if (resizeObserverErrDiv) {
      resizeObserverErrDiv.setAttribute('style', 'display: none');
    }
  }
});
app.mount('#app');
