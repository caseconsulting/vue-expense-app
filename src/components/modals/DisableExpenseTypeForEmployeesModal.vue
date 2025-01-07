<template>
  <div>
    <v-dialog v-model="activate" @click:outside="closeModal()" :persistent="waitingSet.size > 0" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center header_style">
          <h3>Disable Expense Type</h3>
        </v-card-title>

        <v-card-text class="font-weight-medium text-h6">
          <h3>{{ type.budgetName }}</h3>
          <v-autocomplete
            :items="getEmployeeList()"
            :custom-filter="employeeFilter"
            auto-select-first
            v-model="employeeSearch"
            item-title="value"
            id="filterEmployee"
            class="mr-3 mb-6 pr-12"
            label="Filter by Employee"
            variant="underlined"
            hide-details
            clearable
          />
          <v-data-table
            :items="getEmployeeList()"
            :headers="headers"
            :search="employeeSearch"
            :items-per-page="-1"
            :v-model:expanded="expanded"
            :show-expand="multiMode"
            :expand-on-click="multiMode"
          >
            <!-- Empty header/footer slot to disable them -->
            <template #headers></template>
            <template #bottom></template>
            <!-- Avatar Item Slot -->
            <template #[`item.avatars`]="{ item }">
              <user-avatar :employee="item" :image="item.avatar" :size="35" class="text-body-1" />
            </template>
            <!-- Single-budget (no categories) -->
            <template #[`item.actions`]="{ item: emp }">
              <v-switch
                v-if="!multiMode"
                class="cursor-pointer"
                color="primary"
                hide-details
                :model-value="!isDisabled(emp.id)"
                :disabled="isWaiting(emp.id)"
                :loading="isWaiting(emp.id) ? 'warning' : false"
                @click="toggleEmployee(emp.id)"
              />
            </template>
            <!-- Categories expanded slot -->
            <template v-slot:expanded-row="{ columns, item: emp }">
              <tr>
                <td :colspan="columns.length">
                  <v-row v-for="c of type.categories" :key="c.name" class="mx-0 my-2 pa-0" align="center">
                    <v-col class="ma-0 pa-0" cols="9">
                      <p class="my-0 ml-6 pa-0">{{ c.name }}</p>
                    </v-col>
                    <v-col class="ma-0 pa-0" cols="3">
                      <v-switch
                        class="cursor-pointer"
                        density="compact"
                        color="primary"
                        hide-details
                        :model-value="!isDisabled(emp.id, c.name)"
                        :disabled="isWaiting(emp.id, c.name)"
                        :loading="isWaiting(emp.id, c.name) ? 'warning' : false"
                        @click="toggleEmployee(emp.id, c.name)"
                      />
                    </v-col>
                  </v-row>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-btn @click="closeModal()" :disabled="waitingSet.size > 0">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { employeeFilter } from '@/shared/filterUtils';
import api from '@/shared/api';
import _sortBy from 'lodash/sortBy';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const activate = defineModel();
const props = defineProps([
  'type' // expense type
]);
const emitter = inject('emitter');
const store = useStore();

const waitingSet = ref(new Set()); // keeps track of what v-switches have active API calls
let changes = false; // toggle for if changes have been made at all, expense types reload if this is true
const employeeSearch = ref(null); // var to connect search bar with table
const disabledEmployees = ref({}); // which employees are disabled, see below structure
// here's what this var looks like
// const disabledEmployees = {
//   employeeId1: ['categoryName1', 'categoryName2'], // with categories
//   employeeId2: ['budgetID'] // without categories
// }

// data table vars
const headers = ref([
  { title: '', value: 'avatars', sortable: false },
  { title: 'Name', key: 'name', value: (e) => `${e.nickname || e.firstName} ${e.lastName}` },
  { title: 'Actions', key: 'actions', sortable: false }
]);
const expanded = ref([]);
const multiMode = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets list of employees who can access the budget
 */
/**
 * Get the list of employees who have access to a expense type accessible by value.
 *
 * @return Array - list of employees with access
 */
function getEmployeeList() {
  let accessibleBy = props.type.accessibleBy; // shortcut
  let employees = store.getters.employees;
  let employeesList = new Set();

  for (let e of employees) {
    // check access based on work status
    let workStatus = e.workStatus === 100 ? 'FullTime' : e.workStatus > 0 ? 'PartTime' : 'Inactive';
    if (e.employeeRole === 'intern') workStatus = 'Intern';
    // check access based on custom list
    let hasCustomAccess = accessibleBy.includes(e.id);
    // add employee to list if they have access
    if (accessibleBy.includes(workStatus) || hasCustomAccess) {
      employeesList.add({ ...e, value: `${e.nickname || e.firstName} ${e.lastName}` });
    }
  }

  // convert to an array and return sorted
  employeesList = [...employeesList];
  employeesList = _sortBy(employeesList, [
    (employee) => employee.firstName.toLowerCase(),
    (employee) => employee.lastName.toLowerCase()
  ]);
  return employeesList;
}

/**
 * Closes modal and emits invalid delete event
 */
function closeModal() {
  if (changes) emitter.emit('refresh-expense-types');
  if (waitingSet.value.size === 0) activate.value = false;
}

/**
 * Adds employee to list of disabled employees for this expense type and submits to DB
 *
 * @param empId ID of employee
 * @param catName name of category if it exists, defaults to expense type ID
 */
async function toggleEmployee(empId, catName = props.type.id) {
  // set loading status
  let waitingID = `${empId}-${catName}`;
  waitingSet.value.add(waitingID);

  // ensure the employee as an entry in disabledEmployees
  if (!disabledEmployees.value[empId]) disabledEmployees.value[empId] = [];
  // add/remove employee from disabled list var
  if (disabledEmployees.value[empId].includes(catName)) {
    disabledEmployees.value[empId] = disabledEmployees.value[empId].filter((c) => c !== catName);
  } else {
    disabledEmployees.value[empId].push(catName);
  }
  // if employee has nothing disabled, just remove them
  if (disabledEmployees.value[empId].length === 0) delete disabledEmployees.value[empId];

  // patch disabledEmployees value to expense types in DB
  let data = { id: props.type.id, disabledEmployees: disabledEmployees.value };
  await api.updateAttribute(api.EXPENSE_TYPES, data, 'disabledEmployees');

  // unset loading status
  waitingSet.value.delete(waitingID);
  changes = true;
}

/**
 * Returns true if an employee has the budget/category disabled
 *
 * @param empId ID of employee
 * @param catName name of category if it exists, defaults to expense type ID
 */
function isDisabled(empId, catName = props.type.id) {
  return disabledEmployees.value[empId]?.includes(catName) ?? false;
}

/**
 * Returns true if the employee ID/category name is waiting for API call to finish
 *
 * @param empId ID of employee
 * @param catName name of category if it exists, defaults to expense type ID
 */
function isWaiting(empId, catName = props.type.id) {
  return waitingSet.value.has(`${empId}-${catName}`);
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|
watch(
  () => props.type,
  () => {
    changes = false; // reset changes to not reload expense types if nothing happens
    employeeSearch.value = null; // reset search so it doesn't persist
    multiMode.value = props.type.categories?.length > 0;
    disabledEmployees.value = props.type.disabledEmployees ?? {}; // load in disabledEmployees, or make a blank one
  }
);
</script>
