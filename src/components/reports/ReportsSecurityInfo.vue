<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" xl="3" lg="3" md="3" sm="12" class="my-0 py-0">
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :customFilter="customEmployeeFilter"
            :items="employees"
            label="Search By Employee Name"
            variant="underlined"
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
        <v-col cols="12" xl="3" lg="3" md="3" sm="12" class="my-0 py-0">
          <v-autocomplete
            v-model="badgeExpirationDateSearch"
            :items="badgeExpirations"
            label="Search By Badge Expiration"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdownItems()"
            @click:clear="badgeExpirationDateSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" xl="3" lg="3" md="3" sm="12" class="my-0 py-0">
          <v-autocomplete
            v-model="clearanceSearch"
            :items="clearances"
            label="Search By Clearance"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdownItems()"
            @click:clear="clearanceSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            clearable
            label="Filter by Tag (click to flip)"
            v-model="selectedTags"
            :items="tags"
            multiple
            variant="underlined"
            item-title="tagName"
            item-value="id"
            @update:model-value="refreshDropdownItems()"
            return-object
          >
            <template v-slot:selection="{ item }">
              <v-chip
                small
                closable
                @click.stop
                @click="negateTag(item.raw)"
                @click:close="removeTag(item.raw)"
                :color="chipColor(item.raw.id)"
              >
                {{ tagFlip.includes(item.raw.id) ? 'NOT ' : '' }}
                {{ item.raw.tagName }}
              </v-chip>
            </template>
          </v-autocomplete>
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
      </v-data-table>
      <!-- END EMPLOYEE TABLE -->
    </v-container>
  </div>
</template>

