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
            v-model="custOrg2Search"
            :items="custOrgs2"
            label="Search Org 2"
            variant="underlined"
            clearable
            auto-select-first
            @click:clear="custOrg2Search = null"
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="custOrg3Search"
            :items="custOrgs3"
            label="Search Org 3"
            variant="underlined"
            clearable
            auto-select-first
            @click:clear="custOrg3Search = null"
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
import { onMounted, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
import { isProjectActive } from '@/shared/contractUtils';
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { isSameOrBefore, getTodaysDate } from '@/shared/dateUtils';
import { updateStoreContracts, updateStoreEmployees } from '@/utils/storeUtils';
import TagsFilter from '@/components/shared/TagsFilter.vue';
const store = useStore();
const emitter = inject('emitter');
const router = useRouter();
const props = defineProps(['requestedFilter', 'name']);

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
const custOrg2Search = ref(null);
const custOrg3Search = ref(null);
const directorateSearch = ref(null);
const custOrgs2 = ref([]);
const custOrgs3 = ref([]);
const directorates = ref([]);
const search = ref(null); // query text for datatable search field
const combineSearch = ref({}); // query text for datatable search field
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
  // get employees and contracts if they aren't already loaded
  if (!store.getters.employees) await updateStoreEmployees();
  if (!store.getters.contracts) await updateStoreContracts();

  employeesInfo.value = getActive(store.getters.employees); // default to filtered list
  filteredEmployees.value = employeesInfo.value; // value in table
  buildCustomerOrgColumns();

  if (props.requestedFilter && props.requestedFilter.tab === props.name) {
    switch (props.requestedFilter.type) {
      case 'directorate':
        directorateSearch.value = props.requestedFilter.search;
        break;
      case 'org':
        combineSearch.value = { do: true, temp: true }
        custOrg2Search.value = props.requestedFilter.search;
        custOrg3Search.value = props.requestedFilter.search;
        break;
      default:
        search.value = props.requestedFilter.search;
        break;
    }
  }

  if (!props.requestedFilter) refreshDropdownItems();
  updateTableDownload(filteredEmployees.value);
}); // onMounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all of the current customer orgs for each employee and displays the column on the table.
 */
function buildCustomerOrgColumns() {
  // get the projects into a more searchable object
  let projects = {};
  for (let c of store.getters.contracts) {
    for (let p of c.projects) {
      projects[p.id] = p;
    }
  }

  // pull out the org levels from each contract's projects
  let orgs = ['directorate', 'org2', 'org3'];
  for (let employee of employeesInfo.value) {
    // on page re-load, sometimes the orgs are already built. erase them and rebuild.
    for (let key of orgs) employee[key] = [];
    // loop through all contracts and projects to get all orgs
    for (let c of employee.contracts ?? []) {
      for (let p of c.projects ?? []) {
        let project = projects[p.projectId];
        if (!project) continue;
        if (isProjectActive(project, employee)) {
          for (let key of orgs) {
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
  custOrgs2.value = new Set();
  custOrgs3.value = new Set();
  let employee;
  for (let f of filteredEmployees.value ?? []) {
    employee = employeesInfoIndex.value[f.id];
    for (let org of employee?.org2 ?? []) if (org && org != '') custOrgs2.value.add(org);
    for (let org of employee?.org3 ?? []) if (org && org != '') custOrgs3.value.add(org);
  }
  custOrgs2.value = Array.from(custOrgs2.value);
  custOrgs3.value = Array.from(custOrgs3.value);
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
  if (!custOrg2Search.value && !custOrg3Search.value) return;
  let search2 = custOrg2Search.value || undefined;
  let search3 = custOrg3Search.value || undefined;

  // whether or not to combine search of org2 and org3 together, or to require
  // both to match
  let combine = false; // TODO: could be a user-editable field?
  combine = combineSearch.value?.do ?? false;
  let op = (a, b) => combine ? (a || b) : (a && b);
  
  let org2, org3, found2, found3;
  filteredEmployees.value = filteredEmployees.value.filter((employee) => {
    org2 = employee.org2 ?? [];
    org3 = employee.org3 ?? [];
    found2 = !!org2.find((org) => org === search2) || (search2 === undefined);
    found3 = !!org3.find((org) => org === search3) || (search3 === undefined);
    return op(found2, found3);
  });

  if (combineSearch.value?.temp) combineSearch.value = {};
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
watch([search, directorateSearch, custOrg2Search, custOrg3Search, showInactiveEmployees], () => refreshDropdownItems());
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
