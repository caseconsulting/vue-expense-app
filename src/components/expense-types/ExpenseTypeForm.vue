<template>
  <v-card class="mt-3" hover>
    <!-- Form Header -->
    <v-card-title class="d-flex align-center header_style">
      <h3 v-if="model.id">Edit Expense Type</h3>
      <h3 v-else>Create New Expense Type</h3>
    </v-card-title>

    <v-container fluid>
      <v-form ref="expenseTypeForm" v-model="valid" @submit.prevent="valid ? (submitForm = true) : _" lazy-validation>
        <v-row>
          <v-col>
            <!-- Budget Name -->
            <v-text-field
              variant="underlined"
              v-model="editedExpenseType.budgetName"
              id="budgetName"
              :rules="getRequiredRules()"
              label="Budget Name"
              data-vv-name="Budget Name"
              class="type_form_padding"
            ></v-text-field>
          </v-col>
          <v-col cols="auto">
            <!-- Inactive Flag -->
            <v-switch
              v-model="editedExpenseType.isInactive"
              :color="caseRed"
              label="Inactive"
              hide-details
              inset
            ></v-switch>
          </v-col>
        </v-row>
        <!-- Categories -->
        <v-combobox
          variant="underlined"
          v-model="categories"
          hint="Maximum of 10 categories"
          label="Categories (optional)"
          multiple
          append-icon
          chips
          :search="categoryInput"
        >
        </v-combobox>

        <!-- Budget Amount -->
        <v-text-field
          variant="underlined"
          prefix="$"
          v-model="budgetFormatted"
          id="budgetAmount"
          :rules="budgetRules"
          label="Budget"
          data-vv-name="Budget"
          @update:focused="editedExpenseType.budget = parseNumber(budgetFormatted)"
          @update:model-value="formatBudget()"
        ></v-text-field>

        <!-- Monthly Limit -->
        <v-text-field
          variant="underlined"
          prefix="$"
          v-model="monthlyLimitFormatted"
          id="monthlyLimit"
          :rules="monthlyLimitRules"
          label="Monthly Limit (optional)"
          @update:focused="editedExpenseType.monthlyLimit = parseNumber(monthlyLimitFormatted)"
          @update:model-value="formatMonthlyLimit()"
        ></v-text-field>

        <!-- Employee Access -->
        <div class="form-text">
          Employee Access
          <v-avatar @click="toFAQ()" class="mb-4" size="small">
            <v-tooltip activator="parent" location="top">Click for FAQ</v-tooltip>
            <v-icon icon="mdi-information" color="#3f51b5" size="small" />
          </v-avatar>
        </div>
        <v-row no-gutters>
          <v-col cols="6" lg="3">
            <v-checkbox
              :color="caseRed"
              label="Full-time"
              value="FullTime"
              v-model="editedExpenseType.accessibleBy"
              :rules="checkBoxValid"
            ></v-checkbox>
          </v-col>
          <v-col cols="6" lg="3">
            <v-checkbox
              :color="caseRed"
              label="Part-time"
              value="PartTime"
              v-model="editedExpenseType.accessibleBy"
              :rules="checkBoxValid"
            ></v-checkbox>
          </v-col>
          <v-col cols="6" lg="3">
            <v-checkbox
              :color="caseRed"
              label="Intern"
              value="Intern"
              v-model="editedExpenseType.accessibleBy"
              :rules="checkBoxValid"
            ></v-checkbox>
          </v-col>
          <v-col cols="6" lg="3">
            <v-checkbox
              :color="caseRed"
              label="Custom"
              value="Custom"
              v-model="editedExpenseType.accessibleBy"
              :rules="checkBoxValid"
            ></v-checkbox>
          </v-col>
        </v-row>
        <p id="error" v-if="checkBoxRule">At least one checkbox must be checked</p>

        <!-- Custom Access: Employee List -->
        <v-autocomplete
          variant="underlined"
          v-if="editedExpenseType.accessibleBy && editedExpenseType.accessibleBy.includes('Custom')"
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

        <!-- Employee Access Preview -->
        <v-row>
          <v-col>
            <p class="form-text">Employee Access Preview</p>
          </v-col>
          <v-col>
            <v-dialog scrollable max-width="400px">
              <template #activator="{ props }">
                <v-btn size="small" v-bind="props">View {{ employeeSize }} Employees</v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-card>
                  <v-card-title class="d-flex align-center header_style">
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

        <!-- Budget Tags -->
        <div class="form-text">
          Tag Budgets (optional)
          <!-- <v-btn @click="toFAQ()" class="mb-4" x-small icon><v-icon icon="mdi-info" color="#3f51b5" /></v-btn> -->
        </div>
        <v-container>
          <v-row v-for="(tag, index) in editedExpenseType.tagBudgets" :key="index">
            <v-col class="d-flex flex-row justify-center align-center" cols="2">
              <div>
                <v-tooltip activator="parent" location="top">Move Tag Budget Priority Down One</v-tooltip>
                <v-btn
                  :disabled="isLast(index, editedExpenseType.tagBudgets)"
                  v-bind="props"
                  @click="moveTagBudgetDown(index)"
                  size="x-small"
                  class="mr-1"
                >
                  <v-icon icon="mdi-arrow-down-thin" />
                </v-btn>
              </div>
              <div>
                <v-tooltip activator="parent" location="top">Move Tag Budget Priority Up One</v-tooltip>
                <v-btn :disabled="isFirst(index)" size="x-small" @click="moveTagBudgetUp(index)">
                  <v-icon icon="mdi-arrow-up-thin" />
                </v-btn>
              </div>
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                variant="underlined"
                v-model="tag.tags"
                item-title="tagName"
                :rules="getRequiredRules()"
                item-value="id"
                multiple
                :items="tagOptions(tag.tags)"
              >
                <template v-slot:selection="{ item }">
                  <v-chip size="small" v-bind="props" closable @click.stop @click:close="remove(item.raw, index)">
                    <v-icon icon="mdi-tag" class="mr-1" />
                    {{ item.raw.tagName }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="3">
              <v-text-field variant="underlined" v-model="tag.budget" prefix="$" :rules="tagBudgetRules" label="Amount"
            /></v-col>
            <v-col cols="1" class="d-flex justify-center align-center">
              <v-btn size="small" @click="removeTagBudget(index)"><v-icon icon="mdi-trash-can" /></v-btn>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center align-center">
            <v-btn elevation="2" @click="addTagBudget()"><v-icon icon="mdi-plus" />Tag Budget</v-btn></v-row
          >
        </v-container>

        <!-- Flags -->
        <v-row>
          <v-col cols="6">
            <!-- Overdraft Flag -->
            <v-checkbox
              :color="caseRed"
              label="Overdraft Flag"
              :disabled="!!model.id && model.odFlag"
              v-model="editedExpenseType.odFlag"
              persistent-hint
              :hint="odFlagHint()"
            ></v-checkbox>
            <!-- Recurring Flag -->
            <v-checkbox :color="caseRed" label="Recurring Flag" v-model="editedExpenseType.recurringFlag"></v-checkbox>
          </v-col>
          <v-col cols="6">
            <!-- Receipt Required Flag -->
            <v-checkbox
              :color="caseRed"
              label="Receipt Required"
              id="receiptRequired"
              v-model="editedExpenseType.requiredFlag"
              @update:model-value="toggleRequireReceipt()"
            ></v-checkbox>
          </v-col>
        </v-row>

        <!-- Start Date -->
        <v-text-field
          v-if="!editedExpenseType.recurringFlag"
          variant="underlined"
          v-model="startDateFormatted"
          id="startDate"
          :rules="[...getDateRules(), ...startDateRules]"
          label="Start Date"
          hint="MM/DD/YYYY format"
          v-mask="'##/##/####'"
          persistent-hint
          prepend-icon="mdi-calendar"
          @blur="editedExpenseType.startDate = format(startDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
          @click:prepend="showStartMenu = true"
          @keypress="showStartMenu = false"
          autocomplete="off"
        >
          <v-menu
            activator="parent"
            v-model="showStartMenu"
            :rules="getRequiredRules()"
            :close-on-content-click="false"
            location="start center"
          >
            <v-date-picker
              v-model="editedExpenseType.startDate"
              @update:model-value="showStartMenu = false"
              :max="editedExpenseType.endDate"
              show-adjacent-months
              hide-actions
              keyboard-icon=""
              color="#bc3825"
              title="Start Date"
            ></v-date-picker>
          </v-menu>
        </v-text-field>

        <!-- End Date -->
        <v-text-field
          v-if="!editedExpenseType.recurringFlag"
          variant="underlined"
          v-model="endDateFormatted"
          id="endDate"
          :rules="[...getDateRules(), ...endDateRules]"
          label="End Date"
          hint="MM/DD/YYYY format"
          v-mask="'##/##/####'"
          persistent-hint
          prepend-icon="mdi-calendar"
          @blur="editedExpenseType.endDate = format(endDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
          @update:model-value="showEndMenu = false"
          v-bind="props"
          autocomplete="off"
        >
          <v-menu
            activator="parent"
            v-model="showEndMenu"
            :rules="getRequiredRules()"
            :close-on-content-click="false"
            location="start center"
          >
            <v-date-picker
              v-model="editedExpenseType.endDate"
              @update:model-value="showEndMenu = false"
              :min="editedExpenseType.startDate"
              show-adjacent-months
              hide-actions
              keyboard-icon=""
              color="#bc3825"
              title="End Date"
            ></v-date-picker>
          </v-menu>
        </v-text-field>

        <!-- Description -->
        <v-textarea
          variant="underlined"
          v-model="editedExpenseType.description"
          id="description"
          :rules="getRequiredRules()"
          label="Description "
          data-vv-name="Description "
          rows="3"
        ></v-textarea>

        <!-- Campfires Autocomplete -->
        <v-autocomplete
          variant="underlined"
          :items="campfires"
          v-model="editedExpenseType.campfire"
          item-title="name"
          item-value="url"
          label="Basecamp Campfire (optional)"
          clearable
        ></v-autocomplete>

        <!-- Switches -->
        <!-- Pro-rated expense -->
        <v-switch
          :color="caseRed"
          v-model="editedExpenseType.proRated"
          label="Should this expense be pro-rated?"
        ></v-switch>
        <!-- Require Recipient -->
        <v-switch
          :color="caseRed"
          v-model="editedExpenseType.hasRecipient"
          label="Does this expense type have a recipient?"
        ></v-switch>
        <!-- Always Show on Feed -->
        <v-switch
          :color="caseRed"
          v-model="editedExpenseType.alwaysOnFeed"
          @update:model-value="toggleShowAllCategories()"
          label="Have this expense type show on the company feed?"
        ></v-switch>
        <!-- Require URL -->
        <v-switch
          :color="caseRed"
          v-model="editedExpenseType.requireURL"
          @update:model-value="toggleRequireURL()"
          label="Require a url for this expense?"
        ></v-switch>

        <!-- Categrories Specific Questions -->
        <v-container class="pb-0 mb-0">
          <v-row v-if="editedExpenseType.categories && editedExpenseType.categories.length > 0">
            <v-col cols="3">Category</v-col>
            <v-col cols="3">Show on Feed?</v-col>
            <v-col cols="3">Require Url?</v-col>
            <v-col cols="3">Require Receipt?</v-col>
          </v-row>
          <v-row v-for="(category, index) in editedExpenseType.categories" :key="index" class="d-flex align-center">
            <v-col cols="3">{{ category.name }}</v-col>
            <v-col cols="3">
              <v-checkbox
                :color="caseRed"
                v-if="!submitting"
                light
                v-model="category.showOnFeed"
                @click.stop="checkSelection()"
              ></v-checkbox>
            </v-col>
            <v-col cols="3">
              <v-checkbox
                :color="caseRed"
                v-if="!submitting"
                light
                v-model="category.requireURL"
                @click.stop="checkRequireURL()"
              ></v-checkbox>
            </v-col>
            <v-col cols="3">
              <v-checkbox
                :color="caseRed"
                v-if="!submitting"
                light
                v-model="category.requireReceipt"
                @click.stop="checkRequireReceipt()"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-container>

        <!-- Buttons -->
        <!-- Cancel Button -->
        <v-btn color="white " @click="clearForm" class="ma-2" elevation="2">
          <v-icon icon="mdi-close-circle" class="mr-1" />Cancel
        </v-btn>
        <!-- Submit Button -->
        <v-btn variant="outlined" type="submit" class="ma-2" color="success" id="submitButton" :loading="submitting">
          <v-icon icon="mdi-content-save" class="mr-1" />Submit
        </v-btn>
        <!-- End Buttons -->
      </v-form>
      <general-confirmation-modal
        title="Are you sure you want to submit?"
        type="type"
        :toggleModal="submitForm"
      ></general-confirmation-modal>
    </v-container>
  </v-card>
</template>

<script setup>
import api from '@/shared/api.js';
import { getRequiredRules } from '../../shared/validationUtils';
import { getDateRules } from '../../shared/validationUtils';
import GeneralConfirmationModal from '@/components/modals/GeneralConfirmationModal.vue';
import _cloneDeep from 'lodash/cloneDeep';
import _forEach from 'lodash/forEach';
import _sortBy from 'lodash/sortBy';
import _isEmpty from 'lodash/isEmpty';
import _find from 'lodash/find';
import _union from 'lodash/union';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _findIndex from 'lodash/findIndex';
import { generateUUID, isEmpty } from '@/utils/utils';
import { format } from '@/shared/dateUtils';
import { updateStoreExpenseTypes } from '@/utils/storeUtils';
import { mask } from 'vue-the-mask';
import { isValid, isSameOrAfter, isSameOrBefore } from '../../shared/dateUtils';
import { employeeFilter } from '@/shared/filterUtils';
import { onMounted, onBeforeUnmount, ref, computed, inject, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const activeEmployees = ref(null); // list of active employees
const budgetFormatted = ref('');
const monthlyLimitFormatted = ref('');
const budgetRules = ref([
  (v) => !!v || 'Budget amount is required',
  (v) => parseFloat(v, 10) > 0 || 'Budget must be greater than 0.',
  (v) =>
    /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
    'Budget amount must be a number with two decimal digits.'
]); // rules for an expense type budget
const monthlyLimitRules = ref([
  (v) => isEmpty(v) || parseFloat(v, 10) > 0 || 'Limit must be greater than 0.',
  (v) =>
    isEmpty(v) ||
    /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
    'Limit must be a number with two decimal digits.'
]);
const campfires = ref([]); // basecamp campfires
const categories = ref([]); // list of expense type categories
const categoryInput = ref(null); // category combobox input
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
const emitter = inject('emitter');
const endDateRules = ref([
  (v) => {
    return !isEmpty(v) && isValid(v, 'MM/DD/YYYY') && editedExpenseType.value.startDate
      ? isSameOrAfter(v, editedExpenseType.value.startDate) || 'End date must be at or after start date'
      : true;
  }
]);
const endDateFormatted = ref(null); // formatted end date
const employeeSize = ref(null); //number of employees
const expenseTypeForm = ref(null); // filled in from the template
const props = defineProps(['model']); // expense type to be created/updated
const editedExpenseType = ref(_cloneDeep(props.model)); // used to store edits made to an expense type or when creating new expense type
const router = useRouter();
const searchString = ref('');
const showStartMenu = ref(false); // boolean for showing date picker
const showEndMenu = ref(false); // booleand for showing date picket
const startDateFormatted = ref(null); // formateed start date
const startDateRules = ref([
  (v) => {
    return !isEmpty(v) && isValid(v, 'MM/DD/YYYY') && editedExpenseType.value.endDate
      ? isSameOrBefore(v, editedExpenseType.value.endDate) || 'Start date must be at or before end date'
      : true;
  }
]);
const store = useStore();
const submitting = ref(false); // submitting form
const submitForm = ref(false); // triggers subit form modal when changed
const valid = ref(false); // form is valid
const vMask = mask; // custom directive
const tagBudgetRules = ref([
  (v) => !!v || 'Budget amount is required',
  (v) => parseFloat(v, 10) >= 0 || 'Budget must either be a positive or zero dollar amount.',
  (v) =>
    /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
    'Budget amount must be a number with two decimal digits.'
]); // rules for a tag budget
const tags = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and sets all employees.
 */
onMounted(async () => {
  emitter.on('confirmed-type', async () => {
    submitForm.value = false;
    await submit();
    await updateStoreExpenseTypes();
  });
  emitter.on('canceled-type', () => {
    submitting.value = false;
    submitForm.value = false;
  });
  tags.value = store.getters.tags;
  // get all employees
  let employees = store.getters.employees;
  let sortedActiveEmployees = [];

  getEmployeeList();

  // populate list of active employees
  _forEach(employees, (employee) => {
    if (employee.workStatus > 0) {
      sortedActiveEmployees.push({
        value: employee.id,
        text: `${employee.nickname || employee.firstName} ${employee.lastName}`
      });
    }
  });

  sortedActiveEmployees = _sortBy(sortedActiveEmployees, ['text']); // sort employees alphabetically
  activeEmployees.value = sortedActiveEmployees;
  campfires.value = store.getters.basecampCampfires;
  editedExpenseType.value = _cloneDeep(props.model);

  clearForm();
}); // created

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('confirmed-type');
  emitter.off('canceled-type');
}); //beforeUnmount

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
  return !(editedExpenseType.value.accessibleBy && editedExpenseType.value.accessibleBy.length > 0);
}); // checkBoxRule

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Set required receipt for expense type if all category required receipt checkboxes are enabled. If there are no categories, make sure the main toggle is false.
 */
