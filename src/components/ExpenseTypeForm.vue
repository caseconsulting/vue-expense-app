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
          :rules="requiredRules"
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
          v-model="editedExpenseType.budget"
          id="budgetAmount"
          :rules="budgetRules"
          label="Budget"
          data-vv-name="Budget"
        ></v-text-field>

        <!-- Flags -->
        <v-container class="my-3 pb-4" grid-list-md text-xs-center>
          <v-row>
            <v-col cols="6">
              <v-checkbox label="Overdraft Flag" v-model="editedExpenseType.odFlag"></v-checkbox>

              <v-checkbox label="Recurring Flag" v-model="editedExpenseType.recurringFlag"></v-checkbox>
            </v-col>

            <v-col cols="6">
              <v-checkbox label="Receipt Required" v-model="editedExpenseType.requiredFlag"></v-checkbox>

              <v-checkbox label="Mark as Inactive" v-model="editedExpenseType.isInactive"></v-checkbox>
            </v-col>
          </v-row>
        </v-container>

        <!-- Start Date -->
        <v-menu
          v-if="!editedExpenseType.recurringFlag"
          :rules="requiredRules"
          :close-on-content-click="true"
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
              :rules="dateRules"
              label="Start Date"
              hint="MM/DD/YYYY format"
              v-mask="'##/##/####'"
              persistent-hint
              prepend-icon="event"
              @blur="editedExpenseType.startDate = parseDate(startDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>

          <v-date-picker
            v-model="editedExpenseType.startDate"
            :max="editedExpenseType.endDate"
            no-title
          ></v-date-picker>
        </v-menu>

        <!-- End Date -->

        <v-menu
          v-if="!editedExpenseType.recurringFlag"
          :rules="requiredRules"
          :close-on-content-click="true"
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
              :rules="dateRules"
              label="End Date"
              hint="MM/DD/YYYY format"
              v-mask="'##/##/####'"
              persistent-hint
              prepend-icon="event"
              @blur="editedExpenseType.endDate = parseDate(endDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>

          <v-date-picker
            v-model="editedExpenseType.endDate"
            :min="editedExpenseType.startDate"
            no-title
          ></v-date-picker>
        </v-menu>

        <!-- Description -->
        <v-textarea
          v-model="editedExpenseType.description"
          id="description"
          :rules="requiredRules"
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
        <div style="color: dimgray">
          Employee Access
          <v-btn to="/help/expenseTypes" class="mb-4" x-small icon><v-icon color="#3f51b5">info</v-icon></v-btn>
        </div>

        <v-row>
          <v-checkbox
            label="Full-time"
            value="FullTime"
            v-model="editedExpenseType.accessibleBy"
            :rules="checkboxRules"
            class="shrink ml-3"
          ></v-checkbox>
          <v-checkbox
            label="Part-time"
            value="PartTime"
            v-model="editedExpenseType.accessibleBy"
            class="shrink ml-6"
          ></v-checkbox>
          <v-checkbox
            label="Intern"
            value="Intern"
            v-model="editedExpenseType.accessibleBy"
            class="shrink ml-6"
          ></v-checkbox>
          <v-checkbox
            label="Custom"
            value="Custom"
            v-model="editedExpenseType.accessibleBy"
            class="shrink ml-6"
          ></v-checkbox>
        </v-row>

        <v-switch v-model="editedExpenseType.proRated" label="Should this expense be pro-rated?"></v-switch>

        <!-- <v-radio-group v-model="editedExpenseType.accessibleBy" class="smallRadio ma-0" row mandatory>
          <v-radio label="All" value="ALL"></v-radio>

          <v-radio label="Full" value="FULL"></v-radio>

          <v-radio label="Full Time" value="FULL TIME"></v-radio>

          <v-radio label="Custom" value="CUSTOM"></v-radio>
        </v-radio-group> -->

        <!-- Employee Access List -->
        <v-autocomplete
          v-if="editedExpenseType.accessibleBy && editedExpenseType.accessibleBy.includes('Custom')"
          v-model="customAccess"
          :items="activeEmployees"
          no-data-text="No Employees Available"
          item-color="gray"
          multiple
          chips
          clearable
          small-chips
          deletable-chips
          single-line
          class="mt-0 pt-0"
        >
          <template v-slot:label>
            <span class="grey--text caption">No custom employee access</span>
          </template>

          <template v-slot:selection="{ index }">
            <span v-if="index === 0" class="grey--text caption"
              >{{ customAccess.length }} employee(s) have custom access to this expense type</span
            >
          </template>
        </v-autocomplete>

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
          <icon class="mr-1" name="ban"></icon>Cancel
        </v-btn>
        <!-- Submit Button -->
        <v-btn
          outlined
          class="ma-2"
          color="success"
          id="submitButton"
          :loading="submitting"
          @click="
            submitForm = !submitForm;
            submitting = true;
          "
          :disabled="!valid"
        >
          <icon class="mr-1" name="save"></icon>Submit
        </v-btn>
        <!-- End Buttons -->
      </v-form>
      <form-submission-confirmation :toggleSubmissionConfirmation="submitForm"></form-submission-confirmation>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import FormSubmissionConfirmation from '@/components/modals/FormSubmissionConfirmation.vue';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formatDate, isEmpty, parseDate } from '@/utils/utils';
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
  // find index of category selected
  // let index = _.findIndex(this.editedExpenseType.categories, (cat) => {
  //   return cat.name == category.name;
  // });

  // toggle the category require url
  //this.editedExpenseType.categories[index].requireURL = !this.editedExpenseType.categories[index].requireURL;

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
  // find index of category selected
  // let index = _.findIndex(this.editedExpenseType.categories, (cat) => {
  //   return cat.name == category.name;
  // });

  // toggle the category show on feed
  // this.editedExpenseType.categories[index].showOnFeed = !this.editedExpenseType.categories[index].showOnFeed;

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
  this.$refs.expenseTypeForm.reset();
  this.emit('finished-editing-expense-type'); //notify parent no longer editing an expense type
  this.startDateFormatted = null;
  this.endDateFormatted = null;
  this.customAccess = [];
  this.editedExpenseType.accessibleBy = [];
} // clearForm

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  window.EventBus.$emit(msg);
} // emit

