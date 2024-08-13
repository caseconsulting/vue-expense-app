<template>
  <div>
    <!-- Experience in IC -->
    <div class="gray-border ma-0 pt-3 pb-1 px-5">
      <!-- Experience in IC Header -->
      <div class="pb-2">
        <b>Experience in IC:</b>
        <!-- Info Tooltip Message -->
        <span>
          <v-tooltip activator="parent" location="bottom">
            Date ranges are inclusive. Overlapping months will add extended time to IC experience.
          </v-tooltip>
          <v-icon class="pl-2 pb-2" size="x-small">mdi-information</v-icon>
        </span>
      </div>

      <!-- Loop Time Frames -->
      <div v-for="(timeFrame, index) in editedJobExperienceInfo.icTimeFrames" :key="index">
        <!-- Range -->
        <v-text-field
          :model-value="formatRange(timeFrame.range)"
          ref="formFields"
          :rules="getRequiredRules()"
          label="Date Range"
          variant="underlined"
          readonly
          prepend-icon="mdi-calendar"
          clearable
          @click:prepend="timeFrame.showRangeMenu = true"
          autocomplete="off"
        >
          <v-menu
            activator="parent"
            v-model="timeFrame.showRangeMenu"
            :close-on-content-click="false"
            location="start center"
          >
            <v-date-picker
              v-model="timeFrame.range"
              multiple
              :max="today"
              show-adjacent-months
              hide-actions
              keyboard-icon=""
              color="#bc3825"
              title="Date Range"
            ></v-date-picker>
          </v-menu>
          <template v-slot:append>
            <v-btn class="pb-3" icon="" density="comfortable" variant="text" @click="deleteICTimeFrame(index)">
              <v-tooltip activator="parent" location="top">Delete IC Time Frame</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-text-field>
        <!-- End Range -->
      </div>
      <!-- End Loop TimeFrames -->

      <!-- Button to Add IC Time Frame -->
      <div align="center" class="pt-2 pb-4">
        <v-btn @click="addICTimeFrame()" variant="outlined" size="small">Add a Time Frame</v-btn>
      </div>
    </div>
    <!-- End Experience in IC -->

    <!-- Case Info -->
    <div class="gray-border ma-0 pt-2 pb-1 px-5">
      <!-- Company Name -->
      <v-text-field
        label="Company"
        data-vv-name="Company"
        disabled
        variant="underlined"
        model-value="CASE"
      ></v-text-field>

      <!-- Job Position -->
      <v-text-field
        v-model="editedJobExperienceInfo.jobRole"
        disabled
        label="Position"
        variant="underlined"
        data-vv-name="Position"
      ></v-text-field>

      <v-row class="px-3 py-3">
        <!-- Start Date -->
        <v-text-field
          ref="formFields"
          :model-value="format(editedJobExperienceInfo.hireDate, null, 'MM/DD/YYYY')"
          label="Start Date"
          variant="underlined"
          prepend-icon="mdi-calendar"
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
        variant="underlined"
        data-vv-name="Company"
        clearable
      >
      </v-combobox>
      <div v-for="(position, index) in company.positions" :key="index">
        <!-- Job Position -->
        <v-text-field
          ref="formFields"
          :id="'pos-field-' + compIndex + '-' + index"
          v-model.trim="position.title"
          :rules="getRequiredRules()"
          label="Position"
          variant="underlined"
          data-vv-name="Position"
          clearable
        >
          <template v-slot:append v-if="editedJobExperienceInfo.companies[compIndex].positions.length > 1">
            <v-btn variant="text" icon="" density="comfortable" @click="deletePosition(compIndex, index)">
              <v-tooltip activator="parent" location="bottom">Delete Position</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-text-field>

        <v-row>
          <v-col cols="12" sm="6" md="12" lg="6" class="pt-3">
            <!-- Start Date -->
            <v-text-field
              :id="'start-field-' + compIndex + '-' + index"
              ref="formFields"
              :model-value="format(position.startDate, null, 'MM/YYYY')"
              label="Start Date"
              hint="MM/YYYY format"
              v-mask="'##/####'"
              :rules="[...getDateMonthYearRules(), dateOrderRule(compIndex, index)]"
              variant="underlined"
              prepend-icon="mdi-calendar"
              @update:focused="position.startDate = parseEventDate($event)"
              @click:prepend="position.showStartMenu = true"
              @keypress="position.showStartMenu = false"
              @focus="setIndices(compIndex, index)"
              clearable
              autocomplete="off"
            >
              <v-menu
                activator="parent"
                v-model="position.showStartMenu"
                :close-on-content-click="false"
                location="start center"
              >
                <v-date-picker
                  v-model="position.startDate"
                  @update:model-value="position.showStartMenu = false"
                  :max="position.endDate"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="Start Date"
                ></v-date-picker>
              </v-menu>
            </v-text-field>
            <!-- End Start Date -->
          </v-col>
          <v-col cols="12" sm="6" md="12" lg="6" class="pt-3">
            <!-- End Date -->
            <v-text-field
              :id="'end-field-' + compIndex + '-' + index"
              ref="formFields"
              :model-value="format(position.endDate, null, 'MM/YYYY')"
              :label="position.presentDate ? 'Currently active' : 'End Date'"
              variant="underlined"
              :rules="[
                ...getDateMonthYearOptionalRules(),
                dateOrderRule(compIndex, index),
                endDatePresentRule(compIndex, index)
              ]"
              hint="MM/YYYY format"
              v-mask="'##/####'"
              clearable
              prepend-icon="mdi-calendar"
              @click:clear="position.endDate = null"
              @update:focused="position.endDate = parseEventDate($event)"
              @click:prepend="position.showEndMenu = true"
              @keypress="position.showEndMenu = false"
              @focus="setIndices(compIndex, index)"
              @update:model-value="
                position.endDate && position.endDate.length > 0 ? (position.presentDate = false) : ''
              "
              autocomplete="off"
            >
              <template v-if="endDatePresentRule(compIndex, index) !== true" v-slot:message>
                End Date is required (click <v-icon color="black" icon="mdi-check-circle-outline" /> to mark active)
              </template>
              <v-menu
                activator="parent"
                v-model="position.showEndMenu"
                :close-on-content-click="false"
                location="start center"
              >
                <v-date-picker
                  v-model="position.endDate"
                  :min="position.startDate"
                  @update:model-value="position.showEndMenu = false"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="End Date"
                ></v-date-picker>
              </v-menu>
              <template v-slot:append-inner>
                <v-avatar
                  v-if="checkPositionStatus(position)"
                  @click.stop="position.presentDate = !position.presentDate"
                  class="pointer"
                  size="x-small"
                >
                  <span v-if="!position.presentDate">
                    <v-tooltip activator="parent">Click if active</v-tooltip>
                    <v-icon color="black"> mdi-check-circle-outline </v-icon>
                  </span>
                  <span v-else>
                    <v-tooltip activator="parent">Currently active</v-tooltip>
                    <v-icon color="black"> mdi-check-circle </v-icon>
                  </span>
                </v-avatar>
              </template>
            </v-text-field>
            <!-- End End Date -->
          </v-col>
        </v-row>
      </div>
      <div class="pb-4" align="center">
        <v-btn @click="addPosition(compIndex)" :id="'add-pos-' + compIndex" elevation="2">
          <v-icon class="pr-1">mdi-plus</v-icon>
          Position
        </v-btn>
      </div>
      <div class="pb-4" align="center">
        <v-btn variant="text" icon="" id="delete-company" @click="deleteCompany(compIndex)">
          <v-tooltip activator="parent" location="bottom">Delete Company</v-tooltip>
          <v-icon class="case-gray">mdi-delete</v-icon>
        </v-btn>
      </div>
    </div>
    <!-- End Loop Jobs -->

    <!-- Button to Add Jobs -->
    <div class="pt-4" align="center">
      <v-btn @click="addCompany()" elevation="2" id="add-job">
        <v-icon class="pr-1">mdi-plus</v-icon>
        Job
      </v-btn>
    </div>
  </div>
