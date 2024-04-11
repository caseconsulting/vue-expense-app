<template>
  <default-edit-item
    v-if="field.editType === TYPES.DEFAULT"
    :field="field"
    :item="item"
    :valid="valid"
  ></default-edit-item>
  <date-edit-item
    v-else-if="field.editType === TYPES.DATE_MMYYYY || field.infoType === TYPES.DATE_MMDDYYYY"
    :field="field"
    :item="item"
    :valid="valid"
  ></date-edit-item>
  <custom-edit-item v-else :field="field" :item="item" :valid="valid"></custom-edit-item>
</template>

<script>
import DefaultEditItem from '@/components/employees/power-edit/edit-items/DefaultItem.vue';
import DateEditItem from '@/components/employees/power-edit/edit-items/DateItem.vue';
import CustomEditItem from '@/components/employees/power-edit/edit-items/CustomItem.vue';
import { TYPES } from '@/components/employees/power-edit/js/fieldTypes.js';

export default {
  components: {
    DefaultEditItem,
    DateEditItem,
    CustomEditItem
  },
  data() {
    return {
      TYPES: TYPES
    };
  },
  props: ['expanded', 'field', 'item', 'valid']
};
</script>