// /**
//  * Checks if all employees have access to an expense type and at a percentage rate. Return true if 'ALL' is selected,
//  * otherwise returns false.
//  *
//  * @return boolean - all employees have access at a percentage rate
//  */
// function isAllSelected() {
//   return this.editedExpenseType.accessibleBy == 'ALL';
// } // isAllSelected

/**
 * Checks if custom access of employees have acess to an expense type at a percentage rate. Returns true if 'CUSTOM'
 * is selected, otherwise returns false.
 *
 * @return boolean - custom employees have access
 */
function isCustomSelected() {
  return this.editedExpenseType.accessibleBy && this.editedExpenseType.accessibleBy.includes('Custom');
} // isCustomSelected

// /**
//  * Checks if all employees have access to an expense type and at a full rate. Return true if 'FULL' is selected,
//  * otherwise returns false.
//  *
//  * @return boolean - all employees have access at a full rate
//  */
// function isFullSelected() {
//   return this.editedExpenseType.accessibleBy == 'FULL';
// } // isFullSelected

/**
 * Checks if all full time employees have access to an expense type. Return true if 'FULL TIME' is selected, otherwise
 * returns false.
 *
 * @return boolean - all full time employees have access
 */
function isFullTimeSelected() {
  return this.editedExpenseType.accessibleBy.includes('FullTime');
} // isFullTimeSelected

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

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and sets all employees.
 */
