
<template>
  <span class="flag">
    <p>{{ displayText }}:</p>
    <v-icon
      v-if="field"
      icon="mdi-check-circle-outline"
      id="marks"
      class="mr-1"
      color="green"
    />
    <v-icon v-else icon="mdi-close-circle-outline" id="marks" class="mr-1 case-red-text" />
  </span>
</template>
<script setup>
const props = defineProps({
  displayText: {
    type: String,
    required: true
  },
  field: {
    type: Boolean,
    required: true
  }

});
</script>
