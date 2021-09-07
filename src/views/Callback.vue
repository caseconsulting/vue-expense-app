<script>
import { setIdToken, setAccessToken, setRole, setProfile } from '@/utils/auth';

/**
 * mounted lifecycle hook
 */
function mounted() {
  this.$nextTick(async function () {
    try {
      this.setAccessToken();
      this.setIdToken();
      this.setProfile();
      let employeeRole = await this.setRole();

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
