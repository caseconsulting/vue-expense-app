<template>
  <v-container class="text-md-center">
    <div style="text-align: center">
      <img id="caseLogo" class="case_logo" src="../assets/img/logo-banner.gif" alt="" />
      <h1 class="my-4">Case Portal</h1>
      <v-btn @click="login()" id="custom-button-color" class="reimburse_button" elevation="1" large>Login</v-btn>
    </div>
  </v-container>
</template>

<script>
import { isLoggedIn, login } from '@/utils/auth';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Route to home page on log in.
 */
async function created() {
  if (this.isLoggedIn()) {
    this.$router.push('home');
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  methods: {
    login,
    isLoggedIn
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
