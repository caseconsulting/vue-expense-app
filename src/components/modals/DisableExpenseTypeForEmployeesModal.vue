<template>
  <div>
    <v-dialog v-model="activate" :persistent="waitingSet.size > 0" max-width="500">
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
          <v-data-table :items="getEmployeeList()" :headers="headers" :search="employeeSearch" :items-per-page="-1">
            <!-- Empty header/footer slot to disable them -->
            <template #headers></template>
            <template #bottom></template>
            <!-- Avatar Item Slot -->
            <template #[`item.avatars`]="{ item }">
              <user-avatar :employee="item" :image="item.avatar" :size="35" class="text-body-1" />
            </template>
            <!-- Action Item Slot -->
            <template #[`item.actions`]="{ item }">
              <v-switch
                class="cursor-pointer"
                hide-details
                v-model="invertedDisabledEmployees"
                :value="item.id"
                color="primary"
                :label="''"
                @click="toggleEmployee(item.id)"
                :disabled="waitingSet.has(item.id)"
                :loading="waitingSet.has(item.id) ? 'warning' : false"
              />
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
import { inject, ref, computed, watch } from 'vue';
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
const headers = ref([
  { title: '', value: 'avatars', sortable: false },
  { title: 'Name', key: 'name', value: (e) => `${e.nickname || e.firstName} ${e.lastName}` },
  { title: 'Actions', key: 'actions', sortable: false }
]);
const disabledEmployees = ref(new Set([]));
const employeeSearch = ref(null);
const waitingSet = ref(new Set());
let changes = false;

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
  if (waitingSet.value.size == 0) {
    console.log('literally what');
    activate.value = false;
  }
}

/**
 * Adds employee to list of disabled employees for this expense type and submits to DB
 */
async function toggleEmployee(id) {
  // set loading status
  waitingSet.value.add(id);
  // add/remove employee from disabled list
  if (disabledEmployees.value.has(id)) disabledEmployees.value.delete(id);
  else disabledEmployees.value.add(id);
  // patch disabledEmployees value to expense types in DB
  let data = { id: props.type.id, disabledEmployees: [...disabledEmployees.value] };
  await api.updateAttribute(api.EXPENSE_TYPES, data, 'disabledEmployees');
  // unset loading status
  waitingSet.value.delete(id);
  changes = true;
}

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|
watch(
  () => props.type,
  () => {
    changes = false;
    disabledEmployees.value = new Set(props.type?.disabledEmployees ?? []);
  }
);

const invertedDisabledEmployees = computed(() => {
  // get list of employee IDs
  let employees = new Set(getEmployeeList().map((e) => e.id));
  // remove any that are in disabledEmployees list
  for (let eId of disabledEmployees.value) employees.delete(eId);
  // make it back into an array and return
  employees = [...employees];
  return employees;
});
</script>
