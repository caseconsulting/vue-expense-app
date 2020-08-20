<template>
  <v-card hover>
    <!-- Form Header -->
    <v-card-title class="header_style">
      <h3 v-if="model.id">Edit Expense Type</h3>

      <h3 v-else>Create New Expense Type</h3>
    </v-card-title>

    <v-container fluid>
      <v-form ref="form" v-model="valid" lazy-validation>
        <!-- Budget Name -->
        <v-text-field
          v-model="model.budgetName"
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
            <v-chip close outlined label color="gray" @click:close="removeCategory(item)">
              <strong>{{ item }}</strong
              >&nbsp;
            </v-chip>
          </template>
        </v-combobox>

        <!-- Budget Amount -->
        <v-text-field
          prefix="$"
          v-model="model.budget"
          :rules="budgetRules"
          label="Budget"
          data-vv-name="Budget"
        ></v-text-field>

        <!-- Flags -->
        <v-container grid-list-md text-xs-center>
          <v-row>
            <v-col cols="6">
              <v-checkbox label="Overdraft Flag" v-model="model.odFlag"></v-checkbox>

              <v-checkbox label="Recurring Flag" v-model="model.recurringFlag"></v-checkbox>
            </v-col>

            <v-col cols="6">
              <v-checkbox label="Receipt Required" v-model="model.requiredFlag"></v-checkbox>

              <v-checkbox label="Mark as Inactive" v-model="model.isInactive"></v-checkbox>
            </v-col>
          </v-row>
        </v-container>

        <!-- Start Date -->
        <v-menu
          v-if="!model.recurringFlag"
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
              :rules="dateRules"
              label="Start Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              @blur="model.startDate = parseDate(startDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>

          <v-date-picker v-model="model.startDate" no-title></v-date-picker>
        </v-menu>

        <!-- End Date -->

        <v-menu
          v-if="!model.recurringFlag"
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
              :rules="dateRules"
              label="End Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              @blur="model.endDate = parseDate(endDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>

          <v-date-picker v-model="model.endDate" no-title></v-date-picker>
        </v-menu>

        <!-- Description -->
        <v-textarea
          v-model="model.description"
          :rules="requiredRules"
          label="Description "
          data-vv-name="Description "
          rows="3"
        ></v-textarea>

        <!-- Campfires autocomplete -->
        <v-autocomplete
          :items="campfires"
          v-model="model.campfire"
          item-text="name"
          item-value="url"
          label="Basecamp Campfire (optional)"
          clearable
        ></v-autocomplete>

        <!-- Accessibility -->
        <div style="color: dimgray;">
          Employee Access
          <v-btn to="/help/expenseTypes" class="mb-4" x-small icon><v-icon color="#3f51b5">info</v-icon></v-btn>
        </div>

        <v-radio-group v-model="model.accessibleBy" class="smallRadio ma-0" row mandatory>
          <v-radio label="All" value="ALL"></v-radio>

          <v-radio label="Full" value="FULL"></v-radio>

          <v-radio label="Full Time" value="FULL TIME"></v-radio>

          <v-radio label="Custom" value="CUSTOM"></v-radio>
        </v-radio-group>

        <!-- Employee Access List -->
        <v-autocomplete
          v-if="model.accessibleBy == 'CUSTOM'"
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
            <span class="grey--text caption">No Employee Access</span>
          </template>

          <template v-slot:selection="{ index }">
            <span v-if="index === 0 && customAccess.length == 1" class="grey--text caption"
              >Accessible by {{ customAccess.length }} employee</span
            >

            <span v-else-if="index === 0" class="grey--text caption"
              >Accessible by {{ customAccess.length }} employees</span
            >
          </template>
        </v-autocomplete>

        <!-- Require Recipient -->
        <v-switch v-model="model.hasRecipient" label="Does this expense type have a recipient?"></v-switch>

        <!-- always show on feed -->
        <v-switch
          v-model="model.alwaysOnFeed"
          @change="toggleShowAllCategories()"
          label="Have this expense type show on the company feed?"
        ></v-switch>

        <!-- require url for expense type -->
        <v-switch
          v-model="model.requireURL"
          @change="toggleRequireURL()"
          label="Require a url for this expense?"
        ></v-switch>

        <v-container class="pb-0 mb-0">
          <v-row v-if="model.categories.length > 0">
            <v-col>Category</v-col>
            <v-col>Show on Feed?</v-col>
            <v-col>Require Url?</v-col>
          </v-row>
          <v-row v-for="(category, index) in model.categories" :key="index">
            <v-col>{{ category.name }}</v-col>
            <v-col>
              <div>
                <v-checkbox
                  class="my-0"
                  v-if="!submitting"
                  light
                  v-model="category.showOnFeed"
                  @click.stop="checkSelection(category)"
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
                @click.stop="checkRequireURL(category)"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-container>
        <!-- Buttons -->
        <!-- Cancel Button -->
        <v-btn color="white " @click="clearForm" class="ma-2"> <icon class="mr-1" name="ban"></icon>Cancel </v-btn>
        <!-- Submit Button -->
        <v-btn
          outlined
          class="ma-2"
          color="success"
          :loading="submitting"
          @click="submitting = true"
          :disabled="!valid"
        >
          <icon class="mr-1" name="save"></icon>Submit
        </v-btn>
        <!-- End Buttons -->
      </v-form>
      <form-submission-confirmation :activate="this.submitting"></form-submission-confirmation>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import FormSubmissionConfirmation from '@/components/modals/FormSubmissionConfirmation.vue';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formatDate, isEmpty, parseDate } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Set required url for expense type if all category required url checkboxes are enabled.
 */
function checkRequireURL(category) {
  // find index of category selected
  let index = _.findIndex(this.model.categories, (cat) => {
    return cat.name == category.name;
  });

  // toggle the category require url
  this.model.categories[index].requireURL = !this.model.categories[index].requireURL;

  // check if any categories do not require a url
  let somethingIsFalse = _.find(this.model.categories, (category) => {
    return !category.requireURL;
  });

  // update require url for expense type
  if (somethingIsFalse) {
    this.model.requireURL = false;
  } else {
    this.model.requireURL = true;
  }
} // checkRequireURL

/**
 * Set always on feed for expense type if all category show on feed checkboxes are enabled.
 */
function checkSelection(category) {
  // find index of category selected
  let index = _.findIndex(this.model.categories, (cat) => {
    return cat.name == category.name;
  });

  // toggle the category show on feed
  this.model.categories[index].showOnFeed = !this.model.categories[index].showOnFeed;

  // check if any categories are hidden on feed
  let somethingIsFalse = _.find(this.model.categories, (category) => {
    return !category.showOnFeed;
  });

  // update always on feed for expense type
  if (somethingIsFalse) {
    this.model.alwaysOnFeed = false;
  } else {
    this.model.alwaysOnFeed = true;
  }
} // checkSelection

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  this.$refs.form.reset();
  this.$set(this.model, 'id', '');
  this.$set(this.model, 'budget', 0);
  this.$set(this.model, 'budgetName', '');
  this.$set(this.model, 'description', '');
  this.$set(this.model, 'recurringFlag', false);
  this.$set(this.model, 'startDate', '');
  this.$set(this.model, 'endDate', '');
  this.$set(this.model, 'odFlag', false);
  this.$set(this.model, 'requiredFlag', false);
  this.$set(this.model, 'isInactive', false);
  this.$set(this.model, 'categories', []);
  this.$set(this.model, 'accessibleBy', 'ALL');
  this.$set(this.model, 'hasRecipient', false);
  this.$set(this.model, 'alwaysOnFeed', false);
  this.$set(this.model, 'requireURL', false);
  this.startDateFormatted = null;
  this.endDateFormatted = null;
  this.customAccess = [];
} // clearForm