<script>
import _ from 'lodash';
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
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
  this.emitter.on('get-employees-to-contact', (tab) => {
    if (tab === 'securityInfo') {
      this.emitter.emit('list-of-employees-to-contact', this.filteredEmployees);
    }
  });

  this.employeesInfo = this.getActive(this.$store.getters.employees); // default to filtered list
  this.tags = this.$store.getters.tags;
  this.filteredEmployees = this.employeesInfo; // this one is shown
  this.populateDropdowns(this.employeesInfo);

  // fill in search boxes if routed from another page
  if (this.$route.params.requestedFilter) {
    this.clearanceSearch = this.$route.params.requestedFilter;
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
 * Returns the color that at tag filter chip should be
 *
 * @param id ID of the tag item
 *
 */
function chipColor(id) {
  return this.tagFlip.includes(id) ? 'red' : 'gray';
} // chipColor

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
      clearance.awaitingClearance ? types.push(clearance.type + ' (awaiting clearance)') : types.push(clearance.type);
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
function handleClick(_, { item }) {
  this.$router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * negates a tag
 */
function negateTag(item) {
  // try to find the id in the tagFlip array, if it is there then remove it else add it
  const index = this.tagFlip.indexOf(item.id);
  if (index >= 0) {
    this.tagFlip.splice(index, 1);
  } else {
    this.tagFlip.push(item.id);
  }
} // negateTag

/**
 * Populates all job roles in the search dropdown.
 */
function populateBadgeExpirationsDropdown() {
  // formats the badge exp dropdowns to include the date in the future
  this.badgeExpirations = [];
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

  this.badgeExpirations = new Set(this.badgeExpirations);
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
  this.filteredEmployees = this.employeesInfo;
  if (this.search) {
    this.filteredEmployees = _.filter(this.filteredEmployees, (employee) => {
      return employee.employeeNumber == this.search;
    });
  }
  if (this.badgeExpirationDateSearch) {
    this.searchBadgeExpirationDates(this.badgeExpirationDateSearch);
  }
  if (this.clearanceSearch) {
    this.searchClearances(this.clearanceSearch);
  }
  if (this.selectedTags.length > 0) {
    this.filteredEmployees = _.filter(this.filteredEmployees, (employee) => {
      return this.selectedTagsHasEmployee(employee);
    });
  }

  this.populateDropdowns(this.filteredEmployees);
} // refreshDropdownItems

/**
 * Removes an item from the tag filters's active filters
 *
 * @param item - The filter to remove
 */
function removeTag(item) {
  const selIndex = this.selectedTags.findIndex((t) => t.id === item.id);
  if (selIndex >= 0) {
    this.selectedTags.splice(selIndex, 1);
  }
} // removeTag

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

/**
 * Filter by clearances, modifies the filteredEmployees variable
 *
 * @param search - the clearance to search for
 */
function searchClearances(search) {
  this.filteredEmployees = _.filter(this.filteredEmployees, (e) => {
    if (e.clearances) {
      for (let i = 0; i < e.clearances.length; i++) {
        if (e.clearances[i].type == search) return true;
      }
    }
    return false;
  });
} // searchClearances

/**
 * helper function: return true if any selected tag has employee listed under it.
 *
 * @param e - the employee
 * @return true if the employee has a tag selected in filters
 */
function selectedTagsHasEmployee(e) {
  let inTag, tagFlipped;
  for (let i = 0; i < this.selectedTags.length; i++) {
    inTag = this.selectedTags[i].employees.includes(e.id);
    tagFlipped = this.tagFlip.includes(this.selectedTags[i].id);
    if (inTag != tagFlipped) {
      return true;
    }
  }
  return false;
} // selectedTagsHasEmployee

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

/**
 * In the case that the page has been force reloaded (and the store cleared)
 * this watcher will be activated when the store is populated again.
 */
function watchTagFlip() {
  this.refreshDropdownItems();
} // watchTagFlip

/**
 * Remove items from tagFlip array when they are removed from the selected
 * tags
 */
function watchSelectedTags() {
  let negatedTagRemoved = true;
  // use normal for loop to have the index
  for (let i = 0; i < this.tagFlip.length; i++) {
    // try to find the current tag in the selectedTags
    _.forEach(this.selectedTags, (t) => {
      if (t.id === this.tagFlip[i]) negatedTagRemoved = false;
    });
    // if it isn't there, remove it from tagFlip too
    if (negatedTagRemoved) {
      this.tagFlip.splice(i, 1);
    }
  }
  this.refreshDropdownItems();
} // watchSelectedTags

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
          title: 'Employee #',
          key: 'employeeNumber'
        },
        {
          title: 'Name',
          key: 'fullName'
        },
        {
          title: 'Clearance Type',
          key: 'clearanceType'
        },
        {
          title: 'Badge Expiration Date',
          key: 'badgeExpiration'
        },
        {
          title: 'Email',
          key: 'email'
        }
      ], // datatable headers
      badgeExpirationDateSearch: null,
      badgeExpirations: [],
      clearanceSearch: null,
      clearances: ['TS/SCI - Full Scope', 'TS/SCI - CI Poly', 'TS/SCI - No Poly', 'Top Secret', 'Secret'],
      search: null, // query text for datatable search field
      selectedTags: [],
      showInactiveEmployees: false,
      sortBy: [{ key: 'employeeNumber' }], // sort datatable items
      sortDesc: false,
      tags: [],
      tagFlip: [],
      tagSearchString: ''
    };
  },
  methods: {
    customEmployeeFilter,
    chipColor,
    getActive,
    getBadgeExpiration,
    getClearanceType,
    getFullName,
    handleClick,
    negateTag,
    populateBadgeExpirationsDropdown,
    populateEmployeesDropdown,
    populateDropdowns,
    refreshDropdownItems,
    removeTag,
    searchBadgeExpirationDates,
    searchClearances,
    selectedTagsHasEmployee,
    userRoleIsAdmin,
    userRoleIsManager
  },
  watch: {
    showInactiveEmployees: watchShowInactiveUsers,
    tagFlip: { handler: watchTagFlip, deep: true },
    selectedTags: { handler: watchSelectedTags, deep: true }
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