async function created() {
  window.EventBus.$on('confirmed', () => {
    this.submit();
  });
  window.EventBus.$on('canceled', () => {
    this.submitting = false;
  });
  // get all employees
  let employees = await api.getItems(api.EMPLOYEES);
  let activeEmployees = [];

  // populate list of active employees
  _.forEach(employees, (employee) => {
    if (employee.workStatus > 0) {
      activeEmployees.push({
        value: employee.id,
        text: `${employee.firstName} ${employee.lastName}`
      });
    }
  });

  activeEmployees = _.sortBy(activeEmployees, ['text']); // sort employees
  this.activeEmployees = activeEmployees;
  this.campfires = await api.getBasecampCampfires();
  this.editedExpenseType = _.cloneDeep(this.model);
  this.clearForm();
} // created

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
  data() {
    return {
      activeEmployees: null, // list of active employees
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
      checkboxRules: [
        () =>
          (this.editedExpenseType.accessibleBy && this.editedExpenseType.accessibleBy.length > 0) ||
          'At least one checkbox must be checked'
      ],
      customAccess: [], // list of employees with custom access
      dateRules: [
        (v) => !isEmpty(v) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => moment(v, 'MM/DD/YYYY').isValid() || 'Date must be valid',
        (v) => {
          return !isEmpty(v) && moment(v) && this.editedExpenseType.endDate
            ? moment(v).isBefore(moment(this.editedExpenseType.endDate).add(1, 'd')) ||
                'Start date must be at or before end date'
            : true;
        },
        (v) => {
          return !isEmpty(v) && moment(v) && this.editedExpenseType.startDate
            ? moment(v).add(1, 'd').isAfter(moment(this.editedExpenseType.startDate)) ||
                'End date must be at or after start date'
            : true;
        }
      ], // rule for a required date
      endDateFormatted: null, // formatted end date
      editedExpenseType: _.cloneDeep(this.model), //used to store edits made to an expense type or when creating new expense type
      requiredRules: [(v) => !isEmpty(v) || 'This field is required'],
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
    emit,
    formatDate,
    isCustomSelected,
    isEmpty,
    isFullTimeSelected,
    parseDate,
    removeCategory,
    submit,
    toggleRequireURL,
    toggleShowAllCategories
  },
  props: ['model'], // expense type to be created/updated
  watch: {
    'model.id': function () {
      this.editedExpenseType = _.cloneDeep(this.model); //set editedExpense to new value of model

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
    },
    categories: function (val) {
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
    },
    // 'editedExpenseType.accessibleBy': function (val) {
    //   if (!this.submitting && this.editedExpenseType.accessibleBy) {
    //     if (!['FullTime', 'PartTime', 'Intern', 'Custom'].includes(val)) {
    //       // set employee access form field when populating form with an existing expense type
    //       // filter out employees that do not have access
    //       console.log(this.customAccess);
    //       console.log(this.editedExpenseType.accessibleBy);
    //       this.customAccess = _.filter(this.activeEmployees, (employee) => {
    //         return this.editedExpenseType.accessibleBy.includes(employee.value);
    //       });
    //       console.log(this.customAccess);
    //       // map employee values
    //       this.customAccess = _.map(this.customAccess, (employee) => {
    //         return employee.value;
    //       });
    //       console.log(this.customAccess);
    //     }
    //   }
    // },
    'editedExpenseType.endDate': function () {
      this.endDateFormatted = this.formatDate(this.editedExpenseType.endDate) || this.endDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.editedExpenseType.endDate !== null && !this.formatDate(this.editedExpenseType.endDate)) {
        this.editedExpenseType.endDate = null;
      }
    },
    'editedExpenseType.startDate': function () {
      this.startDateFormatted = this.formatDate(this.editedExpenseType.startDate) || this.startDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.editedExpenseType.startDate !== null && !this.formatDate(this.editedExpenseType.startDate)) {
        this.editedExpenseType.startDate = null;
      }
    }
  }
};
</script>

<style scoped>
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