function checkRequireReceipt() {
  if (_isEmpty(editedExpenseType.value.categories)) {
    editedExpenseType.value.requireURL = false;
  } else {
    // check if any categories do not require a receipt
    let somethingIsFalse = _find(editedExpenseType.value.categories, (category) => {
      return !category.requireReceipt;
    });

    // update require receipt for expense type
    if (somethingIsFalse) {
      editedExpenseType.value.requiredFlag = false;
    } else {
      editedExpenseType.value.requiredFlag = true;
    }
  }
} // checkRequireReceipt

/**
 * Set required url for expense type if all category required url checkboxes are enabled. If there are no categories, make sure the main toggle is false.
 */
function checkRequireURL() {
  if (_isEmpty(editedExpenseType.value.categories)) {
    editedExpenseType.value.requireURL = false;
  } else {
    // check if any categories do not require a url
    let somethingIsFalse = _find(editedExpenseType.value.categories, (category) => {
      return !category.requireURL;
    });

    // update require url for expense type
    if (somethingIsFalse) {
      editedExpenseType.value.requireURL = false;
    } else {
      editedExpenseType.value.requireURL = true;
    }
  }
} // checkRequireURL

/**
 * Set always on feed for expense type if all category show on feed checkboxes are enabled. If there are no categories, make sure the main toggle is false.
 */
