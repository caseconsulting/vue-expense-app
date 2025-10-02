<template>
  <div>
    <strong>Emails</strong>
    <help type="expenseTypes"></help>
    <case-email-field v-model="modelValue.to" :required="false" label="To Email"></case-email-field>
    <case-email-field
      v-model="modelValue.cc"
      :disabled="isEmpty(modelValue.to)"
      :required="false"
      label="CC Email"
    ></case-email-field>
    <case-email-field
      v-model="modelValue.bcc"
      :disabled="isEmpty(modelValue.to)"
      :required="false"
      label="BCC Email"
    ></case-email-field>
    <case-email-field
      v-model="modelValue.replyTo"
      :disabled="isEmpty(modelValue.to)"
      :required="false"
      label="Reply-To Email"
    ></case-email-field>
  </div>
</template>
<script setup>
import CaseEmailField from '@/components/shared/edit-fields/CaseEmailField.vue';
import Help from '@/components/shared/buttons/Help.vue';
import { isEmpty } from '@/utils/utils';

const props = defineProps({
  modelValue: Object
});
</script>
