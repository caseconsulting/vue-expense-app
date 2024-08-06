<template>
  <v-tooltip location="top" :text="tooltipText">
    <template #activator="{ props }">
      <v-btn v-bind="props" :icon="buttonIcon" variant="text" @click.stop="secured = !secured"></v-btn>
    </template>
  </v-tooltip>
</template>

<script setup>
import { computed } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const secured = defineModel();

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const buttonIcon = computed(() => (secured.value ? 'mdi-shield' : 'mdi-shield-outline'));
const tooltipText = computed(() => (secured.value ? 'Click to show other users' : 'Click to hide from other users'));
</script>
