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
            v-model="technologySearch"
            :items="technologies"
            label="Search By Technology"
            clearable
            auto-select-first
            @change="refreshDropdownItems()"
            @click:clear="technologySearch = null"
          ></v-autocomplete>
        </v-col>
        <div class="mx-2">
          <v-checkbox v-model="showAllTechnologies" label="Show All Technologies"></v-checkbox>
        </div>
        <div class="mx-3">
          <v-checkbox v-model="showInactiveEmployees" label="Show Inactive Users"></v-checkbox>
        </div>
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
        <!-- Technology Item Slot -->
        <template v-slot:[`item.technologyNames`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.technologyNames }}
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
  this.buildTechnologiesColumns();
  if (this.$route.params.requestedFilter) {
    this.technologySearch = this.$route.params.requestedFilter;
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
 * Gets all of the active technologies for each employee and displays the column on the table.
 */
function buildTechnologiesColumns() {
  this.employeesInfo.forEach((currentEmp) => {
    if (currentEmp.technologies) {
      let techs = '';
      currentEmp.technologies.forEach((tech) => {
        if (this.showAllTechnologies || tech.current) {
          techs += `${tech.name} & `;
        }
      });
      if (techs.length > 0) {
        // remove & at the end
        techs = techs.slice(0, -2);
        currentEmp.technologyNames = techs;
      }
    }
  });
} // buildTechnologiesColumns

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(item) {
  this.$router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populates all technologies in the search dropdown.
 */
function populateTechnologiesDropdown() {
  _.forEach(this.filteredEmployees, (employee) =>
    _.forEach(employee.technologies, (tech) => {
      if (this.showAllTechnologies || tech.current) {
        this.technologies.push(tech.name);
      } else {
        let t = this.technologies.findIndex((t) => t === tech.name);
        if (t != -1) {
          this.technologies.splice(t, 1);
        }
      }
    })
  );
} // populateTechnologiesDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(employees) {
  // refresh the employees autocomplete list to be those that match the query
  this.employees = this.populateEmployeesDropdown(employees);
  this.populateTechnologiesDropdown(employees);
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
  if (this.technologySearch) {
    this.searchTechnologies();
  }
  if (this.search === null && this.technologySearch === null) {
    this.filteredEmployees = this.employeesInfo;
  }

  this.populateDropdowns(this.filteredEmployees);
} // refreshDropdownItems

/**
 * Filters employees on the data table by the technology entered by the user.
 */
function searchTechnologies() {
  this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
    if (employee.technologyNames) {
      if (employee.technologyNames.includes('&')) {
        return employee.technologyNames.split(' & ').find((t) => t.trim() === this.technologySearch);
      } else {
        return employee.technologyNames.trim() === this.technologySearch;
      }
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
} // searchTechnologies

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watches the showAllTechnologies to refilter the table as needed
 */
function watchShowAllTechnologies() {
  this.populateDropdowns(this.employeesInfo);
  this.buildTechnologiesColumns();
  this.refreshDropdownItems();
  if (this.showAllTechnologies) {
    this.headers[2].text = 'All Technologies';
  } else {
    this.headers[2].text = 'Current Technologies';
  }
} // watchShowAllTechnologies

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
          text: 'All Technologies',
          value: 'technologyNames'
        },
        {
          text: 'Email',
          value: 'email'
        }
      ], // datatable headers
      technologySearch: null,
      technologies: [],
      search: null, // query text for datatable search field
      showAllTechnologies: true,
      showInactiveEmployees: false,
      sortBy: 'firstName', // sort datatable items
      sortDesc: false
    };
  },
  methods: {
    buildTechnologiesColumns,
    customEmployeeFilter,
    getActive,
    getFullName,
    handleClick,
    populateEmployeesDropdown,
    populateTechnologiesDropdown,
    populateDropdowns,
    refreshDropdownItems,
    searchTechnologies
  },
  watch: {
    showAllTechnologies: watchShowAllTechnologies,
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
