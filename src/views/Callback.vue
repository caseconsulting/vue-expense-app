<template>
</template>

<script>
import { setIdToken, setAccessToken, setRole } from '@/utils/auth';
// import api from '@/shared/api';

export default {
  name: 'callback',
  mounted() {
    this.$nextTick(async function() {
      setAccessToken();
      setIdToken();
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
