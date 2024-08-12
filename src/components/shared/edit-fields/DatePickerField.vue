<template>
  <v-text-field
    v-model="textDate"
    @update:focused="pickerDate = format(textDate, null, dateFormat)"
    @keypress="menu = false"
    @click:prepend="menu = true"
    :rules="rules"
    :label="label"
    :disabled="disabled"
    v-mask="mask"
    hint="MM/DD/YYYY format"
    prepend-inner-icon="mdi-calendar"
    autocomplete="off"
  >
    <v-menu activator="parent" :close-on-content-click="false" v-model="menu" location="start center">
      <v-date-picker
        v-model="pickerDate"
        @update:model-value="menu = false"
        :title="title"
        :max="max"
        show-adjacent-months
        hide-actions
        keyboard-icon=""
        color="#bc3825"
      >
      </v-date-picker>
    </v-menu>
    <!-- slots for the text field can be added like this as needed -->
    <template #append-inner><slot name="append-inner"></slot></template>
  </v-text-field>
</template>

<script setup>
import { format } from '@/shared/dateUtils';
import { ref, watch } from 'vue';
import { mask as useMask } from 'vue-the-mask';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const vMask = useMask;

const rawDate = defineModel({ required: true });
const props = defineProps({
  label: { type: String },
  rules: { type: Array },
  dateFormat: { type: String, required: true }, //date format of rawDate
  textFormat: { type: String, default: 'MM/DD/YYYY' }, //date format of textDate
  disabled: { type: Boolean, default: false },
  title: { type: String, default: 'Select Date' },
  max: { type: String },
  mask: { type: String, default: '##/##/####' }
});
const textDate = ref(format(rawDate.value, null, props.textFormat));
const pickerDate = ref(format(rawDate.value, null, props.dateFormat));
const menu = ref(false);

watch(pickerDate, () => {
  rawDate.value = format(pickerDate.value, null, props.dateFormat);
  textDate.value = format(pickerDate.value, null, props.textFormat);
});
</script>
