<template>
  <v-container class="text-md-center">
    <div>
      <img width="419" height="160" src="../assets/img/logo-banner.gif" alt="" />
      <h1 class="my-4">CASE Portal</h1>
    </div>
    <v-btn id="custom-button-color" @click="login()" size="large"> Login </v-btn>
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

<script setup>
import { isLoggedIn, login } from '@/utils/auth';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const router = useRouter();

// Route to home page on log in.
if (isLoggedIn()) {
  router.push('home');
}
</script>

<style>
#custom-button-color {
  background-color: #68caa6;
}
</style>
