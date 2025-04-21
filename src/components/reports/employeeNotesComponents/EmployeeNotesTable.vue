<template>
  <div>
    <v-row>
      <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
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
      @update:current-items="updateTableInfo($event)"
    >
      <!-- Employee Number Slot -->
      <template v-slot:[`item.employeeNumber`]="{ item }">
        <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
          {{ item.employeeNumber }}
        </p>
      </template>
      <!-- Full Name Slot -->
      <template v-slot:[`item.fullName`]="{ item }">
        <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
          {{ getFullName(item) }}
        </p>
      </template>
      <!-- Updated Date Slot -->
      <template v-slot:[`item.notes.updated.date`]="{ item }">
        <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
          {{ format(item.notes?.updated?.date, null, 'MM/DD/YYYY') || '' }}
        </p>
      </template>
      <!-- Desire to move -->
      <template v-slot:[`item.notes.pages.career.desireToMove`]="{ item }">
        <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
          {{ item.notes?.pages?.career?.desireToMove ? 'YES' : '' }}
        </p>
      </template>
      <!-- Kudo Date Slot -->
      <template v-slot:[`item.notes.kudos`]="{ item }">
        <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
          {{ getLastKudoDate(item.id) }}
        </p>
      </template>
      <!-- Medical notes -->
      <template v-slot:[`item.notes.pages.personal.medical`]="{ item }">
        <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
          {{ item.notes?.pages?.personal?.medical ? 'YES' : '' }}
        </p>
      </template>
      <!-- Family notes -->
      <template v-slot:[`item.notes.pages.personal.familial`]="{ item }">
        <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
          {{ item.notes?.pages?.personal?.familial ? 'YES' : '' }}
        </p>
      </template>
      <!-- Buttons -->
      <template #[`item.actions`]="{ item }">
        <span>
          <v-tooltip activator="parent" location="top" :text="getNotesTooltip(item)" />
          <v-btn variant="text" icon="mdi-notebook" @click.stop="openNotebook(item)" />
        </span>
      </template>
    </v-data-table>
    <!-- END EMPLOYEE TABLE -->
    <employee-notes
      v-if="focusedEmployee"
      v-model="showEmployeeNotes"
      :employee="focusedEmployee"
      :key="focusedEmployee"
    ></employee-notes>
  </div>
