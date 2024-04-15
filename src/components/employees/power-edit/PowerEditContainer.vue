<template>
  <div>
    <field-selection :fields="fields" :selectedFields="selectedFields"></field-selection>
    <power-edit-table
      :fields="[FIELDS.NAME, ...selectedFields, FIELDS.BLANK]"
      :search="props.search"
    ></power-edit-table>
  </div>
</template>

<script setup>
import FieldSelection from '@/components/employees/power-edit/FieldSelection.vue';
import PowerEditTable from '@/components/employees/power-edit/PowerEditTable.vue';
import { ref } from 'vue';
const FIELDS = require('@/components/employees/power-edit/js/fields.js');

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['search']);
const fields = ref(Object.values(FIELDS));
const selectedFields = ref([FIELDS.EMPLOYEE_NUMBER, FIELDS.WORK_STATUS, FIELDS.JOB_ROLE]);
</script>
