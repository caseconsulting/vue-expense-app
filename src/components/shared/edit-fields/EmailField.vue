<template>
  <v-text-field
    :label="label"
    @update:model-value="emailValue()"
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
  modelValue: String,
  caseEmail: {
    type: Boolean,
    default: true
  },
  required: {
    type: Boolean,
    default: true
  },
  emailValue: {
    type: Function,
    default: () => {}
  }
});

const label = [
  props.caseEmail ? 'Case' : '',
  'Email',
  props.required ? '*' : ''
].join(' ');
</script>