<template>
  <v-card class="mt-3" hover>
    <!-- Form Header -->
    <v-card-title class="header_style">
      <h3 v-if="model.id">Edit Expense Type</h3>

      <h3 v-else>Create New Expense Type</h3>
    </v-card-title>

    <v-container fluid>
      <v-form ref="expenseTypeForm" v-model="valid" lazy-validation>
        <!-- Budget Name -->
        <v-text-field
          v-model="editedExpenseType.budgetName"
          id="budgetName"
          :rules="getRequiredRules()"
          label="Budget Name"
          data-vv-name="Budget Name"
          class="type_form_padding"
        ></v-text-field>

        <!-- Categories -->
        <v-combobox
          v-model="categories"
          hint="Maximum of 10 categories"
          label="Categories (optional)"
          multiple
          small-chips
          append-icon
          :search-input.sync="categoryInput"
        >
          <template v-slot:selection="{ attrs, item }">
            <v-chip :attrs="attrs" close outlined label color="gray" @click:close="removeCategory(item)">
              <strong>{{ item }}</strong
              >&nbsp;
            </v-chip>
          </template>
        </v-combobox>

        <!-- Budget Amount -->
        <v-text-field
          prefix="$"
          v-model="budgetFormatted"
          id="budgetAmount"
          :rules="budgetRules"
          label="Budget"
          data-vv-name="Budget"
          @blur="editedExpenseType.budget = parseBudget(budgetFormatted)"
          @input="formatBudget(budgetFormatted)"
        ></v-text-field>

        <!-- Flags -->
        <v-container class="my-3 pb-4" grid-list-md text-xs-center>
          <v-row>
            <v-col cols="6">
              <v-checkbox
                label="Overdraft Flag"
                :disabled="!!model.id && model.odFlag"
                v-model="editedExpenseType.odFlag"
                persistent-hint
                :hint="odFlagHint()"
              ></v-checkbox>
              <v-checkbox label="Recurring Flag" v-model="editedExpenseType.recurringFlag"></v-checkbox>
            </v-col>

            <v-col cols="6">
              <v-checkbox
                label="Receipt Required"
                id="receiptRequired"
                v-model="editedExpenseType.requiredFlag"
              ></v-checkbox>

              <v-checkbox label="Mark as Inactive" v-model="editedExpenseType.isInactive"></v-checkbox>
            </v-col>
          </v-row>
        </v-container>

        <!-- Start Date -->
        <v-menu
          v-model="showStartMenu"
          v-if="!editedExpenseType.recurringFlag"
          :rules="getRequiredRules()"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="startDateFormatted"
              id="startDate"
              :rules="[...getDateRules(), ...startDateRules]"
              label="Start Date"
              hint="MM/DD/YYYY format"
              v-mask="'##/##/####'"
              persistent-hint
              prepend-icon="event"
              @blur="editedExpenseType.startDate = parseDate(startDateFormatted)"
              @input="showStartMenu = false"
              v-on="on"
            ></v-text-field>
          </template>

          <v-date-picker
            v-model="editedExpenseType.startDate"
            @input="showStartMenu = false"
            :max="editedExpenseType.endDate"
            no-title
          ></v-date-picker>
        </v-menu>

        <!-- End Date -->

        <v-menu
          v-model="showEndMenu"
          v-if="!editedExpenseType.recurringFlag"
          :rules="getRequiredRules()"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="endDateFormatted"
              id="endDate"
              :rules="[...getDateRules(), ...endDateRules]"
              label="End Date"
              hint="MM/DD/YYYY format"
              v-mask="'##/##/####'"
              persistent-hint
              prepend-icon="event"
              @blur="editedExpenseType.endDate = parseDate(endDateFormatted)"
              @input="showEndMenu = false"
              v-on="on"
            ></v-text-field>
          </template>

          <v-date-picker
            v-model="editedExpenseType.endDate"
            @input="showEndMenu = false"
            :min="editedExpenseType.startDate"
            no-title
          ></v-date-picker>
        </v-menu>

        <!-- Description -->
        <v-textarea
          v-model="editedExpenseType.description"
          id="description"
          :rules="getRequiredRules()"
          label="Description "
          data-vv-name="Description "
          rows="3"
        ></v-textarea>

        <!-- Campfires autocomplete -->
        <v-autocomplete
          :items="campfires"
          v-model="editedExpenseType.campfire"
          item-text="name"
          item-value="url"
          label="Basecamp Campfire (optional)"
          clearable
        ></v-autocomplete>

        <!-- Accessibility -->
        <div class="form-text">
          Employee Access
          <v-btn @click="toFAQ()" class="mb-4" x-small icon><v-icon color="#3f51b5">info</v-icon></v-btn>
        </div>
        <v-row>
          <v-checkbox
            label="Full-time"
            value="FullTime"
            v-model="editedExpenseType.accessibleBy"
            :rules="checkBoxValid"
            class="shrink ml-3"
          ></v-checkbox>
          <v-checkbox
            label="Part-time"
            value="PartTime"
            v-model="editedExpenseType.accessibleBy"
            :rules="checkBoxValid"
            class="shrink ml-6"
          ></v-checkbox>
          <v-checkbox
            label="Intern"
            value="Intern"
            v-model="editedExpenseType.accessibleBy"
            :rules="checkBoxValid"
            class="shrink ml-6"
          ></v-checkbox>
          <v-checkbox
            label="Custom"
            value="Custom"
            v-model="editedExpenseType.accessibleBy"
            :rules="checkBoxValid"
            class="shrink ml-6"
          ></v-checkbox>
        </v-row>
        <p id="error" v-if="checkBoxRule">At least one checkbox must be checked</p>
        <!-- Employee Access List -->
        <v-autocomplete
          v-if="editedExpenseType.accessibleBy && editedExpenseType.accessibleBy.includes('Custom')"
          v-model="customAccess"
          :items="activeEmployees"
          :filter="customFilter"
          no-data-text="No Employees Available"
          item-color="gray"
          multiple
          :rules="customAccessRules"
          chips
          clearable
          small-chips
          deletable-chips
          class="mt-0 pt-0"
          :search-input.sync="searchString"
          @change="searchString = ''"
        >
          <template v-slot:label>
            <span v-if="customAccess.length == 0" class="grey--text caption">No custom employee access</span>
            <span v-else class="grey--text caption"
              >{{ customAccess.length }} employee(s) have custom access to this expense type</span
            >
          </template>
        </v-autocomplete>

        <v-switch v-model="editedExpenseType.proRated" label="Should this expense be pro-rated?"></v-switch>

        <!-- Require Recipient -->
        <v-switch v-model="editedExpenseType.hasRecipient" label="Does this expense type have a recipient?"></v-switch>

        <!-- always show on feed -->
        <v-switch
          v-model="editedExpenseType.alwaysOnFeed"
          @change="toggleShowAllCategories()"
          label="Have this expense type show on the company feed?"
        ></v-switch>

        <!-- require url for expense type -->
        <v-switch
          v-model="editedExpenseType.requireURL"
          @change="toggleRequireURL()"
          label="Require a url for this expense?"
        ></v-switch>

        <v-container class="pb-0 mb-0">
          <v-row v-if="editedExpenseType.categories && editedExpenseType.categories.length > 0">
            <v-col>Category</v-col>
            <v-col>Show on Feed?</v-col>
            <v-col>Require Url?</v-col>
          </v-row>
          <v-row v-for="(category, index) in editedExpenseType.categories" :key="index">
            <v-col>{{ category.name }}</v-col>
            <v-col>
              <div>
                <v-checkbox
                  class="my-0"
                  v-if="!submitting"
                  light
                  v-model="category.showOnFeed"
                  @click.stop="checkSelection()"
                ></v-checkbox>
              </div>
            </v-col>
            <v-col>
              <v-checkbox
                class="my-0"
                v-if="!submitting"
                light
                justify="center"
                v-model="category.requireURL"
                @click.stop="checkRequireURL()"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-container>
        <!-- Buttons -->
        <!-- Cancel Button -->
        <v-btn color="white " @click="clearForm" class="ma-2" elevation="2">
          <v-icon class="mr-1">cancel</v-icon>Cancel
        </v-btn>
        <!-- Submit Button -->
        <v-btn
          outlined
          class="ma-2"
          color="success"
          id="submitButton"
          :loading="submitting"
          @click="submitForm = true"
          :disabled="!valid"
        >
          <v-icon class="mr-1">save</v-icon>Submit
        </v-btn>
        <!-- End Buttons -->
      </v-form>
      <form-submission-confirmation
        type="type"
        :toggleSubmissionConfirmation="submitForm"
      ></form-submission-confirmation>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import FormSubmissionConfirmation from '@/components/modals/FormSubmissionConfirmation.vue';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { getDateRules, getRequiredRules } from '@/shared/validationUtils.js';
