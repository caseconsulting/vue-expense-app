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
const model = defineModel('model', {
  type: Boolean,
  default: false
});

const props = defineProps({
  label: String
});
</script>