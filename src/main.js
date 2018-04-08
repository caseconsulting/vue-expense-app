import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

import 'vue-awesome/icons/book'
import 'vue-awesome/icons/users'
import 'vue-awesome/icons/dollar-sign'
import 'vue-awesome/icons/question'

import Icon from 'vue-awesome/components/Icon'

Vue.component('icon', Icon)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
