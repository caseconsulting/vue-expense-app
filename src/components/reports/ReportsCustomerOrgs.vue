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
            @update:model-value="refreshDropdownItems()"
            @click:clear="
              search = null;
              refreshDropdownItems();
            "
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="custOrgSearch"
            :items="custOrgs"
            label="Search By Customer Org"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdownItems()"
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
        <!-- Current Customer Org Experience Item Slot -->
        <template v-slot:[`item.currentOrgYoE`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.currentOrgYoE }}
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
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { isSameOrBefore, getTodaysDate } from '@/shared/dateUtils';
import TagsFilter from '@/components/shared/TagsFilter.vue';
const store = useStore();
const emitter = inject('emitter');
const router = useRouter();

// |--------------------------------------------------|
// |                                                  |
// |                       DATA                       |
// |                                                  |
// |--------------------------------------------------|
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
    title: 'Current Customer Org',
    key: 'currentOrgName'
  },
  {
    title: 'Current Customer Org Experience',
    key: 'currentOrgYoE'
  },
  {
    title: 'Contract',
    key: 'contractNames'
  },
  {
    title: 'Prime',
    key: 'primeNames'
  },
  {
    title: 'Email',
    key: 'email'
  }
]); // datatable headers
const custOrgSearch = ref(null);
const custOrgs = ref([]);
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
onMounted(() => {
  employeesInfo.value = getActive(store.getters.employees); // default to filtered list
  filteredEmployees.value = employeesInfo.value; // one.value is shown
  populateDropdowns(employeesInfo.value);
  buildCustomerOrgColumns();
  buildContractsAndPrimesColumns();
  if (localStorage.getItem('requestedFilter')) {
    custOrgSearch.value = localStorage.getItem('requestedFilter');
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
} // buildCustomerOrgColumns

/**
 * Modified from version of Contracts tab.
 */
function buildContractsAndPrimesColumns() {
  let today = getTodaysDate();
  employeesInfo.value.forEach((currentEmp) => {
    let contractNames = [];
    let primeNames = [];
    if (currentEmp.contracts) {
      currentEmp.contracts.forEach((currentCon) => {
        // find if contract is current based on projects
        let current = false;
        if (currentCon.projects) {
          for (let currentProj of currentCon.projects) {
            if (!currentProj.endDate || isSameOrBefore(today, currentProj.endDate, 'day')) {
              current = true;
              break; // break for loop
            }
          }
        }
        // add current contracts
        if (current) {
          let contract = store.getters.contracts.find((c) => c.id === currentCon.contractId);
          contractNames.push(contract.contractName);
          primeNames.push(contract.primeName);
        }
      });
    }
    currentEmp.contractNames = contractNames?.join(' & ');
    currentEmp.primeNames = primeNames?.join(' & ');
  });
} // buildContractsAndPrimesColumns

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populates all current customer orgs in the search dropdown.
 */
function populateCustomerOrgsDropdown() {
  custOrgs.value = [];
  _forEach(filteredEmployees.value, (employee) =>
    _forEach(employee.customerOrgExp, (org) => {
      if (org.current) custOrgs.value.push(org.name);
    })
  );
  custOrgs.value = Array.from(new Set(custOrgs.value));
} // populateCustomerOrgsDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(emps) {
  // refresh the employees autocomplete list to be those that match the query
  employees.value = populateEmployeesDropdown(emps);
  populateCustomerOrgsDropdown(emps);
} // populateDropdowns

/**
 * Refresh the list based on the current queries
 */
function refreshDropdownItems() {
  filteredEmployees.value = employeesInfo.value;
  if (search.value) {
    filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
      return employee.employeeNumber == search.value;
    });
  }
  if (custOrgSearch.value) {
    searchCustomerOrgs();
  }
  if (tagsInfo.value.selected.length > 0) {
    filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
      return selectedTagsHasEmployee(employee.id, tagsInfo.value);
    });
  }

  populateDropdowns(filteredEmployees.value);
} // refreshDropdownItems

/**
 * Filters employees on the data table by the customer org entered by the user.
 */
function searchCustomerOrgs() {
  filteredEmployees.value = _filter(employeesInfo.value, (employee) => {
    if (employee.customerOrgExp) {
      return employee.customerOrgExp.find((org) => org.current && org.name === custOrgSearch.value);
    } else {
      return false;
    }
  });
  if (search.value) {
    // if there is a desired employee search then only show that employee
    filteredEmployees.value = _filter(employeesInfo.value, (employee) => {
      return employee.employeeNumber == search.value;
    });
  }
} // searchCustomerOrgs

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
