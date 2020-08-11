<template>
  <div>
    <!-- Loop Jobs -->
    <div
      v-for="(job, index) in model.jobs"
      style="border: 1px solid grey;"
      class="pt-3 pb-1 px-5"
      :key="'company: ' + job.company + index"
    >
      <!-- Company Name -->
      <v-combobox
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
                :value="formatDate(job.startDate)"
                label="Start Date"
                prepend-icon="event_available"
                :rules="dateRules"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="job.startDate" no-title @input="job.showStartMenu = false"></v-date-picker>
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
            <v-date-picker v-model="job.endDate" no-title @input="job.showEndMenu = false"></v-date-picker>
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
import _ from 'lodash';
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
 * Add a job to the form.
 */
function addJob() {
  this.model.jobs.push({
    company: null,
    startDate: null,
    endDate: null,
    showStartMenu: false,
    showEndMenu: false
  });
} // addJob

/**
 * delete a job from the form
 */
function deleteJob(index) {
  this.model.jobs.splice(index, 1);
} // deleteJob

function formatDate(date) {
  if (!date) {
    return null;
  }
  const [year, month, day] = date.split('-');
  return `${month}/${day}/${year}`;
} // formatDate

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
}

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
      dateRules: [
        (v) => !!v || 'Date required',
        (v) => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for date
      positionDropDown: [],
      requiredRules: [(v) => !!v || 'This field is required'] // rules for required fields
    };
  },
  methods: {
    addJob,
    deleteJob,
    formatDate,
    getDropDownInfo,
    parseDate
  },
  props: ['model']
};
</script>
