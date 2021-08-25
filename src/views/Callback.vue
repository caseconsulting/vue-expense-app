<script>
import { setIdToken, setAccessToken, setRole, setProfile } from '@/utils/auth';

/**
 * mounted lifecycle hook
 */
function mounted() {
  this.$nextTick(async function () {
    try {
      setAccessToken();
      setIdToken();
      setProfile();
      await setRole();
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
  name: 'callback'
};
</script>
