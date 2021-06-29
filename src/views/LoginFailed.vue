<template>
  <v-container class="text-md-center">
    <div>
      <img src="../assets/img/logo-banner.gif" alt="" />
      <h1 class="my-4">Case Portal</h1>
    </div>
    <v-btn @click="login()" id="custom-button-color" large>Login</v-btn>
    <div>
      <h2 class="mt-5 red--text">
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
import { isLoggedIn, login, getRole } from '@/utils/auth';
import api from '../shared/api';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
const format1 = "YYYY-MM-DD HH:mm:ss"

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
    recordLogin();
    // logged in
    if (getRole() === 'admin') {
      // user's role is admin
      this.$router.push('reimbursements');
    } else {
      // user's role is not admin
      this.$router.push('home');
    }
  }
}

async function recordLogin() {
  let employee = await api.getUser();
  employee.lastLogin = moment(new Date()).format(format1);
  await api.updateItem(api.EMPLOYEES, employee);
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
    isLoggedIn,
    recordLogin
  }
};
</script>

<style>
#custom-button-color {
  background-color: #68caa6;
}
</style>
