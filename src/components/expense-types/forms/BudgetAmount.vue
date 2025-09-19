<template>
  <div>
    <strong>Budget Amount</strong>
    <v-text-field
      variant="underlined"
      prefix="$"
      v-model="budgetFormatted"
      id="budgetAmount"
      :rules="budgetRules"
      label="Budget"
      data-vv-name="Budget"
      @update:focused="modelValue.budget = parseNumber(budgetFormatted)"
      @update:model-value="formatBudget()"
    ></v-text-field>
    <tags-budget-form v-model="props.modelValue"></tags-budget-form>
    <v-text-field
      variant="underlined"
      prefix="$"
      v-model="monthlyLimitFormatted"
      id="monthlyLimit"
      :rules="monthlyLimitRules"
      label="Monthly Limit (optional)"
      @update:focused="modelValue.monthlyLimit = parseNumber(monthlyLimitFormatted)"
      @update:model-value="formatMonthlyLimit()"
    ></v-text-field>
  </div>
</template>
<script setup>
import TagsBudgetForm from '@/components/expense-types/TagsBudgetForm.vue';
import { ref, watch } from 'vue';
import { isEmpty } from '@/utils/utils';

const props = defineProps({
  modelValue: Object
});

const budgetFormatted = ref('');
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


// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Formats the budget on the form for a nicer display.
 */
function formatBudget() {
  if (Number(props.modelValue.budget)) {
    budgetFormatted.value = Number(props.modelValue.budget).toLocaleString().toString();
  }
  props.modelValue.budget = parseNumber(budgetFormatted.value);
}

/**
 * Formats the budget on the form for a nicer display.
 */
function formatMonthlyLimit() {
  if (Number(props.modelValue.monthlyLimit)) {
    monthlyLimitFormatted.value = Number(props.modelValue.monthlyLimit).toLocaleString().toString();
  }
  props.modelValue.monthlyLimit = parseNumber(monthlyLimitFormatted.value);
}

/**
 * Parses the budget to get rid of commas.
 *
 * @param budget - the budget to parse
 * @return String - The budget without formatting
 */
function parseNumber(budget) {
  if (budget && !isEmpty(budget)) {
    return budget.replace(/[,\s]/g, '');
  } else {
    return budget;
  }
}
// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => props.modelValue.budget,
  () => {
    budgetFormatted.value = props.modelValue.budget;
    formatBudget();
  }
);

watch(
  () => props.modelValue.monthlyLimit,
  () => {
    monthlyLimitFormatted.value = props.modelValue.monthlyLimit;
    formatMonthlyLimit();
  }
);
</script>