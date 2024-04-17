<template>
  <div>
    <v-btn @click="emitter.emit('cancel-power-edit')" variant="text" class="float-right">
      <v-tooltip activator="parent">Exit power edit mode</v-tooltip>
      <v-icon size="x-large">mdi-pencil-off</v-icon>
    </v-btn>
    <field-selection :fields="fields" :selectedFields="selectedFields" class="pb-4 w-100"></field-selection>
    <power-edit-table
      :fields="[FIELDS.NAME, ...selectedFields, FIELDS.BLANK]"
      :search="props.search"
    ></power-edit-table>
  </div>
</template>

<script setup>
import FieldSelection from '@/components/employees/power-edit/FieldSelection.vue';
import PowerEditTable from '@/components/employees/power-edit/PowerEditTable.vue';
import { inject, ref } from 'vue';
import FIELDS from '@/components/employees/power-edit/js/fields.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['search']);
const emitter = inject('emitter');
const fields = ref(Object.values(FIELDS));
const selectedFields = ref([FIELDS.EMPLOYEE_NUMBER, FIELDS.WORK_STATUS, FIELDS.JOB_ROLE]);
</script>
