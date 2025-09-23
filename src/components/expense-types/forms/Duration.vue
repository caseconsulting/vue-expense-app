<template>
  <div>
    <strong>Duration</strong>
    <v-row>
      <v-col>
        <checkbox
          label="Recurring Flag"
          v-model="modelValue.recurringFlag"
        ></checkbox>
      </v-col>
      <v-col>
        <checkbox
          label="Inactive"
          v-model="modelValue.isInactive"
          :disabled="!modelValue.recurringFlag"
        ></checkbox>
      </v-col>
    </v-row>
    <v-text-field
      :disabled="modelValue.recurringFlag"
      variant="underlined"
      v-model="startDateFormatted"
      id="startDate"
      :rules="[...getDateRules(), ...startDateRules]"
      label="Start Date"
      hint="MM/DD/YYYY format"
      v-mask="'##/##/####'"
      persistent-hint
      prepend-icon="mdi-calendar"
      @blur="modelValue.startDate = format(startDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
      @click:prepend="showStartMenu = true"
      @keypress="showStartMenu = false"
      autocomplete="off"
    >
      <v-menu
        activator="parent"
        v-model="showStartMenu"
        :rules="getRequiredRules()"
        :close-on-content-click="false"
        location="start center"
      >
        <v-date-picker
          v-model="modelValue.startDate"
          @update:model-value="showStartMenu = false"
          :max="modelValue.endDate"
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          title="Start Date"
        ></v-date-picker>
      </v-menu>
    </v-text-field>
    <v-text-field
      :disabled="modelValue.recurringFlag"
      variant="underlined"
      v-model="endDateFormatted"
      id="endDate"
      :rules="[...getDateRules(), ...endDateRules]"
      label="End Date"
      hint="MM/DD/YYYY format"
      v-mask="'##/##/####'"
      persistent-hint
      prepend-icon="mdi-calendar"
      @blur="modelValue.endDate = format(endDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
      @update:model-value="showEndMenu = false"
      autocomplete="off"
    >
      <v-menu
        activator="parent"
        v-model="showEndMenu"
        :rules="getRequiredRules()"
        :close-on-content-click="false"
        location="start center"
      >
        <v-date-picker
          v-model="modelValue.endDate"
          @update:model-value="showEndMenu = false"
          :min="modelValue.startDate"
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          title="End Date"
        ></v-date-picker>
      </v-menu>
    </v-text-field>
  </div>
</template>
<script setup>
import Checkbox from '@/components/shared/edit-fields/Checkbox.vue';
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { mask } from 'vue-the-mask';
import { isEmpty } from '@/utils/utils';
import { format, isValid, isSameOrAfter, isSameOrBefore } from '@/shared/dateUtils';
import { getRequiredRules, getDateRules } from '@/shared/validationUtils';

const emitter = inject('emitter');
const props = defineProps({
  modelValue: Object
});

const endDateFormatted = ref(null); // formatted end date
const endDateRules = ref([
  (v) => {
    return !isEmpty(v) && isValid(v, 'MM/DD/YYYY') && props.modelValue.startDate
      ? isSameOrAfter(v, props.modelValue.startDate) || 'End date must be at or after start date'
      : true;
  }
]);
const showStartMenu = ref(false); // boolean for showing date picker
const showEndMenu = ref(false); // boolean for showing date picker
const startDateFormatted = ref(null); // formateed start date
const startDateRules = ref([
  (v) => {
    return !isEmpty(v) && isValid(v, 'MM/DD/YYYY') && props.modelValue.endDate
      ? isSameOrBefore(v, props.modelValue.endDate) || 'Start date must be at or before end date'
      : true;
  }
]);
const vMask = mask; // custom directive

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
  startDateFormatted.value = null;
  endDateFormatted.value = null;
}


// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * formats end date
 */
watch(
  () => props.modelValue.endDate,
  () => {
    endDateFormatted.value = format(props.modelValue.endDate, null, 'MM/DD/YYYY') || endDateFormatted.value;
    //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
    if (props.modelValue.endDate !== null && !format(props.modelValue.endDate, null, 'MM/DD/YYYY')) {
      props.modelValue.endDate = null;
    }
  }
);

/**
 * format start date
 */
watch(
  () => props.modelValue.startDate,
  () => {
    startDateFormatted.value =
      format(props.modelValue.startDate, null, 'MM/DD/YYYY') || startDateFormatted.value;
    //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
    if (props.modelValue.startDate !== null && !format(props.modelValue.startDate, null, 'MM/DD/YYYY')) {
      props.modelValue.startDate = null;
    }
  }
);

</script>