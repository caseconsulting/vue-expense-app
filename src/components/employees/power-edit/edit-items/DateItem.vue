<template>
  <v-text-field
    ref="formFields"
    :model-value="format(model, null, 'MM/DD/YYYY')"
    :rules="props.field.rules"
    class="power-edit-field"
    hint="MM/DD/YYYY format"
    v-mask="'##/##/####'"
    variant="underlined"
    @update:focused="model = parseEventDate()"
    @click="showMenu = true"
    @keypress="showMenu = false"
  >
    <v-menu activator="parent" v-model="showMenu" :close-on-content-click="false" location="start center">
      <v-date-picker
        v-model="model"
        @update:model-value="showMenu = false"
        show-adjacent-months
        hide-actions
        keyboard-icon=""
        color="#bc3825"
        :title="props.field.title"
      ></v-date-picker>
    </v-menu>
  </v-text-field>
</template>

<script setup>
import { ref } from 'vue';
import { format, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import { mask } from 'vue-the-mask';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const model = ref(props.item[props.field.key]);
const showMenu = ref(false);
const vMask = (a, b) => mask(a, b);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return this.format(event.target.value, FORMATTED_ISOFORMAT, DEFAULT_ISOFORMAT);
} //parseEventDate
</script>
