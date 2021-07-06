<template>
  <div>
    <v-card :elevation="3" class="">
      <v-card color="#bc3825">
        <v-card-title headline>
          <h2 class="white--text">Stats Dashboard</h2>
        </v-card-title>
      </v-card>
      <v-container fluid>
        <v-tabs color="basil" center-active grow show-arrows class="">
          <v-tab href="#employees">Employees</v-tab>
          <v-tab href="#education">Education</v-tab>
          <v-tab href="#technologies">Technology</v-tab>
          <v-tab href="#certifications">Certifications</v-tab>
          <v-tab-item id="employees" class="mx-2 my-6">
            <employees-chart-tab></employees-chart-tab>
          </v-tab-item>
          <v-tab-item id="education" class="mx-2 my-6">
            <education-chart-tab></education-chart-tab>
          </v-tab-item>
          <v-tab-item id="technologies" class="mx-2 my-6">
            <tech-chart-tab></tech-chart-tab>
          </v-tab-item>
          <v-tab-item id="certifications" class="mx-2 my-6">
            <certifications-chart-tab></certifications-chart-tab>
          </v-tab-item>
        </v-tabs>
      </v-container>
    </v-card>
  </div>
</template>

<script>
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
  }
};
</script>

<style>
.chart {
  height: 60%;
  width: 70%;
}
</style>
