<template>
  <v-text-field
    :label="fieldLabel"
    :hint="props.caseEmail ? CASE_EMAIL_DOMAIN : ''"
    persistent-hint
    :rules="props.caseEmail ? getCaseEmailRules(props.required) : getEmailRules(props.required)"
  >
    <template #prepend-inner><v-icon>mdi-email</v-icon></template>
  </v-text-field>
</template>
<script setup>
import { CASE_EMAIL_DOMAIN } from '@/shared/employeeUtils';
import { getCaseEmailRules, getEmailRules } from '@/shared/validationUtils';

const props = defineProps({
  caseEmail: {
    type: Boolean,
    default: true
  },
  label: {
    type: String,
    default: 'Email'
  },
  model: Object,
  required: {
    type: Boolean,
    default: true
  }
});

const fieldLabel = [props.label, props.required ? '*' : ''].join(' ');
</script>