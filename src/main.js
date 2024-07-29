import { createApp } from 'vue';
import router from './router';
import store from '../store';
import mitt from 'mitt';
import vuetify from './vuetify';

import(/* webpackMode: "eager" */ 'vuetify/dist/vuetify.min.css');

// global custom components
import UserAvatar from '@/components/shared/UserAvatar';

import App from './App.vue';

export const emitter = mitt();

const app = createApp(App).use(router).use(store).use(vuetify);
app.component('UserAvatar', UserAvatar);
app.provide('emitter', emitter);
app.config.globalProperties.emitter = emitter;
app.config.globalProperties.caseRed = '#bc3825';
app.config.globalProperties.caseGray = '#415364';
app.mount('#app');
