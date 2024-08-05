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

const errorHandler = function (error, vueObj, place) {
  console.log('hello');
  // this creates an audit on every error that reaches the console
  let stage = location.hostname === 'localhost' ? 'localhost' : /:\/\/([^/]+)/.exec(window.location.href)[1];
  let page = vueObj.$.type.__file;
  console.log(`Caught error in ${stage}:/${page}:${place}:`);
  console.error(error);
  // api.createItem(api.AUDIT, {
  //   type: 'ERROR',
  //   employeeId: userId.value,
  //   supplemental: {
  //     page: url,
  //     lineNumber: line,
  //     message: error,
  //     environment: stage
  //   }
  // });
};

const app = createApp(App).use(router).use(store).use(vuetify);
app.component('UserAvatar', UserAvatar);
app.provide('emitter', emitter);
app.config.globalProperties.emitter = emitter;
app.config.globalProperties.caseRed = '#bc3825';
app.config.globalProperties.caseGray = '#415364';
const oldErrorHandler = app.config.errorHandler;
app.config.errorHandler = (e, v, p) => {
  if (oldErrorHandler) oldErrorHandler(e, v, p);
  errorHandler(e, v, p);
};
app.mount('#app');
