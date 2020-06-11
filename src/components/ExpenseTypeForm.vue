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
          :rules="genericRules"
          label="Budget Name"
          data-vv-name="Budget Name"
          class="type_form_padding"
        ></v-text-field>

        <!-- Categories -->
        <v-combobox
          v-model="model.categories"
          hint="Maximum of 10 categories"
          label="Categories (optional)"
          multiple
          small-chips
          append-icon
          clearable
          :search-input.sync="categoryInput"
        >
          <template v-slot:selection="{ attrs, item }">
            <v-chip close outlined label color="gray" @click:close="removeCategory(item)">
              <strong>{{ item }}</strong
              >&nbsp;
            </v-chip>
          </template>
        </v-combobox>
        <br />

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
          <v-layout row wrap>
            <v-flex xs6>
              <v-checkbox label="Overdraft Flag" v-model="model.odFlag"></v-checkbox>
              <v-checkbox label="Recurring Flag" v-model="model.recurringFlag"></v-checkbox>
            </v-flex>
            <v-flex xs6>
              <v-checkbox label="Receipt Required" v-model="model.requiredFlag"></v-checkbox>
              <v-checkbox label="Mark as Inactive" v-model="model.isInactive"></v-checkbox>
            </v-flex>
          </v-layout>
        </v-container>

        <!-- Start Date -->
        <v-menu
          v-if="!model.recurringFlag"
          :rules="genericRules"
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
          :rules="genericRules"
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
          :rules="genericRules"
          label="Description "
          data-vv-name="Description "
          rows="3"
        ></v-textarea>

        <!-- Accessibility -->
        <div style="color: dimgray;">Employee Access</div>
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
          :items="allEmployees"
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

        <!-- Buttons -->
        <!-- Cancel Button -->
        <v-btn color="white " @click="clearForm" class="ma-2"> <icon class="mr-1" name="ban"></icon>Cancel </v-btn>

        <!-- Submit Button -->
        <v-btn outlined class="ma-2" color="success" :loading="submitting" @click="submit" :disabled="!valid">
          <icon class="mr-1" name="save"></icon>Submit
        </v-btn>
        <!-- End Buttons -->
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import dateUtils from '@/shared/dateUtils';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
  this.customAccess = [];
} // clearForm

/**
 * Formats a date.
 *
 * @param date - date to format
 * @return Date - formatted date
 */
function formatDate(date) {
  return dateUtils.formatDate(date);
} // formatDate

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
 * Checks if a value is empty. Returns true if the value is null or a single character space String.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return value == null || value === ' ' || value === '';
} // isEmpty

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
 * Parse a date to isoformat (YYYY-MM-DD).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
function parseDate(date) {
  return dateUtils.parseDate(date);
} // parseDate

/**
 * Removes a category from the list of expense type categories.
 *
 * @param category - category to remove
 */
function removeCategory(category) {
  this.model.categories.splice(this.model.categories.indexOf(category), 1);
  this.model.categories = [...this.model.categories];
} // removeCategory

/**
 * Submits an expense type.
 */
async function submit() {
  this.submitting = true; // set loading status to true

  // Add a typed-pending category if exists and not already included
  if (!this.isEmpty(this.categoryInput) && !this.model.categories.includes(this.categoryInput)) {
    this.model.categories.push(this.categoryInput);
  }

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
} // submit

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and sets all employees.
 */
async function created() {
  // get all employees for access list
  let employees = await api.getItems(api.EMPLOYEES);
  let allEmployees = [];
  _.forEach(employees, (employee) => {
    if (employee.workStatus > 0) {
      allEmployees.push({
        value: employee.id,
        text: `${employee.firstName} ${employee.lastName}`
      });
    }
  });
  allEmployees = _.sortBy(allEmployees, ['text']);
  this.allEmployees = allEmployees;
  this.clearForm();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      allEmployees: null,
      budgetRules: [
        (v) => !!v || 'Budget amount is required',
        (v) => parseFloat(v, 10) > 0 || 'Budget must be greater than 0.',
        (v) =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Budget amount must be a number with two decimal digits.'
      ],
      categoryInput: null, // category combobox input
      customAccess: [],
      dateRules: [
        (v) => !!v || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ],
      deleting: false,
      endDateFormatted: null,
      genericRules: [(v) => !!v || 'This field is required'],
      startDateFormatted: null,
      submitting: false,
      valid: false
    };
  },
  methods: {
    clearForm,
    formatDate,
    isAllSelected,
    isCustomSelected,
    isEmpty,
    isFullSelected,
    isFullTimeSelected,
    parseDate,
    removeCategory,
    submit
  },
  props: ['model'], // expense type to be created/updated
  watch: {
    'model.accessibleBy': function (val) {
      if (!this.submitting) {
        if (!['ALL', 'FULL TIME', 'FULL', 'CUSTOM'].includes(val)) {
          // set employee access form field when populating form with an existing expense type
          // filter out employees that do not have access
          this.customAccess = _.filter(this.allEmployees, (employee) => {
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
    'model.categories': function (val) {
      if (val.length > 10) {
        this.$nextTick(() => this.model.categories.pop());
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

<style>
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
