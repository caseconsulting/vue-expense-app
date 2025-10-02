<template>
  <div>
    <strong>Budget Amount</strong>
    <v-text-field
      variant="underlined"
      prefix="$"
      v-model="props.modelValue.budget"
      id="budgetAmount"
      :rules="budgetRules"
      label="Budget"
      data-vv-name="Budget"
    ></v-text-field>
    <tag-budgets v-model="props.modelValue"></tag-budgets>
    <v-text-field
      variant="underlined"
      prefix="$"
      v-model="props.modelValue.monthlyLimit"
      id="monthlyLimit"
      :rules="monthlyLimitRules"
      label="Monthly Limit (optional)"
    ></v-text-field>
  </div>
</template>
<script setup>
import TagBudgets from '@/components/expense-types/forms/fields/TagBudgets.vue';
import { ref } from 'vue';
import { isEmpty } from '@/utils/utils';

const props = defineProps({
  modelValue: Object
});

const budgetRules = ref([
  (v) => !!v || 'Budget amount is required',
  (v) => parseFloat(v, 10) > 0 || 'Budget must be greater than 0.',
  (v) =>
    /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
    'Budget amount must be a number with two decimal digits.'
]); // rules for an expense type budget
const monthlyLimitFormatted = ref('');
const monthlyLimitRules = ref([
  (v) => isEmpty(v) || parseFloat(v, 10) > 0 || 'Limit must be greater than 0.',
  (v) =>
    isEmpty(v) ||
    /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
    'Limit must be a number with two decimal digits.'
]);
</script>
