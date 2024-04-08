<template>
  <div v-if="!this.editing" class="d-flex align-center w-100 h-100 pointer info-item">
    <default-info-item v-if="field.infoType === TYPES.DEFAULT" :field="field" :item="item"></default-info-item>
    <date-info-item
      v-else-if="field.infoType === TYPES.DATE_MMYYYY || field.infoType === TYPES.DATE_MMDDYYYY"
      :field="field"
      :item="item"
    ></date-info-item>
    <custom-info-item v-else :field="field" :item="item"></custom-info-item>
  </div>
  <div v-else class="d-flex align-center w-100 h-100 pointer">
    <default-edit-item v-if="field.editType === TYPES.DEFAULT" :field="field" :item="item"></default-edit-item>
    <date-edit-item
      v-else-if="field.editType === TYPES.DATE_MMYYYY || field.infoType === TYPES.DATE_MMDDYYYY"
      :field="field"
      :item="item"
    ></date-edit-item>
    <custom-edit-item v-else :field="field" :item="item"></custom-edit-item>
  </div>
</template>

<script>
import DefaultInfoItem from '@/components/employees/power-edit/info-items/DefaultItem.vue';
import DefaultEditItem from '@/components/employees/power-edit/edit-items/DefaultItem.vue';
import DateInfoItem from '@/components/employees/power-edit/info-items/DateItem.vue';
import DateEditItem from '@/components/employees/power-edit/edit-items/DateItem.vue';
import CustomInfoItem from '@/components/employees/power-edit/info-items/CustomItem.vue';
import CustomEditItem from '@/components/employees/power-edit/edit-items/CustomItem.vue';
import { TYPES } from '@/components/employees/power-edit/fields.js';

export default {
  components: {
    DefaultInfoItem,
    DefaultEditItem,
    DateInfoItem,
    DateEditItem,
    CustomInfoItem,
    CustomEditItem
  },
  data() {
    return {
      TYPES: TYPES
    };
  },
  props: ['editing', 'field', 'item']
};
</script>
