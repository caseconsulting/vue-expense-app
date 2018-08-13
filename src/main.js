import Vue from 'vue';
import router from './router';
import store from './store';

//Moment
import moment from 'moment';
//Vuetify
import Vuetify from 'vuetify';
// import 'vuetify/dist/vuetify.min.css';
import(/* webpackMode: "eager" */ 'vuetify/dist/vuetify.min.css');
// BEGIN VUE AWESOME
import 'vue-awesome/icons/regular/times-circle';
import 'vue-awesome/icons/regular/check-circle';
import 'vue-awesome/icons/question-circle';
import 'vue-awesome/icons/book';
import 'vue-awesome/icons/code';
import 'vue-awesome/icons/dollar-sign';
import 'vue-awesome/icons/life-ring';
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
import Icon from 'vue-awesome/components/Icon';
import App from './App.vue';
Vue.use(Vuetify, {
  theme: {
    primary: '#68caa6',
    radioactive: '#0ACF23'
  }
});

Vue.prototype.moment = moment;
Vue.component('icon', Icon);
window.EventBus = new Vue();
new Vue({
  router,
  store,
  moment,
  render: h => h(App)
}).$mount('#app');
