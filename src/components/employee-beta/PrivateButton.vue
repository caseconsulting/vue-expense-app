<template>
  <div>
    <v-tooltip activator="parent" location="top" :text="tooltipText"></v-tooltip>
    <v-btn :icon="buttonIcon" variant="text" @click="secured = !secured"></v-btn>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const secured = defineModel();

const buttonIcon = computed(() => (secured.value ? 'mdi-shield' : 'mdi-shield-outline'));
const tooltipText = computed(() =>
  secured.value ? 'Click to show other emlployees' : 'Click to hide from other employees'
);
</script>
