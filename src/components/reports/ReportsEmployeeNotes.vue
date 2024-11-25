<template>
  <div>
    <v-container fluid class="px-1 px-md-4">
      <component :is="toggleOptions[toggleSelected].component" />
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import EmployeeNotesGraphs from '@/components/reports/employeeNotesComponents/EmployeeNotesGraphs';
import EmployeeNotesTable from '@/components/reports/employeeNotesComponents/EmployeeNotesTable';

// chooser for graphs vs chart
const toggleSelected = ref(1);
const toggleOptions = ref([
  {
    value: 'graph',
    component: EmployeeNotesGraphs,
    label: 'Graphs'
  },
  {
    value: 'table',
    component: EmployeeNotesTable,
    label: 'Table'
  }
]);
</script>
