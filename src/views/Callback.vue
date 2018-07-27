<template>
</template>

<script>
import { setIdToken, setAccessToken, setRole } from '@/utils/auth';

export default {
  name: 'callback',
  mounted() {
    this.$nextTick(() => {
      setAccessToken();
      setIdToken();
      setRole();
      window.location.href = '/loginFailed';
    });
  }
};
</script>

<style scoped lang="scss">
</style>
