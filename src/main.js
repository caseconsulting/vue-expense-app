import { createApp } from 'vue';
import router from './router';
import store from '../store';
import mitt from 'mitt';
import vuetify from './vuetify';

import(/* webpackMode: "eager" */ 'vuetify/dist/vuetify.min.css');

import App from './App.vue';

const app = createApp(App).use(router).use(store).use(vuetify);
app.config.globalProperties.emitter = mitt();
app.mount('#app');