function checkSelection() {
  if (_isEmpty(editedExpenseType.value.categories)) {
    editedExpenseType.value.requireURL = false;
  } else {
    // check if any categories are hidden on feed
    let somethingIsFalse = _find(editedExpenseType.value.categories, (category) => {
      return !category.showOnFeed;
    });

    // update always on feed for expense type
    if (somethingIsFalse) {
      editedExpenseType.value.alwaysOnFeed = false;
    } else {
      editedExpenseType.value.alwaysOnFeed = true;
    }
  }
} // checkSelection

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  if (expenseTypeForm.value) {
    expenseTypeForm.value.reset();
  }
  emitter.emit('finished-editing-expense-type'); //notify parent no longer editing an expense type
  startDateFormatted.value = null;
  endDateFormatted.value = null;
  customAccess.value = [];
  editedExpenseType.value.id = null;
  editedExpenseType.value.accessibleBy = ['FullTime'];
} // clearForm

/**
 * Formats the budget on the form for a nicer display.
 */
function formatBudget() {
  editedExpenseType.value.budget = parseNumber(budgetFormatted.value);
  if (Number(editedExpenseType.value.budget)) {
    budgetFormatted.value = Number(editedExpenseType.value.budget).toLocaleString().toString();
  }
} // formatBudget

