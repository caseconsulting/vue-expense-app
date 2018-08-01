<template>
</template>

<script>
import { setIdToken, setAccessToken, setRole, setProfile } from '@/utils/auth';
// import api from '@/shared/api';

export default {
  name: 'callback',
  mounted() {
    this.$nextTick(async function() {
      setAccessToken();
      setIdToken();
      setProfile();
      await setRole();
      // let role = await api.getRole();
      // setRole(role);
      window.location.href = '/loginFailed';
    });
  }
};
</script>

<style scoped lang="scss">
</style>