import { formatDate, isEmpty, parseDate } from '@/utils/utils';
import { updateStoreExpenseTypes, updateStoreCampfires } from '@/utils/storeUtils';
import { mask } from 'vue-the-mask';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Set required url for expense type if all category required url checkboxes are enabled.
 */
function checkRequireURL() {
  // check if any categories do not require a url
  let somethingIsFalse = _.find(this.editedExpenseType.categories, (category) => {
    return !category.requireURL;
  });

  // update require url for expense type
  if (somethingIsFalse) {
    this.editedExpenseType.requireURL = false;
  } else {
    this.editedExpenseType.requireURL = true;
  }
} // checkRequireURL

/**
 * Set always on feed for expense type if all category show on feed checkboxes are enabled.
 */
function checkSelection() {
  // check if any categories are hidden on feed
  let somethingIsFalse = _.find(this.editedExpenseType.categories, (category) => {
    return !category.showOnFeed;
  });

  // update always on feed for expense type
  if (somethingIsFalse) {
    this.editedExpenseType.alwaysOnFeed = false;
  } else {
    this.editedExpenseType.alwaysOnFeed = true;
  }
} // checkSelection

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  if (this.$refs.expenseTypeForm) {
    this.$refs.expenseTypeForm.reset();
  }
  this.emit('finished-editing-expense-type'); //notify parent no longer editing an expense type
  this.startDateFormatted = null;
  this.endDateFormatted = null;
  this.customAccess = [];
  this.editedExpenseType.id = null;
  this.editedExpenseType.accessibleBy = ['FullTime'];
} // clearForm

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item - employee
 * @param queryText - the text used to filter the names
 * @return string - filtered employee
 */
