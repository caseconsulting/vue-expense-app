<template>
  <div>
    <v-container fluid class="px-1 px-md-4">
      <v-row>
        <v-col cols="12" xl="4" lg="4" md="3" sm="12" class="my-0 py-0">
          <v-text-field
            id="employeesSearch"
            v-model.trim="search"
            append-inner-icon="mdi-magnify"
            label="Search (comma separate terms)"
            variant="underlined"
            single-line
          />
        </v-col>
        <v-col cols="6" xl="2" lg="2" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="contractSearch"
            :items="contractsDropDown"
            label="Search By Contract"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdownItems()"
            @click:clear="contractSearch = null"
          >
          </v-autocomplete>
        </v-col>
        <v-col cols="6" xl="2" lg="2" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="primeSearch"
            :items="primesDropDown"
            label="Search By Prime"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdownItems()"
            @click:clear="primeSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="2" lg="2" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="locationSearch"
            :items="locationsDropDown"
            label="Search By Location"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdownItems()"
            @click:clear="locationSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="2" lg="2" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="workTypeSearch"
            :items="workTypesDropDown"
            label="Search By Work Type"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdownItems()"
            @click:clear="workTypeSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="6" xl="2" lg="2" md="3" sm="6" class="my-0 py-0">
          <tags-filter v-model="tagsInfo" @update:modelValue="refreshDropdownItems()"></tags-filter>
        </v-col>
        <v-col cols="6" xl="2" lg="2" md="2" sm="6" class="my-0 py-0">
          <v-checkbox v-model="showInactiveEmployees" label="Show Inactive Users"></v-checkbox>
        </v-col>
      </v-row>

      <!-- START EMPLOYEE TABLE -->
      <v-data-table
        :headers="headers"
        :items="filteredEmployees"
        :sort-by="sortBy"
        :items-per-page="itemsPerPage"
        :search="search"
        :custom-filter="employeeFilter"
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
        <!-- Contracts Item Slot -->
        <template v-slot:[`item.contractNames`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.contractNames }}
          </p>
        </template>
        <!-- Prime Item Slot -->
        <template v-slot:[`item.primeNames`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.primeNames }}
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
import _find from 'lodash/find';
import _uniq from 'lodash/uniq';
import { employeeFilter } from '@/shared/filterUtils';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
import { getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
import { onMounted, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
const store = useStore();
const emitter = inject('emitter');
const router = useRouter();
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import TagsFilter from '@/components/shared/TagsFilter.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       DATA                       |
// |                                                  |
// |--------------------------------------------------|
const contractsDropDown = ref([]);
const contractSearch = ref(null);
const employees = ref([]);
const employeesInfo = ref([]);
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
    title: 'Current Contract',
    key: 'contractNames'
  },
  {
    title: 'Current Prime',
    key: 'primeNames'
  },
  {
    title: 'Location',
    key: 'locations',
    width: '200px'
  },
  {
    title: 'Work Type',
    key: 'workTypes'
  },
  {
    title: 'Email',
    key: 'email'
  }
]); // datatable headers
const itemsPerPage = ref(-1);
const noContractPlaceholder = ref(' — No Contract — ');
const locationSearch = ref(null);
const locationsDropDown = ref([]);
const primeSearch = ref(null);
const primesDropDown = ref([]);
const search = ref(null); // query text for datatable search field
const showInactiveEmployees = ref(false);
const sortBy = ref([{ key: 'employeeNumber' }]); // sort datatable item)
const tagsInfo = ref({
  selected: [],
  flipped: []
});
const workTypeSearch = ref(null);
const workTypesDropDown = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
onMounted(() => {
  employeesInfo.value = getActive(store.getters.employees); // default to filtered list
  filteredEmployees.value = employeesInfo.value; // one.value is shown
  populateDropdowns(employeesInfo.value);
  buildContractsColumn();
  if (localStorage.getItem('requestedFilter')) {
    console.log(localStorage.getItem('requestedFilter'));
    let requestedFilter = JSON.parse(localStorage.getItem('requestedFilter'));
    switch (requestedFilter.type) {
      case 'prime':
        primeSearch.value = requestedFilter.search;
        break;
      case 'contract':
        contractSearch.value = requestedFilter.search;
        break;
      case 'search':
        search.value = requestedFilter.search;
        break;
      default:
        break;
    }
    refreshDropdownItems();
    localStorage.removeItem('requestedFilter');
  }

  search.value = search.value ? search.value + ' ' : null; // solution for redirecting from stats dashboard with a filter

  // initial set of table download data
  updateTableDownload(filteredEmployees.value);
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all of the current contracts and displays the column on the table.
 */
function buildContractsColumn() {
  employeesInfo.value.forEach((currentEmp) => {
    let hasCurrentContract = false;
    let contractNames = '';
    let primeNames = '';
    let locations = '';
    let workTypes = '';
    if (currentEmp.contracts) {
      currentEmp.contracts.forEach((currentCon) => {
        // find current contracts
        let current = false;
        if (currentCon.projects) {
          currentCon.projects.forEach((currProj) => {
            if (!currProj.endDate) {
              current = true;
              let contract = store.getters.contracts.find((c) => c.id === currentCon.contractId);
              let project = contract?.projects?.find((p) => p.id === currProj.projectId);
              if (project) {
                if (currProj.workType === 'Remote' || (!currProj.workType && project.workType === 'Remote'))
                  locations += userRoleIsAdmin() || userRoleIsManager() ? `${getLocation(currentEmp)} & ` : '';
                else if (currProj.location) locations += `${currProj.location} & `;
                else if (project.location) locations += `${project.location} & `;
                if (currProj.workType || project.workType) workTypes += `${currProj.workType || project.workType} & `;
              }
            }
          });
        }
        // add current contracts
        if (current) {
          hasCurrentContract = true;
          let contract = store.getters.contracts.find((c) => c.id === currentCon.contractId);
          contractNames += `${contract.contractName} & `;
          primeNames += `${contract.primeName} & `;
        }
      });
      // remove & at the end
      contractNames = contractNames.slice(0, -2);
      primeNames = primeNames.slice(0, -2);
      locations = locations.slice(0, -2);
      workTypes = workTypes.slice(0, -2);
    }
    if (!hasCurrentContract) {
      workTypes += 'Remote';
      locations += userRoleIsAdmin() || userRoleIsManager() ? getLocation(currentEmp) : '';
    }
    currentEmp.contractNames = contractNames;
    currentEmp.primeNames = primeNames;
    currentEmp.locations = locations;
    currentEmp.workTypes = workTypes;
  });
} // buildContractsColumn

/**
 * Gets the city and state of an employee
 *
 * @param employee - The employee object
 */
function getLocation(employee) {
  if (!employee.currentCity || !employee.currentState) return '';
  else return `${employee.currentCity}, ${employee.currentState}`;
} // getLocation

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populate contracts, primes, locations, and work types dropdown items that match the searches.
 *
 */
function populateOtherDropdowns() {
  contractsDropDown.value = [];
  primesDropDown.value = [];
  locationsDropDown.value = [];
  workTypesDropDown.value = [];
  if (filteredEmployees.value?.length === _filter(store.getters.employees, (e) => e.workStatus !== 0).length)
    contractsDropDown.value.push(noContractPlaceholder.value); // add placeholder if no one has been filtered out
  _forEach(filteredEmployees.value, (e) => {
    _forEach(e.contracts, (c) => {
      // get actual contract from employee contract id
      let contract = _find(store.getters.contracts, (contract) => contract.id === c.contractId);
      _forEach(c.projects, (p) => {
        // get actual project from employee project id
        let project = _find(contract.projects, (project) => project.id === p.projectId);
        if (!p.endDate) {
          contractsDropDown.value.push(contract.contractName);
          primesDropDown.value.push(contract.primeName);
          if (project?.location) locationsDropDown.value.push(project.location);
          if (project?.workType) workTypesDropDown.value.push(project.workType);
        }
      });
    });
  });
  contractsDropDown.value = _uniq(contractsDropDown.value);
  primesDropDown.value = _uniq(primesDropDown.value);
  locationsDropDown.value = _uniq(locationsDropDown.value);
  workTypesDropDown.value = _uniq(workTypesDropDown.value);
} // populateOtherDropdowns

/**
 * Populate all dropdown items.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(emps) {
  // refresh the employees autocomplete list to be those that match the query
  employees.value = populateEmployeesDropdown(emps);
  populateOtherDropdowns();
} // populateDropdowns

/**
 * Refresh the list based on the current queries
 */
function refreshDropdownItems() {
  filteredEmployees.value = employeesInfo.value;
  if (contractSearch.value) {
    searchContract();
  }
  if (primeSearch.value) {
    searchPrimes();
  }
  if (locationSearch.value) {
    searchLocations();
  }
  if (workTypeSearch.value) {
    searchWorkTypes();
  }
  if (tagsInfo.value.selected.length > 0) {
    filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
      return selectedTagsHasEmployee(employee.id, tagsInfo.value);
    });
  }

  populateDropdowns(filteredEmployees.value);
} // refreshDropdownItems

