<template>
  <div>
    <div>
      <strong>Duration</strong>
      <help type="expenseTypes"></help>
    </div>
    <v-row>
      <v-col class="slim">
        <checkbox label="Recurring Flag" v-model="modelValue.recurringFlag"></checkbox>
      </v-col>
      <v-col class="slim">
        <checkbox label="Inactive" v-model="modelValue.isInactive" :disabled="!modelValue.recurringFlag"></checkbox>
      </v-col>
    </v-row>
    <date-picker
      :disabled="modelValue.recurringFlag"
      v-model="modelValue.startDate"
      :rules="[...getDateRules(!modelValue.recurringFlag), ...startDateRules]"
      label="Start Date"
      id="startDate"
      persistent-hint
    />
    <date-picker
      :disabled="modelValue.recurringFlag"
      v-model="modelValue.endDate"
      :rules="[...getDateRules(!modelValue.recurringFlag), ...endDateRules]"
      label="End Date"
      id="endDate"
      persistent-hint
    />
  </div>
</template>
<script setup>
import DatePicker from '@/components/shared/DatePicker.vue';
import Checkbox from '@/components/shared/edit-fields/Checkbox.vue';
import Help from '@/components/shared/buttons/Help.vue';
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { isEmpty } from '@/utils/utils';
import { isValid, isSameOrAfter, isSameOrBefore } from '@/shared/dateUtils';
import { getRequiredRules, getDateRules } from '@/shared/validationUtils';

const emitter = inject('emitter');
const props = defineProps({
  modelValue: Object
});

const startDateRules = ref([
  (v) => {
    return (
      isEmpty(v) ||
      (isValid(v, 'MM/DD/YYYY') && props.modelValue.endDate
        ? isSameOrBefore(v, props.modelValue.endDate) || 'Start date must be at or before end date'
        : true)
    );
  }
]);
const endDateRules = ref([
  (v) => {
    return (
      isEmpty(v) ||
      (isValid(v, 'MM/DD/YYYY') && props.modelValue.startDate
        ? isSameOrAfter(v, props.modelValue.startDate) || 'End date must be at or after start date'
        : true)
    );
  }
]);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and sets all employees.
 */
onMounted(() => {
  emitter.on('clear-expense-type-form', clearForm);
});

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('clear-expense-type-form');
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  props.modelValue.startDate = null;
  props.modelValue.endDate = null;
}

</script>
