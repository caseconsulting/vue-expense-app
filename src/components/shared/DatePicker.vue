<template>
  <div>
    <!-- Menu slot: this is where the user clicks a date -->
    <slot name="menu">
      <v-menu
        v-if="!disabled"
        activator="parent"
        :close-on-content-click="false"
        v-model="showMenu"
        location="start center"
      >
        <v-date-picker
          v-model="model"
          :title="label"
          :min="min"
          :max="max"
          :show-adjacent-months="adjacentDays"
          :multiple="multiple"
          color="#bc3825"
          keyboard-icon=""
          hide-actions
        />
      </v-menu>
    </slot>

    <!-- Display slot: this is where the user can see the picked date(s). Single dates support typing -->
    <slot name="display">
      <!-- Multiple: combo box with chips -->
      <v-combobox
        v-if="multiple"
        v-model="formattedModel"
        :multiple="multiple"
        :label="label"
        :disabled="disabled"
        readonly
        :clearable="clearable"
        :prepend-inner-icon="icon"
        @click:clear="model = []"
      >
        <template v-slot:selection="{ item }">
          <v-chip variant="outlined" :closable="closeableChips ?? clearable" @click:close="remove(item)">
            {{ item.raw }}
          </v-chip>
        </template>
      </v-combobox>

      <!-- Single: string format of date -->
      <v-text-field
        v-else
        v-model="formattedModel"
        :label="label"
        :hint="hint ?? defaults.hint"
        :prepend-inner-icon="icon"
        :variant="variant"
        :hide-details="hideDetails"
        :disabled="disabled"
        :rules="rules"
        v-mask="mask ?? defaults.mask"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :persistent-hint="persistentHint"
        :clearable="clearable"
        validate-on="input"
        @keypress="showMenu = false"
        ref="textFieldRef"
      >
        <template v-if="checkbox != null" v-slot:message>
          {{ textFieldErrorMessage ?? hint ?? defaults.hint }} (click <v-icon color="black" icon="mdi-check-circle-outline" /> to mark current)
        </template>
        <template v-if="checkbox != null" v-slot:append-inner>
          <v-avatar @click.stop="checkbox = !checkbox" class="pointer" size="x-small">
            <span v-if="checkbox">
              <v-tooltip activator="parent">Currently active</v-tooltip>
              <v-icon color="black">mdi-check-circle</v-icon>
            </span>
            <span v-else>
              <v-tooltip activator="parent">Click if active</v-tooltip>
              <v-icon color="black">mdi-check-circle-outline</v-icon>
            </span>
          </v-avatar>
        </template>
        </v-text-field>
    </slot>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { format as formatUtil } from '@/shared/dateUtils';

const props = defineProps({
  // DISPLAY
  label: { type: String, default: 'Pick date' },
  hint: { type: String, default: undefined },
  icon: { type: String, default: 'mdi-calendar' },
  variant: { type: String, default: 'underlined' },
  adjacentDays: { type: Boolean, default: false },
  hideDetails: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  mode: { type: String, default: undefined },
  checkboxHint: { type: String, default: 'Click if current' },

  // LOGIC/CONFIG
  rules: { type: Array, default: () => [] },
  min: { type: String, default: undefined },
  max: { type: String, default: undefined },
  mask: { type: String, default: undefined },

  // FUNCTIONALITY
  returnFormat: { type: String, default: 'YYYY-MM-DD' },
  displayFormat: { type: String, default: 'MM/DD/YYYY' },
  autocomplete: { type: String, default: 'off' },
  persistentHint: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  closeableChips: { type: Boolean, default: undefined },
  autofocus: { type: Boolean, default: false }
});

// custom defualts that rely on other props
let defaults = {
  hint: props.displayFormat,
  mask: props.displayFormat.replaceAll(/\w/gi, '#')
};

// define refs
const model = defineModel({ required: true }); // v-model
const checkbox = defineModel('checkbox', { required: false }); // v-model:checkbox
const formattedModel = ref(format(model.value, null, props.displayFormat));
const multiple = ref(Array.isArray(model.value));
const showMenu = ref(false);
const textFieldRef = ref(null);

/**
 * Wrapper of dateUtils format() to support arrays
 *
 * @param date - date(s) to format
 * @param fromFormat - format to format from
 * @param toFormat - format to format into
 * @return formatted date(s)
 */
function format(item, fromFormat, toFormat) {
  if (Array.isArray(item)) {
    let formattedItems = [];
    for (let i of item) formattedItems.push(formatUtil(i, fromFormat, toFormat));
    return formattedItems;
  } else {
    return formatUtil(item, fromFormat, toFormat);
  }
}

/**
 * Removes an item from the model. It is assumed that the model is an array, and the
 * item is an element in the model array.
 *
 * @param item item to remove
 */
function remove(item) {
  let index = formattedModel.value.indexOf(item.raw);
  if (index > -1) {
    formattedModel.value.splice(index, 1);
    model.value.splice(index, 1);
  }
} // remove

/**
 * Verifies rules for v-text-field
 */
const textFieldErrorMessage = computed(() => {
  return textFieldRef.value?.errorMessages?.[0] || null;
});

/**
 * On checkbox change:
 *  - Force validation
 *  - Clear model if unchecked
 */
watch(
  () => checkbox.value,
  () => {
    if (checkbox.value) {
      model.value = null;
      formattedModel.value = null;
    }
    textFieldRef.value?.validate();
  }
)

/**
 * Update dates on picker select
 */
watch(
  () => model.value,
  (newVal, oldVal) => {
    // if model is an array, watchers will trigger on any format, even if the values don't change
    if (multiple.value && newVal.join() === oldVal.join()) return;

    // put dates into the respective formats
    model.value = format(model.value, null, props.returnFormat) || model.value;
    formattedModel.value = format(model.value, null, props.displayFormat) || formattedModel.value;
    // fixes v-date-picker error so that if the format of date is incorrect the date is set to null
    if (model.value !== null && !format(model.value, null, props.displayFormat)) {
      model.value = null;
    }
    // hide the menu if multiple selections is not allowed
    if (!multiple.value) showMenu.value = false;
  }
);

/**
 * Update dates on manual user input
 */
watch(
  () => formattedModel.value,
  (newVal, oldVal) => {
    // if newVal is null or blank, skip to setting it to the model. otherwise functions won't work and the model will not update
    if (newVal === null || newVal === '') {
      newVal = null;
      model.value = null;
      return;
    }

    // if formatted model is an array, watchers will trigger on any format, even if the values don't change
    if (multiple.value && newVal.join() === oldVal.join()) return;

    // get new format, and set if it formatting was successful
    let newDate = format(formattedModel.value, props.displayFormat, props.returnFormat);
    if (!newDate) return; // user is not done typing yet
    model.value = newDate;
  }
);
</script>