/**
 * Formats the budget on the form for a nicer display.
 */
function formatMonthlyLimit() {
  editedExpenseType.value.monthlyLimit = parseNumber(monthlyLimitFormatted.value);
  if (Number(editedExpenseType.value.monthlyLimit)) {
    monthlyLimitFormatted.value = Number(editedExpenseType.value.monthlyLimit).toLocaleString().toString();
  }
} // formatMonthlyLimit

/**
 * Get the list of employees based on their employement status
 *
 * @return Array - list of employees
 */
function getEmployeeList() {
  let employeeList = [];
  if (editedExpenseType.value.accessibleBy.includes('FullTime')) {
    employeeList = employeeList.concat(
      _filter(store.getters.employees, (employee) => {
        return employee.workStatus == 100 && employee.employeeRole != 'intern';
      })
    );
  }
  if (editedExpenseType.value.accessibleBy.includes('PartTime')) {
    employeeList = employeeList.concat(
      _filter(store.getters.employees, (employee) => {
        return employee.workStatus < 100 && employee.workStatus > 0 && employee.employeeRole != 'intern';
      })
    );
  }
  if (editedExpenseType.value.accessibleBy.includes('Intern')) {
    employeeList = employeeList.concat(
      _filter(store.getters.employees, (employee) => {
        return employee.workStatus > 0 && employee.employeeRole == 'intern';
      })
    );
  }
  if (editedExpenseType.value.accessibleBy.includes('Custom')) {
    employeeList = employeeList.concat(
      _filter(store.getters.employees, (employee) => {
        return customAccess.value.includes(employee.id);
      })
    );
  }

  employeeList = [...new Set(employeeList)];
  employeeSize.value = employeeList.length;
  return _sortBy(employeeList, [
    (employee) => employee.firstName.toLowerCase(),
    (employee) => employee.lastName.toLowerCase()
  ]); // sort by first name then last name
} //getEmployeeList

