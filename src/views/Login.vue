<template>
<v-container class="text-md-center">
  <v-btn @click="login()" id="custom-button-color" large>Login</v-btn>
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
  }
};
</script>
<style>
#custom-button-color {
  background-color: #68CAA6;
}
</style>
