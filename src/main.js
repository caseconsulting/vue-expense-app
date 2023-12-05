import { createApp } from 'vue';
import router from './router';
import store from '../store';
import mitt from 'mitt';
import vuetify from './vuetify';

import(/* webpackMode: "eager" */ 'vuetify/dist/vuetify.min.css');

// global custom components
import UserAvatar from '@/components/shared/UserAvatar';

import App from './App.vue';

const emitter = mitt();
const app = createApp(App).use(router).use(store).use(vuetify);
app.component('UserAvatar', UserAvatar);
window.emitter = emitter;
app.config.globalProperties.emitter = emitter;
app.config.globalProperties.caseRed = '#bc3825';
app.config.globalProperties.caseGray = '#415364';
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
