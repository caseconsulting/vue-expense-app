import Vue from 'vue';
import router from './router';
import store from '../store';

const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import vuetify from './vuetify';

import(/* webpackMode: "eager" */ 'vuetify/dist/vuetify.min.css');

import App from './App.vue';
import Vue2Filters from 'vue2-filters';

Vue.use(Vue2Filters);

Vue.prototype.moment = moment;
window.EventBus = new Vue();
new Vue({
  router,
  store,
  moment,
  vuetify,
  render: (h) => h(App)
}).$mount('#app');
