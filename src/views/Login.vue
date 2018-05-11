<template>
  <div>
    <h1>Login</h1>
    <b-row v-show="!isLoggedIn()" class="mt-3">
      You must Login to use the Expense App.
    </b-row>
  </div>
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
