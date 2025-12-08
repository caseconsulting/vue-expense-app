<template>
  <div>{{ formatDate(props.item[props.field.key]) }}</div>
</template>

<script setup>
import {
  format,
  DEFAULT_ISOFORMAT,
  FORMATTED_ISOFORMAT
} from '@/shared/dateUtils.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function formatDate(date) {
  return format(date, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT);
}
</script>
