<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" xl="3" lg="3" md="3" sm="12" class="my-0 pb-0">
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
        <v-col cols="12" xl="3" lg="3" md="3" sm="12" class="my-0 pb-0">
          <v-autocomplete
            v-model="jobRoleSearch"
            :items="jobRoles"
            :label="`Search By Job Role`"
            clearable
            auto-select-first
            @change="refreshDropdownItems()"
            @click:clear="jobRoleSearch = null"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- START EMPLOYEE TABLE -->
      <v-data-table
        :headers="headers"
        :items="filteredEmployees"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :items-per-page="-1"
        class="elevation-1"
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
        <!-- Job Role Item Slot -->
        <template v-slot:[`item.jobRole`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.jobRole }}
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
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item - employee object
 * @param queryText - query to use to filter
 * @return string - the filtered name
 */
function customEmployeeFilter(item, queryText) {
  const query = queryText ? queryText.trim() : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsEmployeeNumber = item.value.toString().indexOf(query.toString()) >= 0;

  return queryContainsNickName || queryContainsFirstName || queryContainsEmployeeNumber;
} // customEmployeeFilter

/**
 * Returns a filtered list of the input with all inactive
 * employees removed
 */
function getActive(employees) {
  return _.filter(employees, (e) => {
    return e.workStatus > 0;
  });
} // getActive

/**
 * Gets the full name of an employee.
 *
 * @param item - the employee
 * @return String - The employees first name
 */
function getFullName(item) {
  item.fullName = item.firstName + ' ' + item.lastName;
  return item.fullName;
} // getFullName

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(item) {
  this.$router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populates all job roles in the search dropdown.
 */
function populateJobRoleDropdown() {
  let employeeJobRoles = _.map(this.filteredEmployees, (employee) => employee.jobRole);
  employeeJobRoles = _.compact(employeeJobRoles);
  _.forEach(employeeJobRoles, (jobRole) => this.jobRoles.push(jobRole));
} // populateJobRoleDropdown

/**
 * Sets a mapping of employee name to employee id for the autocomplete options.
 *
 * @param empData - The list of employees
 */
function populateEmployeesDropdown(empData) {
  this.employees = _.sortBy(
    _.map(empData, (data) => {
      if (data && data.firstName && data.lastName && data.employeeNumber) {
        return {
          text: data.firstName + ' ' + data.lastName,
          value: data.employeeNumber.toString(),
          nickname: data.nickname,
          firstName: data.firstName,
          lastName: data.lastName
        };
      }
    }).filter((data) => {
      return data != null;
    }),
    (employee) => employee.text.toLowerCase()
  );
} // constructAutoComplete

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(employees) {
  // refresh the employees autocomplete list to be those that match the query
  this.populateEmployeesDropdown(employees);
  this.populateJobRoleDropdown(employees);
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
  if (this.jobRoleSearch) {
    this.searchJobRoles();
  }
  if (this.search === null && this.jobRoleSearch === null) {
    this.filteredEmployees = this.employeesInfo;
  }

  this.populateDropdowns(this.filteredEmployees);
} // refreshDropdownItems

function searchJobRoles() {
  this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
    if (employee.jobRole) {
      return employee.jobRole.includes(this.jobRoleSearch);
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
}

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
          text: 'Job Role',
          value: 'jobRole'
        },
        {
          text: 'Email',
          value: 'email'
        }
      ], // datatable headers
      jobRoleSearch: null,
      jobRoles: [],
      search: null, // query text for datatable search field
      showInactiveEmployees: false,
      sortBy: 'firstName', // sort datatable items
      sortDesc: false
    };
  },
  methods: {
    customEmployeeFilter,
    getActive,
    getFullName,
    handleClick,
    populateEmployeesDropdown,
    populateJobRoleDropdown,
    populateDropdowns,
    refreshDropdownItems,
    searchJobRoles
  }
};
</script>
