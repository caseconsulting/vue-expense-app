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
          <v-btn @click="downloadTable()" v-bind="props" class="mr-4">
            Download
            <template #append>
              <v-icon>mdi-download</v-icon>
            </template>
            <v-tooltip activator="parent" location="bottom">Download current table as XLSX</v-tooltip>
          </v-btn>
          <v-btn @click="renderContactEmployeesModal()" v-bind="props">
            Contact
            <template #append>
              <v-icon>mdi-email</v-icon>
            </template>
            <v-tooltip activator="parent" location="bottom">Contact Active Employees In The Table Below</v-tooltip>
          </v-btn>
        </v-card-title>
      </v-card>
      <v-container fluid class="px-0 px-md-4">
        <reports-page-loader v-if="loading" />
        <div v-else>
          <!-- user is mobile -->
          <div v-if="isMobile()" class="text-center">
            <v-menu offset="y">
              <template #activator="{ props }">
                <v-btn variant="text" theme="dark" class="font-weight-bold" v-bind="props">
                  {{ currentTab.toUpperCase() }} <v-icon class="pb-1"> mdi-chevron-down </v-icon>
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
            <v-tabs color="blue" v-model="currentWindow" center-active grow show-arrows>
              <v-tab v-for="(tab, i) in tabs" :key="i" :value="i" @click="changeTab(tab, i)">
                {{ tab.title }}
              </v-tab>
            </v-tabs>
            <v-window v-model="currentWindow">
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
import { watch, onMounted, computed, ref, reactive, inject } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import ContactEmployeesModal from '@/components/shared/ContactEmployeesModal.vue';
import ReportsPageLoader from '@/components/reports/ReportsPageLoader.vue';
import ReportsAwards from '@/components/reports/ReportsAwards.vue';
import ReportsContracts from '@/components/reports/ReportsContracts.vue';
import ReportsCustomerOrgs from '@/components/reports/ReportsCustomerOrgs.vue';
import ReportsCertifications from '@/components/reports/ReportsCertifications.vue';
import ReportsForeignLanguages from '@/components/reports/ReportsForeignLanguages.vue';
import ReportsJobRoles from '@/components/reports/ReportsJobRoles.vue';
import ReportsTechnologies from '@/components/reports/ReportsTechnologies.vue';
import ReportsSecurityInfo from '@/components/reports/ReportsSecurityInfo.vue';
import { updateStoreEmployees, updateStoreContracts, updateStoreTags } from '@/utils/storeUtils';
import { isMobile, userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { useRouter } from 'vue-router';
import employeeCsv from '@/utils/csv/employeeCsv.js';

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
const tableData = reactive({});
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
const currentWindow = ref(0);

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
    // find requested tab and change to it
    let requestedTab = localStorage.getItem('requestedDataType');
    for (let i in tabs.value) if (tabs.value[i].key === requestedTab) changeTab(tabs.value[i], i);
    localStorage.removeItem('requestedDataType');
    wasRedirected.value = true;
    window.scrollTo(0, 0);
  }

  // update table download for tab that emitted
  emitter.on('reports-table-update', (data) => {
    tableData[data.tab] = data.table;
  });
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
 * @param newTab - the new tab object
 * @param index - index of tab to update v-window to
 */
function changeTab(newTab, index) {
  currentTab.value = newTab;
  if (![null, undefined].includes(index)) currentWindow.value = index;
} // changeTab

/**
 * Pops up the contacts employee modal
 */
function renderContactEmployeesModal() {
  contactKey.value++;
  emitter.emit('get-employees-to-contact', currentTab.value.key);
  toggleContactEmployeesModal.value = true;
} // renderContactEmployeesModal

/**
 * Downloads the current tab's table based on tableData
 */
function downloadTable() {
  let tab = currentTab.value.key;
  let data = tableData[tab];
  let title = `${currentTab.value.title} Download`;
  // rebuild the employee object based on items from table
  let employees = [];
  let tableIds = new Set(data.map((item) => item.key || item.id));
  for (let e of store.getters.employees) if (tableIds.has(e.id)) employees.push(e);
  // download
  employeeCsv.download(employees, store.getters.contracts, store.getters.tags, title);
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
