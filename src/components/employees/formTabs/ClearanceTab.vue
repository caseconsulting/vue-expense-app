<template>
  <div>
    <!-- Loop Clearances -->
    <div v-for="(clearance, cIndex) in editedClearances" class="gray-border ma-0 pt-3 pb-1 px-5" :key="cIndex">
      <!-- Type of Clearance -->
      <v-combobox
        ref="formFields"
        v-model="clearance.type"
        :rules="[...getRequiredRules(), duplicateClearanceTypes(cIndex)]"
        :items="clearanceTypeDropDown"
        label="Type"
        data-vv-name="Type"
        clearable
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
                :value="clearance.grantedDate | formatDate"
                label="Granted Date"
                prepend-icon="event_available"
                clearable
                :rules="[...getDateOptionalRules(), dateGrantedRules(cIndex)]"
                hint="MM/DD/YYYY format"
                v-mask="'##/##/####'"
                v-bind="attrs"
                v-on="on"
                @click:clear="clearance.grantedDate = null"
                @blur="clearance.grantedDate = parseEventDate($event)"
                @input="clearance.showGrantedMenu = false"
                @focus="clearanceElement = clearance"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="clearance.grantedDate"
              :min="clearance.submissionDate"
              no-title
              @input="clearance.showGrantedMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <!-- End Granted Date -->
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
                :value="clearance.submissionDate | formatDate"
                label="Submission Date"
                prepend-icon="event_note"
                clearable
                :rules="[...getDateOptionalRules(), dateSubmissionRules(cIndex)]"
                hint="MM/DD/YYYY format"
                v-mask="'##/##/####'"
                v-bind="attrs"
                v-on="on"
                @click:clear="clearance.submissionDate = null"
                @blur="clearance.submissionDate = parseEventDate($event)"
                @input="clearance.showSubmissionMenu = false"
                @focus="clearanceElement = clearance"
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

      <!-- Badge Number -->
      <v-text-field
        v-model="clearance.badgeNum"
        prepend-icon="portrait"
        counter="5"
        label="Badge Number"
        clearable
        @blur="capitalizeBadges(clearance)"
      ></v-text-field>
      <!-- End Badge Number -->

      <!-- Badge Expiration Date -->
      <v-menu
        v-model="clearance.showBadgeMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            ref="formFields"
            :value="clearance.badgeExpirationDate | formatDate"
            label="Badge Expiration Date"
            prepend-icon="event_busy"
            clearable
            :rules="[...getDateOptionalRules(), dateBadgeRules(cIndex)]"
            hint="MM/DD/YYYY format"
            v-mask="'##/##/####'"
            v-bind="attrs"
            v-on="on"
            @click:clear="clearance.badgeExpirationDate = null"
            @blur="clearance.badgeExpirationDate = parseEventDate($event)"
            @input="clearance.showBadgeMenu = false"
            @focus="clearanceElement = clearance"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="clearance.badgeExpirationDate"
          :min="minExpiration(cIndex)"
          no-title
          @input="clearance.showBadgeMenu = false"
        ></v-date-picker>
      </v-menu>
      <!-- End Badge Expiration Dxate -->

      <!-- Bi Dates -->
      <v-menu
        ref="biMenu"
        v-model="clearance.showBIMenu"
        :close-on-content-click="false"
        :return-value.sync="clearance.biDates"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-combobox
            :value="clearance.biDates | formatDates"
            multiple
            label="BI Dates"
            prepend-icon="event"
            small-chips
            deletable-chips
            readonly
            v-bind="attrs"
            v-on="on"
            @click:clear="clearance.biDates = []"
          >
            <template #selection="{ item }">
              <v-chip close @click:close="remove(item, clearance)">{{ item }}</v-chip>
            </template>
          </v-combobox>
        </template>
        <v-date-picker v-model="clearance.biDates" :min="clearance.submissionDate" multiple no-title scrollable>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="clearance.showBIMenu = false">Cancel</v-btn>
          <v-btn text color="primary" @click="$refs.biMenu[cIndex].save(clearance.biDates)">OK</v-btn>
        </v-date-picker>
      </v-menu>
      <!-- End Bi Dates -->

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
            :value="clearance.adjudicationDates | formatDates"
            multiple
            label="Adjudication Dates"
            prepend-icon="event"
            clearable
            readonly
            v-bind="attrs"
            v-on="on"
            @click:clear="clearance.adjudicationDates = []"
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
            :value="clearance.polyDates | formatDates"
            multiple
            label="Poly Dates"
            prepend-icon="event"
            clearable
            readonly
            v-bind="attrs"
            v-on="on"
            @click:clear="clearance.polyDates = []"
            @input="clearance.showPolyMenu = false"
          ></v-combobox>
        </template>
        <v-date-picker v-model="clearance.polyDates" :min="clearance.submissionDate" multiple no-title scrollable>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="clearance.showPolyMenu = false">Cancel</v-btn>
          <v-btn text color="primary" @click="$refs.polyMenu[cIndex].save(clearance.polyDates)">OK</v-btn>
        </v-date-picker>
      </v-menu>
      <!-- End Poly Dates -->
      <div align="center">
        <v-tooltip bottom slot="append-outer">
          <template v-slot:activator="{ on }">
            <v-btn text icon v-on="on" @click="deleteClearance(cIndex)"
              ><v-icon class="case-gray">delete</v-icon></v-btn
            >
          </template>
          <span>Delete Clearance</span>
        </v-tooltip>
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
import _ from 'lodash';
import { getDateOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { formatDate, parseDate, isEmpty } from '@/utils/utils';
import { mask } from 'vue-the-mask';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

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
  this.employees = this.$store.getters.employees; // get all employees
  this.populateDropDowns(); // get autocomplete drop down data
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function remove(item, clearance) {
  console.log(item);
  console.log(this.editedClearances[clearance]);
  this.editedClearances[clearance] = clearance.biDates.filter((date) => {
    return date !== item;
  });
  console.log(this.editedClearances[clearance]);
}

/**
 * Adds a clearance.
 */
function addClearance() {
  if (!this.editedClearances) this.editedClearances = [];
  this.editedClearances.push({
    adjudicationDates: [],
    biDates: [],
    badgeExpirationDate: null,
    grantedDate: null,
    polyDates: [],
    showAdjudicationMenu: false,
    showBadgeMenu: false,
    showBIMenu: false,
    showGrantedMenu: false,
    showPolyMenu: false,
    showSubmissionMenu: false,
    submissionDate: null,
    type: null
  });
} // addClearance

/**
 * Capitalize all badge numbers.
 */
function capitalizeBadges(clearance) {
  clearance.badgeNum = clearance.badgeNum.toUpperCase();
} // capitalizeBadges

/**
 * Deletes a clearance.
 *
 * @param cIndex - array index of clearance to remove.
 */
function deleteClearance(cIndex) {
  this.editedClearances.splice(cIndex, 1);
} // deleteClearance

/**
 * Checks to see if the first date is at or after the second date, if not, it uses an error message.
 *
 * @param firstDate - The date that should come first
 * @param secondDate - The date that should come second
 * @param errMessage - The message to display if the dates are incorrectly ordered
 * @return Boolean - True if the first date is at or after the second date
 */
function isAfter(firstDate, secondDate, errMessage) {
  return !this.isEmpty(firstDate) && secondDate
    ? moment(firstDate).add(1, 'd').isAfter(moment(secondDate)) || errMessage
    : true;
} // isAfter

/**
 * Checks to see if the first date is at or before the second date, if not, it uses an error message.
 *
 * @param firstDate - The date that should come first
 * @param secondDate - The date that should come second
 * @param errMessage - The message to display if the dates are incorrectly ordered
 * @return boolean - True if the first date is at or before the second date
 */
function isBefore(firstDate, secondDate, errMessage) {
  return !this.isEmpty(firstDate) && secondDate
    ? moment(firstDate).isBefore(moment(secondDate).add(1, 'd')) || errMessage
    : true;
} // isBefore

/**
 * Return the maximum available date to be selected for submission date. Returns the granted date if it exists.
 * Returns null if the granted date doesn't exist.
 *
 * @param cIndex - array index of clearance
 * @return string - maximum (latest possible) date
 */
function maxSubmission(cIndex) {
  let max;
  if (this.editedClearances[cIndex].grantedDate) {
    // submission date is before granted date
    max = moment(this.editedClearances[cIndex].grantedDate, ISOFORMAT);
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
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return this.parseDate(event.target.value);
} // parseEventDate

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
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });
  window.EventBus.$emit('doneValidating', 'clearance', this.editedClearances); // emit done validating and sends edited data back to parent
  window.EventBus.$emit('clearanceStatus', errorCount); // emit error status
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                     FILTERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Formats multiple dates at once in MM/DD/YYYY format.
 * @return Array - The array of formatted dates
 */
