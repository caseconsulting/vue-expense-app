<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" xl="3" lg="3" md="3" sm="12" class="my-0 py-0">
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
        <v-col cols="12" xl="3" lg="3" md="3" sm="12" class="my-0 py-0">
          <v-autocomplete
            v-model="badgeExpirationDateSearch"
            :items="badgeExpirations"
            label="Search By Badge Expiration"
            clearable
            auto-select-first
            @change="refreshDropdownItems()"
            @click:clear="badgeExpirationDateSearch = null"
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
        <!-- Clearance Types Slot -->
        <template v-slot:[`item.clearanceType`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ getClearanceType(item.clearances, item) }}
          </p>
        </template>
        <!-- Badge Expiration Slot -->
        <template v-slot:[`item.badgeExpiration`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ getBadgeExpiration(item.clearances, item) }}
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
import { add, format, getTodaysDate } from '@/shared/dateUtils';
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
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns the expiration dates for all clearances in natural readable format. The sorting key of item.badgeExpiration
 * is stored just as the int form of the time to get accurate sorting.
 *
 * @param clearances - the list of employee clearances
 * @param item - the employee
 * @return String - all badge expiration dates
 */
function getBadgeExpiration(clearances, item) {
  let dates = [];
  let fDate = 100000000000000000;

  // used for sorting... only store the lowest date (closest to expire)
  _.forEach(clearances, (clearance) => {
    if (clearance.badgeExpirationDate) {
      let newDate = parseInt(format(clearance.badgeExpirationDate, null, 'X')); // seconds timestamp -> int
      dates.push(newDate);
      if (newDate < fDate) fDate = newDate;
    }
  });

  dates = _.orderBy(dates);

  // used for displaying
  dates = _.map(dates, (date) => {
    return format(date, 'X', 'MMM Do, YYYY');
  });

  item.badgeExpiration = fDate;

  return _.join(dates, ' | ');
} // getBadgeExpiration

/**
 * Returns the expiration dates for all clearances.
 *
 * @param clearances - the list of employee clearances
 * @param item - the employee
 * @return String - all clearance types
 */
function getClearanceType(clearances, item) {
  let types = [];
  let clearanceList = _.sortBy(clearances, (c) => c.badgeExpirationDate);
  _.forEach(clearanceList, (clearance) => {
    if (clearance.type) {
      types.push(clearance.type);
    }
  });
  item.clearanceType = _.join(types, ' | ');
  return item.clearanceType;
} // getClearanceType

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
function populateBadgeExpirationsDropdown() {
  // formats the badge exp dropdowns to include the date in the future
  let dateRanges = ['30 Days', '60 Days', '90 Days', '180 Days', '365 Days'];
  _.forEach(dateRanges, (date) => {
    let search = date.split(' ');
    let num = parseInt(search[0]);
    let dateType = search[1].toLowerCase();
    let futureDate = format(add(getTodaysDate(), num, dateType), null, 'MMM Do, YYYY');
    this.badgeExpirations.push(date + ' (' + futureDate + ')');
  });

  if (this.search) {
    // once the dropdown is in place, we want to only show options that match
    // dates found in filteredEmployees
    this.badgeExpirations = _.filter(this.badgeExpirations, (date) => {
      let result = this.searchBadgeExpirationDates(date, true);
      return result;
    });
  }

  // refresh the employees autocomplete list to be those that match the query
  this.employees = this.populateEmployeesDropdown(this.filteredEmployees);
} // populateBadgeExpirationsDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(employees) {
  // refresh the employees autocomplete list to be those that match the query
  this.populateEmployeesDropdown(employees);
  this.populateBadgeExpirationsDropdown(employees);
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
  if (this.badgeExpirationDateSearch) {
    this.searchBadgeExpirationDates(this.badgeExpirationDateSearch);
  }
  if (this.search === null && this.badgeExpirationDateSearch === null) {
    this.filteredEmployees = this.employeesInfo;
  }

  this.populateDropdowns(this.filteredEmployees);
} // refreshDropdownItems

/**
 * If there is a desired badge expiration date, this will calculate what dates fall within the range.
 *
 * @param requestedDate - the requested search for the badge expiration date
 * @param forDropdown - used to limit the badge expiration dropdown options based on if there were dates found in that range
 * @return boolean - if we are trying to filter the badge dropdowns, return true if the requestedDate was found
 */
function searchBadgeExpirationDates(requestedDate, forDropdown) {
  let search = requestedDate.split(' ');
  let num = parseInt(search[0]);
  let dateType = search[1].toLowerCase();
  let now = parseInt(format(getTodaysDate(), null, 'X'));
  let upperBound = parseInt(format(add(getTodaysDate(), num, dateType), null, 'X'));
  let foundEmployees = [];

  if (this.filteredEmployees.length > 0) {
    // this means we already filtered by something so we want to restrict the dropdown
    foundEmployees = _.filter(this.filteredEmployees, (employee) => {
      let found = [];
      // if they have no badge expirations, then badgeExpiration will be the big number
      if (employee.badgeExpiration < 100000000000000000) {
        // loop through every employee's clearances and see if any of them are in the selected range
        _.forEach(employee.clearances, (clearance) => {
          let clearanceDate = parseInt(format(clearance.badgeExpirationDate, null, 'X')); // seconds timestamp -> int
          if (clearanceDate > now && clearanceDate <= upperBound && !foundEmployees.includes(employee)) {
            found.push(employee);
          }
        });
      }
      return found.length > 0; // used for the filter function. only keeps employees that met the date criteria
    });
  } else {
    // this means we havent already filtered so we only want to filter the employees
    foundEmployees = _.filter(this.employeesInfo, (employee) => {
      // if they have no badge expirations, then badgeExpiration will be the big number
      if (employee.badgeExpiration < 100000000000000000) {
        // loop through every employee's clearances and see if any of them are in the selected range
        _.forEach(employee.clearances, (clearance) => {
          let clearanceDate = parseInt(format(clearance.badgeExpirationDate, null, 'X')); // seconds timestamp -> int
          if (clearanceDate > now && clearanceDate <= upperBound && !foundEmployees.includes(employee))
            foundEmployees.push(employee);
        });
      }
    });
  }
  if (!forDropdown) {
    this.filteredEmployees = foundEmployees;
    return;
  } else {
    return foundEmployees.length > 0; // used to filter the dropdowns in populateDataTypeDropDowns
  }
} // searchBadgeExpirationDates

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
          text: 'Clearance Type',
          value: 'clearanceType'
        },
        {
          text: 'Badge Expiration Date',
          value: 'badgeExpiration'
        },
        {
          text: 'Email',
          value: 'email'
        }
      ], // datatable headers
      badgeExpirationDateSearch: null,
      badgeExpirations: [],
      search: null, // query text for datatable search field
      showInactiveEmployees: false,
      sortBy: 'firstName', // sort datatable items
      sortDesc: false
    };
  },
  methods: {
    customEmployeeFilter,
    getActive,
    getBadgeExpiration,
    getClearanceType,
    getFullName,
    handleClick,
    populateBadgeExpirationsDropdown,
    populateEmployeesDropdown,
    populateDropdowns,
    refreshDropdownItems,
    searchBadgeExpirationDates
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
