<template>
  <div></div>
</template>
<script>
/**
 * Route to admin page if user role is admin, otherwise route
 * to home page.
 */
function created() {
  this.$router.push('home');
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default { created };
</script>

<style></style>
