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
app.mount('#app');