</template>
<script setup>
import { onMounted, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import _forEach from 'lodash/forEach';
import _filter from 'lodash/filter';
import { employeeFilter } from '@/shared/filterUtils';
import { format, isAfter } from '@/shared/dateUtils';
import api from '@/shared/api.js';
import { getActive, getFullName, populateEmployeesDropdown } from '@/components/reports/reports-utils';
import EmployeeNotes from '@/components/employee-beta/notes/EmployeeNotes.vue';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
import { updateStoreExpenseTypes, updateStoreEmployees } from '@/utils/storeUtils';
import TagsFilter from '@/components/shared/TagsFilter.vue';
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
    title: 'Employee #',
    key: 'employeeNumber'
  },
  {
    title: 'Name',
    key: 'fullName'
  },
  {
    title: 'Notes Updated',
    key: 'notes.updated.date'
  },
  {
    title: 'Last Kudo',
    key: 'notes.kudos',
    value: (item) => getLastKudoDate(item.id, false)
  },
  {
    title: 'Desires to Move?',
    key: 'notes.pages.career.desireToMove'
  },
  {
    title: 'Medical Notes?',
    key: 'notes.pages.personal.medical'
  },
  {
    title: 'Family Notes?',
    key: 'notes.pages.personal.familial'
  },
  {
    title: 'Notes',
    key: 'actions',
    sortable: false
  }
]); // datatable headers
const awardSearch = ref(null);
const awards = ref([]);
const search = ref(null); // query text for datatable search field
const showInactiveEmployees = ref(false);
const sortBy = ref([{ key: 'notes.updated.date', order: 'desc' }]); // sort datatable items
const tagsInfo = ref({
  selected: [],
  flipped: []
});
const focusedEmployee = ref(null);
const showEmployeeNotes = ref(false);
let kudos = ref({});
let emptyKudos = {};

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
onMounted(() => {
  employeesInfo.value = getActive(store.getters.employees); // default to filtered
  filteredEmployees.value = employeesInfo.value; // this one is shown
  emptyKudos = Object.fromEntries(employeesInfo.value.map((e) => [e.id, undefined]));
  populateDropdowns(employeesInfo.value);
  buildAwardsColumns();
  if (localStorage.getItem('requestedFilter')) {
    awardSearch.value = localStorage.getItem('requestedFilter');
    refreshDropdownItems();
    localStorage.removeItem('requestedFilter');
  }

  // set default employee to not error notes modal
  focusedEmployee.value = filteredEmployees.value[0];

  // initial set of table download data
  updateTableInfo(filteredEmployees.value);

  // build kudos for all employees
  buildKudos();

  // emitter catches
  emitter.on('saved-notes', ({ empId, notes }) => {
    let empIndex = filteredEmployees.value.findIndex((e) => e.id == empId);
    if (empIndex > -1) {
      // update their notes info
      filteredEmployees.value[empIndex].notes = notes;
      // also update their last kudo date
      buildKudos(empId);
    }
  });
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function getLastKudoDate(employeeId, shouldFormat = true) {
  let date = kudos.value[employeeId];
  if (date === undefined) return '...';
  if (date === null) return '';
  return shouldFormat ? format(date, null, 'MM/DD/YYYY') : date;
}

function getNotesTooltip(empObj) {
  let maxChars = 40;
  let miscNotes = empObj.notes?.pages?.general?.misc;
  if (!miscNotes) return 'Employee Notes';
  let tooltip = miscNotes.substring(0, maxChars);
  if (miscNotes.length > maxChars) tooltip += '...';
  return tooltip;
}

/**
 * Creates object of last kudo for each employee.
 * eg { 'a1ac...': '2024-09-11' }
 *
 * @param empId (optional) - id of employee to update. if null, will calculate for all employees
 */
async function buildKudos(empId) {
  if (empId === undefined) kudos.value = emptyKudos;

  // fetch data
  await Promise.all([
    store.getters.expenseTypes ? '' : updateStoreExpenseTypes(),
    store.getters.employees ? '' : updateStoreEmployees()
  ]);
  let expenseTypes = store.getters.expenseTypes;
  let employees = store.getters.employees;

  // helper that returns the most recent date
  const mostRecent = (a, b, g = 'day') => {
    let result;
    if (!a || !b) result = a || b;
    else result = isAfter(a, b, g) ? a : b;
    return format(result, null, 'YYYY-MM-DD');
  };

  let employeesToBuild = empId ? [filteredEmployees.value.find((e) => e.id == empId)] : employees;
  for (let e of employeesToBuild) {
    // find from awards
    for (let award of e.awards ?? []) {
      kudos.value[e.id] = mostRecent(kudos.value[e.id], award.dateReceived);
    }

    // find from custom kudos
    for (let kudo of e.notes?.pages?.kudos?.custom ?? []) {
      kudos.value[e.id] = mostRecent(kudos.value[e.id], kudo.date);
    }

    // find from high fives
    // get all high fives
    let highFiveET = expenseTypes.find((et) => et.budgetName === 'High Five');
    let highFives = await api.getAllExpenseTypeExpenses(highFiveET.id);
    // filter down to only ones the user received
    highFives = highFives.filter((hf) => hf.recipient === e.id);
    // extract as kudo if it was reimbursed
    for (let hf of highFives ?? []) {
      if (hf.reimbursedDate) kudos.value[e.id] = mostRecent(kudos.value[e.id], hf.reimbursedDate);
    }
    if (kudos.value[e.id] === undefined) kudos.value[e.id] = null;
  }
}

function openNotebook(employee) {
  focusedEmployee.value = employee;
  showEmployeeNotes.value = true;
}

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
  employees.value = populateEmployeesDropdown(emps);
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
  emitter.emit('reports-table-update', { tab: 'employeeNotes', table: event, headers: headers });
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
}); // watchShowInactiveUsers
</script>

<style lang="css" scoped>
.row-pointer :deep(tbody tr :hover) {
  cursor: pointer;
}

.my-button-toggle {
  display: flex;
  justify-content: center;
}
</style>

<style lang="scss" scoped>
@import 'src/assets/styles/styles';
.inactive {
  color: $case-red;
}
</style>
