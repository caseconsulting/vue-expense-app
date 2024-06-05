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
              <v-btn @click="downloadTab()" v-bind="props" class="mr-4">
                Download
                <template #append>
                  <v-icon>mdi-download</v-icon>
                </template>
              </v-btn>
              <v-btn @click="renderContactEmployeesModal()" v-bind="props">
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
                  {{ currentTab.title }} <v-icon class="pb-1"> mdi-chevron-down </v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-for="tab in tabs" :key="tab" @click="changeTab(tab)">
                  {{ tab.title }}
                </v-list-item>
              </v-list>
            </v-menu>
            <hr class="my-1" />
            <div v-for="tab in tabs" :key="tab">
              <component v-if="currentTab.key === tab.key" :is="tab.component" />
            </div>
          </div>
          <div v-else>
            <!-- user is not mobile -->
            <v-tabs color="blue" center-active grow show-arrows @update:model-value="changeTab">
              <v-tab v-for="tab in tabs" :key="tab" :value="tab.value">{{ tab.title }}</v-tab>
            </v-tabs>
            <v-window v-model="currentTab">
              <v-window-item v-for="tab in tabs" :key="tab" :value="tab.key" class="mx-2 my-6">
                <component :is="tab.component" />
              </v-window-item>
            </v-window>
          </div>
        </div>
      </v-container>
    </v-card>
    <v-dialog v-model="toggleContactEmployeesModal" :width="isMobile() ? '100%' : '60%'" scrollable>
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
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                       DATA                       |
// |                                                  |
// |--------------------------------------------------|
const contactKey = ref(0);
const employeesToContact = ref([]);
const loading = ref(true);
const toggleContactEmployeesModal = ref(false);
const wasRedirected = ref(false);
const requestedDataType = ref(localStorage.getItem('requestedDataType'));
const store = useStore();
const emitter = inject('emitter');
const router = useRouter();
const tabs = ref([
  {
    key: 'contracts',
    title: 'Contracts',
    component: ReportsContracts
  },
  {
    key: 'customerOrgs',
    title: 'Customer Orgs',
    component: ReportsCustomerOrgs
  },
  {
    key: 'certifications',
    title: 'Certifications',
    component: ReportsCertifications
  },
  {
    key: 'awards',
    title: 'Awards',
    component: ReportsAwards
  },
  {
    key: 'foreignLanguages',
    title: 'Foreign Languages',
    component: ReportsForeignLanguages
  },
  {
    key: 'jobRoles',
    title: 'Job Roles',
    component: ReportsJobRoles
  },
  {
    key: 'technologies',
    title: 'Technologies',
    component: ReportsTechnologies
  },
  {
    key: 'securityInfo',
    title: 'Security Info',
    component: ReportsSecurityInfo
  }
]);
const currentTab = ref(tabs.value[0]);

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
    currentTab.value = tabs.value.find((item) => item.key === localStorage.getItem('requestedDataType'));
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
  router.push({
    path: '/stats',
    name: 'stats'
  });
} // backClick

/**
 * Changes the tab display.
 *
 * @param event - the new tab
 */
function changeTab(newTab) {
  currentTab.value = newTab;
} // changeTab

/**
 * Pops up the contacts employee modal
 */
function renderContactEmployeesModal() {
  contactKey.value++;
  emitter.emit('get-employees-to-contact', currentTab.value.value);
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
