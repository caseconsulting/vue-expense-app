<template>
  <v-container>
    <h1>Employee Statistics Dashboard</h1>
    <div>
      <v-container flex>
        <v-col>
          <v-row>
            <div class="chart">
              <tech-bar-chart />
            </div>
          </v-row>
          <v-row>
            <div class="chart">
              <certification-chart />
            </div>
          </v-row>
          <v-row>
            <div class="chart">
              <job-experiences-chart />
            </div>
          </v-row>
          <v-row>
            <div class="chart">
              <ic-chart />
            </div>
          </v-row>
          <v-row>
            <div class="chart">
              <job-role-chart />
            </div>
          </v-row>
          <v-row>
            <div class="chart">
              <highest-degree-chart />
            </div>
          </v-row>
        </v-col>
      </v-container>
    </div>
  </v-container>
</template>

<script>
import TechBarChart from '../components/customCharts/TechBarChart.vue';
import JobExperiencesChart from '../components/customCharts/JobExperiencesChart.vue';
import CertificationChart from '../components/customCharts/CertificationChart.vue';
import IcChart from '../components/customCharts/ICChart.vue';
import JobRoleChart from '../components/customCharts/JobRoleChart.vue';
import HighestDegreeChart from '../components/customCharts/HighestDegreeChart.vue';

export default {
  components: {
    TechBarChart,
    JobExperiencesChart,
    CertificationChart,
    IcChart,
    JobRoleChart,
    HighestDegreeChart
  }
};
</script>

<style>
.chart {
  height: 60%;
  width: 70%;
}
</style>
