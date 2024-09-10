<template>
  <div>
    <v-container class="d-flex justify-center py-0">
      <v-btn-toggle v-model="toggleSelected" mandatory color="primary" style="height: 2.3em" variant="outlined">
        <v-btn v-for="(o, i) in toggleOptions" :key="i" :value="i" style="height: 2.3em">{{ o.label }}</v-btn>
      </v-btn-toggle>
    </v-container>

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
const toggleSelected = ref(0);
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
