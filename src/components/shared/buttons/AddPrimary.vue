<template>
  <v-btn @click="click()"><v-icon>mdi-plus</v-icon>{{ title }}</v-btn>
</template>
<script setup>

defineProps({
  title: {
    type: String,
    default: 'Add'
  },
  click: {
    type: Function,
    default: () => { }
  }
});
</script>