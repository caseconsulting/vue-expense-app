<template>
  <div>
    <!-- Loop Clearances -->
    <div
      v-for="(clearance, cIndex) in model.clearances"
      style="border: 1px solid grey;"
      class="pt-3 pb-1 px-5"
      :key="cIndex"
    >
      <!-- Clearance Type -->
      <v-combobox
        v-model="clearance.type"
        :rules="requiredRules"
        :items="clearanceTypeDropDown"
        label="Type"
        data-vv-name="Type"
        append-outer-icon="delete"
        @click:append-outer="deleteClearance(cIndex)"
      >
      </v-combobox>

      <v-row>
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
                :value="formatDate(clearance.grantedDate)"
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
                :value="formatDate(clearance.expirationDate)"
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
                :value="formatDate(clearance.submissionDate)"
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
              :value="formatRange(bi.range)"
              :rules="dateRequired"
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
        <v-btn @click="addBIDates(cIndex)" depressed outlined small color="#3f3f3c">Add BI Dates</v-btn>
      </div>
    </div>
    <!-- End Loop Clearances -->
    <!-- Add Clearance button -->
    <div class="pt-4" align="center">
      <v-btn @click="addClearance"><v-icon class="pr-1">add</v-icon>Clearance</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import moment from 'moment';
import _ from 'lodash';

const ISOFORMAT = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

async function created() {
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.getDropDownInfo();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add BI dates to a clearance
 */
function addBIDates(cIndex) {
  this.model.clearances[cIndex].biDates.push({
    range: [],
    showRangeMenu: false
  });
} // addBIDates

/**
 * Add a clearance to the form.
 */
function addClearance() {
  this.model.clearances.push({
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
 * delete a BI Date from a clearance
 */
function deleteBIDate(cIndex, biIndex) {
  this.model.clearances[cIndex].biDates.splice(biIndex, 1);
} // deleteBIDate

/**
 * delete a clearance from the form
 */
function deleteClearance(cIndex) {
  this.model.clearances.splice(cIndex, 1);
} // deleteClearance

/**
 * format date as MM/DD/YYYY
 */
function formatDate(date) {
  if (!date) {
    return null;
  }
  const [year, month, day] = date.split('-');
  return `${month}/${day}/${year}`;
} // formatDate

/**
 * format date range as 'MM/DD/YYYY' - 'MM/DD/YYYY'
 */
function formatRange(range) {
  if (_.isEmpty(range)) {
    return null;
  }

  let start = moment(range[0], ISOFORMAT);
  if (range[1]) {
    let end = moment(range[1], ISOFORMAT);
    if (start.isAfter(end)) {
      return `${end.format('MM/DD/YYYY')} - ${start.format('MM/DD/YYYY')}`;
    } else {
      return `${start.format('MM/DD/YYYY')} - ${end.format('MM/DD/YYYY')}`;
    }
  } else {
    return `${start.format('MM/DD/YYYY')} - Present`;
  }
} // formatRange

/**
 * Gets information that other employees have filled out.
 */
function getDropDownInfo() {
  let employeesClearances = _.map(this.employees, (employee) => employee.clearances); //extract clearances
  employeesClearances = _.compact(employeesClearances); //remove falsey values
  _.forEach(employeesClearances, (clearances) => {
    _.forEach(clearances, (clearance) => {
      this.clearanceTypeDropDown.push(clearance.type);
    });
  });
} // getDropDownInfo

/**
 * Return the maximum available date to be selected for submission date. Returns the granted date if it exists.
 * Returns the expiration date if the expiration date exists and the granted date does not exists. Returns null if
 * neither the granted date or expiration date exist.
 *
 * @param cIndex - clearance index
 * @return string - maximum date
 */
function maxSubmission(cIndex) {
  let max;
  if (this.model.clearances[cIndex].grantedDate) {
    // submission date is before granted date
    max = moment(this.model.clearances[cIndex].grantedDate, ISOFORMAT);
  } else if (this.model.clearances[cIndex].expirationDate) {
    // submission date is before expiration date
    max = moment(this.model.clearances[cIndex].expirationDate, ISOFORMAT);
  }

  // submission date is before any poly dates
  if (!_.isEmpty(this.model.clearances[cIndex].polyDates)) {
    let earliest = moment(
      _.first(
        _.sortBy(this.model.clearances[cIndex].polyDates, (date) => {
          return moment(date, ISOFORMAT);
        })
      )
    );
    if (earliest.isBefore(max)) {
      max = earliest;
    }
  }

  // submission date is before any adjudication dates
  if (!_.isEmpty(this.model.clearances[cIndex].adjudicationDates)) {
    let earliest = moment(
      _.first(
        _.sortBy(this.model.clearances[cIndex].adjudicationDates, (date) => {
          return moment(date, ISOFORMAT);
        })
      )
    );
    if (earliest.isBefore(max)) {
      max = earliest;
    }
  }

  return max ? max.format(ISOFORMAT) : null;
} // maxSubmission

/**
 * Return the minimum available date to be selected for expiration date. Returns the granted date if it exists.
 * Returns the submission date if the submission date exists and the granted date does not exists. Returns null if
 * neither the granted date or submission date exist.
 *
 * @param cIndex - clearance index
 * @return string - maximum date
 */
function minExpiration(cIndex) {
  if (this.model.clearances[cIndex].grantedDate) {
    return this.model.clearances[cIndex].grantedDate;
  } else if (this.model.clearances[cIndex].submissionDate) {
    return this.model.clearances[cIndex].submissionDate;
  }
} // minExpiration

/**
 * Parse a date to isoformat (YYYY-MM-DD).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
function parseDate(date) {
  if (!date) {
    return null;
  }
  const [month, day, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // parseDate
}

export default {
  created,
  data() {
    return {
      clearanceTypeDropDown: [],
      compareDate: null,
      dateOptionalRules: [
        (v) => {
          return v ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for optional dates
      dateRequired: [(v) => !!v || 'Date required'], // date required
      dateRules: [
        (v) => !!v || 'Date required',
        (v) => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for date
      positionDropDown: [],
      requiredRules: [(v) => !!v || 'This field is required'] // rules for required fields
    };
  },
  methods: {
    addBIDates,
    addClearance,
    deleteBIDate,
    deleteClearance,
    formatDate,
    formatRange,
    getDropDownInfo,
    maxSubmission,
    minExpiration,
    parseDate
  },
  props: ['model']
};
</script>
