<template>
  <div>
    <v-container fluid class="px-1 px-md-4">
      <v-row>
        <v-col cols="12" xl="3" lg="3" md="3" sm="12" class="my-0 py-0">
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
            @update:model-value="refreshDropdownItems()"
            @click:clear="
              search = null;
              refreshDropdownItems();
            "
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
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
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
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
        :items-per-page="itemsPerPage"
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
import _ from 'lodash';
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
    title: 'Email',
    key: 'email'
  }
]); // datatable headers
const itemsPerPage = ref(-1);
const noContractPlaceholder = ref(' — No Contract — ');
const primeSearch = ref(null);
const primesDropDown = ref([]);
const search = ref(null); // query text for datatable search fiel)
const showInactiveEmployees = ref(false);
const sortBy = ref([{ key: 'employeeNumber' }]); // sort datatable item)
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
onMounted(() => {
  employeesInfo.value = getActive(store.getters.employees); // default to filtered list
  filteredEmployees.value = employeesInfo.value; // one.value is shown
  populateDropdowns(employeesInfo.value);
  buildContractsColumn();
  if (localStorage.getItem('requestedFilter')) {
    primeSearch.value = localStorage.getItem('requestedFilter');
    refreshDropdownItems();
    localStorage.removeItem('requestedFilter');
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
 * Gets all of the current contracts and displays the column on the table.
 */
function buildContractsColumn() {
  employeesInfo.value.forEach((currentEmp) => {
    if (currentEmp.contracts) {
      let contractNames = '';
      let primeNames = '';
      currentEmp.contracts.forEach((currentCon) => {
        // find current contracts
        let current = false;
        if (currentCon.projects) {
          currentCon.projects.forEach((currProj) => {
            if (!currProj.endDate) {
              current = true;
            }
          });
        }
        // add current contracts
        if (current) {
          let contract = store.getters.contracts.find((c) => c.id === currentCon.contractId);
          contractNames += `${contract.contractName} & `;
          primeNames += `${contract.primeName} & `;
        }
      });
      // remove & at the end
      contractNames = contractNames.slice(0, -2);
      primeNames = primeNames.slice(0, -2);
      currentEmp.contractNames = contractNames;
      currentEmp.primeNames = primeNames;
    }
  });
} // buildContractsColumn

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populate contracts and primes dropdown items that match the searches.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateContractsAndPrimesDropdown(employees) {
  //resets dropdowns after each query
  contractsDropDown.value = [];
  primesDropDown.value = [];

  let origContracts = _.map(employees, (employee) => employee.contracts); // extract contracts
  let employeesContracts = _.compact(origContracts); // remove falsey values

  // if there were any employees without a contract they would have been filtered out
  // and we want to show No Contract as an option in the dropdown
  if (origContracts.length !== employeesContracts.length) {
    contractsDropDown.value.push(noContractPlaceholder.value);
  }

  // loop employees
  _.forEach(employeesContracts, (contracts) => {
    // loop contracts
    _.forEach(contracts, (contract) => {
      // loop through projects to test if contract is current
      // (was.value added to make sure only current contracts/primes were listed in Reports autocomplete dropdowns)
      _.forEach(contract, (projects) => {
        // loop project
        _.forEach(projects, (project) => {
          if (project.presentDate) {
            let fullContract = store.getters.contracts.find((c) => c.id === contract.contractId);
            if (contract.value) {
              // limit the prime dropdown to only those that belong to the contract
              if (fullContract.contractName === contractSearch.value) {
                contractsDropDown.value.push(fullContract.contractName);
                primesDropDown.value.push(fullContract.primeName);
              }
            } else if (primeSearch.value) {
              // limit the contract dropdown to only those that belong to the prime
              if (fullContract.primeName === primeSearch.value) {
                contractsDropDown.value.push(fullContract.contractName);
                primesDropDown.value.push(primeSearch.value);
              }
            } else {
              contractsDropDown.value.push(fullContract.contractName); // add contract name
              primesDropDown.value.push(fullContract.primeName); // add contract prime
            }
          }
        });
      });
    });
  });
  contractsDropDown.value = Array.from(new Set(contractsDropDown.value));
  primesDropDown.value = Array.from(new Set(primesDropDown.value));
} // populateContractsAndPrimesDropdown

/**
 * Populate all dropdown items.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(emps) {
  // refresh the employees autocomplete list to be those that match the query
  employees.value = populateEmployeesDropdown(emps);
  populateContractsAndPrimesDropdown(emps);
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
  if (search.value) {
    filteredEmployees.value = _.filter(filteredEmployees.value, (employee) => {
      return employee.employeeNumber == search.value;
    });
  }
  if (tagsInfo.value.selected.length > 0) {
    filteredEmployees.value = _.filter(filteredEmployees.value, (employee) => {
      return selectedTagsHasEmployee(employee.id, tagsInfo.value);
    });
  }

  populateDropdowns(filteredEmployees.value);
} // refreshDropdownItems

/**
 * Clears the other search forms and searches the table by contract
 */
function searchContract() {
  if (contractSearch.value) {
    if (primeSearch.value) {
      filteredEmployees.value = _.filter(employeesInfo.value, (employee) => {
        if (employee.contractNames) {
          return (
            employee.contractNames.split(' & ').findIndex((element) => element.includes(contractSearch.value)) > -1 &&
            employee.primeNames.split(' & ').findIndex((element) => element.includes(primeSearch.value)) > -1
          );
        } else return false;
      });
    } else if (contractSearch.value === noContractPlaceholder.value) {
      filteredEmployees.value = _.filter(employeesInfo.value, (employee) => {
        return !employee.contractNames;
      });
    } else {
      filteredEmployees.value = _.filter(employeesInfo.value, (employee) => {
        if (employee.contractNames) {
          return (
            employee.contractNames.split(' & ').findIndex((element) => element.includes(contractSearch.value)) > -1
          );
        } else return false;
      });
    }
  }
} // searchContract

/**
 * Clears the other search forms and searches the table by prime
 */
function searchPrimes() {
  if (primeSearch.value) {
    if (contractSearch.value) {
      filteredEmployees.value = _.filter(employeesInfo.value, (employee) => {
        if (employee.primeNames) {
          return (
            employee.contractNames.split(' & ').findIndex((element) => element.includes(contractSearch.value)) > -1 &&
            employee.primeNames.split(' & ').findIndex((element) => element.includes(primeSearch.value)) > -1
          );
        } else return false;
      });
    } else {
      filteredEmployees.value = _.filter(employeesInfo.value, (employee) => {
        if (employee.primeNames) {
          return employee.primeNames.split(' & ').findIndex((element) => element.includes(primeSearch.value)) > -1;
        } else return false;
      });
    }
  }
} // searchPrimes

/**
 * Emit new data for tab.value
 *
 * @param event the event data containing the table information
 */
function updateTableDownload(event) {
  emitter.emit('reports-table-update', { tab: 'contracts', table: event, headers: headers });
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
@import 'src/assets/styles/styles';
.inactive {
  color: $case-red;
}
</style>
