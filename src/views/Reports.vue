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
          <v-btn v-if="userRoleIsAdmin() || userRoleIsManager()" @click="downloadTable()" v-bind="props" class="mr-4">
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
                  {{ currentTab.title.toUpperCase() }} <v-icon class="pb-1"> mdi-chevron-down </v-icon>
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
              <component v-if="currentTab.key === tab.key" :is="tab.component" class="text-start" />
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
import { watch, onMounted, computed, ref, reactive, inject, shallowRef } from 'vue';
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
import ReportsSecurityInfo from '@/components/reports/ReportsSecurityInfo.vue';
import ReportsEmployeeNotes from '@/components/reports/ReportsEmployeeNotes.vue';
import { updateStoreEmployees, updateStoreContracts, updateStoreTags } from '@/utils/storeUtils';
import { isMobile, userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { getEmployeeCurrentProjects } from '@/shared/employeeUtils';
import { useRouter } from 'vue-router';
import baseCsv from '@/utils/csv/baseCsv.js';

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
    component: shallowRef(ReportsContracts)
  },
  {
    key: 'customerOrgs',
    title: 'Customer Orgs',
    component: shallowRef(ReportsCustomerOrgs)
  },
  {
    key: 'certifications',
    title: 'Certifications',
    component: shallowRef(ReportsCertifications)
  },
  {
    key: 'awards',
    title: 'Awards',
    component: shallowRef(ReportsAwards)
  },
  {
    key: 'foreignLanguages',
    title: 'Foreign Languages',
    component: shallowRef(ReportsForeignLanguages)
  },
  {
    key: 'jobRoles',
    title: 'Job Roles',
    component: shallowRef(ReportsJobRoles)
  },
  {
    key: 'technologies',
    title: 'Technologies',
    component: shallowRef(ReportsTechnologies)
  },
  {
    key: 'securityInfo',
    title: 'Security Info',
    component: shallowRef(ReportsSecurityInfo)
  }
]);

if (userRoleIsAdmin()) {
  tabs.value.push({
    key: 'employeeNotes',
    title: 'Employee Notes',
    component: shallowRef(ReportsEmployeeNotes)
  });
}

const props = ref();
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
    tableData[data.tab] = data;
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
 * Filters through table data of a given tab and returns the employee
 * objects for anyone in the table
 */
function getTableEmployeeData(tab = currentTab.value) {
  let employees = [];
  tab = tab.key || tab;
  let data = tableData[tab].table;

  // fetch employees
  let tableIds = new Set(data.map((item) => item.key || item.id));
  for (let e of store.getters.employees) if (tableIds.has(e.id)) employees.push(e);

  return employees;
} // getTableEmployeeData

/**
 * Pops up the contacts employee modal
 */
function renderContactEmployeesModal() {
  contactKey.value++;
  employeesToContact.value = getTableEmployeeData();
  toggleContactEmployeesModal.value = true;
} // renderContactEmployeesModal

/**
 * Downloads the current tab's table based on tableData
 */
function downloadTable() {
  // get title and raw data
  let title = `${currentTab.value.title} Download`;
  let data = tableData[currentTab.value.key];
  let table = data.table;
  let rawHeaders = data.headers;

  // index headers to be easier to find
  let headers = {};
  for (let h of rawHeaders) headers[h.key] = h.title;

  // extract and format data
  let renameKeys = (item) => {
    let newItem = {};
    for (let key of Object.keys(item)) newItem[headers[key]] = item[key];
    return newItem;
  };
  let csvData = table.map((item) => renameKeys(item.columns));

  // EXTRA DATA
  let extraDataReports = ['contracts'];
  // create an index of employees
  let employeesIndex = {};
  if (extraDataReports.includes(currentTab.value.key))
    for (let e of store.getters.employees) employeesIndex[e.employeeNumber] = e;

  // EXTRA DATA: contract tab - add in current project
  if (currentTab.value.key === 'contracts') {
    // get contracts info so that we can get the project names
    let projects = {};
    for (let c of store.getters.contracts) for (let p of c.projects) projects[p.id] = p;
    // header info (hardcoded based on headers of tables)
    let employeeNumberHeader = 'Employee #';
    let contractHeader = 'Current Contract';
    let projectHeader = 'Current Project';
    // loop through all rows and add in employee's current project
    let currentProjects, row, emp;
    for (let i in csvData) {
      row = csvData[i];
      // get the current projects of user
      emp = employeesIndex[row[employeeNumberHeader]];
      currentProjects = getEmployeeCurrentProjects(emp);
      currentProjects = currentProjects.map((p) => projects[p.projectId].projectName);
      // place after contracts by copying everything in order
      csvData[i] = {};
      for (let colName in row) {
        csvData[i][colName] = row[colName];
        if (colName === contractHeader) csvData[i][projectHeader] = currentProjects?.join(' & ');
      }
    }
  }

  // parse and download to xlsx
  let csvString = baseCsv.generate(csvData);
  baseCsv.download(csvString, title);
} // downloadTable

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
