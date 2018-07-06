import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
Vue.config.productionTip = false;

//Vuetify
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
Vue.use(Vuetify,{
    theme: {
      primary: "#68caa6"
    }
});
//Moment
import moment from 'moment';

Vue.prototype.moment = moment;

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
import 'vue-awesome/icons/space-shuttle';
import 'vue-awesome/icons/user-astronaut';
import Icon from 'vue-awesome/components/Icon';

Vue.component('icon', Icon);
// END VUE AWESOME
window.EventBus = new Vue();

new Vue({
  router,
  store,
  moment,
  render: h => h(App)
}).$mount('#app');
