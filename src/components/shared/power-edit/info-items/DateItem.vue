<template>
  <div>{{ formatDate(props.item[props.field.key]) }}</div>
</template>

<script setup>
import { TYPES } from '@/components/shared/power-edit/js/fieldTypes.js';
import {
  format,
  DEFAULT_ISOFORMAT,
  FORMATTED_ISOFORMAT,
  MONTH_YEAR_PARSED_ISOFORMAT,
  MONTH_YEAR_FORMATTED_ISOFORMAT
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
  if (props.field.infoType === TYPES.DATE_MMDDYYYY) {
    return format(date, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT);
  } else if (props.field.infoType === TYPES.DATE_MMYYYY) {
    return format(date, MONTH_YEAR_PARSED_ISOFORMAT, MONTH_YEAR_FORMATTED_ISOFORMAT);
  }
}
</script>
