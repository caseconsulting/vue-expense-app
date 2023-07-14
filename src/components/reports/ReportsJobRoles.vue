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
            v-model="jobRoleSearch"
            :items="jobRoles"
            label="Search By Job Role"
            clearable
            auto-select-first
            @change="refreshDropdownItems()"
            @click:clear="jobRoleSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            class="mr-3"
            clearable
            chips
            deletable-chips
            label="Filter by Employee Tag"
            v-model="selectedTags"
            :items="tags"
            multiple
            variant="solo-filled"
            item-color="gray"
            item-text="tagName"
            item-value="id"
            return-object
            @change="refreshDropdownItems()"
          >
          </v-autocomplete>
        </v-col>
        <v-col cols="2" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <span v-on="on">
                <v-checkbox @change="refreshDropdownItems()" v-model="tagFlip" label="Flip tag(s)" />
              </span>
            </template>
            <span>Filter OUT employees with tag(s)</span>
          </v-tooltip>
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
  window.EventBus.$on('get-employees-to-contact', () => {
    window.EventBus.$emit('list-of-employees-to-contact', this.filteredEmployees);
  });

  this.employeesInfo = this.getActive(this.$store.getters.employees); // default to filtered list
  this.tags = this.$store.getters.tags;
  this.filteredEmployees = this.employeesInfo; // this one is shown
  this.populateDropdowns(this.employeesInfo);
  if (this.$route.params.requestedFilter) {
    this.jobRoleSearch = this.$route.params.requestedFilter;
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
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(employees) {
  // refresh the employees autocomplete list to be those that match the query
  this.employees = this.populateEmployeesDropdown(employees);
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
  if (this.selectedTags.length > 0) {
    this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
      for (let i = 0; i < this.selectedTags.length; i++) {
        if (this.selectedTags[i].employees.includes(employee.id)) {
          return !this.tagFlip;
        }
      }
      return this.tagFlip;
    });
  }

  this.populateDropdowns(this.filteredEmployees);
} // refreshDropdownItems

/**
 * Filters employees on the data table by the job role entered by the user.
 */
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
} // searchJobRoles

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
      selectedTags: [],
      showInactiveEmployees: false,
      sortBy: 'firstName', // sort datatable items
      sortDesc: false,
      tags: [],
      tagFlip: false,
      tagSearchString: ''
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
  },
  watch: {
    showInactiveEmployees: watchShowInactiveUsers
  }
};
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
