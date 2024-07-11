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
        <v-btn id="custom-button-color" @click="login()" class="px-4 reimburse_button" elevation="1" size="large">
          Login
        </v-btn>
      </v-col>

      <v-col v-if="isTimedOut()" cols="12">
        <v-alert class="session-expired-alert" text="Session expired. Please login again." type="warning"></v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { isLoggedIn, login, isTimedOut } from '@/utils/auth';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const router = useRouter();

// Route to home page on log in.
let path = decodeURIComponent(window.location.search).split('=/')[1];
path = path ? path : 'home';
localStorage.setItem('redirectUrl', path);
if (isLoggedIn()) {
  router.push(path);
}
</script>

<style>
#custom-button-color {
  /* background-color: #68caa6; */
  background-color: red;
}

.session-expired-alert {
  text-align: center;
  justify-content: center;
  font-weight: bold;
}

@media only screen and (max-width: 767px) {
  .case_logo {
    width: 80%;
  }
}
</style>
