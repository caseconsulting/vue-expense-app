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
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
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
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
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
        class="elevation-1"
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

<script setup>
import _forEach from 'lodash/forEach';
import _orderBy from 'lodash/orderBy';
import _map from 'lodash/map';
import _join from 'lodash/join';
import _sortBy from 'lodash/sortBy';
import _filter from 'lodash/filter';
import { employeeFilter } from '@/shared/filterUtils';
import { add, format, getTodaysDate } from '@/shared/dateUtils';
import { getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
import { onMounted, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
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
]); // datatable headers
const badgeExpirationDateSearch = ref(null);
const badgeExpirations = ref([]);
const clearanceSearch = ref(null);
const clearances = ref(['TS/SCI - Full Scope', 'TS/SCI - CI Poly', 'TS/SCI - No Poly', 'Top Secret', 'Secret']);
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

  // fill in search boxes if routed from another page
  if (localStorage.getItem('requestedFilter')) {
    clearanceSearch.value = localStorage.getItem('requestedFilter');
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
  _forEach(clearances, (clearance) => {
    if (clearance.badgeExpirationDate) {
      let newDate = parseInt(format(clearance.badgeExpirationDate, null, 'X')); // seconds timestamp -> int
      dates.push(newDate);
      if (newDate < fDate) fDate = newDate;
    }
  });

  dates = _orderBy(dates);

  // used for displaying
  dates = _map(dates, (date) => {
    return format(date, 'X', 'MMM Do, YYYY');
  });

  item.badgeExpiration = fDate;

  return _join(dates, ' | ');
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
  let clearanceList = _sortBy(clearances, (c) => c.badgeExpirationDate);
  _forEach(clearanceList, (clearance) => {
    if (clearance.type) {
      clearance.awaitingClearance ? types.push(clearance.type + ' (awaiting clearance)') : types.push(clearance.type);
    }
  });
  item.clearanceType = _join(types, ' | ');
  return item.clearanceType;
} // getClearanceType

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populates all job roles in the search dropdown.
 */
function populateBadgeExpirationsDropdown() {
  // formats the badge exp dropdowns to include the date in the future
  badgeExpirations.value = [];
  let dateRanges = ['30 Days', '60 Days', '90 Days', '180 Days', '365 Days'];
  _forEach(dateRanges, (date) => {
    let search = date.split(' ');
    let num = parseInt(search[0]);
    let dateType = search[1].toLowerCase();
    let futureDate = format(add(getTodaysDate(), num, dateType), null, 'MMM Do, YYYY');
    badgeExpirations.value.push(date + ' (' + futureDate + ')');
  });

  if (search.value) {
    // once the dropdown is in place, we want to only show options that match
    // dates found in filteredEmployees
    badgeExpirations.value = _filter(badgeExpirations.value, (date) => {
      let result = searchBadgeExpirationDates(date, true);
      return result;
    });
  }

  badgeExpirations.value = Array.from(new Set(badgeExpirations.value));
  // refresh the employees autocomplete list to be those that match the query
  employees.value = populateEmployeesDropdown(filteredEmployees.value);
} // populateBadgeExpirationsDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(emps) {
  // refresh the employees autocomplete list to be those that match the query
  employees.value = populateEmployeesDropdown(emps);
  populateBadgeExpirationsDropdown(emps);
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
  if (badgeExpirationDateSearch.value) {
    searchBadgeExpirationDates(badgeExpirationDateSearch.value);
  }
  if (clearanceSearch.value) {
    searchClearances(clearanceSearch.value);
  }
  if (tagsInfo.value.selected.length > 0) {
    filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
      return selectedTagsHasEmployee(employee.id, tagsInfo.value);
    });
  }

  populateDropdowns(filteredEmployees.value);
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

  if (filteredEmployees.value.length > 0) {
    // means.value we already filtered by something so we want to restrict the dropdown
    foundEmployees = _filter(filteredEmployees.value, (employee) => {
      let found = [];
      // if they have no badge expirations, then badgeExpiration will be the big number
      if (employee.badgeExpiration < 100000000000000000) {
        // loop through every employee's clearances and see if any of them are in the selected range
        _forEach(employee.clearances, (clearance) => {
          let clearanceDate = parseInt(format(clearance.badgeExpirationDate, null, 'X')); // seconds timestamp -> int
          if (clearanceDate > now && clearanceDate <= upperBound && !foundEmployees.includes(employee)) {
            found.push(employee);
          }
        });
      }
      return found.length > 0; // used for the filter function. only keeps employees that met the date criteria
    });
  } else {
    // means.value we havent already filtered so we only want to filter the employees
    foundEmployees = _filter(employeesInfo.value, (employee) => {
      // if they have no badge expirations, then badgeExpiration will be the big number
      if (employee.badgeExpiration < 100000000000000000) {
        // loop through every employee's clearances and see if any of them are in the selected range
        _forEach(employee.clearances, (clearance) => {
          let clearanceDate = parseInt(format(clearance.badgeExpirationDate, null, 'X')); // seconds timestamp -> int
          if (clearanceDate > now && clearanceDate <= upperBound && !foundEmployees.includes(employee))
            foundEmployees.push(employee);
        });
      }
    });
  }
  if (!forDropdown) {
    filteredEmployees.value = foundEmployees;
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
  filteredEmployees.value = _filter(filteredEmployees.value, (e) => {
    if (e.clearances) {
      for (let i = 0; i < e.clearances.length; i++) {
        if (e.clearances[i].type == search) return true;
      }
    }
    return false;
  });
} // searchClearances

/**
 * Emit new data for tab.value
 *
 * @param event the event data containing the table information
 */
function updateTableDownload(event) {
  emitter.emit('reports-table-update', { tab: 'securityInfo', table: event, headers: headers });
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
