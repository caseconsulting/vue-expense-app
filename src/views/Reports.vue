<template>
  <div>
    <v-card :elevation="3" class="">
      <v-card color="#bc3825">
        <v-card-title headline v-bind:class="{ 'justify-center': isMobile }">
          <h2 class="text-center white--text">Reports</h2>
        </v-card-title>
      </v-card>
      <v-container fluid>
        <reports-page-loader v-if="loading"></reports-page-loader>
        <!-- user is not mobile -->
        <v-tabs v-else color="blue" center-active grow show-arrows @change="changeTab" v-model="currentTab">
          <v-tab href="#contracts" :disabled="loading">Contracts</v-tab>
          <v-tab href="#customerOrgs" :disabled="loading">Customer Orgs</v-tab>
          <v-tab href="#jobRoles" :disabled="loading">Job Roles</v-tab>
          <v-tab href="#securityInfo" :disabled="loading">Security Info</v-tab>
          <v-tab-item id="contracts" class="mx-2 my-6">
            <ReportsContracts />
          </v-tab-item>
          <v-tab-item id="customerOrgs" class="mx-2 my-6">
            <ReportsCustomerOrgs />
          </v-tab-item>
          <v-tab-item id="jobRoles" class="mx-2 my-6">
            <ReportsJobRoles />
          </v-tab-item>
          <v-tab-item id="securityInfo" class="mx-2 my-6">
            <ReportsSecurityInfo />
          </v-tab-item>
        </v-tabs>
      </v-container>
    </v-card>
  </div>
</template>
<script>
import ReportsPageLoader from '@/components/reports/ReportsPageLoader.vue';
import ReportsContracts from '@/components/reports/ReportsContracts.vue';
import ReportsCustomerOrgs from '@/components/reports/ReportsCustomerOrgs.vue';
import ReportsJobRoles from '@/components/reports/ReportsJobRoles.vue';
import ReportsSecurityInfo from '../components/reports/ReportsSecurityInfo.vue';
import { updateStoreEmployees, updateStoreContracts } from '@/utils/storeUtils';
import { isMobile } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook.
 */
async function created() {
  if (this.$store.getters.storeIsPopulated) {
    await Promise.all([
      !this.$store.getters.employees ? this.updateStoreEmployees() : '',
      !this.$store.getters.contracts ? this.updateStoreContracts() : ''
    ]);
    this.loading = false;
  }
  if (this.$route.params.requestedDataType) {
    this.currentTab = this.$route.params.requestedDataType;
    this.wasRedirected = true;
    window.scrollTo(0, 0);
  }
} // created

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

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the store is populated from initial page load.
 *
 * @returns boolean - True if the store is populated
 */
function storeIsPopulated() {
  return this.$store.getters.storeIsPopulated;
} // storeIsPopulated

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  components: {
    ReportsContracts,
    ReportsCustomerOrgs,
    ReportsJobRoles,
    ReportsSecurityInfo,
    ReportsPageLoader
  },
  computed: {
    isMobile,
    storeIsPopulated
  },
  data() {
    return {
      contracts: null,
      currentTab: null,
      loading: true,
      wasRedirected: false
    };
  },
  methods: {
    changeTab,
    updateStoreContracts,
    updateStoreEmployees
  },
  watch: {
    async storeIsPopulated() {
      if (this.$store.getters.storeIsPopulated) {
        await Promise.all([
          !this.$store.getters.employees ? this.updateStoreEmployees() : '',
          !this.$store.getters.contracts ? this.updateStoreContracts() : ''
        ]);
        this.loading = false;
      }
    }
  }
};
</script>
