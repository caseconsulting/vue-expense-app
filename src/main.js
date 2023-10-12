import Vue from 'vue';
import router from './router';
import store from '../store';

import vuetify from './vuetify';

import(/* webpackMode: "eager" */ 'vuetify/dist/vuetify.min.css');

import App from './App.vue';

window.EventBus = new Vue();
new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App)
}).$mount('#app');
