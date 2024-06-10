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
                size="small"
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
import _ from 'lodash';
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { employeeFilter } from '@/shared/filterUtils';
import { add, format, getTodaysDate } from '@/shared/dateUtils';
import { getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
import { getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
import { onMounted, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
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
const selectedTags = ref([]);
const showInactiveEmployees = ref(false);
const sortBy = ref([{ key: 'employeeNumber' }]); // sort datatable items
const tags = ref([]);
const tagFlip = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
onMounted(() => {
  emitter.on('get-employees-to-contact', (tab) => {
    if (tab === 'security info') {
      emitter.emit('list-of-employees-to-contact', filteredEmployees.value);
    }
  });

  employeesInfo.value = getActive(store.getters.employees); // default to filtered list
  tags.value = store.getters.tags;
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
 * Returns the color that at tag filter chip should be
 *
 * @param id ID of the tag item
 *
 */
function chipColor(id) {
  return tagFlip.value.includes(id) ? 'red' : 'gray';
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
  router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * negates a tag
 */
function negateTag(item) {
  // try to find the id in the tagFlip array, if it is there then remove it else add it
  const index = tagFlip.value.indexOf(item.id);
  if (index >= 0) {
    tagFlip.value.splice(index, 1);
  } else {
    tagFlip.value.push(item.id);
  }
} // negateTag

/**
 * Populates all job roles in the search dropdown.
 */
function populateBadgeExpirationsDropdown() {
  // formats the badge exp dropdowns to include the date in the future
  badgeExpirations.value = [];
  let dateRanges = ['30 Days', '60 Days', '90 Days', '180 Days', '365 Days'];
  _.forEach(dateRanges, (date) => {
    let search = date.split(' ');
    let num = parseInt(search[0]);
    let dateType = search[1].toLowerCase();
    let futureDate = format(add(getTodaysDate(), num, dateType), null, 'MMM Do, YYYY');
    badgeExpirations.value.push(date + ' (' + futureDate + ')');
  });

  if (search.value) {
    // once the dropdown is in place, we want to only show options that match
    // dates found in filteredEmployees
    badgeExpirations.value = _.filter(badgeExpirations.value, (date) => {
      let result = searchBadgeExpirationDates(date, true);
      return result;
    });
  }

  badgeExpirations.value = new Set(badgeExpirations.value);
  // refresh the employees autocomplete list to be those that match the query
  employees.value = populateEmployeesDropdown(filteredEmployees.value);
} // populateBadgeExpirationsDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(employees) {
  // refresh the employees autocomplete list to be those that match the query
  populateEmployeesDropdown(employees);
  populateBadgeExpirationsDropdown(employees);
} // populateDropdowns

/**
 * Refresh the list based on the current queries
 */
function refreshDropdownItems() {
  filteredEmployees.value = employeesInfo.value;
  if (search.value) {
    filteredEmployees.value = _.filter(filteredEmployees.value, (employee) => {
      return employee.employeeNumber == search.value;
    });
  }
  if (badgeExpirationDateSearch.value) {
    searchBadgeExpirationDates(badgeExpirationDateSearch.value);
  }
  if (clearanceSearch.value) {
    searchClearances(clearanceSearch.value);
  }
  if (selectedTags.value.length > 0) {
    filteredEmployees.value = _.filter(filteredEmployees.value, (employee) => {
      return selectedTagsHasEmployee(employee);
    });
  }

  populateDropdowns(filteredEmployees.value);
} // refreshDropdownItems

/**
 * Removes an item from the tag filters's active filters
 *
 * @param item - The filter to remove
 */
function removeTag(item) {
  const selIndex = selectedTags.value.findIndex((t) => t.id === item.id);
  if (selIndex >= 0) {
    selectedTags.value.splice(selIndex, 1);
  }
} // removeTag

/**
 * If there is a desired badge expiration date, will.value calculate what dates fall within the range.
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
    foundEmployees = _.filter(filteredEmployees.value, (employee) => {
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
    // means.value we havent already filtered so we only want to filter the employees
    foundEmployees = _.filter(employeesInfo.value, (employee) => {
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
  filteredEmployees.value = _.filter(filteredEmployees.value, (e) => {
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
  for (let i = 0; i < selectedTags.value.length; i++) {
    inTag = selectedTags.value[i].employees.includes(e.id);
    tagFlipped = tagFlip.value.includes(selectedTags.value[i].id);
    if (inTag != tagFlipped) {
      return true;
    }
  }
  return false;
} // selectedTagsHasEmployee

/**
 * Emit new data for tab.value
 *
 * @param event the event data containing the table information
 */
function updateTableDownload(event) {
  emitter.emit('reports-table-update', { tab: 'securityInfo', table: event });
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

/**
 * In the case that the page has been force reloaded (and the store cleared)
 * watcher.value will be activated when the store is populated again.
 */
watch(tagFlip, () => {
  refreshDropdownItems();
});

/**
 * Remove items from tagFlip array when they are removed from the selected
 * tags
 */
watch(selectedTags, () => {
  let negatedTagRemoved = true;
  // use normal for loop to have the index
  for (let i = 0; i < tagFlip.value.length; i++) {
    // try to find the current tag in the selectedTags
    _.forEach(selectedTags.value, (t) => {
      if (t.id === tagFlip.value[i]) negatedTagRemoved = false;
    });
    // if it isn't there, remove it from tagFlip too
    if (negatedTagRemoved) {
      tagFlip.value.splice(i, 1);
    }
  }
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
