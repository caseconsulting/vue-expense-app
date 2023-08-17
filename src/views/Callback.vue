<template>
  <div>
    <!-- Leave empty div/template so no "mounted" error is thrown in the console -->
  </div>
</template>

<script>
import { setIdToken, setAccessToken, setRole, setProfile } from '@/utils/auth';
import api from '@/shared/api';
import { getTodaysDate } from '../shared/dateUtils';
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
      let user = await api.getUser();
      let employeeRole = user.employeeRole;
      this.setRole(employeeRole);
      // passes this local storage information to App.vue to avoid
      // loading the data again when the page switches to the admin/user view
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('lastLogin', getTodaysDate(login_format));

      window.location.href = localStorage.getItem('redirectUrl');
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
