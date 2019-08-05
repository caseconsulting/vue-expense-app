<script>
import { setIdToken, setAccessToken, setRole, setProfile } from '@/utils/auth';

export default {
  name: 'callback',
  mounted() {
    this.$nextTick(async function() {
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
  }
};
</script>

<style scoped lang="scss"></style>