/**
 * Get the employee name of an employee id.
 *
 * @param employeeId - employee id
 * @return String - employee full name
 */
function getEmployeeName(employeeId) {
  let localEmployee = _find(store.getters.employees, ['id', employeeId]);
  return `${localEmployee.firstName} ${localEmployee.lastName}`;
} // getEmployeeName

/**
 * Checks if custom access of employees have acess to an expense type at a percentage rate. Returns true if 'CUSTOM'
 * is selected, otherwise returns false.
 *
 * @return boolean - custom employees have access
 */
function isCustomSelected() {
  return editedExpenseType.value.accessibleBy && editedExpenseType.value.accessibleBy.includes('Custom');
} // isCustomSelected

/**
 * overdraft flag hint
 *
 * @return string - the string flag hint
 */
function odFlagHint() {
  if (!!props.model.id && props.model.odFlag) {
    return 'Cannot be undone';
  } else if (editedExpenseType.value.odFlag) {
    return 'Cannot be undone once submitted';
  } else {
    return '';
  }
} // odFlagHint

/**
 * Parses the budget to get rid of commas.
 *
 * @param budget - the budget to parse
 * @return String - The budget without formatting
 */
function parseNumber(budget) {
  if (budget && !_isEmpty(budget)) {
    return budget.replace(/[,\s]/g, '');
  } else {
    return budget;
  }
} // parseNumber

