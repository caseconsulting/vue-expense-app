<template>
  <div />
</template>

<script setup>
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const router = useRouter();

// |--------------------------------------------------|
// |                                                  |
// |                 LIFESTYLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Route to admin page if user role is admin, otherwise route
 * to home page.
 */
onBeforeMount(() => {
  router.push('/home');
}); // created
</script>

<style></style>
