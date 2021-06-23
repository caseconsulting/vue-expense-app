<template>
  <v-container>
    <h1>Employee Statistics Dashboard</h1>
    <div>
      <v-container flex>
        <v-row>
          <v-col>
            <div class="chart">
              <tech-bar-chart />
            </div>
          </v-col>
          <v-col>
            <div class="chart">
              <certification-chart />
            </div>
          </v-col>
          <v-col>
            <div class="chart">
              <job-experiences-chart />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>

<script>
import TechBarChart from '../components/customCharts/TechBarChart.vue';
import JobExperiencesChart from '../components/customCharts/JobExperiencesChart.vue';
import CertificationChart from '../components/customCharts/CertificationChart.vue';

export default {
  components: {
    TechBarChart,
    JobExperiencesChart,
    CertificationChart
  }
};
</script>

<style>
.chart {
  height: 50%;
  width: 100%;
}
</style>
