<template>
  <div>
    <strong>Emails</strong>
    <case-email-field v-model="modelValue.to" :required="false" label="To Email"></case-email-field>
    <case-email-field v-model="modelValue.cc" :required="false" label="CC Email"></case-email-field>
    <case-email-field v-model="modelValue.bcc" :required="false" label="BCC Email"></case-email-field>
    <case-email-field v-model="modelValue.replyTo" :required="false" label="Reply-To Email"></case-email-field>
  </div>
</template>
<script setup>
import CaseEmailField from '@/components/shared/edit-fields/CaseEmailField.vue';

const props = defineProps({
  modelValue: Object
});
</script>