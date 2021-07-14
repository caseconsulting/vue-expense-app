<template>
  <div>
    <!-- Experience in IC -->
    <div style="border: 1px solid grey" class="pt-3 pb-1 px-5">
      <!-- Experience in IC Header -->
      <div class="pb-2">
        <b>Experience in IC:</b>
        <!-- Info Tooltip Message -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" class="pl-2 pb-2" small>info</v-icon>
          </template>
          <span>Date ranges are inclusive. Overlapping months will add extended time to IC experience</span>
        </v-tooltip>
      </div>

      <!-- Loop Time Frames -->
      <div v-for="(timeFrame, index) in editedJobExperienceInfo.icTimeFrames" :key="index">
        <!-- Range -->
        <v-menu
          v-model="timeFrame.showRangeMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              ref="formFields"
              :value="formatRange(timeFrame.range)"
              :rules="requiredRules"
              label="Date Range"
              prepend-icon="date_range"
              readonly
              v-bind="attrs"
              v-on="on"
              append-outer-icon="delete"
              @click:append-outer="deleteICTimeFrame(index)"
            ></v-text-field>
          </template>
          <v-date-picker v-model="timeFrame.range" no-title type="month" range></v-date-picker>
        </v-menu>
        <!-- End Range -->
      </div>
      <!-- End Loop TimeFrames -->

      <!-- Button to Add IC Time Frame -->
      <div align="center" class="pt-2 pb-4">
        <v-btn @click="addICTimeFrame()" depressed outlined small>Add a Time Frame</v-btn>
      </div>
    </div>
    <!-- End Experience in IC -->

    <!-- Case Info -->
    <div style="border: 1px solid grey" class="pt-2 pb-1 px-5">
      <!-- Company Name -->
      <v-text-field label="Company" data-vv-name="Company" readonly value="Case Consulting"></v-text-field>

      <!-- Job Position -->
      <v-text-field
        v-model="editedJobExperienceInfo.jobRole"
        readonly
        label="Position"
        data-vv-name="Position"
      ></v-text-field>

      <v-row class="px-3 py-3">
        <!-- Start Date -->
        <v-text-field
          :value="formatDate(editedJobExperienceInfo.hireDate)"
          label="Start Date"
          prepend-icon="event_available"
          readonly
        ></v-text-field>
        <!-- End Start Date -->
      </v-row>
    </div>
    <!-- End Case Info -->

    <!-- Loop Jobs -->
    <div
      v-for="(company, compIndex) in editedJobExperienceInfo.companies"
      style="border: 1px solid grey"
      class="pt-3 pb-1 px-5"
      :key="'company: ' + company.companyName + compIndex"
    >
      <!-- Company Name -->
      <v-combobox
        ref="formFields"
        :id="'comp-' + compIndex"
        v-model.trim="company.companyName"
        :rules="requiredRules"
        :items="companyDropDown"
        label="Company"
        data-vv-name="Company"
        append-outer-icon="delete"
        @click:append-outer="deleteCompany(compIndex)"
      >
      </v-combobox>
      <div v-for="(position, index) in company.positions" :key="index">
        <!-- Job Position -->
        <v-combobox
          ref="formFields"
          :id="'pos-field-' + compIndex + '-' + index"
          v-model.trim="position.title"
          :rules="requiredRules"
          label="Position"
          data-vv-name="Position"
          append-outer-icon="delete"
          @click:append-outer="deletePosition(compIndex, index)"
        ></v-combobox>
        <v-row>
          <v-col cols="12" sm="6" md="12" lg="6" class="pt-3">
            <!-- Start Date -->
            <v-menu
              v-model="position.showStartMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :id="'start-field-' + compIndex + '-' + index"
                  ref="formFields"
                  :value="position.startDate | formatDate"
                  label="Start Date"
                  hint="MM/DD/YYYY format"
                  v-mask="'##/##/####'"
                  prepend-icon="event_available"
                  :rules="[dateRules[0], dateRules[1], dateRules[2], dateOrderRule(compIndex, index)]"
                  v-bind="attrs"
                  v-on="on"
                  @blur="position.startDate = parseEventDate($event)"
                  @focus="setIndices(compIndex, index)"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="position.startDate"
                :max="position.endDate"
                no-title
                @input="position.showStartMenu = false"
              ></v-date-picker>
            </v-menu>
            <!-- End Start Date -->
          </v-col>
          <v-col cols="12" sm="6" md="12" lg="6" class="pt-3">
            <!-- End Date -->
            <v-menu
              v-model="position.showEndMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :id="'end-field-' + compIndex + '-' + index"
                  ref="formFields"
                  :disabled="position.presentDate"
                  :value="position.endDate | formatDate"
                  label="End Date"
                  prepend-icon="event_busy"
                  :rules="[
                    dateOptionalRules[0],
                    dateOptionalRules[1],
                    dateOrderRule(compIndex, index),
                    endDatePresentRule(compIndex, index)
                  ]"
                  hint="MM/DD/YYYY format"
                  v-mask="'##/##/####'"
                  v-bind="attrs"
                  v-on="on"
                  clearable
                  @click:clear="position.endDate = null"
                  @blur="position.endDate = parseEventDate($event)"
                  @focus="setIndices(compIndex, index)"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="position.endDate"
                :min="position.startDate"
                no-title
                @input="position.showEndMenu = false"
              ></v-date-picker>
            </v-menu>
            <!-- End End Date -->
          </v-col>
          <v-col></v-col>
          <v-col>
            <v-layout justify-start class="pl-2">
              <v-checkbox
                class="ma-0 pa-0"
                v-model="position.presentDate"
                :label="`Present`"
                @click="position.endDate = null"
              ></v-checkbox>
            </v-layout>
          </v-col>
        </v-row>
      </div>
      <div class="pb-4" align="center">
        <v-btn @click="addPosition(compIndex)" :id="'add-pos-' + compIndex" elevation="2"
          ><v-icon class="pr-1">add</v-icon>Position</v-btn
        >
      </div>
      <!-- <v-row v-if="!hasEndDatesFilled(compIndex)" class="py-5 caption text--darken-2 grey--text">
        Note that leaving the end date blank means you are currently working at that position.
      </v-row> -->
    </div>
    <!-- End Loop Jobs -->

    <!-- Button to Add Jobs -->
    <div class="pt-4" align="center">
      <v-btn @click="addCompany()" elevation="2" id="add-job"><v-icon class="pr-1">add</v-icon>Job</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { isEmpty, formatDate, parseDate } from '@/utils/utils';
