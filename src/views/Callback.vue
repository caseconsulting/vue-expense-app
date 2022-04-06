<template>
  <div>
    <!-- Leave empty div/template so no "mounted" error is thrown in the console -->
  </div>
</template>

<script>
import { setIdToken, setAccessToken, setRole, setProfile } from '@/utils/auth';
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
 * mounted lifecycle hook
 */
function mounted() {
  this.$nextTick(async function () {
    try {
      // set tokens
      this.setAccessToken();
      this.setIdToken();
      this.setProfile();
      let employeeRole = await this.setRole();

      // login
      let employee = this.$store.getters.user;
      employee.lastLogin = moment(new Date()).format(login_format);
      await api.updateItem(api.EMPLOYEES, employee);
      // Create an audit of the success
      await api.createItem(api.AUDIT, {
        id: uuid(),
        type: 'login',
        tags: ['account'],
        employeeId: employee.id,
        description: `${employee.firstName} ${employee.lastName} has logged in`,
        timeToLive: 60
      });

      if (employeeRole === 'admin') {
        // user's role is admin
        window.location.href = '/reimbursements';
      } else {
        // user's role is not admin
        window.location.href = '/';
      }
    } catch (error) {
      window.location.href = '/loginFailed';
    }
  });
} //mounted

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  mounted,
  methods: {
    setAccessToken,
    setIdToken,
    setProfile,
    setRole
  },
  name: 'callback'
};
</script>
