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
    <slot>
      <!-- Range: string format on exteme dates -->
      <v-text-field
        v-if="range"
        v-model="rangeDisplay"
        :label="label"
        :hint="hint ?? defaults.hint"
        :prepend-inner-icon="prependInnerIcon ?? icon"
        :prepend-icon="prependIcon"
        :append-inner-icon="appendInnerIcon"
        :append-icon="appendIcon"
        :variant="variant"
        :hide-details="hideDetails"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :persistent-hint="persistentHint"
        :clearable="clearable"
        @keypress="showMenu = false"
        :autofocus="autofocus"
        readonly
      />

      <!-- Multiple: combo box with chips -->
      <v-combobox
        v-else-if="multiple"
        v-model="formattedModel"
        :multiple="multiple"
        :label="label"
        :disabled="disabled"
        :variant="variant"
        readonly
        :clearable="clearable"
        :prepend-inner-icon="icon"
        @click:clear="model = []"
        :autofocus="autofocus"
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
        :prepend-inner-icon="prependInnerIcon ?? icon"
        :prepend-icon="prependIcon"
        :append-inner-icon="appendInnerIcon"
        :append-icon="appendIcon"
        :autofocus="autofocus"
        :variant="variant"
        :hide-details="hideDetails"
        :disabled="disabled"
        :rules="rules"
        v-mask="mask ?? defaults.mask"
        :autocomplete="autocomplete"
        :persistent-hint="persistentHint"
        :clearable="clearable"
        validate-on="input"
        @keypress="showMenu = false"
        ref="textFieldRef"
      >
        <template v-if="checkbox != null" v-slot:message>
          {{ textFieldErrorMessage ?? hint ?? defaults.hint }} (click <v-icon color="black" icon="mdi-check-circle-outline" /> to mark current)
        </template>
        <template v-slot:append-inner>
          <v-avatar v-if="checkbox != null" @click.stop="checkbox = !checkbox" class="pointer" size="x-small">
            <span v-if="checkbox">
              <v-tooltip activator="parent">Currently active</v-tooltip>
              <v-icon color="black">mdi-check-circle</v-icon>
            </span>
            <span v-else>
              <v-tooltip activator="parent">Click if active</v-tooltip>
              <v-icon color="black">mdi-check-circle-outline</v-icon>
            </span>
          </v-avatar>
          <slot name="append-inner"></slot>
        </template>
        </v-text-field>
    </slot>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { format as formatUtil, isAfter, isBefore } from '@/shared/dateUtils';

const props = defineProps({
  // DISPLAY
  label: { type: String, default: 'Pick date' },
  hint: { type: String, default: undefined },
  variant: { type: String, default: 'underlined' },
  adjacentDays: { type: Boolean, default: false },
  hideDetails: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  checkboxHint: { type: String, default: 'Click if current' }, // used for v-model:checkbox

  // ICONS
  icon: { type: String, default: 'mdi-calendar' }, // prepend-inner-icon default
  prependInnerIcon: { type: String, default: undefined },
  prependIcon: { type: String, default: undefined },
  appendInnerIcon: { type: String, default: undefined },
  appendIcon: { type: String, default: undefined },

  // LOGIC/CONFIG
  rules: { type: Array, default: () => [] },
  min: { type: String, default: undefined },
  max: { type: String, default: undefined },
  mask: { type: String, default: undefined },

  // FUNCTIONALITY
  returnFormat: { type: String, default: 'YYYY-MM-DD' },
  displayFormat: { type: String, default: 'MM/DD/YYYY' },
  autocomplete: { type: String, default: 'off' },
  autofocus: { type: Boolean, default: false },
  persistentHint: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  closeableChips: { type: Boolean, default: undefined },
  autofocus: { type: Boolean, default: false },
  range: { type: Boolean, default: false },
  rangeFormat: { type: String, default: 'MM/DD/YYYY' }
});

// custom defualts that rely on other props
let defaults = {
  hint: `${props.displayFormat} format`,
  mask: props.displayFormat.replace(/[A-Za-z]/g, '#')
};

// define refs
const model = defineModel({ required: true }); // v-model
const checkbox = defineModel('checkbox', { required: false }); // v-model:checkbox
const multiple = ref(!!props.range || Array.isArray(model.value));
const formattedModel = ref(format(model.value, null, props.displayFormat));
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
  let f = (d) => formatUtil(d, fromFormat, toFormat);

  if (props.range) {
    if (item.length === 0) return [];
    if (item.length === 1) return [f(item[0])];
    // find min/max dates
    let [a, b] = [item[0], item[0]];
    for (let i of item) {
      if (isBefore(i, a)) a = i;
      if (isAfter(i, b)) b = i;
    }
    // return range format
    return [f(a), f(b)];
  }

  if (multiple.value) {
    let formattedItems = [];
    for (let i of item) formattedItems.push(f(i));
    return formattedItems;
  }

  return f(item, fromFormat, toFormat);
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
 * Display format for ranges
 */
const rangeDisplay = computed(() => {
  if (!props.range) return;
  if (model.value.length === 0) return null;
  let [a, b] = model.value;
  a = formatUtil(a, null, props.rangeFormat);
  b = b ? formatUtil(b, null, props.rangeFormat) : 'Present';
  return `${a} — ${b}`;
})

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

    // reset the checkbox on any input
    checkbox.value = false;

    // if formatted model is an array, watchers will trigger on any format, even if the values don't change
    if (multiple.value && newVal.join() === oldVal.join()) return;

    // get new format, and set if it formatting was successful
    let newDate = format(formattedModel.value, props.displayFormat, props.returnFormat);
    if (!newDate) return; // user is not done typing yet
    model.value = newDate;
  }
);
</script>
