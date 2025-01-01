<template>
  <div>
    <v-dialog v-model="activate" @click:outside="closeModal()" max-width="900">
      <v-card>
        <v-card-title class="d-flex align-center header_style">
          <h3>Disable Expense Type</h3>
        </v-card-title>

        <v-card-text class="font-weight-medium text-h6">
          <h4>{{ type.budgetName }}</h4>
          <v-data-table :items="getEmployeeList()" :headers="headers" :items-per-page="-1">
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
                v-model="invertedDisabledEmployees"
                :value="item.id"
                color="primary"
                :label="''"
                @click="toggleEmployee(item.id)"
                :loading="waitingSet.has(item.id) ? 'warning' : false"
              />
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-btn @click="closeModal()">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { inject, ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import api from '@/shared/api';
import _filter from 'lodash/filter';
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
  let employeesList = [];

  // accessible by full time employees
  if (accessibleBy.includes('FullTime')) {
    employeesList = employeesList.concat(
      _filter(employees, (employee) => {
        return employee.workStatus == 100 && employee.employeeRole != 'intern';
      })
    );
  }
  // accessible by part time employees
  if (accessibleBy.includes('PartTime')) {
    employeesList = employeesList.concat(
      _filter(employees, (employee) => {
        return employee.workStatus < 100 && employee.workStatus > 0 && employee.employeeRole != 'intern';
      })
    );
  }
  // accessible by interns
  if (accessibleBy.includes('Intern')) {
    employeesList = employeesList.concat(
      _filter(employees, (employee) => {
        return employee.workStatus > 0 && employee.employeeRole == 'intern';
      })
    );
  }
  // custom access list
  if (accessibleBy.includes('Custom')) {
    employeesList = employeesList.concat(
      _filter(employees, (employee) => {
        return accessibleBy.includes(employee.id);
      })
    );
  }
  // TODO: remove users if a tag sets their budget to 0 (also just use a set and convert in next line)

  // remove duplicates
  employeesList = [...new Set(employeesList)];
  return _sortBy(employeesList, [
    (employee) => employee.firstName.toLowerCase(),
    (employee) => employee.lastName.toLowerCase()
  ]); // sort by first name then last name
} // getEmployeeList

/**
 * Closes modal and emits invalid delete event
 */
function closeModal() {
  if (changes) emitter.emit('refresh-expense-types');
  activate.value = false;
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
  changes = true;
  waitingSet.value.delete(id);
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