</template>

<script>
import _isEmpty from 'lodash/isEmpty';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';
import _compact from 'lodash/compact';
import _isArray from 'lodash/isArray';
import _cloneDeep from 'lodash/cloneDeep';
import { getDateMonthYearRules, getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { asyncForEach, isEmpty, isMobile } from '@/utils/utils';
import { add, format, getTodaysDate, isAfter } from '@/shared/dateUtils';
import { mask } from 'vue-the-mask';
import { getRole } from '@/utils/auth';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  this.emitter.emit('created', 'jobExperience'); // emit education tab was created
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
    companyName: null,
    positions: [
      {
        title: null,
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
    title: null,
    endDate: null,
    startDate: null,
    showStartMenu: false,
    showEndMenu: false,
    presentDate: false
  });
} // addPosition

/**
 * Checks if a position is active or not.
 *
 * @param position - the job position
 */
function checkPositionStatus(position) {
  if (!position.endDate) {
    return true;
  } else {
    position.presentDate = false;
    return false;
  }
} // checkPositionStatus

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
 * remaining.
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
  if (_isEmpty(range)) {
    return null;
  }
  let start = format(range[0], null, 'YYYY-MM');
  if (range[1]) {
    // end date selected
    let end = format(range[1], null, 'YYYY-MM');
    if (isAfter(start, end)) {
      // start date is listed after end date
      return `${format(end, 'YYYY-MM', 'MMMM YYYY')} - ${format(start, 'YYYY-MM', 'MMMM YYYY')}`;
    } else {
      // start date is listed before end date
      return `${format(start, 'YYYY-MM', 'MMMM YYYY')} - ${format(end, 'YYYY-MM', 'MMMM YYYY')}`;
    }
  } else {
    // no end date selected
    return `${format(start, 'YYYY-MM', 'MMMM YYYY')} - Present`;
  }
} // formatRange

