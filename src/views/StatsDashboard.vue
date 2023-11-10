<template>
  <div>
    <v-card :elevation="3" class="">
      <v-card color="#bc3825">
        <v-card-title class="d-flex align-center header_style" v-bind:class="{ 'justify-center': isMobile }">
          <h2 class="text-center text-white">Stats Dashboard</h2>
        </v-card-title>
      </v-card>
      <v-container fluid>
        <!-- user is mobile -->
        <div v-if="isMobile" class="text-center">
          <v-menu offset="y">
            <template v-slot:activator="{ props }">
              <v-btn variant="text" color="#bc3825" theme="dark" class="font-weight-bold" v-bind="props"
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
          <employees-chart-tab v-if="statsTab === 'employees' && dataLoaded"></employees-chart-tab>
          <education-chart-tab v-if="statsTab === 'education' && dataLoaded"></education-chart-tab>
          <tech-chart-tab v-if="statsTab === 'technology' && dataLoaded"></tech-chart-tab>
          <certifications-chart-tab v-if="statsTab === 'certifications' && dataLoaded"></certifications-chart-tab>
          <customer-org-chart-tab v-if="statsTab === 'customer Org' && dataLoaded"></customer-org-chart-tab>
        </div>
        <!-- user is not mobile -->
        <v-tabs
          v-else
          color="basil"
          v-model="currentTab"
          center-active
          grow
          show-arrows
          @update:model-value="changeTab"
        >
          <v-tab value="employees">Employees</v-tab>
          <v-tab value="education" :disabled="!dataLoaded">Education</v-tab>
          <v-tab value="technologies" :disabled="!dataLoaded">Technology</v-tab>
          <v-tab value="certifications" :disabled="!dataLoaded">Certifications</v-tab>
          <v-tab value="customerOrg" :disabled="!dataLoaded">Customer Org</v-tab>
        </v-tabs>
        <v-window v-model="currentTab">
          <v-window-item value="employees" class="mx-2 my-6">
            <employees-chart-tab v-if="currentTab === 'employees' && dataLoaded"></employees-chart-tab>
          </v-window-item>
          <v-window-item value="education" class="mx-2 my-6">
            <education-chart-tab v-if="currentTab === 'education' && dataLoaded"></education-chart-tab>
          </v-window-item>
          <v-window-item value="technologies" class="mx-2 mb-6 mt-0">
            <tech-chart-tab v-if="currentTab === 'technologies' && dataLoaded"></tech-chart-tab>
          </v-window-item>
          <v-window-item value="certifications" class="mx-2 my-6">
            <certifications-chart-tab v-if="currentTab === 'certifications' && dataLoaded"></certifications-chart-tab>
          </v-window-item>
          <v-window-item value="customerOrg" class="mx-2 my-6">
            <customer-org-chart-tab v-if="currentTab === 'customerOrg' && dataLoaded"></customer-org-chart-tab>
          </v-window-item>
        </v-window>
        <!-- loading -->
        <div v-if="!dataLoaded">
          <v-row class="flex justify-center">
            <v-col md="6" sm="12" class="mt-4">
              <v-skeleton-loader type="list-item@5" class="mx-auto" width="70%"></v-skeleton-loader>
            </v-col>
            <v-col md="6" sm="12" class="mt-4">
              <v-skeleton-loader type="list-item@5" class="mx-auto" width="70%"></v-skeleton-loader>
            </v-col>
          </v-row>
          <div v-for="i in 2" :key="i" class="mx-auto my-6" style="width: 80%">
            <v-skeleton-loader
              v-for="i in 2"
              :key="i"
              type="text, image"
              class="mx-2 d-inline-block"
              width="48%"
            ></v-skeleton-loader>
          </div>
        </div>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import CertificationsChartTab from '../components/charts/chart-tabs/CertificationsChartTab.vue';
import EmployeesChartTab from '../components/charts/chart-tabs/EmployeesChartTab.vue';
import TechChartTab from '../components/charts/chart-tabs/TechChartTab.vue';
import EducationChartTab from '../components/charts/chart-tabs/EducationChartTab.vue';
import CustomerOrgChartTab from '../components/charts/chart-tabs/CustomerOrgChartTab.vue';
import { isMobile, storeIsPopulated } from '@/utils/utils';
import { updateStoreEmployees, updateStoreContracts } from '@/utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                   LIFECYCLE                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook.
 */
function created() {
  let requestedDataType = localStorage.getItem('requestedDataType');
  if (requestedDataType) {
    let mappings = {};
    mappings['jobRoles'] = 'employees';
    mappings['contracts'] = 'employees';
    mappings['certifications'] = 'employees';
    mappings['customerOrgs'] = 'customerOrg';
    this.changeTab(mappings[requestedDataType]);
  }
} // created

/**
 * Mounted lifecycle hook.
 */
async function mounted() {
  if (this.storeIsPopulated) {
    await Promise.all([
      !this.$store.getters.employees ? this.updateStoreEmployees() : '',
      !this.$store.getters.contracts ? this.updateStoreContracts() : ''
    ]);
    this.dataLoaded = true;
  }
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Changes the tab display.
 *
 * @param event - the new tab
 */
function changeTab(event) {
  this.currentTab = event;
} // changeTab

/**
 * This is used to select the correct tab on mobile devices.
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
  created,
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
    updateStoreEmployees,
    updateStoreContracts
  },
  watch: {
    storeIsPopulated: async function () {
      await Promise.all([
        !this.$store.getters.employees ? this.updateStoreEmployees() : '',
        !this.$store.getters.contracts ? this.updateStoreContracts() : ''
      ]);
      if (this.storeIsPopulated) this.dataLoaded = true;
    }
  }
};
</script>
