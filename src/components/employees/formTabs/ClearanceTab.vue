<template>
  <div>
    <!-- Loop Clearances -->
    <div
      v-for="(clearance, cIndex) in editedClearances"
      style="border: 1px solid grey"
      class="pt-3 pb-1 px-5"
      :key="cIndex"
    >
      <!-- Type of Clearance -->
      <v-combobox
        ref="formFields"
        v-model="clearance.type"
        :rules="requiredRules"
        :items="clearanceTypeDropDown"
        label="Type"
        data-vv-name="Type"
        append-outer-icon="delete"
        @click:append-outer="deleteClearance(cIndex)"
      >
      </v-combobox>

      <v-row class="py-3">
        <!-- Granted Date -->
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <v-menu
            v-model="clearance.showGrantedMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="formatDateDashToSlash(clearance.grantedDate)"
                label="Granted Date"
                prepend-icon="event_available"
                clearable
                :rules="dateOptionalRules"
                readonly
                v-bind="attrs"
                v-on="on"
                @click:clear="clearance.grantedDate = null"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="clearance.grantedDate"
              :max="clearance.expirationDate"
              :min="clearance.submissionDate"
              no-title
              @input="clearance.showGrantedMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <!-- End Granted Date -->
        <!-- Expiration Date -->
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <v-menu
            v-model="clearance.showExpirationMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="formatDateDashToSlash(clearance.expirationDate)"
                label="Expiration Date"
                prepend-icon="event_busy"
                clearable
                :rules="dateOptionalRules"
                readonly
                v-bind="attrs"
                v-on="on"
                @click:clear="clearance.expirationDate = null"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="clearance.expirationDate"
              :min="minExpiration(cIndex)"
              no-title
              @input="clearance.showExpirationMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <!-- End Expiration Date -->
        <!-- Submission Date -->
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <v-menu
            v-model="clearance.showSubmissionMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="formatDateDashToSlash(clearance.submissionDate)"
                label="Submission Date"
                prepend-icon="event_note"
                clearable
                :rules="dateOptionalRules"
                readonly
                v-bind="attrs"
                v-on="on"
                @click:clear="clearance.submissionDate = null"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="clearance.submissionDate"
              :max="maxSubmission(cIndex)"
              no-title
              @input="clearance.showSubmissionMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <!-- End Submission Date -->
      </v-row>

      <!-- Poly Dates -->
      <v-menu
        ref="polyMenu"
        v-model="clearance.showPolyMenu"
        :close-on-content-click="false"
        :return-value.sync="clearance.polyDates"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-combobox
            v-model="clearance.polyDates"
            multiple
            chips
            small-chips
            label="Poly Dates"
            prepend-icon="event"
            clearable
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-combobox>
        </template>
        <v-date-picker v-model="clearance.polyDates" :min="clearance.submissionDate" multiple no-title scrollable>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="clearance.showPolyMenu = false">Cancel</v-btn>
          <v-btn text color="primary" @click="$refs.polyMenu[cIndex].save(clearance.polyDates)">OK</v-btn>
        </v-date-picker>
      </v-menu>
      <!-- End Poly Dates -->

      <!-- Adjudication Dates -->
      <v-menu
        ref="adjudicationMenu"
        v-model="clearance.showAdjudicationMenu"
        :close-on-content-click="false"
        :return-value.sync="clearance.adjudicationDates"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-combobox
            v-model="clearance.adjudicationDates"
            multiple
            chips
            small-chips
            label="Adjudication Dates"
            prepend-icon="event"
            clearable
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-combobox>
        </template>
        <v-date-picker
          v-model="clearance.adjudicationDates"
          :min="clearance.submissionDate"
          multiple
          no-title
          scrollable
        >
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="clearance.showAdjudicationMenu = false">Cancel</v-btn>
          <v-btn text color="primary" @click="$refs.adjudicationMenu[cIndex].save(clearance.adjudicationDates)"
            >OK</v-btn
          >
        </v-date-picker>
      </v-menu>
      <!-- End Adjudication Dates -->

      <!-- Loop BI Dates -->
      <div v-for="(bi, biIndex) in clearance.biDates" :key="biIndex">
        <!-- Range -->
        <v-menu
          v-model="bi.showRangeMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              ref="formFields"
              :value="formatRange(bi.range)"
              :rules="requiredRules"
              label="BI Dates"
              prepend-icon="date_range"
              readonly
              v-bind="attrs"
              v-on="on"
              append-outer-icon="delete"
              @click:append-outer="deleteBIDate(cIndex, biIndex)"
            ></v-text-field>
          </template>
          <v-date-picker v-model="bi.range" :min="clearance.submissionDate" no-title range></v-date-picker>
        </v-menu>
        <!-- End Range -->
      </div>
      <!-- End Loop BI Dates -->
      <div align="center" class="pt-2 pb-4">
        <v-btn @click="addBIDates(cIndex)" depressed outlined small>Add BI Dates</v-btn>
      </div>
    </div>
    <!-- End Loop Clearances -->

    <!-- Button to add Clearances -->
    <div class="pt-4" align="center">
      <v-btn @click="addClearance" elevation="2"><v-icon class="pr-1">add</v-icon>Clearance</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import moment from 'moment';
