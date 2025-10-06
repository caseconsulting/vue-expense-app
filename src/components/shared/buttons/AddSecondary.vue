<template>
  <v-btn @click="click()" variant="outlined" size="small"><v-icon>mdi-plus</v-icon>{{ title }}</v-btn>
</template>
<script setup>

defineProps({
  title: {
    type: String,
    default: 'Add'
  },
  click: {
    type: Function,
    required: true
  }
});
</script>