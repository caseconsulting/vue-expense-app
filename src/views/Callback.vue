<template>
  <div>
    <!-- Leave empty div/template so no "mounted" error is thrown in the console -->
  </div>
</template>

<script>
import { setIdToken, setAccessToken, setRole, setProfile } from '@/utils/auth';
const login_format = 'MMM Do, YYYY HH:mm:ss';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
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
      localStorage.setItem('lastLogin', moment(new Date()).format(login_format));

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
