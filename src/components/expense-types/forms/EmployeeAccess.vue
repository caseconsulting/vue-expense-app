<template>
  <div>
    <div>
      <strong>Employee Access</strong>
      <help type="expenseTypes"></help>
    </div>
    <v-row no-gutters>
      <v-col cols="6" lg="3">
        <checkbox
          label="Full-time"
          value="FullTime"
          v-model="modelValue.accessibleBy"
          :rules="checkBoxValid"
        ></checkbox>
      </v-col>
      <v-col cols="6" lg="3">
        <checkbox
          label="Part-time"
          value="PartTime"
          v-model="modelValue.accessibleBy"
          :rules="checkBoxValid"
        ></checkbox>
      </v-col>
      <v-col cols="6" lg="3">
        <checkbox
          label="Intern"
          value="Intern"
          v-model="modelValue.accessibleBy"
          :rules="checkBoxValid"
        ></checkbox>
      </v-col>
      <v-col cols="6" lg="3">
        <checkbox
          label="Custom"
          value="Custom"
          v-model="modelValue.accessibleBy"
          :rules="checkBoxValid"
        ></checkbox>
      </v-col>
    </v-row>
    <p id="error" v-if="checkBoxRule">At least one checkbox must be checked</p>
    <v-autocomplete
      variant="underlined"
      v-if="modelValue.accessibleBy && modelValue.accessibleBy.includes('Custom')"
      v-model="customAccess"
      :items="activeEmployees"
      :custom-filter="employeeFilter"
      no-data-text="No Employees Available"
      item-props.color="gray"
      multiple
      :rules="customAccessRules"
      chips
      clearable
      closable-chips
      class="mt-0 pt-0"
      :search="searchString"
      @update:model-value="searchString = ''"
      item-title="text"
      item-value="value"
    >
      <template v-slot:label>
        <span v-if="customAccess.length == 0" class="text-grey text-caption">No custom employee access</span>
        <span v-else class="text-grey text-caption"
          >{{ customAccess.length }} employee(s) have custom access to this expense type</span
        >
      </template>
    </v-autocomplete>

    <v-row>
      <v-col>
        <p class="form-text">Access Preview</p>
      </v-col>
      <v-col>
        <v-dialog scrollable max-width="400px">
          <template #activator="{ props }">
            <v-btn size="small" v-bind="props">View {{ employeeSize }} Employees</v-btn>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card>
              <v-card-title class="d-flex align-center header-slim">
                <h3>Accessible Preview</h3>
              </v-card-title>
              <v-divider color="black" />
              <v-card-text>
                <v-row>
                  <v-list color="#f0f0f0" width="376">
                    <div v-for="employee in getEmployeeList()" :key="employee.id">
                      <v-list-item>
                        <!-- Employee Image -->
                        <template #prepend>
                          <user-avatar :employee="employee" :image="employee.avatar" />
                        </template>
                        <!-- Employee Name -->
                        <v-list-item-title>{{ getEmployeeName(employee.id) }}</v-list-item-title>
                      </v-list-item>
                    </div>
                  </v-list>
                </v-row>
              </v-card-text>
              <v-divider color="black" />
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="isActive.value = false">Close</v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </v-col>
    </v-row>
  </div>
</template>
<script setup>
import Checkbox from '@/components/shared/forms/Checkbox.vue';
import Help from '@/components/shared/buttons/Help.vue';
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { employeeFilter } from '@/shared/filterUtils';
import _sortBy from 'lodash/sortBy';

const emitter = inject('emitter');
const props = defineProps({
  modelValue: Object
});
const store = useStore();

const activeEmployees = ref(null); // list of active employees
const checkBoxValid = ref([
  () => {
    return !checkBoxRule.value;
  }
]);
const customAccess = ref([]); // list of employees with custom access
const customAccessRules = ref([
  () => {
    return customAccess.value.length > 0 || 'Select at least one employee or uncheck the Custom checkbox';
  }
]);
const employeeSize = ref(null); //number of employees
const searchString = ref('');


// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and sets all employees.
 */
onMounted(() => {
  emitter.on('clear-expense-type-form', clearForm);

  // get all employees
  let employees = store.getters.employees;
  let sortedActiveEmployees = [];

  getEmployeeList();

  // populate list of active employees
  employees.forEach((employee) => {
    if (employee.workStatus > 0) {
      sortedActiveEmployees.push({
        value: employee.id,
        text: `${employee.nickname || employee.firstName} ${employee.lastName}`
      });
    }
  });

  sortedActiveEmployees = _sortBy(sortedActiveEmployees, ['text']); // sort employees alphabetically
  activeEmployees.value = sortedActiveEmployees;
});

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('clear-expense-type-form');
});

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * boolean for checkBox appearance
 *
 * @return boolean - whether checkbox appears
 */
const checkBoxRule = computed(() => {
  return !(props.modelValue.accessibleBy && props.modelValue.accessibleBy.length > 0);
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function clearForm() {
  customAccess.value = [];
}

/**
 * Get the list of employees based on their employement status
 *
 * @return Array - list of employees
 */
function getEmployeeList() {
  let employeeList = props.modelValue.employeeAccess(store.getters.employees, customAccess.value);
  employeeSize.value = employeeList.length;
  return _sortBy(employeeList, [
    (employee) => employee.firstName.toLowerCase(),
    (employee) => employee.lastName.toLowerCase()
  ]); // sort by first name then last name
}

/**
 * Get the employee name of an employee id.
 *
 * @param employeeId - employee id
 * @return String - employee full name
 */
function getEmployeeName(employeeId) {
  let localEmployee = store.getters.employees.find((employee) => employee.id === employeeId);
  return `${localEmployee.firstName} ${localEmployee.lastName}`;
}


// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for editedExpensetype.accessibleBy
 */
watch(
  () => props.modelValue.accessibleBy,
  () => getEmployeeList()
);

/**
 * water for customAccess
 */
watch(
  () => customAccess,
  () => getEmployeeList()
);
</script>
<style scoped>
#error {
  color: #ff5252;
  font-size: 12px;
}
</style>