<template>
  <div>
    <v-container fluid class="px-1 px-md-4">
      <v-row>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :custom-filter="employeeFilter"
            :items="employees"
            variant="underlined"
            label="Search By Employee Name"
            auto-select-first
            clearable
            item-title="text"
            item-value="value"
            @click:clear="search = null"
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="directorateSearch"
            :items="directorates"
            label="Search Directorate"
            variant="underlined"
            clearable
            auto-select-first
            @click:clear="directorateSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="custOrgSearch"
            :items="custOrgs"
            label="Search Orgs"
            variant="underlined"
            clearable
            auto-select-first
            @click:clear="custOrgSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <tags-filter v-model="tagsInfo" @update:modelValue="refreshDropdownItems()"></tags-filter>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-checkbox v-model="showInactiveEmployees" label="Show Inactive Users"></v-checkbox>
        </v-col>
      </v-row>

      <!-- START EMPLOYEE TABLE -->
      <v-data-table
        :headers="headers"
        :items="filteredEmployees"
        :sort-by="sortBy"
        :items-per-page="-1"
        class="elevation-1 row-pointer"
        @click:row="handleClick"
        @update:current-items="updateTableDownload($event)"
      >
        <!-- Employee Number Slot -->
        <template v-slot:[`item.employeeNumber`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.employeeNumber }}
          </p>
        </template>
        <!-- Full Name Item Slot -->
        <template v-slot:[`item.fullName`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ getFullName(item) }}
          </p>
        </template>
        <!-- Current Customer Org Item Slot -->
        <template v-slot:[`item.currentOrgName`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.currentOrgName }}
          </p>
        </template>
        <!-- Email Name Item Slot -->
        <template v-slot:[`item.email`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.email }}
          </p>
        </template>
      </v-data-table>
      <!-- END EMPLOYEE TABLE -->
    </v-container>
  </div>
</template>

