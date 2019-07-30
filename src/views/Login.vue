<template>
  <v-container class="text-md-center">
    <div style="text-align: center;">
      <img class="case_logo" src="../assets/img/logo-banner.gif" alt="" />
      <h1 class="my-4"><span class="login_e">€</span>xpense Portal</h1>
      <v-btn @click="login()" id="custom-button-color" class="reimburse_button" large>Login</v-btn>
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
  }
};
</script>
<style>
#custom-button-color {
  /* background-color: #68caa6; */
  background-color: red;
}

@media only screen and (max-width: 767px) {
  .case_logo {
    width: 80%;
  }
}
</style>
