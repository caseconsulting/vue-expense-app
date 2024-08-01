<template>
  <v-form ref="form" v-model="valid" validate-on="lazy">
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
            <div v-for="(timeFrame, index) in editedEmployee.icTimeFrames" :key="index">
              <v-text-field
                :model-value="formatRange(timeFrame.range)"
                :rules="getRequiredRules()"
                label="Date Range"
                readonly
                prepend-inner-icon="mdi-calendar"
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
                    :max="getTodaysDate('MM/DD/YYYY')"
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
            <v-tooltip activator="parent" location="right"> Change Job Role in Personal Edit Tab </v-tooltip>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-text-field
              :model-value="format(editedEmployee.hireDate, null, 'MM/DD/YYYY')"
              label="Start Date"
              prepend-inner-icon="mdi-calendar"
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
                <v-text-field
                  :id="'start-field-' + compIndex + '-' + index"
                  :model-value="format(position.startDate, null, 'MM/YYYY')"
                  label="Start Date"
                  hint="MM/YYYY format"
                  v-mask="'##/####'"
                  :rules="[...getDateMonthYearRules()]"
                  prepend-inner-icon="mdi-calendar"
                  @update:focused="position.startDate = parseEventDate($event)"
                  @click:prepend="position.showStartMenu = true"
                  @keypress="position.showStartMenu = false"
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
              <v-col :cols="!isMobile() ? '3' : '12'">
                <v-text-field
                  :id="'end-field-' + compIndex + '-' + index"
                  :model-value="format(position.endDate, null, 'MM/YYYY')"
                  :label="position.presentDate ? 'Currently active' : 'End Date'"
                  :rules="[...getDateMonthYearOptionalRules(), getEndDatePresentRule(position)]"
                  hint="MM/YYYY format"
                  v-mask="'##/####'"
                  clearable
                  prepend-inner-icon="mdi-calendar"
                  @click:clear="position.endDate = null"
                  @update:focused="position.endDate = parseEventDate($event)"
                  @click:prepend="position.showEndMenu = true"
                  @keypress="position.showEndMenu = false"
                  @update:model-value="
                    position.endDate && position.endDate.length > 0 ? (position.presentDate = false) : ''
                  "
                  autocomplete="off"
                >
                  <template v-if="getEndDatePresentRule(position) !== true" v-slot:message>
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
                  <template #append v-if="isMobile() && editedCompanies[compIndex].positions.length > 1">
                    <v-btn variant="text" icon="" density="comfortable" @click="deletePosition(compIndex, index)">
                      <v-tooltip activator="parent" location="bottom">Delete Position</v-tooltip>
                      <v-icon class="case-gray">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
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
  </v-form>
</template>

<script setup>
import { format, getTodaysDate, isAfter } from '@/shared/dateUtils';
import {
  getDateMonthYearOptionalRules,
  getDateMonthYearRules,
  getDuplicateCompanyNameRule,
  getRequiredRules
} from '@/shared/validationUtils';
import { isEmpty, map } from 'lodash';
import { inject, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { mask } from 'vue-the-mask';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const emitter = inject('emitter');
const vMask = mask; // custom directive

const editedEmployee = defineModel({ required: true });
const valid = defineModel('valid', { required: true });
const form = ref(null); // template ref

const editedCompanies = ref(editedEmployee.value.companies);
const companyDropDown = ref([]);

populateDropDowns();

let stopPrepare = false;
const onDiscardEdits = (employee) => {
  stopPrepare = true;
  editedEmployee.value = employee;
};

defineExpose({ prepareSubmit });

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(() => {
  emitter.on('discard-edits', onDiscardEdits);
});

onMounted(validate);

onBeforeUnmount(() => {
  emitter.off('discard-edits', onDiscardEdits);
});

onBeforeUnmount(prepareSubmit);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

async function prepareSubmit() {
  if (!stopPrepare) {
    await validate();

    // delete properties from positions that should not be stored in the database
    editedEmployee.value.companies = map(editedCompanies.value, (company) => {
      company.positions = map(company.positions, (position) => {
        delete position.showStartMenu;
        delete position.showEndMenu;
        return position;
      });
      return company;
    });
  }
}

async function validate() {
  if (form.value) {
    const result = await form.value.validate();
    emitter.emit('validating', { tab: 'jobExperience', valid: result.valid });
    return result;
  }
  return null;
}

/**
 * Rule that specifies that the end date is present if job is not currently active
 * @param position The position object
 */
function getEndDatePresentRule(position) {
  return () => {
    if (!position.presentDate && isEmpty(position.endDate)) return 'End Date is required';
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
  if (!editedEmployee.value.icTimeFrames) editedEmployee.value.icTimeFrames = [];
  editedEmployee.value.icTimeFrames.push({
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
  editedCompanies.value[compIndex].positions.push({
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
  if (isEmpty(range)) {
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
  let employeesJobs = map(store.getters.employees, (employee) => employee.companies); //extract jobs
  employeesJobs = compact(employeesJobs); //remove falsey values
  // loop employees
  forEach(employeesJobs, (jobs) => {
    // loop jobs
    forEach(jobs, (job) => {
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
