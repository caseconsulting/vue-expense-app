<template>
  <v-container>
    <v-row>
      <v-col md="6" sm="12">
        <job-experiences-chart></job-experiences-chart>
      </v-col>
      <v-col md="6" sm="12">
        <job-role-chart></job-role-chart>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" sm="12">
        <job-experiences-chart></job-experiences-chart>
      </v-col>
      <v-col md="6" sm="12">
        <job-role-chart></job-role-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import JobExperiencesChart from '../customCharts/JobExperiencesChart.vue';
import JobRoleChart from '../customCharts/JobRoleChart.vue';

export default {
  components: {
    JobExperiencesChart,
    JobRoleChart
  }
};
</script>
