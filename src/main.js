import Vue from 'vue';
import router from './router';
import store from './store';

import moment from 'moment';
import vuetify from './vuetify';

import(/* webpackMode: "eager" */ 'vuetify/dist/vuetify.min.css');

// BEGIN VUE AWESOME
import 'vue-awesome/icons/regular/times-circle';
import 'vue-awesome/icons/regular/check-circle';
import 'vue-awesome/icons/question-circle';
import 'vue-awesome/icons/book';
import 'vue-awesome/icons/code';
import 'vue-awesome/icons/dollar-sign';
import 'vue-awesome/icons/life-ring';
import 'vue-awesome/icons/fire';
import 'vue-awesome/icons/sign-in-alt';
import 'vue-awesome/icons/sign-out-alt';
import 'vue-awesome/icons/users';
import 'vue-awesome/icons/desktop';
import 'vue-awesome/icons/save';
import 'vue-awesome/icons/trash';
import 'vue-awesome/icons/ban';
import 'vue-awesome/icons/bars';
import 'vue-awesome/icons/space-shuttle';
import 'vue-awesome/icons/user-astronaut';
import 'vue-awesome/icons/hand-holding-usd';
import 'vue-awesome/icons/cloud-download-alt';
import 'vue-awesome/icons/times-circle';
import 'vue-awesome/icons/edit';
import 'vue-awesome/icons/sticky-note';
import 'vue-awesome/icons/crosshairs';
import 'vue-awesome/icons/clock';
import 'vue-awesome/icons/regular/clock';
import 'vue-awesome/icons/regular/stop-circle';
import 'vue-awesome/icons/home';
import 'vue-awesome/icons/brands/twitter';
import 'vue-awesome/icons/brands/github';
import 'vue-awesome/icons/brands/linkedin';
import 'vue-awesome/icons/brands/youtube';
import 'vue-awesome/icons/brands/facebook';
import 'vue-awesome/icons/user-plus';
import 'vue-awesome/icons/glass-cheers';
import 'vue-awesome/icons/birthday-cake';
import 'vue-awesome/icons/dollar-sign';

import Icon from 'vue-awesome/components/Icon';
import App from './App.vue';
import Vue2Filters from 'vue2-filters';
// Vue.use(Vuetify, {
//   theme: {
//     primary: '#68caa6',
//     radioactive: '#0ACF23'
//   }
// });
Vue.use(Vue2Filters);
Vue.prototype.moment = moment;
Vue.component('icon', Icon);
window.EventBus = new Vue();
new Vue({
  router,
  store,
  moment,
  vuetify,
  render: (h) => h(App)
}).$mount('#app');
