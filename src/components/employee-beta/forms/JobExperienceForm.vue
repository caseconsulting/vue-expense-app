<template>
  <div>
    <v-row>
      <!-- Left side of the edit page -->
      <v-col :cols="!isMobile() ? '5' : '12'">
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
            <v-row v-for="(timeFrame, index) in editedEmployee.icTimeFrames" :key="index">
              <v-col cols="10">
                <date-picker
                  v-model="timeFrame.range"
                  :rules="getRequiredRules()"
                  :max="getTodaysDate('YYYY-MM-DD')"
                  variant="filled"
                  range-format="MMM YYYY" 
                  label="Date Range"
                  show-adjacent-months
                  hide-actions
                  clearable
                  range
                />
              </v-col>
              <v-col cols="2">
                <v-btn icon="" density="comfortable" variant="text" @click="deleteICTimeFrame(index)">
                  <v-tooltip activator="parent" location="top">Delete IC Time Frame</v-tooltip>
                  <v-icon class="case-gray">mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
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

      <v-divider v-if="!isMobile()" :thickness="4" class="border-opacity-25 mr-4" vertical></v-divider>

      <!-- Start Right side -->
      <v-col :cols="isMobile() ? '12' : ''">
        <!-- Start CASE Information -->
        <v-row>
          <v-col>
            <b>CASE Information:</b>
          </v-col>
        </v-row>

        <v-row>
          <v-col :cols="isMobile() ? '12' : ''">
            <!-- CASE name -->
            <v-text-field label="Company" data-vv-name="Company" disabled model-value="CASE"></v-text-field>
          </v-col>

          <v-col :cols="isMobile() ? '10' : ''">
            <v-text-field
              v-model="editedEmployee.jobRole"
              disabled
              label="Position"
              data-vv-name="Position"
            ></v-text-field>
          </v-col>

          <v-col :cols="isMobile() ? '2' : 'auto'">
            <v-icon class="pt-7 case-gray">mdi-information</v-icon>
            <v-tooltip activator="parent" location="right"> Change Job Information in Personal Edit Tab </v-tooltip>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <DatePicker
              variant="filled"
              v-model="editedEmployee.hireDate"
              label="Start Date"
              disabled
            />
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

    <v-row v-for="(company, compIndex) in editedCompanies" :key="compIndex">
      <v-col>
        <v-row>
          <!-- Company name -->
          <v-col>
            <v-combobox
              :id="'comp-' + compIndex"
              v-model.trim="company.companyName"
              :rules="[...getRequiredRules(), getDuplicateCompanyNameRule(editedCompanies)]"
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
          <v-col class="groove">
            <v-row>
              <!-- Position -->
              <v-col :cols="!isMobile() ? '4' : '12'">
                <v-text-field
                  :id="'pos-field' + compIndex + '-' + index"
                  v-model.trim="position.title"
                  :rules="getRequiredRules()"
                  label="Position"
                  data-vv-name="Position"
                  clearable
                >
                  <template #append v-if="isMobile() && editedCompanies[compIndex].positions.length > 1">
                    <v-btn variant="text" icon="" density="comfortable" @click="deletePosition(compIndex, index)">
                      <v-tooltip activator="parent" location="bottom">Delete Position</v-tooltip>
                      <v-icon class="case-gray">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <!-- End position -->

              <!-- Start Date -->
              <v-col :cols="!isMobile() ? '4' : '12'">
                <date-picker
                  v-model="position.startDate"
                  :id="'start-field-' + compIndex + '-' + index"
                  :rules="[...getDateMonthYearRules()]"
                  :max="position.presentDate ? getTodaysDate('YYYY-MM-DD') : position.endDate"
                  variant="filled"
                  label="Start Date"
                  return-format="YYYY-MM"
                  display-format="MM/YYYY"
                  show-adjacent-months
                  hide-actions
                  clearable
                />
              </v-col>
              <!-- End Start Date -->

              <!-- End Date -->
              <v-col :cols="!isMobile() ? '3' : '12'">
                <date-picker
                  v-model="position.endDate"
                  v-model:checkbox="position.presentDate"
                  :id="'end-field-' + compIndex + '-' + index"
                  :rules="[...getDateMonthYearOptionalRules(), getEndDatePresentRule(position)]"
                  :min="position.startDate"
                  variant="filled"
                  label="End Date"
                  return-format="YYYY-MM"
                  display-format="MM/YYYY"
                  show-adjacent-months
                  hide-actions
                  clearable
                />
              </v-col>
              <!-- End end date -->

              <v-divider v-if="isMobile()" thickness="2" class="ml-2"></v-divider>

              <v-col v-if="!isMobile() && editedCompanies[compIndex].positions.length > 1" cols="1">
                <v-btn variant="text" icon="" density="comfortable" @click="deletePosition(compIndex, index)">
                  <v-tooltip activator="parent" location="bottom">Delete Position</v-tooltip>
                  <v-icon class="case-gray">mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Add Postion button -->
        <v-row>
          <v-col :cols="!isMobile() ? '7' : '12'" :align="!isMobile() ? 'right' : 'center'">
            <v-btn @click="addPosition(compIndex)" :id="'add-pos-' + compIndex" elevation="2">
              <v-icon class="pr-1">mdi-plus</v-icon>
              Position
            </v-btn>
          </v-col>
        </v-row>
        <!-- End add postion -->
        <v-divider
          thickness="4"
          class="border-opacity-50 mt-5"
          v-if="compIndex < editedEmployee.companies.length - 1"
        />
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
  </div>
