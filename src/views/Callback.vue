<template>
  <div id="preloader">
    <div id="loader">
      <!-- Leave empty div/template so no "mounted" error is thrown in the console -->
    </div>
  </div>
</template>

<script setup>
import { setIdToken, setAccessToken, setRole, setProfile } from '@/utils/auth';
import api from '@/shared/api';
import { getTodaysDate } from '../shared/dateUtils';
import { onMounted } from 'vue';
const login_format = 'MMM Do, YYYY HH:mm:ss';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
onMounted(() => {
  this.$nextTick(async function () {
    try {
      // set tokens
      setAccessToken();
      setIdToken();
      setProfile();
      let user = await api.getUser();
      let employeeRole = user.employeeRole;
      setRole(employeeRole);
      // passes this local storage information to App.vue to avoid
      // loading the data again when the page switches to the admin/user view
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('lastLogin', getTodaysDate(login_format));

      window.location.href = localStorage.getItem('redirectUrl');
    } catch (error) {
      window.location.href = '/loginFailed';
    }
  });
}); //mounted
</script>

<style scoped>
body {
  background-color: white;
}
#preloader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
#loader {
  display: block;
  position: relative;
  left: 50%;
  top: 50%;
  width: 150px;
  height: 150px;
  margin: -75px 0 0 -75px;
  border-radius: 50%;
  border: 10px solid transparent;
  border-top-color: #bc3825;
  -webkit-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;
}
#loader:before {
  content: '';
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border-radius: 50%;
  border: 9px solid transparent;
  border-top-color: #415364;
  -webkit-animation: spin 3s linear infinite;
  animation: spin 3s linear infinite;
}
#loader:after {
  content: '';
  position: absolute;
  top: 18px;
  left: 18px;
  right: 18px;
  bottom: 18px;
  border-radius: 50%;
  border: 8px solid transparent;
  border-top-color: #ccc;
  -webkit-animation: spin 1.5s linear infinite;
  animation: spin 1.5s linear infinite;
}
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
