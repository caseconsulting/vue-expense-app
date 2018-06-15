import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

//Vue Bootstrap
import BootstrapVue from 'bootstrap-vue';

//Vuetify
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

//Vuesax
import Vuesax from 'vuesax';
import 'vuesax/dist/vuesax.css'; //vuesax styles

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

Vue.use(BootstrapVue);
Vue.use(Vuesax);
Vue.use(Vuetify);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
