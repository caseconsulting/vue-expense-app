<template>
<<<<<<< HEAD
  <div>
    <v-card :elevation="3" class="ma-15 mx-20">
      <v-card color="#bc3825">
        <v-card-title headline>
          <h2 class="white--text">Stats Dashboard</h2>
        </v-card-title>
      </v-card>
      <v-container fluid>
        <v-tabs color="basil" center-active grow show-arrows class="ma-2">
          <v-tab href="#technologies">Technology</v-tab>
          <v-tab href="#employees">Employees</v-tab>
          <v-tab href="#certifications">Certifications</v-tab>
          <v-tab href="#education">Education</v-tab>
          <v-tab-item id="technologies" class="ma-6">
            <tech-chart-tab></tech-chart-tab>
          </v-tab-item>
          <v-tab-item id="employees" class="ma-6">
            <employees-chart-tab></employees-chart-tab>
          </v-tab-item>
          <v-tab-item id="certifications" class="ma-6">
            <certifications-chart-tab></certifications-chart-tab>
          </v-tab-item>
          <v-tab-item id="education" class="ma-6">
            <education-chart-tab></education-chart-tab>
          </v-tab-item>
        </v-tabs>
=======
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
              <ic-table />
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
          <v-row>
            <div class="chart">
              <customer-org-chart />
            </div>
          </v-row>
        </v-col>
>>>>>>> 2380-better-IC-chart: changed ICChart to be a table, and added customerorgchart pie chart
      </v-container>
    </v-card>
  </div>
</template>

<script>
<<<<<<< HEAD
import CertificationsChartTab from '../components/charts/chartTabs/CertificationsChartTab.vue';
import EmployeesChartTab from '../components/charts/chartTabs/EmployeesChartTab.vue';
import TechChartTab from '../components/charts/chartTabs/TechChartTab.vue';
import EducationChartTab from '../components/charts/chartTabs/EducationChartTab.vue';

export default {
  components: {
    CertificationsChartTab,
    EmployeesChartTab,
    TechChartTab,
    EducationChartTab
=======
import TechBarChart from '../components/customCharts/TechBarChart.vue';
import JobExperiencesChart from '../components/customCharts/JobExperiencesChart.vue';
import CertificationChart from '../components/customCharts/CertificationChart.vue';
import IcTable from '../components/customCharts/IcTable.vue';
import JobRoleChart from '../components/customCharts/JobRoleChart.vue';
import HighestDegreeChart from '../components/customCharts/HighestDegreeChart.vue';
import CustomerOrgChart from '../components/customCharts/CustomerOrgChart.vue';

export default {
  components: {
    TechBarChart,
    JobExperiencesChart,
    CertificationChart,
    IcTable,
    JobRoleChart,
    HighestDegreeChart,
    CustomerOrgChart
>>>>>>> 2380-better-IC-chart: changed ICChart to be a table, and added customerorgchart pie chart
  }
};
</script>

<style>
.chart {
  height: 60%;
  width: 70%;
}
</style>
