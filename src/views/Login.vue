<template>
  <v-container class="text-md-center">
    <v-row justify="center">
      <v-col align="center" cols="12" class="pb-0">
        <img id="caseLogo" class="case_logo" width="419" src="../assets/img/logo-banner.gif" alt="" />
      </v-col>
      <v-col align="center" cols="12">
        <h1 class="my-4">CASE Portal</h1>
      </v-col>
      <v-col align="center" cols="12">
        <v-btn @click="login()" id="custom-button-color" class="reimburse_button" elevation="1" size="large"
          >Login</v-btn
        >
      </v-col>
    </v-row>
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
function created() {
  let path = decodeURIComponent(window.location.search).split('=/')[1];
  path = path ? path : 'home';
  localStorage.setItem('redirectUrl', path);
  if (this.isLoggedIn()) {
    this.$router.push(path);
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
