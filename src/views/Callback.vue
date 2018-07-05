<template>
</template>

<script>
import { setIdToken, setAccessToken } from '@/utils/auth';

export default {
  name: 'callback',
  mounted() {
    this.$nextTick(() => {
      setAccessToken();
      setIdToken();
      window.location.href = '/loginFailed';
    });
  }
};
</script>

<style scoped lang="scss">
</style>
