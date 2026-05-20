<template>
  <div>
    <strong>Budget Amount</strong>
    <v-row>
      <v-col cols="10">
        <v-text-field
          variant="underlined"
          prefix="$"
          v-model="props.modelValue.budget"
          id="budgetAmount"
          :rules="budgetRules"
          label="Budget"
          data-vv-name="Budget"
        />
      </v-col>
      <v-col cols="2">
        <v-btn
          @click="props.modelValue.allowCompanyCard = !props.modelValue.allowCompanyCard"
          variant="text"
          class="mr-2"
          icon
          v-tooltip="{ text: `Company card is ${props.modelValue.allowCompanyCard ? 'enabled' : 'disabled'}`, location: 'left' }"
        >
          <v-icon
            :icon="props.modelValue.allowCompanyCard ? 'mdi-account-credit-card' : 'mdi-account-credit-card-outline'"
            :color="props.modelValue.allowCompanyCard ? '#BC3825' : 'grey-darken-2'"
          />
        </v-btn>
      </v-col>
    </v-row>
    <tag-budgets v-model="props.modelValue" />
    <v-text-field
      variant="underlined"
      prefix="$"
      v-model="props.modelValue.monthlyLimit"
      id="monthlyLimit"
      :rules="monthlyLimitRules"
      label="Monthly Limit (optional)"
    />
  </div>
</template>
<script setup>
import TagBudgets from '@/components/expense-types/forms/fields/TagBudgets.vue';
import { ref, inject, onMounted, onBeforeUnmount } from 'vue';
import { isEmpty } from '@/utils/utils';

const emitter = inject('emitter');
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
const monthlyLimitRules = ref([
  (v) => isEmpty(v) || parseFloat(v, 10) > 0 || 'Limit must be greater than 0.',
  (v) =>
    isEmpty(v) ||
    /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
    'Limit must be a number with two decimal digits.'
]);

/**
 * Gets and sets all employees.
 */
onMounted(() => {
  emitter.on('clear-expense-type-form', () => {
    props.modelValue.budget = null;
    props.modelValue.monthlyLimit = null;
    props.modelValue.allowCompanyCard = false;
  });
});

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('clear-expense-type-form');
});
</script>