import { mask } from 'vue-the-mask';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  window.EventBus.$emit('created', 'jobExperience'); // emit education tab was created
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.populateDropDowns(); // get autocomplete drop down data
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds an IC Time Frame.
 */
function addICTimeFrame() {
  this.editedJobExperienceInfo.icTimeFrames.push({
    range: [],
    showRangeMenu: false
  });
} // addICTimeFrame

/**
 * Adds an empty company to the bottom of the form list.
 */
function addCompany() {
  this.editedJobExperienceInfo.companies.push({
    companyName: '',
    positions: [
      {
        title: '',
        endDate: null,
        startDate: null,
        showStartMenu: false,
        showEndMenu: false,
        presentDate: false
      }
    ]
  });
} // addCompany

/**
 * Adds a position form underneath the respective company.
 *
 * @param compIndex - company to place the position under
 */
function addPosition(compIndex) {
  this.editedJobExperienceInfo.companies[compIndex].positions.push({
    title: '',
    endDate: null,
    startDate: null,
    showStartMenu: false,
    showEndMenu: false,
    presentDate: false
  });
}

/**
 * Deletes an IC Time Frame.
 *
 * @param index - array index of IC time frame to delete
 */
function deleteICTimeFrame(index) {
  this.editedJobExperienceInfo.icTimeFrames.splice(index, 1);
} // deleteICTimeFrame

/**
 * Deletes a Company and its nested positions.
 *
 * @param index - array index of company to delete
 */
function deleteCompany(index) {
  this.editedJobExperienceInfo.companies.splice(index, 1);
}

/**
 * Deletes a single position. Will delete the entire company entry if there are no positions
 * remaining
 *
 * @param compIndex - index of the company form
 * @param posIndex - index of the position form
 */
function deletePosition(compIndex, posIndex) {
  if (this.editedJobExperienceInfo.companies[compIndex].positions.length === 1) {
    this.editedJobExperienceInfo.companies.splice(compIndex, 1);
  } else {
    this.editedJobExperienceInfo.companies[compIndex].positions.splice(posIndex, 1);
  }
}

/**
 * Format date range as 'Month YYYY' - 'Month YYYY' in chronological order.
 *
 * @param range - Array of String dates in 'Month YYYY' format
 * @return String - 'Month YYYY' - 'Month YYYY' date range
 */
