<template>
  <default-info-item
    v-if="props.field.infoType === TYPES.DEFAULT"
    :field="props.field"
    :item="props.item"
  ></default-info-item>
  <date-info-item
    v-else-if="props.field.infoType === TYPES.DATE_MMYYYY || props.field.infoType === TYPES.DATE_MMDDYYYY"
    :field="props.field"
    :item="props.item"
  ></date-info-item>
  <custom-info-item v-else :field="props.field" :item="props.item"></custom-info-item>
</template>

<script setup>
import DefaultInfoItem from '@/components/employees/power-edit/info-items/DefaultItem.vue';
import DateInfoItem from '@/components/employees/power-edit/info-items/DateItem.vue';
import CustomInfoItem from '@/components/employees/power-edit/info-items/CustomItem.vue';
import { TYPES } from '@/components/employees/power-edit/js/fieldTypes.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
</script>
