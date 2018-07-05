<template>
<v-container class="text-md-center">
  <div>
    <img src="../assets/img/logo-banner.gif" alt="">
    <h1 class="my-4">€xpense Portal</h1>
  </div>
  <v-btn @click="login()" id="custom-button-color" large>Login</v-btn>
  <div>
    <h2 class="mt-5 red--text">Invalid Login<br />Please Use @consultwithcase email address</h2>
  </div>
</v-container>
</template>

<script>
import { isLoggedIn, login } from '@/utils/auth';

export default {
  created() {
    if (this.isLoggedIn()) {
      this.$router.push('home');
    }
  },
  methods: {
    login() {
      login();
    },
    isLoggedIn() {
      return isLoggedIn();
    }
  },
  props: {
    failure: Boolean
  }
};
</script>
<style>
#custom-button-color {
  background-color: #68CAA6;
}
</style>
