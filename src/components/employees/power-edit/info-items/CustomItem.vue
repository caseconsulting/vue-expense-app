<template>
  <PlaceOfBirth v-if="field.title === FIELDS.PLACE_OF_BIRTH.title" :field="field" :item="item" />
  <WorkStatus v-else-if="field.title === FIELDS.WORK_STATUS.title" :field="field" :item="item" />
  <div v-else>{{ item[field.key] }}</div>
</template>

<script>
import PlaceOfBirth from '@/components/employees/power-edit/info-items/custom-items/PlaceOfBirth.vue';
import WorkStatus from '@/components/employees/power-edit/info-items/custom-items/WorkStatus.vue';
const FIELDS = require('@/components/employees/power-edit/js/fields.js');

export default {
  components: { PlaceOfBirth, WorkStatus },
  data() {
    return {
      FIELDS
    };
  },
  props: ['field', 'item']
};
</script>
