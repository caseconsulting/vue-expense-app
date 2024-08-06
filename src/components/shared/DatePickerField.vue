<template>
  <v-text-field
    v-model="formattedDate"
    :label="label"
    v-mask="'##/##/####'"
    hint="MM/DD/YYYY"
    :rules="rules"
    prepend-inner-icon="mdi-calendar"
    autocomplete="off"
    :class="textFieldClasses"
    @keypress="menu = false"
  >
    <v-menu activator="parent" :close-on-content-click="false" v-model="menu" location="start center">
      <v-date-picker
        v-model="date"
        show-adjacent-months
        hide-actions
        keyboard-icon
        color="#bc3825"
        :title="label"
        @update:model-value="menu = false"
      >
      </v-date-picker>
    </v-menu>
    <!-- slots for the text field can be added like this as needed -->
    <template #append-inner><slot name="append-inner"></slot></template>
  </v-text-field>
</template>

<script setup>
import { DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT, ISO8601 } from '@/shared/dateUtils';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { mask } from 'vue-the-mask';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const vMask = mask;

const rawDate = defineModel({ required: true });
const props = defineProps({
  label: { type: String },
  rules: { type: Array },
  formats: { type: Array },
  textFieldClasses: { type: String || Object },
  datePickerClasses: { type: String || Object }
});
const menu = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Dayjs wrapper for the date. This is used as the model for the date picker, since that also uses dayjs objects
 * @type {import('vue').WritableComputedRef<import('dayjs').Dayjs>}
 */
const date = computed({
  get: () => dayjs(rawDate.value, props.formats ?? [ISO8601, DEFAULT_ISOFORMAT]),
  set: (val) => {
    rawDate.value = val.format(ISO8601);
  }
});

/**
 * The date in MM/DD/YYYY format
 * @type {import('vue').WritableComputedRef<string>}
 */
const formattedDate = computed({
  get: () => {
    if (!date.value.isValid()) return '';
    return date.value.format(FORMATTED_ISOFORMAT);
  },
  set: (val) => {
    const day = dayjs(val, FORMATTED_ISOFORMAT);
    if (day.isValid()) date.value = day;
  }
});
</script>
