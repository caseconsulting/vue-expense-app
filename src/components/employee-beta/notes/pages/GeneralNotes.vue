<template>
  <div>
    <v-textarea v-model="notes" variant="outlined" auto-grow rows="15" max-rows="15" class="w-100"></v-textarea>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// let props = defineProps('notes');

const notes = ref('');
</script>