function formatDates(array) {
  let formattedDates = [];
  array.forEach((date) => {
    formattedDates.push(formatDate(date));
  });
  return formattedDates;
} // formatDates

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      clearanceElement: {},
      clearanceTypeDropDown: [], // autocomplete clearance type options
      dateBadgeRules: (index) => {
        let currClearance = this.editedClearances[index];
        return currClearance.grantedDate && currClearance.badgeExpirationDate && currClearance.submissionDate
          ? (moment(currClearance.badgeExpirationDate).isAfter(moment(currClearance.grantedDate)) &&
              moment(currClearance.badgeExpirationDate).isAfter(moment(currClearance.submissionDate))) ||
              'Badge expiration date must come after grant and submission date'
          : true;
      },
      dateSubmissionRules: (index) => {
        let currClearance = this.editedClearances[index];
        return currClearance.grantedDate && currClearance.submissionDate
          ? moment(currClearance.submissionDate).isBefore(moment(currClearance.grantedDate)) ||
              'Submission date must be before grant date'
          : true;
      },
      editedClearances: _.cloneDeep(this.model), // stores edited clearances info
      dateGrantedRules: (index) => {
        let currClearance = this.editedClearances[index];
        return currClearance.grantedDate && currClearance.submissionDate
          ? moment(currClearance.grantedDate).isAfter(moment(currClearance.submissionDate)) ||
              'Grant date must be after the submission date'
          : true;
      },
      duplicateClearanceTypes: (cIndex) => {
        let clearanceNames = _.map(this.editedClearances, (clearance) => clearance.type);
        let clearanceName = clearanceNames[cIndex];
        clearanceNames.splice(cIndex, 1);
        return !clearanceNames.includes(clearanceName) || 'Duplicate clearance name';
      },
      requiredRules: [(v) => !this.isEmpty(v) || 'This field is required'] // rules for a required field
    };
  },
  directives: { mask },
  filters: {
    formatDate,
    formatDates
  },
  methods: {
    remove,
    addClearance,
    capitalizeBadges,
    formatDate,
    deleteClearance,
    getDateOptionalRules,
    getRequiredRules,
    isAfter,
    isBefore,
    isEmpty,
    maxSubmission,
    minExpiration,
    parseDate,
    parseEventDate,
    populateDropDowns,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>
