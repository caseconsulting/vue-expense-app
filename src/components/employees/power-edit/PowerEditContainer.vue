<template>
  <div>
    <field-selection :fields="fields" :selectedFields="selectedFields"></field-selection>
    <power-edit-table :fields="[FIELDS.NAME, ...selectedFields, FIELDS.BLANK]" :search="search"></power-edit-table>
  </div>
</template>

<script>
import FieldSelection from '@/components/employees/power-edit/FieldSelection.vue';
import PowerEditTable from '@/components/employees/power-edit/PowerEditTable.vue';
const FIELDS = require('@/components/employees/power-edit/js/fields.js');

export default {
  components: {
    FieldSelection,
    PowerEditTable
  },
  data() {
    return {
      FIELDS,
      fields: Object.values(FIELDS),
      selectedFields: [FIELDS.EMPLOYEE_NUMBER, FIELDS.WORK_STATUS, FIELDS.JOB_ROLE]
    };
  },
  props: ['search']
};
</script>
