<template>
  <div>
    <v-btn
      v-if="requestedDataType"
      id="backBtn"
      class="mb-3"
      elevation="2"
      @click="backClick()"
      :size="isMobile ? 'x-small' : 'default'"
    >
      <template v-slot:prepend>
        <v-icon size="large" class="pr-1">mdi-arrow-left-thin</v-icon>
      </template>
      Back
    </v-btn>
    <v-card>
      <v-card color="#bc3825">
        <v-card-title class="d-flex align-center header_style" v-bind:class="{ 'justify-center': isMobile }">
          <h2 class="text-white">Reports</h2>
          <v-spacer></v-spacer>
          <v-tooltip location="bottom">
            <template v-slot:activator="{ on, attrs }">
              <v-btn id="contactEmployeesBtn" @click="renderContactEmployeesModal()" v-bind="attrs" v-on="on">
                Contact
                <template v-slot:append>
                  <v-icon>mdi-email</v-icon>
                </template>
              </v-btn>
            </template>
            <span>Contact Active Employees In The Table Below</span>
          </v-tooltip>
        </v-card-title>
      </v-card>
      <v-container fluid>
        <reports-page-loader v-if="this.loading"></reports-page-loader>
        <div v-else>
          <!-- user is not mobile -->
          <v-tabs color="blue" center-active grow show-arrows @update:model-value="changeTab" v-model="currentTab">
            <v-tab value="contracts" :disabled="loading">Contracts</v-tab>
            <v-tab value="customerOrgs" :disabled="loading">Customer Orgs</v-tab>
            <v-tab value="certifications" :disabled="loading">Certifications</v-tab>
            <v-tab value="languages" :disabled="loading">Foreign Languages</v-tab>
            <v-tab value="jobRoles" :disabled="loading">Job Roles</v-tab>
            <v-tab value="technologies" :disabled="loading">Technologies</v-tab>
            <v-tab value="securityInfo" :disabled="loading">Security Info</v-tab>
          </v-tabs>
          <v-window v-model="currentTab">
            <v-window-item value="contracts" class="mx-2 my-6">
              <ReportsContracts />
            </v-window-item>
            <v-window-item value="customerOrgs" class="mx-2 my-6">
              <ReportsCustomerOrgs />
            </v-window-item>
            <v-window-item value="certifications" class="mx-2 my-6">
              <ReportsCertifications />
            </v-window-item>
            <v-window-item value="languages" class="mx-2 my-6">
              <ReportsForeignLanguages />
            </v-window-item>
            <v-window-item value="jobRoles" class="mx-2 my-6">
              <ReportsJobRoles />
            </v-window-item>
            <v-window-item value="technologies" class="mx-2 my-6">
              <ReportsTechnologies />
            </v-window-item>
            <v-window-item value="securityInfo" class="mx-2 my-6">
              <ReportsSecurityInfo />
            </v-window-item>
          </v-window>
        </div>
      </v-container>
    </v-card>
    <v-dialog v-model="toggleContactEmployeesModal" width="60%" persistent>
      <contact-employees-modal :passedEmployees="employeesToContact" :key="contactKey"></contact-employees-modal>
    </v-dialog>
  </div>
</template>
<script>
import ContactEmployeesModal from '@/components/shared/ContactEmployeesModal.vue';
import ReportsPageLoader from '@/components/reports/ReportsPageLoader.vue';
import ReportsContracts from '@/components/reports/ReportsContracts.vue';
import ReportsCustomerOrgs from '@/components/reports/ReportsCustomerOrgs.vue';
import ReportsCertifications from '@/components/reports/ReportsCertifications.vue';
import ReportsForeignLanguages from '@/components/reports/ReportsForeignLanguages.vue';
import ReportsJobRoles from '@/components/reports/ReportsJobRoles.vue';
import ReportsTechnologies from '@/components/reports/ReportsTechnologies.vue';
import ReportsSecurityInfo from '../components/reports/ReportsSecurityInfo.vue';
import { updateStoreEmployees, updateStoreContracts, updateStoreTags } from '@/utils/storeUtils';
import { isMobile, userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook.
 */
async function created() {
  this.emitter.on('close-contact-employees-modal', () => (this.toggleContactEmployeesModal = false));
  this.emitter.on('list-of-employees-to-contact', (employees) => (this.employeesToContact = employees));
  if (this.$store.getters.storeIsPopulated) {
    await Promise.all([
      !this.$store.getters.employees ? this.updateStoreEmployees() : '',
      !this.$store.getters.contracts ? this.updateStoreContracts() : '',
      !this.$store.getters.tags && (userRoleIsAdmin() || userRoleIsManager()) ? this.updateStoreTags() : ''
    ]);
    this.loading = false;
  }
  if (localStorage.getItem('requestedDataType')) {
    this.currentTab = localStorage.getItem('requestedDataType');
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
 * Handler for back button click event.
 */
function backClick() {
  localStorage.setItem('requestedDataType', localStorage.getItem('requestedDataType'));
  this.$router.push({
    path: '/stats',
    name: 'stats'
  });
} // backClick

/**
 * Changes the tab display.
 *
 * @param event - the new tab
 */
function changeTab(event) {
  this.currentTab = event;
} // changeTab

function renderContactEmployeesModal() {
  this.contactKey++;
  this.emitter.emit('get-employees-to-contact', this.currentTab);
  this.toggleContactEmployeesModal = true;
}

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
    ContactEmployeesModal,
    ReportsContracts,
    ReportsCustomerOrgs,
    ReportsCertifications,
    ReportsForeignLanguages,
    ReportsJobRoles,
    ReportsTechnologies,
    ReportsSecurityInfo,
    ReportsPageLoader
  },
  computed: {
    isMobile,
    storeIsPopulated
  },
  data() {
    return {
      contactKey: 0,
      contracts: null,
      currentTab: null,
      employeesToContact: [],
      loading: true,
      toggleContactEmployeesModal: false,
      wasRedirected: false,
      requestedDataType: localStorage.getItem('requestedDataType')
    };
  },
  methods: {
    backClick,
    changeTab,
    renderContactEmployeesModal,
    updateStoreContracts,
    updateStoreEmployees,
    updateStoreTags
  },
  watch: {
    async storeIsPopulated() {
      if (this.$store.getters.storeIsPopulated) {
        await Promise.all([
          !this.$store.getters.employees ? this.updateStoreEmployees() : '',
          !this.$store.getters.contracts ? this.updateStoreContracts() : '',
          !this.$store.getters.tags && (userRoleIsAdmin() || userRoleIsManager()) ? this.updateStoreTags() : ''
        ]);
        this.loading = false;
      }
    }
  }
};
</script>