function formatRange(range) {
  if (_.isEmpty(range)) {
    return null;
  }

  let start = moment(range[0], 'YYYY-MM');
  if (range[1]) {
    // end date selected
    let end = moment(range[1], 'YYYY-MM');
    if (start.isAfter(end)) {
      // start date is listed after end date
      return `${end.format('MMMM YYYY')} - ${start.format('MMMM YYYY')}`;
    } else {
      // start date is listed before end date
      return `${start.format('MMMM YYYY')} - ${end.format('MMMM YYYY')}`;
    }
  } else {
    // no end date selected
    return `${start.format('MMMM YYYY')} - Present`;
  }
} // formatRange

/**
 * Checks if the current company has any positions without an end date
 *
 * @param index The index of the company in the editedJobExperienceInfo.companies
 * @return whether or not the positions for that company have all their end dates filled
 */
function hasEndDatesFilled(index) {
  let hasEndDatesFilled = true;
  _.forEach(this.editedJobExperienceInfo.companies[index].positions, (position) => {
    hasEndDatesFilled &= !!position.endDate;
  });

  return hasEndDatesFilled;
}

/**
 * Parse the date after losing focus.
 */
function parseEventDate() {
  return parseDate(event.target.value);
} //parseEventDate

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesJobs = _.map(this.employees, (employee) => employee.jobs); //extract jobs
  employeesJobs = _.compact(employeesJobs); //remove falsey values
  // loop employees
  _.forEach(employeesJobs, (jobs) => {
    // loop jobs
    _.forEach(jobs, (job) => {
      this.companyDropDown.push(job.company); // add company name
    });
  });
} // populateDropDowns

/**
 * Sets the indexes for purposes of validating date fields.
 *
 * @param companyIndex - The index of the company
 * @param positionIndex - The index of the position
 */
function setIndices(companyIndex, positionIndex) {
  this.companyIndex = companyIndex;
  this.positionIndex = positionIndex;
}

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let hasErrors = false;
  let errorCount = 0;
  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    //this.$refs.formFields.validate();
    _.forEach(this.$refs.formFields, (field) => {
      field.validate();
      if (!field.validate()) {
        errorCount++;
      }
    });

    if (errorCount > 0) {
      hasErrors = true;
    }
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }
  window.EventBus.$emit('doneValidating', 'jobExperience', this.editedJobExperienceInfo); // emit done validating
  window.EventBus.$emit('jobExperienceStatus', [hasErrors, errorCount]); // emit error status
} // validateFields

export default {
  created,
  data() {
    return {
      companyDropDown: [], // autocomplete company name options
      companyIndex: 0,
      positionIndex: 0,
      dateOrderRule: (compIndex, posIndex) => {
        if (this.editedJobExperienceInfo !== undefined) {
          let position = this.editedJobExperienceInfo.companies[compIndex].positions[posIndex];
          return !isEmpty(position.endDate) && moment(position.endDate) && position.startDate
            ? moment(position.endDate).add(1, 'd').isAfter(moment(position.startDate)) ||
                'End date must be at or after start date'
            : true;
        } else {
          return true;
        }
      },
      dateOptionalRules: [
        //end date validation
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        },
        (v) => (!isEmpty(v) ? moment(v, 'MM/DD/YYYY').isValid() || 'Date must be valid' : true)
      ], // rules for an optional date
      dateRules: [
        (v) => {
          return !isEmpty(v) || 'Date required';
        },
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => moment(v, 'MM/DD/YYYY').isValid() || 'Date must be valid'
      ], // rules for an optional date
      endDatePresentRule: (compIndex, posIndex) => {
        if (this.editedJobExperienceInfo !== undefined) {
          let position = this.editedJobExperienceInfo.companies[compIndex].positions[posIndex];
          if (position.presentDate == false && isEmpty(position.endDate)) {
            return 'End Date is required';
          } else {
            return true;
          }
        } else {
          return false;
        }
      },
      editedJobExperienceInfo: _.cloneDeep(this.model), //edited job experience info
      requiredRules: [(v) => !isEmpty(v) || 'This field is required'] // rules for required fields
    };
  },
  directives: { mask },
  filters: {
    formatDate
  },
  methods: {
    addICTimeFrame,
    addCompany,
    addPosition,
    deleteICTimeFrame,
    deleteCompany,
    deletePosition,
    formatDate,
    hasEndDatesFilled,
    parseDate,
    parseEventDate,
    formatRange,
    isEmpty,
    populateDropDowns,
    setIndices,
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