import _ from 'lodash';
import { formatDateDashToSlash, formatDateSlashToDash, isEmpty } from '@/utils/utils';

const ISOFORMAT = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  window.EventBus.$emit('created', 'clearance'); // emit clearance tab was created
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.populateDropDowns(); // get autocomplete drop down data
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add BI dates to a clearance
 *
 * @param cIndex - array index of clearance to add the BI date to.
 */
function addBIDates(cIndex) {
  this.editedClearances[cIndex].biDates.push({
    range: [],
    showRangeMenu: false
  });
} // addBIDates

/**
 * Adds a clearance.
 */
function addClearance() {
  this.editedClearances.push({
    adjudicationDates: [],
    biDates: [],
    expirationDate: null,
    grantedDate: null,
    polyDates: [],
    showAdjudicationMenu: false,
    showExpirationMenu: false,
    showGrantedMenu: false,
    showPolyMenu: false,
    showSubmissionMenu: false,
    submissionDate: null,
    type: null
  });
} // addClearance

/**
 * Deletes a BI Date from a clearance.
 *
 * @param cIndex - array index of clearance to remove the BI date from.
 * @param biIndex - array index of BI date to remove.
 */
function deleteBIDate(cIndex, biIndex) {
  this.editedClearances[cIndex].biDates.splice(biIndex, 1);
} // deleteBIDate

/**
 * Deletes a clearance.
 *
 * @param cIndex - array index of clearance to remove.
 */
function deleteClearance(cIndex) {
  this.editedClearances.splice(cIndex, 1);
} // deleteClearance

/**
 * Format date range as 'MM/DD/YYYY' - 'MM/DD/YYYY' in chronological order.
 *
 * @param range - Array of String dates in isoformat
 * @return String - 'MM/DD/YYYY' - 'MM/DD/YYYY' date range
 */
function formatRange(range) {
  if (_.isEmpty(range)) {
    return null;
  }

  let start = moment(range[0], ISOFORMAT);
  if (range[1]) {
    // end date selected
    let end = moment(range[1], ISOFORMAT);
    if (start.isAfter(end)) {
      // start date is listed after end date
      return `${end.format('MM/DD/YYYY')} - ${start.format('MM/DD/YYYY')}`;
    } else {
      // start date is listed before end date
      return `${start.format('MM/DD/YYYY')} - ${end.format('MM/DD/YYYY')}`;
    }
  } else {
    // no end date selected
    return `${start.format('MM/DD/YYYY')} - Present`;
  }
} // formatRange

