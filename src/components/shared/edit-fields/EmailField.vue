<template>
  <v-text-field
    :label="fieldLabel"
    :rules="getEmailRules(props.required)"
  >
    <template #prepend-inner><v-icon>mdi-email</v-icon></template>
  </v-text-field>
</template>
<script setup>
import { getEmailRules } from '@/shared/validationUtils';
import { computed } from 'vue';

const model = defineModel('model', {
  type: String,
  default: '',
});

const props = defineProps({
  label: {
    type: String,
    default: 'Email'
  },
  required: {
    type: Boolean,
    default: true
  }
});

const fieldLabel = [props.label, props.required ? '*' : ''].join(' ');
</script>