/**
 * Checks if all employees have access to an expense type and at a percentage rate. Return true if 'ALL' is selected,
 * otherwise returns false.
 *
 * @return boolean - all employees have access at a percentage rate
 */
function isAllSelected() {
  return this.model.accessibleBy == 'ALL';
} // isAllSelected

/**
 * Checks if custom access of employees have acess to an expense type at a percentage rate. Returns true if 'CUSTOM'
 * is selected, otherwise returns false.
 *
 * @return boolean - custom employees have access
 */
function isCustomSelected() {
  return this.model.accessibleBy == 'CUSTOM';
} // isCustomSelected

/**
 * Checks if all employees have access to an expense type and at a full rate. Return true if 'FULL' is selected,
 * otherwise returns false.
 *
 * @return boolean - all employees have access at a full rate
 */
function isFullSelected() {
  return this.model.accessibleBy == 'FULL';
} // isFullSelected

/**
 * Checks if all full time employees have access to an expense type. Return true if 'FULL TIME' is selected, otherwise
 * returns false.
 *
 * @return boolean - all full time employees have access
 */
function isFullTimeSelected() {
  return this.model.accessibleBy == 'FULL TIME';
} // isFullTimeSelected

/**
 * Removes a category from the list of expense type categories.
 *
 * @param category - category to remove
 */