/**
 * Checks if the current company has any positions without an end date.
 *
 * @param index The index of the company in the editedJobExperienceInfo.companies
 * @return boolean - whether or not the positions for that company have all their end dates filled
 */
function hasEndDatesFilled(index) {
  let hasEndDatesFilled = true;
  _forEach(this.editedJobExperienceInfo.companies[index].positions, (position) => {
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
  return this.format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} //parseEventDate

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesJobs = _map(this.employees, (employee) => employee.companies); //extract jobs
  employeesJobs = _compact(employeesJobs); //remove falsey values
  // loop employees
  _forEach(employeesJobs, (jobs) => {
    // loop jobs
    _forEach(jobs, (job) => {
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
async function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) errorCount++;
  });

  // Fail safe in case users or inters somehow change their disabled info
  if (this.getRole() === 'user' || this.getRole() === 'intern') {
    this.editedJobExperienceInfo.jobRole = this.model.jobRole;
    this.editedJobExperienceInfo.hireDate = this.model.hireDate;
  }

  _forEach(this.editedJobExperienceInfo.companies, (company) => {
    _forEach(company.positions, (position) => {
      if (position.endDate && position.presentDate) {
        position.presentDate = false;
      }
    });
  });

  this.emitter.emit('doneValidating', { tab: 'jobExperience', data: this.editedJobExperienceInfo }); // emit done validating
  this.emitter.emit('jobExperienceStatus', errorCount); // emit error status
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
          return !this.isEmpty(position.endDate) && position.startDate
            ? isAfter(add(position.endDate, 1, 'd'), position.startDate) || 'End date must be at or after start date'
            : true;
        } else {
          return true;
        }
      },
      duplicateCompanyName: (compIndex) => {
        let compNames = _map(this.editedJobExperienceInfo.companies, (company) => company.companyName);
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
      editedJobExperienceInfo: _cloneDeep(this.model), //edited job experience info
      today: getTodaysDate('MM/DD/YYYY')
    };
  },
  directives: { mask },
  methods: {
    add, // dateUtils
    addICTimeFrame,
    addCompany,
    addPosition,
    checkPositionStatus,
    deleteICTimeFrame,
    deleteCompany,
    deletePosition,
    format, // dateUtils
    getDateMonthYearRules,
    getDateMonthYearOptionalRules,
    getRequiredRules,
    hasEndDatesFilled,
    parseEventDate,
    formatRange,
    getRole,
    isAfter, // dateUtils
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