</template>

<script setup>
import DatePicker from '@/components/shared/DatePicker.vue'
import { usePrepareSubmit } from '@/composables/editTabCommunication';
import { format, getTodaysDate, isAfter } from '@/shared/dateUtils';
import {
  getDateMonthYearOptionalRules,
  getDateMonthYearRules,
  getDuplicateCompanyNameRule,
  getRequiredRules
} from '@/shared/validationUtils';
import { isMobile } from '@/utils/utils';
import _compact from 'lodash/compact';
import _forEach from 'lodash/forEach';
import _isEmpty from 'lodash/isEmpty';
import _map from 'lodash/map';
import { ref } from 'vue';
import { mask } from 'vue-the-mask';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const vMask = mask; // custom directive

// passes in all slot props as a single object
const { slotProps } = defineProps(['slotProps']);
const editedEmployee = ref(slotProps.editedEmployee);

const editedCompanies = ref(editedEmployee.value.companies);
const companyDropDown = ref([]);

populateDropDowns();
usePrepareSubmit('jobExperience', prepareSubmit);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

async function prepareSubmit() {
  if (!slotProps.stopPrepare) {
    await slotProps.validate();

    // delete properties from positions that should not be stored in the database
    editedEmployee.value.companies = _map(editedCompanies.value, (company) => {
      company.positions = _map(company.positions, (position) => {
        return position;
      });
      return company;
    });
  }
}

/**
 * Rule that specifies that the end date is present if job is not currently active
 * @param position The position object
 */
function getEndDatePresentRule(position) {
  return () => {
    if (!position.presentDate && _isEmpty(position.endDate)) return 'End Date is required';
    else return true;
  };
}

/**
 * Adds an empty company to the bottom of the form list.
 */
function addCompany() {
  if (!editedCompanies.value) editedCompanies.value = [];
  editedCompanies.value.push({
    companyName: null,
    positions: [
      {
        endDate: null,
        presentDate: false,
        startDate: null,
        title: null,
      }
    ]
  });
} // addCompany

/**
 * Adds the IC Time Frame to the model
 */
function addICTimeFrame() {
  if (!editedEmployee.value.icTimeFrames) editedEmployee.value.icTimeFrames = [];
  editedEmployee.value.icTimeFrames.push({
    range: []
  });
} // addICTimeFrame

/**
 * Adds a position form underneath the respective company.
 *
 * @param compIndex - company to place the position under
 */
function addPosition(compIndex) {
  editedCompanies.value[compIndex].positions.push({
    title: null,
    endDate: null,
    startDate: null,
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
  editedCompanies.value.splice(index, 1);
} // deleteCompany

/**
 * Deletes an IC Time Frame.
 *
 * @param index - array index of IC time frame to delete
 */
function deleteICTimeFrame(index) {
  editedEmployee.value.icTimeFrames.splice(index, 1);
} // deleteICTimeFrame

/**
 * Deletes a single position. Will delete the entire company entry if there are no positions
 * remaining.
 *
 * @param compIndex - index of the company form
 * @param posIndex - index of the position form
 */
function deletePosition(compIndex, posIndex) {
  if (editedCompanies.value[compIndex].positions.length === 1) {
    //Should never enter here
    editedCompanies.value.splice(compIndex, 1);
  } else {
    editedCompanies.value[compIndex].positions.splice(posIndex, 1);
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
  let employeesJobs = _map(store.getters.employees, (employee) => employee.companies); //extract jobs
  employeesJobs = _compact(employeesJobs); //remove falsey values
  // loop employees
  _forEach(employeesJobs, (jobs) => {
    // loop jobs
    _forEach(jobs, (job) => {
      companyDropDown.value.push(job.companyName); // add company name
    });
  });
} // populateDropDowns
</script>

<style scoped>
.append-text-field {
  min-width: 250px;
}
</style>