/**
 * route to FAQ
 */
function toFAQ() {
  let faq = router.resolve({ path: '/help/expenseTypes' });
  window.open(faq.href, '_blank');
} // toFAQ

// /**
//  * Removes a category from the list of expense type categories.
//  *
//  * @param category - category to remove
//  */
// function removeCategory(category) {
//   editedExpenseType.value.categories.splice(
//     editedExpenseType.value.categories.map((cat) => cat.name).indexOf(category),
//     1
//   );
//   editedExpenseType.value.categories = [...editedExpenseType.value.categories];
//   categories.value.splice(categories.value.indexOf(category), 1);
//   categories.value = [...categories.value];

//   //recompute the receipt, show on feed, and url select all buttons
//   checkRequireURL();
//   checkRequireReceipt();
//   checkSelection();
// } // removeCategory

/**
 * Submits an expense type.
 */
async function submit() {
  submitting.value = true; // set loading status to true
  emitter.emit('startAction');

  // set accessibleBy based on access radio
  if (isCustomSelected()) {
    editedExpenseType.value.accessibleBy = _union(editedExpenseType.value.accessibleBy, customAccess.value); // merge unique vals
  }

  // convert budget input into a floating point number
  editedExpenseType.value.budget = parseFloat(editedExpenseType.value.budget);

  if (editedExpenseType.value.odFlag == null) {
    // set overdraft flag to false if checkbox is null
    editedExpenseType.value.odFlag = false;
  }

  if (editedExpenseType.value.recurringFlag == null) {
    // set recurring flag to false if checkbox is null
    editedExpenseType.value.recurringFlag = false;
  }

  if (editedExpenseType.value.requiredFlag == null) {
    // set receipt required flag to false if checkbox is null
    editedExpenseType.value.requiredFlag = false;
  }

  if (editedExpenseType.value.isInactive == null) {
    // set is inactive flag to false if checkbox is null
    editedExpenseType.value.isInactive = false;
  }

  if (editedExpenseType.value.proRated == null) {
    editedExpenseType.value.proRated = false;
  }

  // format dates
  if (editedExpenseType.value.startDate) {
    editedExpenseType.value.startDate = format(editedExpenseType.value.startDate, null, 'YYYY-MM-DD');
  }
  if (editedExpenseType.value.endDate) {
    editedExpenseType.value.endDate = format(editedExpenseType.value.endDate, null, 'YYYY-MM-DD');
  }

  if (expenseTypeForm.value && expenseTypeForm.value.validate()) {
    for (var i = 0; i < editedExpenseType.value.categories.length; i++) {
      editedExpenseType.value.categories[i] = JSON.stringify(editedExpenseType.value.categories[i]);
    }
    // form is validated
    if (editedExpenseType.value.recurringFlag) {
      // clear start and end date fields if expense type is recurring
      editedExpenseType.value['startDate'] = null;
      editedExpenseType.value['endDate'] = null;
    }

    if (editedExpenseType.value.id) {
      // editing an expense type
      let newExpenseType = await api.updateItem(api.EXPENSE_TYPES, editedExpenseType.value);

      if (newExpenseType.id) {
        // successfully updates expense type
        emitter.emit('update');
        clearForm();
      } else {
        // emit error if fails to update expense type
        emitter.emit('error', JSON.stringify(newExpenseType.response.data.message));
      }
    } else {
      // creating a new expense type
      let newUUID = generateUUID();
      editedExpenseType.value['id'] = newUUID;
      let newExpenseType = await api.createItem(api.EXPENSE_TYPES, editedExpenseType.value);

      if (newExpenseType.id) {
        // successfully creates an expense type
        editedExpenseType.value['id'] = newExpenseType.id;
        emitter.emit('add');
        clearForm();
      } else {
        // emit error if fails to create an expense type
        emitter.emit('error', JSON.stringify(newExpenseType.response.data.message));
        editedExpenseType.value['id'] = '';
      }
    }
  }

  submitting.value = false; // set loading status to false
  emitter.emit('endAction');
} // submit