<script setup>
import _forEach from 'lodash/forEach';
import _filter from 'lodash/filter';
import { employeeFilter } from '@/shared/filterUtils';
import { getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
import { onMounted, ref, inject, watch, defineProps } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
import { isProjectActive } from '@/shared/contractUtils';
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { isSameOrBefore, getTodaysDate } from '@/shared/dateUtils';
import { updateStoreContracts } from '@/utils/storeUtils';
import TagsFilter from '@/components/shared/TagsFilter.vue';
const store = useStore();
const emitter = inject('emitter');
const router = useRouter();
const props = defineProps(['requestedFilter']);

// |--------------------------------------------------|
// |                                                  |
// |                       DATA                       |
// |                                                  |
// |--------------------------------------------------|
const employees = ref([]);
const employeesInfo = ref([]);
const employeesInfoIndex = ref({}); // quick ref to employees by id
const filteredEmployees = ref([]);
const headers = ref([
  {
    title: 'Employee #',
    key: 'employeeNumber'
  },
  {
    title: 'Name',
    key: 'fullName'
  },
  {
    title: 'Directorate',
    key: 'directorate',
    value: (item) => item.directorate?.filter(Boolean)?.join(' & ') ?? ''
  },
  {
    title: 'Org 2',
    key: 'org2',
    value: (item) => item.org2?.filter(Boolean)?.join(' & ') ?? ''
  },
  {
    title: 'Org 3',
    key: 'org3',
    value: (item) => item.org3?.filter(Boolean)?.join(' & ') ?? ''
  },
  {
    title: 'Email',
    key: 'email'
  }
]); // datatable headers
const custOrgSearch = ref(null);
const directorateSearch = ref(null);
const custOrgs = ref([]);
const directorates = ref([]);
const search = ref(null); // query text for datatable search field
const showInactiveEmployees = ref(false);
const sortBy = ref([{ key: 'employeeNumber' }]); // sort datatable items
const tagsInfo = ref({
  selected: [],
  flipped: []
});

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
onMounted(async () => {
  employeesInfo.value = getActive(store.getters.employees); // default to filtered list
  filteredEmployees.value = employeesInfo.value; // value in table
  buildCustomerOrgColumns();
  populateDropdowns();

  // get contracts if they aren't already loaded
  if (!store.getters.contracts) await updateStoreContracts();

  if (props.requestedFilter) {
    switch (props.requestedFilter.type) {
      case 'directorate':
        directorateSearch.value = props.requestedFilter.search;
        break;
      case 'org':
      case 'org2':
      case 'org3':
        custOrgSearch.value = props.requestedFilter.search;
        break;
      default:
        search.value = props.requestedFilter.search;
        break;
    }
    refreshDropdownItems();
  }

  // initial set of table download data
  updateTableDownload(filteredEmployees.value);
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all of the current customer orgs for each employee and displays the column on the table.
 */
function buildCustomerOrgColumns() {
  employeesInfo.value.forEach((currentEmp) => {
    if (currentEmp.customerOrgExp) {
      let hasCurrent = false;
      let orgs = '';
      let years = 0;
      currentEmp.customerOrgExp.forEach((org) => {
        if (org.current) {
          hasCurrent = true;
          orgs += `${org.name} & `;
          years += parseFloat(org.years);
        }
      });
      if (hasCurrent) {
        // remove & at the end
        orgs = orgs.slice(0, -2);
        currentEmp.currentOrgName = orgs;
        currentEmp.currentOrgYoE = years.toFixed(2) + ' years';
      }
    }
  });

  // get the projects into a more searchable object
  let projects = {};
  for (let { projects: p } of store.getters.contracts) {
    for (let { id, ...rest } of p) {
      projects[id] = rest;
    }
  }

  // pull out the org levels from each contract's projects
  let orgs = ['directorate', 'org2', 'org3'];
  for (let employee of employeesInfo.value) {
    for (let c of employee.contracts ?? []) {
      for (let p of c.projects ?? []) {
        let project = projects[p.projectId];
        if (isProjectActive(project)) {
          for (let key of orgs) {
            employee[key] ??= [];
            employee[key].push(project[key] ?? undefined);
          }
        }
      }
    }
    employeesInfoIndex.value[employee.id] = employee;
  }
} // buildCustomerOrgColumns

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populates all dropdowns
 */
function populateDropdowns() {
  employees.value = populateEmployeesDropdown(employeesInfo.value);
  populateCustomerOrgsDropdown();
  populateDirectoratesDropdown();
} // populateDropdowns

/**
 * Populates all current customer orgs in the search dropdown.
 */
function populateCustomerOrgsDropdown() {
  custOrgs.value = new Set();
  let employee;
  for (let f of filteredEmployees.value ?? []) {
    employee = employeesInfoIndex.value[f.id];
    for (let org of employee?.org2 ?? []) if (org && org != '') custOrgs.value.add(org);
    for (let org of employee?.org3 ?? []) if (org && org != '') custOrgs.value.add(org);
  }
  custOrgs.value = Array.from(custOrgs.value);
} // populateCustomerOrgsDropdown

/**
 * Populates all current directorates in the search dropdown.
 */
function populateDirectoratesDropdown() {
  directorates.value = new Set();
  let employee;
  for (let f of filteredEmployees.value ?? []) {
    employee = employeesInfoIndex.value[f.id];
    for (let dir of employee?.directorate ?? []) {
      if (dir && dir != '') directorates.value.add(dir);
    }
  }
  directorates.value = Array.from(directorates.value);
} // populateDirectoratesDropdown

/**
 * Refresh the list based on the current queries
 */
function refreshDropdownItems() {
  // reset to full list of employees
  filteredEmployees.value = employeesInfo.value;
  // search all filters
  searchEmployees();
  searchDirectorates();
  searchCustomerOrgs();
  searchTags();
  // update the dropdowns based on the filtered list
  populateDropdowns(filteredEmployees.value);
} // refreshDropdownItems

/**
 * Filters employees on the data table by employee number returned by dropdown.
 */
function searchEmployees() {
  if (!search.value) return;
  filteredEmployees.value = filteredEmployees.value.filter((employee) => {
    return employee.employeeNumber == search.value;
  });
}

/**
 * Filters employees on the data table by the directorate entered by the user.
 */
function searchDirectorates() {
  if (!directorateSearch.value) return;
  filteredEmployees.value = filteredEmployees.value.filter((employee) => {
    return employee.directorate?.find((dir) => dir === directorateSearch.value);
  });
}

/**
 * Filters employees on the data table by the customer org entered by the user.
 */
function searchCustomerOrgs() {
  if (!custOrgSearch.value) return;
  let combOrgs;
  filteredEmployees.value = filteredEmployees.value.filter((employee) => {
    combOrgs = [...(employee.org2 ?? []), ...(employee.org3 ?? [])];
    return combOrgs.find((org) => org === custOrgSearch.value);
  });
} // searchCustomerOrgs

/**
 * Filters employees on the data table by tags selected by the user.
 */
function searchTags() {
  if (tagsInfo.value.selected.length === 0) return;
  filteredEmployees.value = filteredEmployees.value.filter((employee) => {
    return selectedTagsHasEmployee(employee.id, tagsInfo.value);
  });
} // searchTags

/**
 * Emit new data for tab.value
 *
 * @param event the event data containing the table information
 */
function updateTableDownload(event) {
  emitter.emit('reports-table-update', { tab: 'customerOrgs', table: event, headers: headers });
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watches the showInactiveUsers to refilter the table as needed
 */
watch(showInactiveEmployees, () => {
  search.value = null;
  refreshDropdownItems();
  employeesInfo.value = store.getters.employees;
  if (!showInactiveEmployees.value) employeesInfo.value = getActive(employeesInfo.value);
});

/**
 * Watches the directorate and org searches to rerun the search filters if cleared
 */
watch([search, directorateSearch, custOrgSearch, showInactiveEmployees], () => refreshDropdownItems() );
</script>

<style lang="css" scoped>
.row-pointer :deep(tbody tr :hover) {
  cursor: pointer;
}
</style>

<style lang="scss" scoped>
@use '@/assets/styles/styles' as *;
.inactive {
  color: $case-red;
}
</style>
