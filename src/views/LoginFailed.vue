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
import { v4 as uuid } from 'uuid';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
const login_format = 'MMM Do, YYYY HH:mm:ss';

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
      this.$router.push('reimbursements');
    } else {
      // user's role is not admin
      this.$router.push('home');
    }
    await this.recordLogin();
  }
}

async function recordLogin() {
  let employee = await api.getUser();
  employee.lastLogin = moment(new Date()).format(login_format);
  await api.updateItem(api.EMPLOYEES, employee);
  // Create an audit of the success
  api.createItem(api.AUDIT, {
    id: uuid(),
    type: 'login',
    tags: ['account'],
    employeeId: employee.id,
    description: `${employee.firstName} ${employee.lastName} has logged in`,
    timeToLive: 60
  });
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
