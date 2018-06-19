<template>
<v-container class="text-md-center">

  <div class="text-center">
    <h1 id="main-header" class="text-center"><span class="e">€</span>xpense App</h1>
    <v-btn @click="login()" id="custom-button-color" large>Login</v-btn>
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
#main-header {
  font-family: 'Quicksand', sans-serif;
  font-weight: bold;
  font-size: 48px;
  color: #38424D;
  padding-top: 1%;
  padding-bottom: 2%;
}

.e {
  color: #68CAA6;
}

#custom-button-color {
  background-color: #68CAA6;
}
</style>