function customFilter(item, queryText) {
  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;

  return queryContainsNickName || queryContainsFirstName;
} // customFilter

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  window.EventBus.$emit(msg);
} // emit

/**
 * Formats the budget on the form for a nicer display.
 */
function formatBudget() {
  this.editedExpenseType.budget = this.parseBudget(this.budgetFormatted);
  if (Number(this.editedExpenseType.budget)) {
    this.budgetFormatted = Number(this.editedExpenseType.budget).toLocaleString().toString();
  }
} // formatBudget

/**
 * Checks if custom access of employees have acess to an expense type at a percentage rate. Returns true if 'CUSTOM'
 * is selected, otherwise returns false.
 *
 * @return boolean - custom employees have access
 */
function isCustomSelected() {
  return this.editedExpenseType.accessibleBy && this.editedExpenseType.accessibleBy.includes('Custom');
} // isCustomSelected

/**
 * overdraft flag hint
 *
 * @return string - the string flag hint
 */
function odFlagHint() {
  if (!!this.model.id && this.model.odFlag) {
    return 'Cannot be undone';
  } else if (this.editedExpenseType.odFlag) {
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
function parseBudget(budget) {
  if (budget && !_.isEmpty(budget)) {
    return budget.replace(/[,\s]/g, '');
  } else {
    return budget;
  }
} // parseBudget

/**
 * route to FAQ
 */
function toFAQ() {
  let faq = this.$router.resolve({ path: '/help/expenseTypes' });
  window.open(faq.href, '_blank');
} // toFAQ

/**
 * Removes a category from the list of expense type categories.
 *
 * @param category - category to remove
 */
function removeCategory(category) {
  this.editedExpenseType.categories.splice(this.editedExpenseType.categories.indexOf(category), 1);
  this.editedExpenseType.categories = [...this.editedExpenseType.categories];
  this.categories.splice(this.categories.indexOf(category), 1);
  this.categories = [...this.categories];
} // removeCategory

/**
 * Submits an expense type.
 */
async function submit() {
  this.submitting = true; // set loading status to true
  this.$emit('startAction');

  // set accessibleBy based on access radio
  if (this.isCustomSelected()) {
    this.editedExpenseType.accessibleBy = _.union(this.editedExpenseType.accessibleBy, this.customAccess); // merge unique vals
  }

  // convert budget input into a floating point number
  this.editedExpenseType.budget = parseFloat(this.editedExpenseType.budget);

  if (this.editedExpenseType.odFlag == null) {
    // set overdraft flag to false if checkbox is null
    this.editedExpenseType.odFlag = false;
  }

  if (this.editedExpenseType.recurringFlag == null) {
    // set recurring flag to false if checkbox is null
    this.editedExpenseType.recurringFlag = false;
  }

  if (this.editedExpenseType.requiredFlag == null) {
    // set receipt required flag to false if checkbox is null
    this.editedExpenseType.requiredFlag = false;
  }

  if (this.editedExpenseType.isInactive == null) {
    // set is inactive flag to false if checkbox is null
    this.editedExpenseType.isInactive = false;
  }

  if (this.editedExpenseType.proRated == null) {
    this.editedExpenseType.proRated = false;
  }

  if (this.$refs.expenseTypeForm && this.$refs.expenseTypeForm.validate()) {
    for (var i = 0; i < this.editedExpenseType.categories.length; i++) {
      this.editedExpenseType.categories[i] = JSON.stringify(this.editedExpenseType.categories[i]);
    }
    // form is validated
    if (this.editedExpenseType.recurringFlag) {
      // clear start and end date fields if expense type is recurring
      this.$set(this.editedExpenseType, 'startDate', null);
      this.$set(this.editedExpenseType, 'endDate', null);
    }

    if (this.editedExpenseType.id) {
      // editing an expense type
      let newExpenseType = await api.updateItem(api.EXPENSE_TYPES, this.editedExpenseType);

      if (newExpenseType.id) {
        // successfully updates expense type
        this.$emit('update');
        this.clearForm();
      } else {
        // emit error if fails to update expense type
        this.$emit('error', newExpenseType.response.data.message);
      }
    } else {
      // creating a new expense type
      let newUUID = uuid();
      this.$set(this.editedExpenseType, 'id', newUUID);
      let newExpenseType = await api.createItem(api.EXPENSE_TYPES, this.editedExpenseType);

      if (newExpenseType.id) {
        // successfully creates an expense type
        this.$set(this.editedExpenseType, 'id', newExpenseType.id);
        this.$emit('add', newExpenseType);
        this.clearForm();
      } else {
        // emit error if fails to create an expense type
        this.$emit('error', newExpenseType.response.data.message);
        this.$set(this.editedExpenseType, 'id', '');
      }
    }
  }

  this.submitting = false; // set loading status to false
  this.$emit('endAction');
} // submit

/**
 * Sets all category show on feed to true if expense type always show on feed is enabled. Sets all category show on
 * feed to false otherwise.
 */
function toggleShowAllCategories() {
  if (!this.submitting) {
    let alwaysOF = this.editedExpenseType.alwaysOnFeed;

    _.forEach(this.editedExpenseType.categories, (category) => {
      category.showOnFeed = alwaysOF;
    });
  }
} // toggleShowAllCategories

/**
 * Sets all category require url to true if expense type require url is enabled. Sets all to false otherwise.
 */
function toggleRequireURL() {
  if (!this.submitting) {
    let requireURL = this.editedExpenseType.requireURL;

    _.forEach(this.editedExpenseType.categories, (category) => {
      category.requireURL = requireURL;
    });
  }
} // toggleRequireURL

/**
 * boolean for checkBox appearance
 *
 * @return boolean - whether checkbox appears
 */
function checkBoxRule() {
  return !(this.editedExpenseType.accessibleBy && this.editedExpenseType.accessibleBy.length > 0);
} // checkBoxRule

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and sets all employees.
 */
async function created() {
  window.EventBus.$on('confirmed-type', async () => {
    this.submitForm = false;
    await this.submit();
    await this.updateStoreExpenseTypes();
  });
  window.EventBus.$on('canceled-type', () => {
    this.submitting = false;
    this.submitForm = false;
  });
  // get all employees
  let employees = this.$store.getters.employees;
  let activeEmployees = [];

  // populate list of active employees
  _.forEach(employees, (employee) => {
    if (employee.workStatus > 0) {
      activeEmployees.push({
        value: employee.id,
        text: `${employee.firstName} ${employee.lastName}`,
        nickname: employee.nickname,
        firstName: employee.firstName,
        lastName: employee.lastName
      });
    }
  });

  activeEmployees = _.sortBy(activeEmployees, ['text']); // sort employees
  this.activeEmployees = activeEmployees;
  await this.updateStoreCampfires();
  this.campfires = this.$store.getters.basecampCampfires;
  this.editedExpenseType = _.cloneDeep(this.model);
  this.clearForm();
} // created

/**
 * beforeDestroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('confirmed-type');
  window.EventBus.$off('canceled-type');
} //beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for model.id - sets the model as the editedExpenseType and check if it is editing
 */
function watchModelID() {
  this.editedExpenseType = _.cloneDeep(this.model); //set editedExpense to new value of model

  // set array used for custom access chip-selector to previously saved data but without the access strings
  // This code sucks
  if (this.editedExpenseType.accessibleBy.includes('Custom')) {
    let index = 1;
    if (this.editedExpenseType.accessibleBy.includes('FullTime')) {
      index++;
    }
    if (this.editedExpenseType.accessibleBy.includes('PartTime')) {
      index++;
    }
    if (this.editedExpenseType.accessibleBy.includes('Intern')) {
      index++;
    }
    // set only the ids of people with custom access (don't include the access type)
    this.customAccess = this.editedExpenseType.accessibleBy.splice(index, this.editedExpenseType.accessibleBy.length);
  }

  //when model id is not empty then must be editing an expense
  if (!this.isEmpty(this.model.id)) {
    this.emit('editing-expense-type'); //notify parent that expense is being edited
  }
  if (this.editedExpenseType.id != null) {
    //map categories
    this.categories = _.map(this.editedExpenseType.categories, (category) => {
      return category.name;
    });
  }
  this.editedExpenseType.budget = this.model.budget;
  this.budgetFormatted = this.editedExpenseType.budget;
  this.formatBudget();
} // watchModelID

/**
 * watcher for categories - limits categories and updates checkboxes
 *
 * @param val - categories list
 */
function watchCategories(val) {
  // limit categories to less than 10
  if (val.length > 10) {
    this.$nextTick(() => this.categories.pop());
    this.$nextTick(() => this.editedExpenseType.categories.pop());
  }

  // update categories checkboxes
  if (val.length > this.editedExpenseType.categories.length) {
    // category was added
    let c = _.map(this.editedExpenseType.categories, (category) => {
      return category.name;
    });

    let index = _.findIndex(val, (x) => {
      return !c.includes(x);
    });

    this.editedExpenseType.categories.push({
      name: val[index],
      showOnFeed: this.editedExpenseType.alwaysOnFeed,
      requireURL: this.editedExpenseType.requireURL
    });
  } else if (val.length < this.editedExpenseType.categories.length) {
    // category was removed
    this.editedExpenseType.categories = _.filter(this.editedExpenseType.categories, (category) => {
      return val.includes(category.name);
    });
  }
} // watchCategories

/**
 * watcher for editedExpenseType.endDate - formats date
 */
function watchEditedExpenseTypeEndDate() {
  this.endDateFormatted = this.formatDate(this.editedExpenseType.endDate) || this.endDateFormatted;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedExpenseType.endDate !== null && !this.formatDate(this.editedExpenseType.endDate)) {
    this.editedExpenseType.endDate = null;
  }
} // watchEditedExpenseTypeEndDate

/**
 * watcher for editedExpenseType.startDate - format date
 */
function watchEditedExpenseTypeStartDate() {
  this.startDateFormatted = this.formatDate(this.editedExpenseType.startDate) || this.startDateFormatted;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedExpenseType.startDate !== null && !this.formatDate(this.editedExpenseType.startDate)) {
    this.editedExpenseType.startDate = null;
  }
} // watchEditedExpenseTypeStartDate

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    FormSubmissionConfirmation
  },
  created,
  beforeDestroy,
  data() {
    return {
      activeEmployees: null, // list of active employees
      budgetFormatted: '',
      budgetRules: [
        (v) => !!v || 'Budget amount is required',
        (v) => parseFloat(v, 10) > 0 || 'Budget must be greater than 0.',
        (v) =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Budget amount must be a number with two decimal digits.'
      ], // rules for an expense type budget
      campfires: [], // basecamp campfires
      categories: [], // list of expense type categories
      categoryInput: null, // category combobox input
      checkBoxValid: [
        () => {
          return !this.checkBoxRule;
        }
      ],
      customAccess: [], // list of employees with custom access
      customAccessRules: [
        () => {
          return this.customAccess.length > 0 || 'Select at least one employee or uncheck the Custom checkbox';
        }
      ],
      startDateRules: [
        (v) => {
          return !this.isEmpty(v) && moment(v, 'MM/DD/YYYY', true).isValid() && this.editedExpenseType.endDate
            ? moment(v, 'MM/DD/YYYY', true).isSameOrBefore(moment(this.editedExpenseType.endDate)) ||
                'Start date must be at or before end date'
            : true;
        }
      ],
      endDateRules: [
        (v) => {
          return !this.isEmpty(v) && moment(v, 'MM/DD/YYYY', true).isValid() && this.editedExpenseType.startDate
            ? moment(v, 'MM/DD/YYYY', true).isSameOrAfter(moment(this.editedExpenseType.startDate)) ||
                'End date must be at or after start date'
            : true;
        }
      ],
      endDateFormatted: null, // formatted end date
      editedExpenseType: _.cloneDeep(this.model), //used to store edits made to an expense type or when creating new expense type
      searchString: '',
      showStartMenu: false, // boolean for showing date picker
      showEndMenu: false, // boolean for showing date picker
      startDateFormatted: null, // formatted start date
      submitting: false, // submitting form
      submitForm: false, //triggers submit form modal when changed
      valid: false // form is valid
    };
  },
  directives: { mask },
  methods: {
    checkRequireURL,
    checkSelection,
    clearForm,
    customFilter,
    emit,
    formatBudget,
    formatDate,
    getDateRules,
    getRequiredRules,
    isCustomSelected,
    isEmpty,
    odFlagHint,
    parseBudget,
    parseDate,
    removeCategory,
    submit,
    toFAQ,
    toggleRequireURL,
    toggleShowAllCategories,
    updateStoreExpenseTypes,
    updateStoreCampfires
  },
  props: ['model'], // expense type to be created/updated
  computed: {
    checkBoxRule
  },
  watch: {
    'model.id': watchModelID,
    categories: watchCategories,
    'editedExpenseType.endDate': watchEditedExpenseTypeEndDate,
    'editedExpenseType.startDate': watchEditedExpenseTypeStartDate
  }
};
</script>

<style scoped>
#error {
  color: #ff5252;
  font-size: 12px;
}

.smallRadio {
  margin: 0 !important;
}

.smallRadio label {
  margin-left: -6px;
}

.smallRadio [class*='__ripple'] {
  height: 20px;
  width: 20px;
  margin: 14px;
}
</style>
