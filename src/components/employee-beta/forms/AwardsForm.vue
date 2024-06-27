<template>
  <v-expansion-panel title="Awards" value="Awards">
    <v-expansion-panel-text>
      <div>Editing: {{ formTabs }}</div>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup>
defineProps(['formTabs']);
</script>
