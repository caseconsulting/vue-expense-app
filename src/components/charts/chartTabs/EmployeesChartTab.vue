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
      <v-col md="6" sm="12" class="my-4">
        <job-role-chart></job-role-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CaseYearsChart from '../customCharts/CaseYearsChart.vue';
import JobExperiencesChart from '../customCharts/JobExperiencesChart.vue';
import JobRoleChart from '../customCharts/JobRoleChart.vue';
import PrimesChart from '../customCharts/PrimesChart.vue';

export default {
  components: {
    CaseYearsChart,
    JobExperiencesChart,
    JobRoleChart,
    PrimesChart
  }
};
</script>
