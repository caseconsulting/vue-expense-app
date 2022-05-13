<template>
  <div>
    <!-- Experience in IC -->
    <div class="gray-border ma-0 pt-3 pb-1 px-5">
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
              :value="formatRange(timeFrame.range)"
              :rules="getRequiredRules()"
              label="Date Range"
              prepend-icon="date_range"
              readonly
              v-bind="attrs"
              v-on="on"
              clearable
            >
              <v-tooltip top slot="append-outer">
                <template v-slot:activator="{ on }">
                  <v-btn class="pb-3" v-on="on" icon text @click="deleteICTimeFrame(index)"
                    ><v-icon class="case-gray">delete</v-icon></v-btn
                  >
                </template>
                <span>Delete IC Time Frame</span>
              </v-tooltip>
            </v-text-field>
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
    <div class="gray-border ma-0 pt-2 pb-1 px-5">
      <!-- Company Name -->
      <v-text-field label="Company" data-vv-name="Company" disabled value="Case Consulting"></v-text-field>

      <!-- Job Position -->
      <v-text-field
        v-model="editedJobExperienceInfo.jobRole"
        disabled
        label="Position"
        data-vv-name="Position"
      ></v-text-field>

      <v-row class="px-3 py-3">
        <!-- Start Date -->
        <v-text-field
          ref="formFields"
          :value="formatDate(editedJobExperienceInfo.hireDate)"
          label="Start Date"
          prepend-icon="event_available"
          disabled
        ></v-text-field>
        <!-- End Start Date -->
      </v-row>
    </div>
    <!-- End Case Info -->

    <!-- Loop Jobs -->
    <div
      v-for="(company, compIndex) in editedJobExperienceInfo.companies"
      class="gray-border ma-0 pt-3 pb-1 px-5"
      :key="compIndex"
    >
      <!-- Company Name -->
      <v-combobox
        ref="formFields"
        :id="'comp-' + compIndex"
        v-model.trim="company.companyName"
        :rules="[...getRequiredRules(), duplicateCompanyName(compIndex)]"
        :items="companyDropDown"
        label="Company"
        data-vv-name="Company"
        clearable
      >
      </v-combobox>
      <div v-for="(position, index) in company.positions" :key="index">
        <!-- Job Position -->
        <div v-if="editedJobExperienceInfo.companies[compIndex].positions.length === 1">
          <v-text-field
            ref="formFields"
            :id="'pos-field-' + compIndex + '-' + index"
            v-model.trim="position.title"
            :rules="getRequiredRules()"
            label="Position"
            data-vv-name="Position"
            clearable
          ></v-text-field>
        </div>
        <div v-else>
          <v-text-field
            ref="formFields"
            :id="'pos-field-' + compIndex + '-' + index"
            v-model.trim="position.title"
            :rules="getRequiredRules()"
            label="Position"
            data-vv-name="Position"
            append-outer-icon="delete"
            clearable
          >
            <v-tooltip bottom slot="append-outer">
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="deletePosition(compIndex, index)"
                  ><v-icon class="case-gray">delete</v-icon></v-btn
                >
              </template>
              <span>Delete Position</span>
            </v-tooltip>
          </v-text-field>
        </div>

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
                  :value="position.startDate | formatDateMonthYear"
                  label="Start Date"
                  hint="MM/YYYY format"
                  v-mask="'##/####'"
                  prepend-icon="event_available"
                  :rules="[...getDateMonthYearRules(), dateOrderRule(compIndex, index)]"
                  v-bind="attrs"
                  v-on="on"
                  @blur="position.startDate = parseEventDate($event)"
                  @input="position.showStartMenu = false"
                  @focus="setIndices(compIndex, index)"
                  clearable
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="position.startDate"
                :max="position.endDate"
                no-title
                type="month"
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
                  :value="position.endDate | formatDateMonthYear"
                  label="End Date"
                  prepend-icon="event_busy"
                  :rules="[
                    ...getDateMonthYearOptionalRules(),
                    dateOrderRule(compIndex, index),
                    endDatePresentRule(compIndex, index)
                  ]"
                  hint="MM/YYYY format"
                  v-mask="'##/####'"
                  v-bind="attrs"
                  v-on="on"
                  clearable
                  @click:clear="position.endDate = null"
                  @blur="position.endDate = parseEventDate($event)"
                  @input="position.showEndMenu = false"
                  @focus="setIndices(compIndex, index)"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="position.endDate"
                :min="position.startDate"
                no-title
                type="month"
                @input="position.showEndMenu = false"
              ></v-date-picker>
            </v-menu>
            <!-- End End Date -->
          </v-col>
          <v-col v-if="!isMobile"></v-col>
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
      <div class="pb-4" align="center">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn text icon v-on="on" @click="deleteCompany(compIndex)"
              ><v-icon class="case-gray">delete</v-icon></v-btn
            >
          </template>
          <span>Delete Company</span>
        </v-tooltip>
      </div>
    </div>
    <!-- End Loop Jobs -->

    <!-- Button to Add Jobs -->
    <div class="pt-4" align="center">
      <v-btn @click="addCompany()" elevation="2" id="add-job"><v-icon class="pr-1">add</v-icon>Job</v-btn>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { getDateMonthYearRules, getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { isEmpty, formatDate, formatDateMonthYear, parseDateMonthYear, isMobile } from '@/utils/utils';
import { mask } from 'vue-the-mask';
import { getRole } from '@/utils/auth';
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
  this.employees = this.$store.getters.employees; // get all employees
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
  if (!this.editedJobExperienceInfo) this.editedJobExperienceInfo = [];
  this.editedJobExperienceInfo.companies.push({
    companyName: '',
    positions: [
      {
        title: '',
        endDate: null,
        presentDate: false,
        startDate: null,
        showStartMenu: false,
        showEndMenu: false
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
} // addPosition

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
} // deleteCompany

/**
 * Deletes a single position. Will delete the entire company entry if there are no positions
 * remaining
 *
 * @param compIndex - index of the company form
 * @param posIndex - index of the position form
 */
function deletePosition(compIndex, posIndex) {
  if (this.editedJobExperienceInfo.companies[compIndex].positions.length === 1) {
    //Should never enter here
    this.editedJobExperienceInfo.companies.splice(compIndex, 1);
  } else {
    this.editedJobExperienceInfo.companies[compIndex].positions.splice(posIndex, 1);
  }
} // deletePosition

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
 * @return boolean - whether or not the positions for that company have all their end dates filled
 */
function hasEndDatesFilled(index) {
  let hasEndDatesFilled = true;
  _.forEach(this.editedJobExperienceInfo.companies[index].positions, (position) => {
    hasEndDatesFilled &= !!position.endDate;
  });

  return hasEndDatesFilled;
} // hasEndDatesFilled

/**
 * Parse the date after losing focus.
 *
 * @return String - the date in YYYY-MM format
 */
function parseEventDate() {
  return this.parseDateMonthYear(event.target.value);
} //parseEventDate

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesJobs = _.map(this.employees, (employee) => employee.companies); //extract jobs
  employeesJobs = _.compact(employeesJobs); //remove falsey values
  // loop employees
  _.forEach(employeesJobs, (jobs) => {
    // loop jobs
    _.forEach(jobs, (job) => {
      this.companyDropDown.push(job.companyName); // add company name
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
} // setIndices

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

  // Fail safe in case users or inters somehow change their disabled info
  if (this.getRole() === 'user' || this.getRole() === 'intern') {
    this.editedJobExperienceInfo.jobRole = this.model.jobRole;
    this.editedJobExperienceInfo.hireDate = this.model.hireDate;
  }

  _.forEach(this.editedJobExperienceInfo.companies, (company) => {
    _.forEach(company.positions, (position) => {
      if (position.endDate && position.presentDate) {
        position.presentDate = false;
      }
    });
  });

  window.EventBus.$emit('doneValidating', 'jobExperience', this.editedJobExperienceInfo); // emit done validating
  window.EventBus.$emit('jobExperienceStatus', errorCount); // emit error status
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
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    isMobile
  },
  created,
  data() {
    return {
      companyDropDown: [], // autocomplete company name options
      companyIndex: 0,
      positionIndex: 0,
      dateOrderRule: (compIndex, posIndex) => {
        if (this.editedJobExperienceInfo !== undefined) {
          let position = this.editedJobExperienceInfo.companies[compIndex].positions[posIndex];
          return !this.isEmpty(position.endDate) && moment(position.endDate) && position.startDate
            ? moment(position.endDate).add(1, 'd').isAfter(moment(position.startDate)) ||
                'End date must be at or after start date'
            : true;
        } else {
          return true;
        }
      },
      duplicateCompanyName: (compIndex) => {
        let compNames = _.map(this.editedJobExperienceInfo.companies, (company) => company.companyName);
        let company = compNames[compIndex];
        compNames.splice(compIndex, 1);
        return !compNames.includes(company) || 'Duplicate company name';
      },
      endDatePresentRule: (compIndex, posIndex) => {
        if (this.editedJobExperienceInfo !== undefined) {
          let position = this.editedJobExperienceInfo.companies[compIndex].positions[posIndex];
          if (position.presentDate == false && this.isEmpty(position.endDate)) {
            return 'End Date is required';
          } else {
            return true;
          }
        } else {
          return false;
        }
      },
      editedJobExperienceInfo: _.cloneDeep(this.model) //edited job experience info
    };
  },
  directives: { mask },
  filters: {
    formatDate,
    formatDateMonthYear
  },
  methods: {
    addICTimeFrame,
    addCompany,
    addPosition,
    deleteICTimeFrame,
    deleteCompany,
    deletePosition,
    formatDate,
    getDateMonthYearRules,
    getDateMonthYearOptionalRules,
    getRequiredRules,
    hasEndDatesFilled,
    parseDateMonthYear,
    parseEventDate,
    formatRange,
    getRole,
    isEmpty,
    populateDropDowns,
    setIndices,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>
