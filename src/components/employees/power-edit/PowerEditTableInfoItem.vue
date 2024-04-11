<template>
  <default-info-item v-if="field.infoType === TYPES.DEFAULT" :field="field" :item="item"></default-info-item>
  <date-info-item
    v-else-if="field.infoType === TYPES.DATE_MMYYYY || field.infoType === TYPES.DATE_MMDDYYYY"
    :field="field"
    :item="item"
  ></date-info-item>
  <custom-info-item v-else :field="field" :item="item"></custom-info-item>
</template>

<script>
import DefaultInfoItem from '@/components/employees/power-edit/info-items/DefaultItem.vue';
import DateInfoItem from '@/components/employees/power-edit/info-items/DateItem.vue';
import CustomInfoItem from '@/components/employees/power-edit/info-items/CustomItem.vue';
import { TYPES } from '@/components/employees/power-edit/js/fieldTypes.js';

export default {
  components: {
    DefaultInfoItem,
    DateInfoItem,
    CustomInfoItem
  },
  data() {
    return {
      TYPES: TYPES,
      valid: true
    };
  },
  props: ['field', 'item']
};
</script>
