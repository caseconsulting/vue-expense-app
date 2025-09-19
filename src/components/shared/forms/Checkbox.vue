<template>
  <v-checkbox
    :color="caseRed"
    light
  >
    <template #label>
      <span class="form-text">{{ label }}</span>
    </template>
  </v-checkbox>
</template>
<script setup>
const props = defineProps({
  label: String,
  model: Object
});
</script>