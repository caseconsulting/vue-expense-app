import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

//vuetify
import Vuetify from 'vuetify';
Vue.use(Vuetify);
import 'vuetify/dist/vuetify.min.css';

//Vuesax
// import Vuesax from 'vuesax';
// import 'vuesax/dist/vuesax.css'; //vuesax styles
import 'vuetify/dist/vuetify.min.css'; // Ensure you are using css-loader

// Vue.use(Vuesax);
Vue.use(Vuetify);

Vue.config.productionTip = false;

// BEGIN VUE AWESOME
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

import Icon from 'vue-awesome/components/Icon';

Vue.component('icon', Icon);
// END VUE AWESOME

import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
