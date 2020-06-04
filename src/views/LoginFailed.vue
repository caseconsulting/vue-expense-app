<template>
  <v-container class="text-md-center">
    <div>
      <img src="../assets/img/logo-banner.gif" alt="" />
      <h1 class="my-4"><span class="e">€</span>xpense Portal</h1>
    </div>
    <v-btn @click="login()" id="custom-button-color" large>Login</v-btn>
    <div>
      <h2 class="mt-5 red--text">Invalid Login<br />Please Use @consultwithcase email address</h2>
    </div>
    <div>
      <img src="https://media.giphy.com/media/3ohzdQ1IynzclJldUQ/giphy.gif" />
    </div>
  </v-container>
</template>

<script>
import { isLoggedIn, login, getRole } from '@/utils/auth';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Route to admin page if user role is admin, otherwise route to home page
 */
async function created() {
  if (this.isLoggedIn()) {
    // logged in
    if (getRole() === 'admin') {
      // user's role is admin
      this.$router.push('admin-dashboard');
    } else {
      // user's role is not admin
      this.$router.push('home');
    }
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
  background-color: #68caa6;
}
</style>
