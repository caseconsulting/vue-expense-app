<template>
  <div>
    <div>
      <strong>Employee Access</strong>
      <help type="expenseTypes"></help>
    </div>
    <v-row no-gutters>
      <v-col v-for="opt of checkBoxOptions" :key="opt.value" cols="6" lg="3" class="slim">
        <v-checkbox
          :color="caseRed"
          :label="opt.label"
          :value="opt.value"
          :rules="[checkBoxesValid]"
          :key="checkBoxesValid"
          v-model="accessCheckboxes"
        />
      </v-col>
    </v-row>
    <p id="error" v-if="!checkBoxesValid">At least one checkbox must be checked</p>
    <v-autocomplete
      v-if="accessCheckboxes?.includes('Custom')"
      variant="underlined"
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
      <v-col class="slim">
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
import Help from '@/components/shared/buttons/Help.vue';
import { computed, inject, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { employeeFilter } from '@/shared/filterUtils';
import _sortBy from 'lodash/sortBy';
import { updateStoreEmployees } from '@/utils/storeUtils';

const emitter = inject('emitter');
const props = defineProps({
  modelValue: Object
});
const store = useStore();

const activeEmployees = ref(null); // list of active employees
const customAccess = ref([]); // list of employees with custom access
const customAccessRules = ref([
  () => {
    return customAccess.value.length > 0 || 'Select at least one employee or uncheck the Custom checkbox';
  }
]);
const checkBoxOptions = ref([
  { label: 'Full-time', value: 'FullTime' },
  { label: 'Part-time', value: 'PartTime' },
  { label: 'Intern', value: 'Intern' },
  { label: 'Custom', value: 'Custom' }
]);
const accessCheckboxes = ref(['FullTime']);
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
onBeforeMount(async () => {
  emitter.on('clear-expense-type-form', clearForm);

  if (!store.getters.employees) await updateStoreEmployees();

  // get all employees
  let employees = store.getters.employees;
  let sortedActiveEmployees = [];

  // populate and sort list of active employees
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
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function clearForm() {
  accessCheckboxes.value = ['FullTime'];
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
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * boolean for checkBox appearance
 *
 * @return boolean - whether checkboxes are valid
 */
const checkBoxesValid = computed(() => {
  let boxes = props.modelValue.accessibleBy;
  if (!boxes || boxes.length <= 0) return false; // no boxes selected
  if (boxes.includes('Custom')) { // at least one custom employee added
    let baseValues = checkBoxOptions.value.map((opt) => opt.value);
    return boxes.some((val) => !baseValues.includes(val));
  }
  return true;
});

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * On model change, update the checkboxes accordingly
 */
watch(
  () => props.modelValue.id,
  () => {
    // set access checkboxes
    if (!props.modelValue.accessibleBy?.length) accessCheckboxes.value = ['FullTime'];
    else {
      let baseValues = checkBoxOptions.value.map((opt) => opt.value);
      accessCheckboxes.value = props.modelValue.accessibleBy.filter((val) => baseValues.includes(val));
      customAccess.value = props.modelValue.accessibleBy.filter((val) => !baseValues.includes(val));
    }
  }
)

/**
 * Keep accessibleBy up to date with high-level access (Full-time, Part-time, etc) and custom access
 */
watch(
  () => [accessCheckboxes.value, customAccess.value],
  () => {
    if (!accessCheckboxes.value || !customAccess.value) return;
    props.modelValue.accessibleBy = [...accessCheckboxes.value, ...customAccess.value];
  },
  { deep: true }
)
</script>
<style scoped>
#error {
  color: #ff5252;
  font-size: 12px;
}
</style>