/**
 * Clears the other search forms and searches the table by contract
 */
function searchContract() {
  if (contractSearch.value === noContractPlaceholder.value) {
    filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
      return !employee.contractNames;
    });
  } else {
    filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
      if (employee.contractNames) {
        return employee.contractNames.split(' & ').findIndex((element) => element.includes(contractSearch.value)) > -1;
      } else return false;
    });
  }
} // searchContract

/**
 * Clears the other search forms and searches the table by prime
 */
function searchPrimes() {
  filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
    if (employee.primeNames) {
      return employee.primeNames.split(' & ').findIndex((element) => element.includes(primeSearch.value)) > -1;
    } else return false;
  });
} // searchPrimes

/**
 * Clears the other search forms and searches the table by location
 */
function searchLocations() {
  filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
    if (employee.locations) {
      return employee.locations.split(' & ').findIndex((element) => element.includes(locationSearch.value)) > -1;
    } else {
      return false;
    }
  });
} // searchLocations

/**
 * Clears the other search forms and searches the table by work type
 */
function searchWorkTypes() {
  filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
    if (employee.workTypes) {
      return employee.workTypes.split(' & ').findIndex((element) => element.includes(workTypeSearch.value)) > -1;
    } else {
      return false;
    }
  });
} // searchWorkTypes

/**
 * Emit new data for tab.value
 *
 * @param event the event data containing the table information
 */
function updateTableDownload(event) {
  emitter.emit('reports-table-update', { tab: 'contracts', table: event, headers: headers });
} // updateTableDownload

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
  employeesInfo.value = store.getters.employees;
  if (!showInactiveEmployees.value) employeesInfo.value = getActive(employeesInfo.value);
  populateDropdowns(employeesInfo.value);
  refreshDropdownItems();
});
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