/**
 * Return the maximum available date to be selected for submission date. Returns the granted date if it exists.
 * Returns the expiration date if the expiration date exists and the granted date does not exists. Returns null if
 * neither the granted date or expiration date exist.
 *
 * @param cIndex - array index of clearance
 * @return string - maximum (latest possible) date
 */
function maxSubmission(cIndex) {
  let max;
  if (this.editedClearances[cIndex].grantedDate) {
    // submission date is before granted date
    max = moment(this.editedClearances[cIndex].grantedDate, ISOFORMAT);
  } else if (this.editedClearances[cIndex].expirationDate) {
    // submission date is before expiration date
    max = moment(this.editedClearances[cIndex].expirationDate, ISOFORMAT);
  }

  // check submission date is before any poly dates
  if (!_.isEmpty(this.editedClearances[cIndex].polyDates)) {
    // poly dates exist
    let earliest = moment(
      _.first(
        // get earliest poly date
        _.sortBy(this.editedClearances[cIndex].polyDates, (date) => {
          // sort poly dates
          return moment(date, ISOFORMAT);
        })
      )
    );
    if (earliest.isBefore(max)) {
      // poly date is earliest date
      max = earliest; // update max date
    }
  }

  // check submission date is before any adjudication dates
  if (!_.isEmpty(this.editedClearances[cIndex].adjudicationDates)) {
    // adjudication dates exist
    let earliest = moment(
      _.first(
        // get earliest adjudication date
        _.sortBy(this.editedClearances[cIndex].adjudicationDates, (date) => {
          // sort adjudication dates
          return moment(date, ISOFORMAT);
        })
      )
    );
    if (earliest.isBefore(max)) {
      // adjudication date is earliest date
      max = earliest; // update max date
    }
  }

  return max ? max.format(ISOFORMAT) : null;
} // maxSubmission

/**
 * Return the minimum available date to be selected for expiration date. Returns the granted date if it exists.
 * Returns the submission date if the submission date exists and the granted date does not exists. Returns null if
 * neither the granted date or submission date exist.
 *
 * @param cIndex - array index of clearance
 * @return string - minimum (earliest possible) date
 */
function minExpiration(cIndex) {
  if (this.editedClearances[cIndex].grantedDate) {
    return this.editedClearances[cIndex].grantedDate;
  } else if (this.editedClearances[cIndex].submissionDate) {
    return this.editedClearances[cIndex].submissionDate;
  }
} // minExpiration

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesClearances = _.map(this.employees, (employee) => employee.clearances); // extract clearances
  employeesClearances = _.compact(employeesClearances); //remove falsey values
  // loop employees
  _.forEach(employeesClearances, (clearances) => {
    // loop certifications
    _.forEach(clearances, (clearance) => {
      this.clearanceTypeDropDown.push(clearance.type); // add clearance type
    });
  });
} // populateDropDowns

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let hasErrors = false;

  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    let error = _.find(this.$refs.formFields, (field) => {
      return !field.validate();
    });
    hasErrors = _.isNil(error) ? false : true;
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }

  window.EventBus.$emit('doneValidating', 'clearance', this.editedClearances); // emit done validating and sends edited data back to parent
  window.EventBus.$emit('clearanceStatus', hasErrors); // emit error status
} // validateFields

export default {
  created,
  data() {
    return {
      clearanceTypeDropDown: [], // autocomplete clearance type options
      dateOptionalRules: [
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for an optional date
      dateRules: [
        (v) => !isEmpty(v) || 'Date required',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for a required date
      editedClearances: _.cloneDeep(this.model), // stores edited clearances info
      requiredRules: [(v) => !isEmpty(v) || 'This field is required'] // rules for a required field
    };
  },
  methods: {
    addBIDates,
    addClearance,
    deleteBIDate,
    deleteClearance,
    formatDateSlashToDash,
    formatDateDashToSlash,
    formatRange,
    isEmpty,
    maxSubmission,
    minExpiration,
    populateDropDowns,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: function (val) {
      if (val) {
        // parent component triggers validation
        this.validateFields();
      }
    }
  }
};
</script>
