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
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn text color="#bc3825" dark class="font-weight-bold" v-bind="attrs" v-on="on"
                >{{ statsTab.toUpperCase() }} <v-icon class="pb-1">expand_more</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="selectDropDown('employees')" :disabled="!dataLoaded">Employees</v-list-item>
              <v-list-item @click="selectDropDown('education')" :disabled="!dataLoaded">Education</v-list-item>
              <v-list-item @click="selectDropDown('certifications')" :disabled="!dataLoaded"
                >Certifications</v-list-item
              >
              <v-list-item @click="selectDropDown('technology')" :disabled="!dataLoaded">Technology</v-list-item>
              <v-list-item @click="selectDropDown('customer Org')" :disabled="!dataLoaded">Customer Org</v-list-item>
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
          <v-tab href="#education" :disabled="!dataLoaded">Education</v-tab>
          <v-tab href="#technologies" :disabled="!dataLoaded">Technology</v-tab>
          <v-tab href="#certifications" :disabled="!dataLoaded">Certifications</v-tab>
          <v-tab href="#customerOrg" :disabled="!dataLoaded">Customer Org</v-tab>
          <v-tab-item id="employees" class="mx-2 my-6">
            <employees-chart-tab v-if="currentTab === 'employees' && dataLoaded"></employees-chart-tab>
          </v-tab-item>
          <v-tab-item id="education" class="mx-2 my-6">
            <education-chart-tab v-if="currentTab === 'education' && dataLoaded"></education-chart-tab>
          </v-tab-item>
          <v-tab-item id="technologies" class="mx-2 my-6">
            <tech-chart-tab v-if="currentTab === 'technologies' && dataLoaded"></tech-chart-tab>
          </v-tab-item>
          <v-tab-item id="certifications" class="mx-2 my-6">
            <certifications-chart-tab v-if="currentTab === 'certifications' && dataLoaded"></certifications-chart-tab>
          </v-tab-item>
          <v-tab-item id="customerOrg" class="mx-2 my-6">
            <customer-org-chart-tab v-if="currentTab === 'customerOrg' && dataLoaded"></customer-org-chart-tab>
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
import { isMobile, storeIsPopulated } from '@/utils/utils';
import { updateStoreEmployees } from '@/utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                   LIFECYCLE                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted hook
 *
 */
async function mounted() {
  if (this.storeIsPopulated) {
    if (!this.$store.getters.employees) {
      await this.updateStoreEmployees();
    }
    this.dataLoaded = true;
  }
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * changes the tab
 *
 * @param event - the new tab
 */
function changeTab(event) {
  this.currentTab = event;
} // changeTab

/**
 * This is used to select the correct tab on mobile devices
 * @param tabName - The name of the tab
 */
function selectDropDown(tabName) {
  this.statsTab = tabName;
} // selectDropDown

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    CertificationsChartTab,
    EmployeesChartTab,
    TechChartTab,
    EducationChartTab,
    CustomerOrgChartTab
  },
  computed: {
    isMobile,
    storeIsPopulated
  },
  mounted,
  data() {
    return {
      currentTab: '',
      dataLoaded: false,
      statsTab: 'employees'
    };
  },
  methods: {
    changeTab,
    selectDropDown,
    updateStoreEmployees
  },
  watch: {
    storeIsPopulated: async function () {
      if (!this.$store.getters.employees) {
        await this.updateStoreEmployees();
      }
      if (this.storeIsPopulated) this.dataLoaded = true;
    }
  }
};
</script>

<style>
.chart {
  height: 60%;
  width: 70%;
}
</style>
