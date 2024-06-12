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
        <job-experiences-chart></job-experiences-chart>
      </v-col>
      <v-col md="6" sm="12" class="mt-2">
        <case-years-chart></case-years-chart>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" sm="12" class="mt-4">
        <primes-chart></primes-chart>
      </v-col>
      <v-col md="6" sm="12" class="mt-4">
        <job-role-chart></job-role-chart>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" sm="12" class="mt-4">
        <languages-chart></languages-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import CaseYearsChart from '../custom-charts/CaseYearsChart.vue';
import JobExperiencesChart from '../custom-charts/JobExperiencesChart.vue';
import JobRoleChart from '../custom-charts/JobRoleChart.vue';
import PrimesChart from '../custom-charts/PrimesChart.vue';
import LanguagesChart from '../custom-charts/LanguagesChart.vue';
import EmployeesTable from '../custom-charts/EmployeesTable.vue';
import EmployeeClearancesTable from '../custom-charts/EmployeeClearancesTable.vue';
</script>