/**
 * Sets all category show on feed to true if expense type always show on feed is enabled. Sets all category show on
 * feed to false otherwise.
 */
function toggleShowAllCategories() {
  if (!submitting.value) {
    let alwaysOF = editedExpenseType.value.alwaysOnFeed;

    _forEach(editedExpenseType.value.categories, (category) => {
      category.showOnFeed = alwaysOF;
    });
  }
} // toggleShowAllCategories

/**
 * Sets all category require url to true if expense type require url is enabled. Sets all to false otherwise.
 */
function toggleRequireURL() {
  if (!submitting.value) {
    let requireURL = editedExpenseType.value.requireURL;

    _forEach(editedExpenseType.value.categories, (category) => {
      category.requireURL = requireURL;
    });
  }
} // toggleRequireURL

/**
 * Sets all category require url to true if expense type require url is enabled. Sets all to false otherwise.
 */
function toggleRequireReceipt() {
  if (!submitting.value) {
    let requireReceipt = editedExpenseType.value.requiredFlag;

    _forEach(editedExpenseType.value.categories, (category) => {
      category.requireReceipt = requireReceipt;
    });
  }
} // toggleRequireReceipt

/**
 * Creates empty tag budget field in tagBudgets list
 */
function addTagBudget() {
  editedExpenseType.value.tagBudgets.push({});
} // addTagBudgets

/**
 * Removes specified tag budget from list of tag budgets
 *
 * @param index index of tag budget to remove
 */
function removeTagBudget(index) {
  editedExpenseType.value.tagBudgets.splice(index, 1);
} // removeTagBudget

/**
 * Removes given chip from tag autocomplete input.
 *
 * @param data chip data to remove
 * @param index autocomplete input index
 */
function remove(data, index) {
  let indx = editedExpenseType.value.tagBudgets[index].tags.findIndex((t) => t == data.id);
  editedExpenseType.value.tagBudgets[index].tags.splice(indx, 1);
} // remove

/**
 * Gets tag options for the v-autocomplete dropdown completes. Makes sure that tag name cannot be used more than once.
 * @param selectedItems tag IDs already selected
 */
function tagOptions(selectedItems) {
  let selectedTags = [];
  if (editedExpenseType.value.tagBudgets.length > 0) {
    editedExpenseType.value.tagBudgets.forEach((t) => {
      if (t.tags) {
        t.tags.forEach((id) => {
          selectedTags.push(id);
        });
      }
    });
  }
  if (selectedItems && selectedItems.length > 0) {
    selectedTags = selectedTags.filter((st) => !selectedItems.includes(st));
  }
  return tags.value.filter((t) => !selectedTags.includes(t.id));
} // tagOptions

// /**
//  * Gets tag object given id
//  * @param id id of tag to find
//  */
// function getTagByID(id) {
//   return tags.value.find((t) => t.id === id);
// } // getTagByID

/**
 * Checks if index in element is first in array
 *
 * @param index index of element
 */
function isFirst(index) {
  return index == 0;
} // isFirst

/**
 * Checks if index of elment is last in array
 * @param index index of element
 * @param arr array
 */
function isLast(index, arr) {
  return index == arr.length - 1;
} // isLast

/**
 * Moves tag budget up one in priority
 * @param index index of tag budget to move
 */
function moveTagBudgetUp(index) {
  let temp = editedExpenseType.value.tagBudgets[index - 1];
  editedExpenseType.value.tagBudgets[index - 1] = editedExpenseType.value.tagBudgets[index];
  editedExpenseType.value.tagBudgets[index] = temp;
} // moveTagBudgetUp

