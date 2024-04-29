<template>
  <div>
    <v-btn
      v-if="requestedDataType"
      id="backBtn"
      class="mb-3"
      elevation="2"
      :size="isMobile() ? 'x-small' : 'default'"
      @click="backClick()"
    >
      <template #prepend>
        <v-icon size="large" class="pr-1"> mdi-arrow-left-thin </v-icon>
      </template>
      Back
    </v-btn>
    <v-card>
      <v-card color="#bc3825">
        <v-card-title class="d-flex align-center header_style" v-bind:class="{ 'justify-center': isMobile() }">
          <h2 class="text-white">Reports</h2>
          <v-spacer />
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn id="contactEmployeesBtn" @click="renderContactEmployeesModal()" v-bind="props">
                Contact
                <template #append>
                  <v-icon>mdi-email</v-icon>
                </template>
              </v-btn>
            </template>
            <span>Contact Active Employees In The Table Below</span>
          </v-tooltip>
        </v-card-title>
      </v-card>
      <v-container fluid class="px-0 px-md-4">
        <reports-page-loader v-if="loading" />
        <div v-else>
          <!-- user is mobile -->
          <div v-if="isMobile()" class="text-center">
            <v-menu offset="y">
              <template #activator="{ props }">
                <v-btn variant="text" color="#bc3825" theme="dark" class="font-weight-bold" v-bind="props">
                  {{ currentTab.toUpperCase() }} <v-icon class="pb-1"> mdi-chevron-down </v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="selectDropDown('contracts')"> Contracts </v-list-item>
                <v-list-item @click="selectDropDown('customer orgs')"> Customer Orgs </v-list-item>
                <v-list-item @click="selectDropDown('certifications')"> Certifications </v-list-item>
                <v-list-item @click="selectDropDown('awards')"> Awards </v-list-item>
                <v-list-item @click="selectDropDown('languages')"> Foreign Languages </v-list-item>
                <v-list-item @click="selectDropDown('job roles')"> Job Roles </v-list-item>
                <v-list-item @click="selectDropDown('technologies')"> Technologies </v-list-item>
                <v-list-item @click="selectDropDown('security info')"> Security Info </v-list-item>
              </v-list>
            </v-menu>
            <hr class="my-1" />
            <ReportsContracts v-if="currentTab === 'contracts'" />
            <ReportsCustomerOrgs v-if="currentTab === 'customer orgs'" />
            <ReportsCertifications v-if="currentTab === 'certifications'" />
            <ReportsAwards v-if="currentTab === 'awards'" />
            <ReportsForeignLanguages v-if="currentTab === 'languages'" />
            <ReportsJobRoles v-if="currentTab === 'job roles'" />
            <ReportsTechnologies v-if="currentTab === 'technologies'" />
            <ReportsSecurityInfo v-if="currentTab === 'security info'" />
          </div>
          <div v-else>
            <!-- user is not mobile -->
            <v-tabs color="blue" center-active v-model="currentTab" grow show-arrows @update:model-value="changeTab">
              <v-tab value="contracts"> Contracts </v-tab>
              <v-tab value="customer orgs"> Customer Orgs </v-tab>
              <v-tab value="certifications"> Certifications </v-tab>
              <v-tab value="awards"> Awards </v-tab>
              <v-tab value="languages"> Foreign Languages </v-tab>
              <v-tab value="job roles"> Job Roles </v-tab>
              <v-tab value="technologies"> Technologies </v-tab>
              <v-tab value="security info"> Security Info </v-tab>
            </v-tabs>
            <v-window v-model="currentTab">
              <v-window-item value="contracts" class="mx-2 my-6">
                <ReportsContracts />
              </v-window-item>
              <v-window-item value="customer orgs" class="mx-2 my-6">
                <ReportsCustomerOrgs />
              </v-window-item>
              <v-window-item value="certifications" class="mx-2 my-6">
                <ReportsCertifications />
              </v-window-item>
              <v-window-item value="awards" class="mx-2 my-6">
                <ReportsAwards />
              </v-window-item>
              <v-window-item value="languages" class="mx-2 my-6">
                <ReportsForeignLanguages />
              </v-window-item>
              <v-window-item value="job roles" class="mx-2 my-6">
                <ReportsJobRoles />
              </v-window-item>
              <v-window-item value="technologies" class="mx-2 my-6">
                <ReportsTechnologies />
              </v-window-item>
              <v-window-item value="security info" class="mx-2 my-6">
                <ReportsSecurityInfo />
              </v-window-item>
            </v-window>
          </div>
        </div>
      </v-container>
    </v-card>
    <v-dialog v-model="toggleContactEmployeesModal" :width="isMobile() ? '100%' : '60%'">
      <contact-employees-modal :passedEmployees="employeesToContact" :key="contactKey" />
    </v-dialog>
  </div>
</template>
<script setup>
import { watch, onMounted, computed, ref, inject } from 'vue';
import { useStore } from 'vuex';
import ContactEmployeesModal from '@/components/shared/ContactEmployeesModal.vue';
import ReportsPageLoader from '@/components/reports/ReportsPageLoader.vue';
import ReportsAwards from '@/components/reports/ReportsAwards.vue';
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
// |                       DATA                       |
// |                                                  |
// |--------------------------------------------------|
const contactKey = ref(0);
const currentTab = ref('contracts');
const employeesToContact = ref([]);
const loading = ref(true);
const toggleContactEmployeesModal = ref(false);
const wasRedirected = ref(false);
const requestedDataType = ref(localStorage.getItem('requestedDataType'));
const store = useStore();
const emitter = inject('emitter');

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook.
 */
onMounted(async () => {
  emitter.on('close-contact-employees-modal', () => (toggleContactEmployeesModal.value = false));
  emitter.on('list-of-employees-to-contact', (employees) => (employeesToContact.value = employees));
  if (store.getters.storeIsPopulated) {
    await Promise.all([
      !store.getters.employees ? updateStoreEmployees() : '',
      !store.getters.contracts ? updateStoreContracts() : '',
      !store.getters.tags && (userRoleIsAdmin() || userRoleIsManager()) ? updateStoreTags() : ''
    ]);
    loading.value = false;
  }
  if (localStorage.getItem('requestedDataType')) {
    currentTab.value = localStorage.getItem('requestedDataType');
    localStorage.removeItem('requestedDataType');
    wasRedirected.value = true;
    window.scrollTo(0, 0);
  }
});

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
  currentTab.value = event;
} // changeTab

/**
 * This is used to select the correct tab on mobile devices.
 * @param tabName - The name of the tab
 */
function selectDropDown(tabName) {
  currentTab.value = tabName;
} // selectDropDown

/**
 * Pops up the contacts employee modal
 */
function renderContactEmployeesModal() {
  contactKey.value++;
  emitter.emit('get-employees-to-contact', currentTab.value);
  toggleContactEmployeesModal.value = true;
} // renderContactEmployeesModal

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
const storeIsPopulated = computed(() => {
  return store.getters.storeIsPopulated;
});

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(storeIsPopulated, async () => {
  if (store.getters.storeIsPopulated) {
    await Promise.all([
      !store.getters.employees ? updateStoreEmployees() : '',
      !store.getters.contracts ? updateStoreContracts() : '',
      !store.getters.tags && (userRoleIsAdmin() || userRoleIsManager()) ? updateStoreTags() : ''
    ]);
    loading.value = false;
  }
});
</script>
