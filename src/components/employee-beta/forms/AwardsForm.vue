<template>
  <base-form title="Awards" value="Awards">
    <div>Editing: {{ formTabs }}</div>
  </base-form>
</template>

<script setup>
import BaseForm from './BaseForm.vue';

defineProps(['formTabs']);
</script>
