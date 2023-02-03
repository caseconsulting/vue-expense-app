<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :filter="customEmployeeFilter"
            :items="employees"
            label="Search By Employee Name"
            auto-select-first
            clearable
            @change="refreshDropdownItems()"
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
            clearable
            auto-select-first
            @change="refreshDropdownItems()"
            @click:clear="custOrgSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-checkbox v-model="showInactiveEmployees" label="Show Inactive Users"></v-checkbox>
        </v-col>
      </v-row>

      <!-- START EMPLOYEE TABLE -->
      <v-data-table
        :headers="headers"
        :items="filteredEmployees"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :items-per-page="-1"
        class="elevation-1 row-pointer"
        @click:row="handleClick"
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
        <!-- Alert for no search results -->
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
      <!-- END EMPLOYEE TABLE -->
    </v-container>
  </div>
</template>

<script>
import _ from 'lodash';
import { customEmployeeFilter, getActive, getFullName, populateEmployeesDropdown } from './reports-utils';

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
function created() {
  this.employeesInfo = this.getActive(this.$store.getters.employees); // default to filtered list
  this.filteredEmployees = this.employeesInfo; // this one is shown
  this.populateDropdowns(this.employeesInfo);
  this.buildCustomerOrgColumns();
  if (this.$route.params.requestedFilter) {
    this.custOrgSearch = this.$route.params.requestedFilter;
    this.refreshDropdownItems();
    this.$route.params.requestedFilter = null;
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all of the current customer orgs for each employee and displays the column on the table.
 */
function buildCustomerOrgColumns() {
  this.employeesInfo.forEach((currentEmp) => {
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
        currentEmp.currentOrgYoE = years + (years == 1 ? ' year' : ' years');
      }
    }
  });
} // buildCustomerOrgColumns

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(item) {
  this.$router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populates all current customer orgs in the search dropdown.
 */
function populateCustomerOrgsDropdown() {
  _.forEach(this.filteredEmployees, (employee) =>
    _.forEach(employee.customerOrgExp, (org) => {
      if (org.current) this.custOrgs.push(org.name);
    })
  );
} // populateCustomerOrgsDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(employees) {
  // refresh the employees autocomplete list to be those that match the query
  this.employees = this.populateEmployeesDropdown(employees);
  this.populateCustomerOrgsDropdown(employees);
} // populateDropdowns

/**
 * Refresh the list based on the current queries
 */
function refreshDropdownItems() {
  if (this.search) {
    this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
      return employee.employeeNumber == this.search;
    });
  }
  if (this.custOrgSearch) {
    this.searchCustomerOrgs();
  }
  if (this.search === null && this.custOrgSearch === null) {
    this.filteredEmployees = this.employeesInfo;
  }

  this.populateDropdowns(this.filteredEmployees);
} // refreshDropdownItems

/**
 * Filters employees on the data table by the customer org entered by the user.
 */
function searchCustomerOrgs() {
  this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
    if (employee.customerOrgExp) {
      return employee.customerOrgExp.find((org) => org.current && org.name === this.custOrgSearch);
    } else {
      return false;
    }
  });
  if (this.search) {
    // if there is a desired employee search then only show that employee
    this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
      return employee.employeeNumber == this.search;
    });
  }
} // searchCustomerOrgs

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watches the showInactiveUsers to refilter the table as needed
 */
function watchShowInactiveUsers() {
  this.search = null;
  this.employeesInfo = this.$store.getters.employees;
  if (!this.showInactiveEmployees) this.employeesInfo = this.getActive(this.employeesInfo);
  this.populateDropdowns(this.employeesInfo);
  this.refreshDropdownItems();
} // watchShowInactiveUsers

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      employees: [],
      employeesInfo: [],
      filteredEmployees: [],
      headers: [
        {
          text: 'Employee #',
          value: 'employeeNumber'
        },
        {
          text: 'Name',
          value: 'fullName'
        },
        {
          text: 'Current Customer Org',
          value: 'currentOrgName'
        },
        {
          text: 'Current Customer Org Experience',
          value: 'currentOrgYoE'
        },
        {
          text: 'Email',
          value: 'email'
        }
      ], // datatable headers
      custOrgSearch: null,
      custOrgs: [],
      search: null, // query text for datatable search field
      showInactiveEmployees: false,
      sortBy: 'firstName', // sort datatable items
      sortDesc: false
    };
  },
  methods: {
    buildCustomerOrgColumns,
    customEmployeeFilter,
    getActive,
    getFullName,
    handleClick,
    populateEmployeesDropdown,
    populateCustomerOrgsDropdown,
    populateDropdowns,
    refreshDropdownItems,
    searchCustomerOrgs
  },
  watch: {
    showInactiveEmployees: watchShowInactiveUsers
  }
};
</script>

<style lang="css" scoped>
.row-pointer >>> tbody tr :hover {
  cursor: pointer;
}
</style>

<style lang="scss" scoped>
@import 'src/assets/styles/styles';
.inactive {
  color: $case-red;
}
</style>