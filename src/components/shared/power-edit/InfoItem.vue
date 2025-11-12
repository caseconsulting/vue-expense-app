<template>
  <default-info-item
    v-if="props.field.infoType === TYPES.DEFAULT"
    :field="props.field"
    :item="props.item"
  ></default-info-item>
  <date-info-item
    v-else-if="props.field.infoType === TYPES.DATE_MMDDYYYY"
    :field="props.field"
    :item="props.item"
  ></date-info-item>
  <component v-else :is="props.CustomInfoItem" :field="props.field" :item="props.item"></component>
</template>

<script setup>
import DefaultInfoItem from '@/components/shared/power-edit/info-items/DefaultItem.vue';
import DateInfoItem from '@/components/shared/power-edit/info-items/DateItem.vue';
import { TYPES } from '@/components/shared/power-edit/js/fieldTypes.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item', 'CustomInfoItem']);
</script>
