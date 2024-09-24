<template>
  <v-text-field
    v-mask="maskRules ?? defaults.maskRules"
    v-model="formattedDate"
    :rules="rules"
    validate-on="input"
    :label="label"
    :hint="hint ?? defaults.hint"
    :prepend-inner-icon="icon"
    @click:prepend="showMenu = true"
    @keypress="showMenu = false"
    @update:focused="onFocusChange"
    :autocomplete="autocomplete"
    :clearable="clearable"
    :persistent-hint="persistentHint"
    :variant="variant"
  >
    <v-menu activator="parent" :close-on-content-click="false" v-model="showMenu" location="start center">
      <v-date-picker
        v-model="date"
        :show-adjacent-months="adjacentDays"
        hide-actions
        keyboard-icon=""
        color="#bc3825"
        :title="label"
      />
    </v-menu>
  </v-text-field>
</template>

<script setup>
/**
 * POINTS OF ISSUE:
 * - how does this manage timezones?
 * - how does this manage formats that include the time?
 */

import { ref, watch } from 'vue';
import { format } from '@/shared/dateUtils';
// import { mask } from 'vue-the-mask';

const props = defineProps({
  // DISPLAY
  label: { type: String, default: 'Pick date' },
  hint: { type: String, default: undefined },
  icon: { type: String, default: 'mdi-calendar' },
  variant: { type: String, default: 'underlined' },
  adjacentDays: { type: Boolean, default: false },

  // LOGIC/CONFIG
  rules: { type: Array, default: () => [] },
  maskRules: { type: String, default: undefined },

  // FUNCTIONALITY
  returnFormat: { type: String, default: 'YYYY-MM-DD' },
  displayFormat: { type: String, default: 'MM/DD/YYYY' },
  autocomplete: { type: String, default: 'off' },
  persistentHint: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },

  // CUSTOM FUNCTIONALITY
  // action to take when user clicks into text field. `return false` to not do any of the automatic actions.
  onClickIn: { type: Function, default: () => true },
  // action to take when user clicks out of text field. `return false` to not do any of the automatic actions.
  onClickOut: { type: Function, default: () => true }
});

// custom defualts that rely on other props
let defaults = {
  hint: props.displayFormat,
  maskRules: props.displayFormat.replaceAll(/\w/gi, '#')
};

// define refs
const date = defineModel(); // v-model
const formattedDate = ref(format(date.value, null, props.displayFormat));
const showMenu = ref(false);
// const vMask = mask; // custom directive

/**
 * Action(s) to take when the user clicks in/out of the box
 */
function onFocusChange(e) {
  // Vuetify consts for what type of focus change this is
  const [FOCUS, BLUR] = [true, false];

  // on user clicking into the box
  if (e === FOCUS) {
    // do user actions
    let proceed = props.onClickIn();
    if (proceed === false) return;
    // ... do any on-focus actions here
  }

  // on user clicking out of the box
  if (e === BLUR) {
    // do user actions
    let proceed = props.onClickOut();
    if (proceed === false) return;
    // ... do any on-blur actions here
  }
}

/**
 * Update dates on picker select
 */
watch(
  () => date.value,
  () => {
    // put dates into the respective formats
    date.value = format(date.value, null, props.returnFormat) || date.value;
    formattedDate.value = format(date.value, null, props.displayFormat) || formattedDate.value;
    // fixes v-date-picker error so that if the format of date is incorrect the date is set to null
    if (date.value !== null && !format(date.value, null, props.displayFormat)) {
      date.value = null;
    }
    // hide the menu
    showMenu.value = false;
  }
);

/**
 * Update dates on manual user input
 */
watch(
  () => formattedDate.value,
  () => {
    let newDate = format(formattedDate.value, props.displayFormat, props.returnFormat);
    if (!newDate) return; // user is not done typing yet
    date.value = newDate;
  }
);
</script>
