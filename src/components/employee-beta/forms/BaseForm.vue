<template>
  <v-expansion-panel :value="value">
    <v-expansion-panel-title class="bg-grey-lighten-4">
      <h3 class="text-subtitle-1">{{ title }}</h3>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <slot></slot>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
});
</script>
