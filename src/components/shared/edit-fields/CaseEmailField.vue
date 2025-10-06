<template>
  <v-text-field
    v-model="displayValue"
    :label="fieldLabel"
    :rules="getCaseEmailRules(props.required)"
    @input="updateModel"
  >
    <template #prepend-inner><v-icon>mdi-email</v-icon></template>
    <template #append-inner>
      <span class="text-grey">{{ CASE_EMAIL_DOMAIN }}</span>
    </template>
  </v-text-field>
</template>
<script setup>
import { CASE_EMAIL_DOMAIN } from '@/shared/employeeUtils';
import { getCaseEmailRules } from '@/shared/validationUtils';
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: String,
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

const emit = defineEmits(['update:modelValue'])

const displayValue = ref('')

// Update model ONLY — do NOT change what user typed
function updateModel() {
  const username = displayValue.value.trim()
  const full = username ? username + CASE_EMAIL_DOMAIN : ''
  emit('update:modelValue', full)
}

watch(
  () => props.modelValue,
  (newVal) => {
    const username = (newVal || '').replace(CASE_EMAIL_DOMAIN, '')
    if (username !== displayValue.value) {
      displayValue.value = username
    }
  },
  { immediate: true }
)
</script>