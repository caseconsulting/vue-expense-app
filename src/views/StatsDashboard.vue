<template>
  <div>
    <v-card :elevation="3" class="">
      <v-card color="#bc3825">
        <v-card-title headline v-bind:class="{ 'justify-center': isMobile }">
          <h2 class="text-center white--text">Stats Dashboard</h2>
        </v-card-title>
      </v-card>
      <v-container fluid>
        <!-- user is mobile -->
        <div v-if="isMobile" class="text-center">
          <v-menu eager offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn text color="#bc3825" dark class="font-weight-bold" v-bind="attrs" v-on="on"
                >{{ statsTab.toUpperCase() }} <v-icon class="pb-1">expand_more</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="selectDropDown('employees')">Employees</v-list-item>
              <v-list-item @click="selectDropDown('education')">Education</v-list-item>
              <v-list-item @click="selectDropDown('certifications')">Certifications</v-list-item>
              <v-list-item @click="selectDropDown('technology')">Technology</v-list-item>
              <v-list-item @click="selectDropDown('customer Org')">Customer Org</v-list-item>
            </v-list>
          </v-menu>
          <hr class="my-1" />
          <employees-chart-tab v-if="statsTab === 'employees'"></employees-chart-tab>
          <education-chart-tab v-if="statsTab === 'education'"></education-chart-tab>
          <tech-chart-tab v-if="statsTab === 'technology'"></tech-chart-tab>
          <certifications-chart-tab v-if="statsTab === 'certifications'"></certifications-chart-tab>
          <customer-org-chart-tab v-if="statsTab === 'customer Org'"></customer-org-chart-tab>
        </div>
        <!-- user is not mobile -->
        <v-tabs v-else color="basil" center-active grow show-arrows class="" @change="changeTab">
          <v-tab href="#employees">Employees</v-tab>
          <v-tab href="#education">Education</v-tab>
          <v-tab href="#technologies">Technology</v-tab>
          <v-tab href="#certifications">Certifications</v-tab>
          <v-tab href="#customerOrg">Customer Org</v-tab>
          <v-tab-item id="employees" class="mx-2 my-6">
            <employees-chart-tab v-if="currentTab === 'employees'"></employees-chart-tab>
          </v-tab-item>
          <v-tab-item id="education" class="mx-2 my-6">
            <education-chart-tab v-if="currentTab === 'education'"></education-chart-tab>
          </v-tab-item>
          <v-tab-item id="technologies" class="mx-2 my-6">
            <tech-chart-tab v-if="currentTab === 'technologies'"></tech-chart-tab>
          </v-tab-item>
          <v-tab-item id="certifications" class="mx-2 my-6">
            <certifications-chart-tab v-if="currentTab === 'certifications'"></certifications-chart-tab>
          </v-tab-item>
          <v-tab-item id="customerOrg" class="mx-2 my-6">
            <customer-org-chart-tab v-if="currentTab === 'customerOrg'"></customer-org-chart-tab>
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
import CustomerOrgChartTab from '../components/charts/chartTabs/CustomerOrgChartTab.vue';

function changeTab(event) {
  //console.log(event);
  this.currentTab = event;
}

/**
 * This is used to select the correct tab on mobile devices
 * @param tabName - The name of the tab
 */
function selectDropDown(tabName) {
  this.statsTab = tabName;
} // selectDropDown

export default {
  components: {
    CertificationsChartTab,
    EmployeesChartTab,
    TechChartTab,
    EducationChartTab,
    CustomerOrgChartTab
  },
  computed: {
    isMobile() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return true;
        default:
          return false;
      }
    }
  },
  data() {
    return {
      currentTab: '',
      statsTab: 'employees'
    };
  },
  methods: {
    changeTab,
    selectDropDown
  }
};
</script>

<style>
.chart {
  height: 60%;
  width: 70%;
}
</style>
