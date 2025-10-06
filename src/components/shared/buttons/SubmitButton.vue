<template>
  <v-btn
    variant="outlined"
    class="ma-1"
    :color="props.valid ? 'success': 'error'"
    type="submit"
    size="small"
  >
    <v-icon class="mr-1">mdi-content-save</v-icon>Submit
  </v-btn>
</template>
<script setup>

const props = defineProps({
  valid: {
    type: Boolean,
    default: true
  }
});

</script>
