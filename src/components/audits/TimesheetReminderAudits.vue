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
            label="Search Employees"
            variant="underlined"
            auto-select-first
            clearable
            item-title="text"
            item-value="value"
            @click:clear="
              search = null;
              refreshDropdownItems();
            "
          ></v-autocomplete>
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="reminders"
        :sort-by="sortBy"
        :items-per-page="-1"
        class="elevation-1 row-pointer"
      >
        <!-- Employee Number Slot
        <template v-slot:[`item.employeeNumber`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.employeeNumber }}
          </p>
        </template>-->
      </v-data-table>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import _forEach from 'lodash/forEach';
import _filter from 'lodash/filter';
// import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { employeeFilter } from '@/shared/filterUtils';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
// import TagsFilter from '@/components/shared/TagsFilter.vue';
const emitter = inject('emitter');
const store = useStore();
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
    title: 'Employee',
    key: 'employee.name'
  },
  {
    title: 'Phone Number',
    key: 'phoneNumber'
  },
  {
    title: 'Date/time',
    key: 'timestamp'
  }
]); // datatable headers
const awardSearch = ref(null);
const awards = ref([]);
const search = ref(null); // query text for datatable search field
const showInactiveEmployees = ref(false);
const sortBy = ref([{ key: 'timestamp' }]); // sort datatable items
const tagsInfo = ref({
  selected: [],
  flipped: []
});

// indexed datasets
let reminders = ref([]);
let index = ref({
  employee: {},
  invocation: {}
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
  employeesInfo.value = store.getters.employees; // default to filtered
  filteredEmployees.value = employeesInfo.value; // this one is shown
  populateDropdowns(employeesInfo.value);
  buildAwardsColumns();
  if (localStorage.getItem('requestedFilter')) {
    awardSearch.value = localStorage.getItem('requestedFilter');
    refreshDropdownItems();
    localStorage.removeItem('requestedFilter');
  }

  // index datasets for easy searching
  for (let employee of employeesInfo.value) {
    for (let reminder of employee.timesheetReminders ?? []) {
      let basicEmployee = {
        id: employee.id,
        name: `${employee.nickname || employee.firstName} ${employee.lastName}`
      };
      // add to array of all reminders
      reminders.value.push({ ...reminder, employee: basicEmployee });
      // add to employee index
      if (!index.value.employee[employee.id]) index.value.employee[employee.id] = [];
      index.value.employee[employee.id].push({ ...reminder, employee: basicEmployee });
      // add to lamdba invocation index
      let invocation = getInvocation(reminder);
      if (!index.value.invocation[invocation]) index.value.invocation[invocation] = [];
      index.value.invocation[invocation].push({ ...reminder, employee: basicEmployee });
    }
  }
  console.log(reminders.value);
  console.log(index.value);

  // initial set of table download data
  updateTableInfo(filteredEmployees.value);
}); // created

// helper to identify lambda invocations for grouping
function getInvocation(reminder) {
  // TODO: round to nearest hour and return "YYYY-MM-DD-HH"
  return reminder.timestamp;
}

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all of the active awards for each employee and displays the column on the table.
 */
function buildAwardsColumns() {
  employeesInfo.value.forEach((currentEmp) => {
    if (currentEmp.awards) {
      let hasAward = false;
      let awards = '';
      currentEmp.awards.forEach((award) => {
        hasAward = true;
        awards += `${award.name} & `;
      });
      if (hasAward) {
        // remove & at the end
        awards = awards.slice(0, -2);
        currentEmp.awardNames = awards;
      }
    }
  });
} // buildAwardsColumns

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populates all awards in the search dropdown.
 */
function populateAwardsDropdown() {
  awards.value = [];
  _forEach(filteredEmployees.value, (employee) =>
    _forEach(employee.awards, (award) => {
      awards.value.push(award.name);
    })
  );
  awards.value = Array.from(new Set(awards.value));
} // populateAwardsDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(emps) {
  // refresh the employees autocomplete list to be those that match the query
  // employees.value = populateEmployeesDropdown(emps);
  populateAwardsDropdown(emps);
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
  if (awardSearch.value) {
    searchAwards();
  }
  if (tagsInfo.value.selected.length > 0) {
    filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
      return selectedTagsHasEmployee(employee.id, tagsInfo.value);
    });
  }

  populateDropdowns(filteredEmployees.value);
} // refreshDropdownItems

/**
 * Filters employees on the data table by the award entered by the user.
 */
function searchAwards() {
  filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
    if (employee.awardNames) {
      return employee.awardNames.includes(awardSearch.value);
    } else {
      return false;
    }
  });
} // searchAwards

/**
 * Emit new data for this tab
 *
 * @param event the event data containing the table information
 */
function updateTableInfo(event) {
  emitter.emit('reports-table-update', { tab: 'awards', table: event, headers: headers });
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
  // if (!showInactiveEmployees.value) employeesInfo.value = employeesInfo.value;
  populateDropdowns(employeesInfo.value);
  refreshDropdownItems();
}); // watchShowInactiveUsers
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
