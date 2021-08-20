<template>
  <div></div>
</template>
<script>
/**
 * Route to admin page if user role is admin, otherwise route to home page
 */
async function created() {
  this.$router.push('home');
}
export default { created };
</script>

<style></style>
