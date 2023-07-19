<template>
  <div>
    <v-btn
      v-if="$route.params.requestedDataType"
      id="backBtn"
      class="mb-3"
      elevation="2"
      @click="backClick()"
      :x-small="isMobile"
      ><v-icon class="pr-1">arrow_back</v-icon>Back</v-btn
    >
    <v-card>
      <v-card color="#bc3825">
        <v-card-title headline v-bind:class="{ 'justify-center': isMobile }">
          <h2 class="white--text">Reports</h2>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn id="contactEmployeesBtn" @click="renderContactEmployeesModal()" v-bind="attrs" v-on="on">
                Contact
                <v-icon right>email</v-icon>
              </v-btn>
            </template>
            <span>Contact Active Employees In The Table Below</span>
          </v-tooltip>
        </v-card-title>
      </v-card>
      <v-container fluid>
        <reports-page-loader v-if="loading"></reports-page-loader>
        <!-- user is not mobile -->
        <v-tabs
          v-else
          color="blue"
          center-active
          grow
          show-arrows
          :key="tabKey"
          @change="changeTab"
          v-model="currentTab"
        >
          <v-tab href="#contracts" :disabled="loading">Contracts</v-tab>
          <v-tab href="#customerOrgs" :disabled="loading">Customer Orgs</v-tab>
          <v-tab href="#certifications" :disabled="loading">Certifications</v-tab>
          <v-tab href="#languages" :disabled="loading">Foreign Languages</v-tab>
          <v-tab href="#jobRoles" :disabled="loading">Job Roles</v-tab>
          <v-tab href="#technologies" :disabled="loading">Technologies</v-tab>
          <v-tab href="#securityInfo" :disabled="loading">Security Info</v-tab>
          <v-tab-item id="contracts" class="mx-2 my-6">
            <ReportsContracts />
          </v-tab-item>
          <v-tab-item id="customerOrgs" class="mx-2 my-6">
            <ReportsCustomerOrgs />
          </v-tab-item>
          <v-tab-item id="certifications" class="mx-2 my-6">
            <ReportsCertifications />
          </v-tab-item>
          <v-tab-item id="languages" class="mx-2 my-6">
            <ReportsForeignLanguages />
          </v-tab-item>
          <v-tab-item id="jobRoles" class="mx-2 my-6">
            <ReportsJobRoles />
          </v-tab-item>
          <v-tab-item id="technologies" class="mx-2 my-6">
            <ReportsTechnologies />
          </v-tab-item>
          <v-tab-item id="securityInfo" class="mx-2 my-6">
            <ReportsSecurityInfo />
          </v-tab-item>
        </v-tabs>
      </v-container>
    </v-card>
    <v-dialog v-model="toggleContactEmployeesModal" width="50%" persistent>
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
  window.EventBus.$on('close-contact-employees-modal', () => (this.toggleContactEmployeesModal = false));
  window.EventBus.$on('list-of-employees-to-contact', (employees) => (this.employeesToContact = employees));

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
 * Handler for back button click event.
 */
function backClick() {
  this.$router.push({
    path: '/stats',
    name: 'stats',
    params: { requestedDataType: this.$route.params.requestedDataType }
  });
} // backClick

/**
 * Changes the tab display.
 *
 * @param event - the new tab
 */
function changeTab(event) {
  this.tabKey++;
  this.currentTab = event;
} // changeTab

function renderContactEmployeesModal() {
  this.contactKey++;
  window.EventBus.$emit('get-employees-to-contact');
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
      tabKey: 0,
      contactKey: 0,
      contracts: null,
      currentTab: null,
      employeesToContact: [],
      loading: true,
      toggleContactEmployeesModal: false,
      wasRedirected: false
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
          !this.$store.getters.tags ? this.updateStoreTags() : ''
        ]);
        this.loading = false;
      }
    }
  }
};
</script>
