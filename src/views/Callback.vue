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
      await this.setRole();
      window.location.href = '/loginFailed';
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
