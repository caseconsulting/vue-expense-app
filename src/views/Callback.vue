<script>
import { setIdToken, setAccessToken, setRole, setProfile } from '@/utils/auth';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  mounted() {
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
  },
  name: 'callback'
};
</script>
