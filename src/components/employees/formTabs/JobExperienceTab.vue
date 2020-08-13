<template>
  <div>
    <div style="border: 1px solid grey;" class="pt-3 pb-1 px-5">
      <!-- Experience in IC -->
      <div class="pb-2">
        <b>Experience in IC:</b>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" class="pl-2 pb-2" small>info</v-icon>
          </template>
          <span>Date ranges are inclusive. Overlapping months will add extended time to IC experience</span>
        </v-tooltip>
      </div>

      <!-- Loop Time Frames -->
      <div v-for="(timeFrame, index) in model.icTimeFrames" :key="index">
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
              :rules="dateRequired"
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
      <div align="center" class="pt-2 pb-4">
        <v-btn @click="addICTimeFrame()" depressed outlined small color="#3f3f3c">Add a Time Frame</v-btn>
      </div>
    </div>

    <!-- Case Info -->
    <div style="border: 1px solid grey;" class="pt-3 pb-1 px-5">
      <!-- Company Name -->
      <v-text-field label="Company" data-vv-name="Company" readonly value="Case Consulting"></v-text-field>

      <!-- Job Position -->
      <v-text-field v-model="model.jobRole" readonly label="Position" data-vv-name="Position"></v-text-field>

      <v-row class="px-3">
        <!-- Start Date -->
        <v-text-field
          :value="formatDate(model.hireDate)"
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
      v-for="(job, index) in model.jobs"
      style="border: 1px solid grey;"
      class="pt-3 pb-1 px-5"
      :key="'company: ' + job.company + index"
    >
      <!-- Company Name -->
      <v-combobox
        ref="formFields"
        v-model="job.company"
        :rules="requiredRules"
        :items="companyDropDown"
        label="Company"
        data-vv-name="Company"
        append-outer-icon="delete"
        @click:append-outer="deleteJob(index)"
      >
      </v-combobox>

      <!-- Job Position -->
      <v-combobox
        ref="formFields"
        v-model="job.position"
        :rules="requiredRules"
        :items="positionDropDown"
        label="Position"
        data-vv-name="Position"
      ></v-combobox>

      <v-row>
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- Start Date -->
          <v-menu
            v-model="job.showStartMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="formatDate(job.startDate)"
                label="Start Date"
                prepend-icon="event_available"
                :rules="dateRules"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="job.startDate"
              :max="job.endDate"
              no-title
              @input="job.showStartMenu = false"
            ></v-date-picker>
          </v-menu>
          <!-- End Start Date -->
        </v-col>
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- End Date -->
          <v-menu
            v-model="job.showEndMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="formatDate(job.endDate)"
                label="End Date (optional)"
                prepend-icon="event_busy"
                :rules="dateOptionalRules"
                readonly
                v-bind="attrs"
                v-on="on"
                clearable
                @click:clear="job.endDate = null"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="job.endDate"
              :min="job.startDate"
              no-title
              @input="job.showEndMenu = false"
            ></v-date-picker>
          </v-menu>
          <!-- End End Date -->
        </v-col>
      </v-row>
    </div>
    <!-- Add job button -->
    <div class="pt-4" align="center">
      <v-btn @click="addJob()"><v-icon class="pr-1">add</v-icon>Job</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import moment from 'moment';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

async function created() {
  window.EventBus.$emit('created', 'jobExperience');
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.getDropDownInfo();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add a ic time frame
 */
function addICTimeFrame() {
  this.model.icTimeFrames.push({
    range: [],
    showRangeMenu: false
  });
} // addICTimeFrame

/**
 * Add a job to the form.
 */
function addJob() {
  this.model.jobs.push({
    company: null,
    position: null,
    startDate: null,
    endDate: null,
    showStartMenu: false,
    showEndMenu: false
  });
} // addJob

/**
 * delete a ic time frame
 */
function deleteICTimeFrame(index) {
  this.model.icTimeFrames.splice(index, 1);
} // deleteICTimeFrame

/**
 * delete a job from the form
 */
function deleteJob(index) {
  this.model.jobs.splice(index, 1);
} // deleteJob

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
 * format date range as Month YYYY - Month YYYY
 */
function formatRange(range) {
  if (_.isEmpty(range)) {
    return null;
  }

  let start = moment(range[0], 'YYYY-MM');
  if (range[1]) {
    let end = moment(range[1], 'YYYY-MM');
    if (start.isAfter(end)) {
      return `${end.format('MMMM YYYY')} - ${start.format('MMMM YYYY')}`;
    } else {
      return `${start.format('MMMM YYYY')} - ${end.format('MMMM YYYY')}`;
    }
  } else {
    return `${start.format('MMMM YYYY')} - Present`;
  }
} // formatRange

/**
 * Gets information that other employees have filled out.
 */
function getDropDownInfo() {
  let employeesJobs = _.map(this.employees, (employee) => employee.jobs); //extract jobs
  employeesJobs = _.compact(employeesJobs); //remove falsey values
  _.forEach(employeesJobs, (jobs) => {
    _.forEach(jobs, (job) => {
      this.companyDropDown.push(job.company);
    });
  });
} // getDropDownInfo

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
} // parseDate

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let hasErrors = false;

  if (_.isArray(this.$refs.formFields)) {
    let error = _.find(this.$refs.formFields, (field) => {
      return !field.validate();
    });
    hasErrors = _.isNil(error) ? false : true;
  } else if (this.$refs.formFields) {
    hasErrors = this.$refs.formFields.validate;
  }

  window.EventBus.$emit('doneValidating', 'jobExperience');
  window.EventBus.$emit('jobExperienceStatus', hasErrors);
} // validateFields

export default {
  created,
  data() {
    return {
      companyDropDown: [],
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
      formFields: [],
      positionDropDown: [],
      requiredRules: [(v) => !!v || 'This field is required'] // rules for required fields
    };
  },
  methods: {
    addICTimeFrame,
    addJob,
    deleteICTimeFrame,
    deleteJob,
    formatDate,
    formatRange,
    getDropDownInfo,
    parseDate,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: function (val) {
      if (val) {
        this.validateFields();
      }
    }
  }
};
</script>