function removeCategory(category) {
  this.model.categories.splice(this.model.categories.indexOf(category), 1);
  this.model.categories = [...this.model.categories];
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
    this.model.accessibleBy = this.customAccess;
  }

  // convert budget input into a floating point number
  this.model.budget = parseFloat(this.model.budget);

  if (this.model.odFlag == null) {
    // set overdraft flag to false if checkbox is null
    this.model.odFlag = false;
  }

  if (this.model.recurringFlag == null) {
    // set recurring flag to false if checkbox is null
    this.model.recurringFlag = false;
  }

  if (this.model.requiredFlag == null) {
    // set receipt required flag to false if checkbox is null
    this.model.requiredFlag = false;
  }

  if (this.model.isInactive == null) {
    // set is inactive flag to false if checkbox is null
    this.model.isInactive = false;
  }

  for (var i = 0; i < this.model.categories.length; i++) {
    this.model.categories[i] = JSON.stringify(this.model.categories[i]);
  }

  if (this.$refs.form.validate()) {
    // form is validated
    if (this.model.recurringFlag) {
      // clear start and end date fields if expense type is recurring
      this.$set(this.model, 'startDate', null);
      this.$set(this.model, 'endDate', null);
    }

    if (this.model.id) {
      // editing an expense type
      let newExpenseType = await api.updateItem(api.EXPENSE_TYPES, this.model);

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
      this.$set(this.model, 'id', newUUID);
      let newExpenseType = await api.createItem(api.EXPENSE_TYPES, this.model);

      if (newExpenseType.id) {
        // successfully creates an expense type
        this.$set(this.model, 'id', newExpenseType.id);
        this.$emit('add', newExpenseType);
        this.clearForm();
      } else {
        // emit error if fails to create an expense type
        this.$emit('error', newExpenseType.response.data.message);
        this.$set(this.model, 'id', '');
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
    let alwaysOF = this.model.alwaysOnFeed;

    _.forEach(this.model.categories, (category) => {
      category.showOnFeed = alwaysOF;
    });
  }
} // toggleShowAllCategories

/**
 * Sets all category require url to true if expense type require url is enabled. Sets all to false otherwise.
 */
function toggleRequireURL() {
  if (!this.submitting) {
    let requireURL = this.model.requireURL;

    _.forEach(this.model.categories, (category) => {
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
      customAccess: [], // list of employees with custom access
      dateRules: [
        (v) => !isEmpty(v) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rule for a required date
      endDateFormatted: null, // formatted end date
      requiredRules: [(v) => !isEmpty(v) || 'This field is required'],
      startDateFormatted: null, // formatted start date
      submitting: false, // submitting form
      valid: false // form is valid
    };
  },
  methods: {
    checkRequireURL,
    checkSelection,
    clearForm,
    formatDate,
    isAllSelected,
    isCustomSelected,
    isEmpty,
    isFullSelected,
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
      if (this.model.id != null) {
        this.categories = _.map(this.model.categories, (category) => {
          return category.name;
        });
      }
    },
    'model.accessibleBy': function (val) {
      if (!this.submitting) {
        if (!['ALL', 'FULL TIME', 'FULL', 'CUSTOM'].includes(val)) {
          // set employee access form field when populating form with an existing expense type
          // filter out employees that do not have access
          this.customAccess = _.filter(this.activeEmployees, (employee) => {
            return this.model.accessibleBy.includes(employee.value);
          });

          // map employee values
          this.customAccess = _.map(this.customAccess, (employee) => {
            return employee.value;
          });

          this.model.accessibleBy = 'CUSTOM';
        }
      }
    },
    categories: function (val) {
      // limit categories to less than 10
      if (val.length > 10) {
        this.$nextTick(() => this.categories.pop());
        this.$nextTick(() => this.model.categories.pop());
      }

      // update categories checkboxes
      if (val.length > this.model.categories.length) {
        // category was added
        let c = _.map(this.model.categories, (category) => {
          return category.name;
        });

        let index = _.findIndex(val, (x) => {
          return !c.includes(x);
        });

        this.model.categories.push({
          name: val[index],
          showOnFeed: this.model.alwaysOnFeed,
          requireURL: this.model.requireURL
        });
      } else if (val.length < this.model.categories.length) {
        // category was removed
        this.model.categories = _.filter(this.model.categories, (category) => {
          return val.includes(category.name);
        });
      }
    },
    'model.endDate': function () {
      this.endDateFormatted = this.formatDate(this.model.endDate) || this.endDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.endDate !== null && !this.formatDate(this.model.endDate)) {
        this.model.endDate = null;
      }
    },
    'model.startDate': function () {
      this.startDateFormatted = this.formatDate(this.model.startDate) || this.startDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.startDate !== null && !this.formatDate(this.model.startDate)) {
        this.model.startDate = null;
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
