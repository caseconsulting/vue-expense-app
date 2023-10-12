<template>
  <v-container class="text-md-center">
    <div>
      <img width="419" height="160" src="../assets/img/logo-banner.gif" alt="" />
      <h1 class="my-4">CASE Portal</h1>
    </div>
    <v-btn @click="login()" id="custom-button-color" size="large">Login</v-btn>
    <div>
      <h2 class="mt-5 text-red">
        Invalid Login - Email not registered with an employee<br />Use @consultwithcase email address or contact your
        administrator
      </h2>
    </div>
    <div>
      <img src="https://media.giphy.com/media/3ohzdQ1IynzclJldUQ/giphy.gif" />
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
function created() {
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
    isLoggedIn,
    login
  }
};
</script>

<style>
#custom-button-color {
  background-color: #68caa6;
}
</style>
