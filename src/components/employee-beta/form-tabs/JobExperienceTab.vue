<template>
  <v-container>
    <v-row>
      <!-- Left side of the edit page -->
      <v-col cols="5">
        <!-- Start IC information -->
        <v-row>
          <v-col>
            <b>Experience in IC:</b>
            <span>
              <v-tooltip activator="parent" location="bottom">
                Date ranges are inclusive. Overlapping months will add extended time to IC experience.
              </v-tooltip>
              <v-icon class="pl-2 pb-1" size="x-small">mdi-information</v-icon>
            </span>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <div v-for="(timeFrame, index) in editedJobExperienceInfo.icTimeFrames" :key="index">
              <v-text-field
                :model-value="formatRange(timeFrame.range)"
                ref="formFields"
                :rules="getRequiredRules()"
                label="Date Range"
                readonly
                prepend-icon="mdi-calendar"
                clearable
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
                    color="#c23010"
                    title="Date Range"
                  >
                  </v-date-picker>
                </v-menu>
                <template v-slot:append>
                  <v-btn icon="" density="comfortable" variant="text" @click="deleteICTimeFrame(index)">
                    <v-tooltip activator="parent" location="top">Delete IC Time Frame</v-tooltip>
                    <v-icon class="case-gray">mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col align="center">
            <v-btn @click="addICTimeFrame()" variant="outlined" size="small">Add a Time Frame</v-btn>
          </v-col>
        </v-row>
        <!-- End IC Information -->
      </v-col>
      <!-- End Left Side -->

      <v-divider :thickness="4" class="border-opacity-25 mr-4" vertical></v-divider>

      <!-- Start Right side -->
      <v-col>
        <!-- Start CASE Information -->
        <v-row>
          <v-col>
            <b>CASE Information:</b>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <!-- CASE name -->
            <v-text-field label="Company" data-vv-name="Company" disabled model-value="CASE"></v-text-field>
          </v-col>

          <v-col>
            <v-text-field
              v-model="editedJobExperienceInfo.jobRole"
              disabled
              label="Position"
              data-vv-name="Position"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-text-field
              ref="formFields"
              :model-value="format(editedJobExperienceInfo.hireDate, null, 'MM/DD/YYYY')"
              label="Start Date"
              prepend-icon="mdi-calendar"
              disabled
            ></v-text-field>
          </v-col>
        </v-row>
        <!-- End CASE Information -->
      </v-col>
      <!-- End right side -->
    </v-row>

    <!-- Start other job experience -->
    <v-row>
      <v-col>
        <b>Other Job Experience:</b>
      </v-col>
    </v-row>

    <v-row v-for="(company, compIndex) in editedJobExperienceInfo.companies" :key="compIndex">
      <v-col>
        <v-row>
          <!-- Company name -->
          <v-col>
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
          </v-col>
          <!-- End company name -->
          <v-col cols="1">
            <v-btn variant="text" icon="" id="delete-company" @click="deleteCompany(compIndex)">
              <v-tooltip activator="parent" location="bottom">Delete Company</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-for="(position, index) in company.positions" :key="index">
          <v-col cols="1"></v-col>

          <!-- Position -->
          <v-col cols="4" class="groove">
            <v-text-field
              ref="formFields"
              :id="'pos-field' + compIndex + '-' + index"
              v-model.trim="position.title"
              :rules="getRequiredRules()"
              label="Position"
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
          </v-col>
          <!-- End position -->

          <!-- Start Date -->
          <v-col>
            <v-text-field
              :id="'start-field-' + compIndex + '-' + index"
              ref="formFields"
              :model-value="format(position.startDate, null, 'MM/YYYY')"
              label="Start Date"
              hint="MM/YYYY format"
              v-mask="'##/####'"
              :rules="[...getDateMonthYearRules()]"
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
          </v-col>
          <!-- End Start Date -->

          <!-- End Date -->
          <v-col>
            <v-text-field
              :id="'end-field-' + compIndex + '-' + index"
              ref="formFields"
              :model-value="format(position.endDate, null, 'MM/YYYY')"
              :label="position.presentDate ? 'Currently active' : 'End Date'"
              :rules="[...getDateMonthYearOptionalRules(), endDatePresentRule(compIndex, index)]"
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
          </v-col>
          <!-- End end date -->
        </v-row>

        <!-- Add Postion button -->
        <v-row>
          <v-col cols="7" align="right">
            <v-btn @click="addPosition(compIndex)" :id="'add-pos-' + compIndex" elevation="2">
              <v-icon class="pr-1">mdi-plus</v-icon>
              Position
            </v-btn>
          </v-col>
        </v-row>
        <!-- End add postion -->
        <v-row no-gutters class="mx-5">
          <v-divider class="mt-8 mb-4" opacity="100" v-if="compIndex < editedJobExperienceInfo.companies.length - 1" />
        </v-row>
      </v-col>
    </v-row>
    <!-- End company -->
    <v-row>
      <v-col align="center">
        <v-btn @click="addCompany()" elevation="2" id="add-job">
          <v-icon class="pr-1">mdi-plus</v-icon>
          Job
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import _, { isEmpty } from 'lodash';
import { ref } from 'vue';
import { inject, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import {
  getDateMonthYearRules,
  getDateMonthYearOptionalRules,
  getRequiredRules
} from '../../../shared/validationUtils';
import { format, getTodaysDate, isAfter } from '../../../shared/dateUtils';
import { mask } from 'vue-the-mask';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const props = defineProps(['model', 'validating']);
const store = useStore();
const vMask = mask; // custom directive

const companyDropDown = ref([]);
const companyIndex = ref(0);
const duplicateCompanyName = (compIndex) => {
  let compNames = _.map(editedJobExperienceInfo.value.companies, (company) => company.companyName);
  let company = compNames[compIndex];
  compNames.splice(compIndex, 1);
  return !compNames.includes(company) || 'Duplicate company name';
};
const endDatePresentRule = (compIndex, posIndex) => {
  if (editedJobExperienceInfo.value !== undefined) {
    let position = editedJobExperienceInfo.value.companies[compIndex].positions[posIndex];
    if (position.presentDate == false && isEmpty(position.endDate)) {
      return 'End Date is required';
    } else {
      return true;
    }
  } else {
    return true;
  }
};
const editedJobExperienceInfo = ref(_.cloneDeep(props.model));
const employees = ref(null);
const positionIndex = ref(0);
const today = getTodaysDate('MM/DD/YYYY');

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(async () => {
  emitter.emit('created', 'jobExperience'); // emit jobExperience tab was created
  employees.value = store.getters.employees; // get all employees
  populateDropDowns(); // get autocomplete drop down data
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds an empty company to the bottom of the form list.
 *
 */
function addCompany() {
  if (!editedJobExperienceInfo.value) editedJobExperienceInfo.value = [];
  editedJobExperienceInfo.value.companies.push({
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
 * Adds the IC Time Frame to the model
 */
function addICTimeFrame() {
  editedJobExperienceInfo.value.icTimeFrames.push({
    range: [],
    showRangeMenu: false
  });
} // addICTimeFrame

/**
 * Adds a position form underneath the respective company.
 *
 * @param compIndex - company to place the position under
 */
function addPosition(compIndex) {
  editedJobExperienceInfo.value.companies[compIndex].positions.push({
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
 * Deletes a Company and its nested positions.
 *
 * @param index - array index of company to delete
 */
function deleteCompany(index) {
  editedJobExperienceInfo.value.companies.splice(index, 1);
} // deleteCompany

/**
 * Deletes an IC Time Frame.
 *
 * @param index - array index of IC time frame to delete
 */
function deleteICTimeFrame(index) {
  editedJobExperienceInfo.value.icTimeFrames.splice(index, 1);
} // deleteICTimeFrame

/**
 * Deletes a single position. Will delete the entire company entry if there are no positions
 * remaining.
 *
 * @param compIndex - index of the company form
 * @param posIndex - index of the position form
 */
function deletePosition(compIndex, posIndex) {
  if (editedJobExperienceInfo.value.companies[compIndex].positions.length === 1) {
    //Should never enter here
    editedJobExperienceInfo.value.companies.splice(compIndex, 1);
  } else {
    editedJobExperienceInfo.value.companies[compIndex].positions.splice(posIndex, 1);
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
 * Parse the date after losing focus.
 *
 * @return String - the date in YYYY-MM format
 */
function parseEventDate() {
  return format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} //parseEventDate

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesJobs = _.map(employees.value, (employee) => employee.companies); //extract jobs
  employeesJobs = _.compact(employeesJobs); //remove falsey values
  // loop employees
  _.forEach(employeesJobs, (jobs) => {
    // loop jobs
    _.forEach(jobs, (job) => {
      companyDropDown.value.push(job.companyName); // add company name
    });
  });
} // populateDropDowns

/**
 * Sets the indexes for purposes of validating date fields.
 *
 * @param companyIndex - The index of the company
 * @param positionIndex - The index of the position
 */
function setIndices(companyIdx, positionIdx) {
  companyIndex.value = companyIdx;
  positionIndex.value = positionIdx;
} // setIndices
</script>
