<template>
  <div>{{ formatDate(item[field.key]) }}</div>
</template>

<script>
import { TYPES } from '@/components/employees/power-edit/js/fieldTypes.js';
import {
  format,
  DEFAULT_ISOFORMAT,
  FORMATTED_ISOFORMAT,
  MONTH_YEAR_PARSED_ISOFORMAT,
  MONTH_YEAR_FORMATTED_ISOFORMAT
} from '@/shared/dateUtils.js';

function formatDate(date) {
  if (this.field.infoType === TYPES.DATE_MMDDYYYY) {
    return this.format(date, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT);
  } else if (this.field.infoType === TYPES.DATE_MMYYYY) {
    return this.format(date, MONTH_YEAR_PARSED_ISOFORMAT, MONTH_YEAR_FORMATTED_ISOFORMAT);
  }
  //item[field.key]
}

export default {
  data() {
    return {
      TYPES
    };
  },
  methods: {
    format,
    formatDate
  },
  props: ['field', 'item']
};
</script>
