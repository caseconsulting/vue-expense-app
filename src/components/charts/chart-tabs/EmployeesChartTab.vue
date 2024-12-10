<template>
  <v-container class="px-1 px-md-4">
    <v-row>
      <v-col md="6" sm="12" class="mt-4 d-flex flex-column justify-center">
        <employees-table></employees-table>
      </v-col>
      <v-col md="6" sm="12" class="mt-4">
        <employee-clearances-table></employee-clearances-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" sm="12" class="mt-2">
        <job-experiences-chart :colors="colors"></job-experiences-chart>
      </v-col>
      <v-col md="6" sm="12" class="mt-2">
        <case-years-chart :colors="colors"></case-years-chart>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" sm="12" class="mt-4">
        <primes-chart :colors="colors"></primes-chart>
      </v-col>
      <v-col md="6" sm="12" class="mt-4">
        <contracts-chart :colors="colors"></contracts-chart>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" sm="12" class="mt-4">
        <languages-chart :colors="colors"></languages-chart>
      </v-col>
      <v-col md="6" sm="12" class="mt-4">
        <job-role-chart :colors="colors"></job-role-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import CaseYearsChart from '../custom-charts/CaseYearsChart.vue';
import ContractsChart from '../custom-charts/ContractsChart.vue';
import EmployeesTable from '../custom-charts/EmployeesTable.vue';
import EmployeeClearancesTable from '../custom-charts/EmployeeClearancesTable.vue';
import JobExperiencesChart from '../custom-charts/JobExperiencesChart.vue';
import JobRoleChart from '../custom-charts/JobRoleChart.vue';
import LanguagesChart from '../custom-charts/LanguagesChart.vue';
import PrimesChart from '../custom-charts/PrimesChart.vue';

import { ref } from 'vue';
let colors = ref([
  'rgba(252, 128, 121, 0.9)',
  'rgba(221, 170, 140, 0.9)',
  'rgba(228, 201, 158, 0.9)',
  'rgba(76, 136, 170, 0.9)',
  'rgba(145, 160, 170, 0.9)'
]);
</script>
