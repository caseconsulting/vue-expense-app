<template>
  <v-container>
    <v-row>
      <v-col md="6" sm="12" class="mt-4">
        <job-experiences-chart></job-experiences-chart>
      </v-col>
      <v-col md="6" sm="12" class="mt-4">
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
      <v-col md="6" sm="12" class="mt-4">
        <employees-table></employees-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CaseYearsChart from '../custom-charts/CaseYearsChart.vue';
import JobExperiencesChart from '../custom-charts/JobExperiencesChart.vue';
import JobRoleChart from '../custom-charts/JobRoleChart.vue';
import PrimesChart from '../custom-charts/PrimesChart.vue';
import LanguagesChart from '../custom-charts/LanguagesChart.vue';
import EmployeesTable from '../custom-charts/EmployeesTable.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    CaseYearsChart,
    JobExperiencesChart,
    JobRoleChart,
    PrimesChart,
    LanguagesChart,
    EmployeesTable
  }
};
</script>