/**
 * Moves tag budget down one in priority
 * @param index index of tag budget to move
 */
function moveTagBudgetDown(index) {
  let temp = editedExpenseType.value.tagBudgets[index + 1];
  editedExpenseType.value.tagBudgets[index + 1] = editedExpenseType.value.tagBudgets[index];
  editedExpenseType.value.tagBudgets[index] = temp;
} // moveTagBudgetDown

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for model.id - sets the model as the editedExpenseType and check if it is editing
 */
watch(
  () => props.model.id,
  () => {
    editedExpenseType.value = _cloneDeep(props.model); //set editedExpense to new value of model

    // set array used for custom access chip-selector to previously saved data but without the access strings
    // This code sucks
    if (editedExpenseType.value.accessibleBy.includes('Custom')) {
      let index = 1;
      if (editedExpenseType.value.accessibleBy.includes('FullTime')) {
        index++;
      }
      if (editedExpenseType.value.accessibleBy.includes('PartTime')) {
        index++;
      }
      if (editedExpenseType.value.accessibleBy.includes('Intern')) {
        index++;
      }
      // set only the ids of people with custom access (don't include the access type)
      customAccess.value = editedExpenseType.value.accessibleBy.splice(
        index,
        editedExpenseType.value.accessibleBy.length
      );
    }

    //when model id is not empty then must be editing an expense
    if (!isEmpty(props.model.id)) {
      emitter.emit('editing-expense-type'); //notify parent that expense is being edited
    }
    if (editedExpenseType.value.id != null) {
      //map categories
      categories.value = _map(editedExpenseType.value.categories, (category) => {
        return category.name;
      });
    }
    startDateFormatted.value = format(editedExpenseType.value.startDate, null, 'MM/DD/YYYY');
    endDateFormatted.value = format(editedExpenseType.value.endDate, null, 'MM/DD/YYYY');
    editedExpenseType.value.budget = props.model.budget;
    budgetFormatted.value = editedExpenseType.value.budget;
    formatBudget();
    formatMonthlyLimit();
  }
); // watchModelID

/**
 * watcher for categories - limits categories and updates checkboxes
 *
 * @param val - categories list
 */
watch(categories, (val) => {
  // limit categories to less than 10
  if (val.length > 10) {
    nextTick(() => categories.value.pop());
    nextTick(() => editedExpenseType.value.categories.pop());
  }

  // update categories checkboxes
  if (val.length > editedExpenseType.value.categories.length) {
    // category was added
    let c = _map(editedExpenseType.value.categories, (category) => {
      return category.name;
    });

    let index = _findIndex(val, (x) => {
      return !c.includes(x);
    });

    editedExpenseType.value.categories.push({
      name: val[index],
      showOnFeed: editedExpenseType.value.alwaysOnFeed,
      requireURL: editedExpenseType.value.requireURL,
      requireReceipt: editedExpenseType.value.requiredFlag
    });
  } else if (val.length < editedExpenseType.value.categories.length) {
    // category was removed
    editedExpenseType.value.categories = _filter(editedExpenseType.value.categories, (category) => {
      return val.includes(category.name);
    });
  }
}); // watchCategories

/**
 * watcher for editedExpenseType.endDate - formats date
 */
watch(
  () => editedExpenseType.value.endDate,
  () => {
    endDateFormatted.value = format(editedExpenseType.value.endDate, null, 'MM/DD/YYYY') || endDateFormatted.value;
    //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
    if (editedExpenseType.value.endDate !== null && !format(editedExpenseType.value.endDate, null, 'MM/DD/YYYY')) {
      editedExpenseType.value.endDate = null;
    }
  }
); // watchEditedExpenseTypeEndDate

/**
 * watcher for editedExpenseType.startDate - format date
 */
watch(
  () => editedExpenseType.value.startDate,
  () => {
    startDateFormatted.value =
      format(editedExpenseType.value.startDate, null, 'MM/DD/YYYY') || startDateFormatted.value;
    //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
    if (editedExpenseType.value.startDate !== null && !format(editedExpenseType.value.startDate, null, 'MM/DD/YYYY')) {
      editedExpenseType.value.startDate = null;
    }
  }
); // watchEditedExpenseTypeStartDate

/**
 * watcher for editedExpensetype.accessibleBy
 */
watch(
  () => editedExpenseType.value.accessibleBy,
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
