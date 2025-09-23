<template>
  <div>
    <strong>Emails</strong>
    <email-field v-model="modelValue.to" :caseEmail="true" :required="false"></email-field>
    <email-field v-model="modelValue.cc" :caseEmail="true" :required="false"></email-field>
    <email-field v-model="modelValue.bcc" :caseEmail="true" :required="false"></email-field>
    <email-field v-model="modelValue.replyTo" :caseEmail="true" :required="false"></email-field>
  </div>
</template>
<script setup>
import EmailField from '@/components/shared/edit-fields/EmailField.vue';

const props = defineProps({
  modelValue: Object
});
</script>