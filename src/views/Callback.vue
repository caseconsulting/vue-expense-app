<template> </template>

<script>
import { setIdToken, setAccessToken, setRole, setProfile } from '@/utils/auth';
// import api from '@/shared/api';

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
      // let role = await api.getRole();
      // setRole(role);
    });
  }
};
</script>

<style scoped lang="scss"></style>
