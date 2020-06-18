<template>
  <div id="monthly-charges">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Hours for {{ month }} {{ year }}</h4>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <div v-if="this.loading" class="pb-4">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <div v-else>
          <!-- If the user has no hours -->
          <v-row v-if="jobHours.length == 0" justify="center">
            <p>No hours for this month</p>
          </v-row>
          <v-row v-for="job in jobHours" :key="job.name">
            {{ job.name }}:
            <v-spacer></v-spacer>
            <p>{{ job.hours }}</p>
          </v-row>
          <v-row class="bold">
            Total:
            <v-spacer></v-spacer>
            <p>{{ this.totalHours }} / {{ workHours }}</p>
          </v-row>
          <v-row @click="showDialog = true">
            Estimated Hours/Day:
            <v-spacer></v-spacer>
            <p>{{ estimatedDailyHours }}</p>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="showDialog" max-width="400">
      <v-toolbar color="#565651" dark>
        <v-toolbar-title>Hours</v-toolbar-title>
      </v-toolbar>
      <v-divider></v-divider>
      <v-list style="font-size: 13px;" dense>
        <!-- Hours worked this month -->
        <v-list-item>
          <v-list-item-content>Hours Worked:</v-list-item-content>
          <v-list-item-content class="text-right">
            <div>{{ this.totalHours }}</div>
          </v-list-item-content>
        </v-list-item>
        <!-- Hours left this month -->
        <v-list-item>
          <v-list-item-content>Hours Remaining:</v-list-item-content>
          <v-list-item-content class="text-right">
            <div>{{ this.remainingHours }}</div>
          </v-list-item-content>
        </v-list-item>
        <!-- Work days left -->
        <v-list-item>
          <v-list-item-content>Work Days Remaining:</v-list-item-content>
          <v-list-item-content class="text-right">
            <div>
              <input
                type="text"
                class="text-right"
                :value="this.userWorkDays"
                @input="updateEstimate"
              />
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-dialog>
  </div>
</template>

<script>
import moment from 'moment';
import api from '@/shared/api.js';
import _ from 'lodash';

const IsoFormat = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sets the total cost per each expense type.
 *
 * @return Array - expense type and each total
 */
function jobHours() {
  let jobHours = [];
  jobHours = _.map(this.timeSheets, (item) => {
    return {
      name: item.jobcode,
      hours: 0
    };
  });
  jobHours = _.uniqWith(jobHours, _.isEqual);
  _.forEach(this.timeSheets, (hours) => {
    _.forEach(jobHours, (total) => {
      if (total.name === hours.jobcode) {
        total.hours += hours.duration;
      }
    });
  });
  _.forEach(jobHours, (total) => {
    total.hours = decimalToTime(total.hours);
  });
  jobHours = _.sortBy(jobHours, [
    function (job) {
      return job.name.toLowerCase();
    }
  ]);
  return jobHours;
} // jobHours

function remainingWorkDays() {
  let remainingWorkDays = 0;
  let day = moment();
  let currMonth = day.month();
  while (day.month() === currMonth) {
    // if day.isoWeekday() >= 1 && <=6 then add 1 day to remainingWorkDays
    if (day.isoWeekday() >= 1 && day.isoWeekday() <= 5) {
      remainingWorkDays += 1;
    }
    // increment to the next day
    day = day.add(1, 'd');
  }
  return remainingWorkDays;
} // remainingWorkDays

function workHours() {
  let workHours = 0;
  let day = moment().set('date', 1);
  let currMonth = day.month();
  while (day.month() === currMonth) {
    // if day.isoWeekday() >= 1 && <=6 then add 8 hours to workHours
    if (day.isoWeekday() >= 1 && day.isoWeekday() <= 5) {
      workHours += 8;
    }
    // increment to the next day
    day = day.add(1, 'd');
  }
  return workHours + 'h';
} // workHours

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget information for employee. Creates event listeners.
 */
async function created() {
  this.loading = true;
  // get the current day & time in the proper format
  let now = moment().format(IsoFormat);
  // set the current month
  this.month = moment().format('MMMM');
  // set the current year
  this.year = moment().format('YYYY');
  // get the first day of the month in the proper format
  let firstDay = moment().set('date', 1).format(IsoFormat);
  // get timesheets from api
  this.timeSheets = await api.getTimeSheets(this.employee.employeeNumber, firstDay, now);
  _.forEach(this.timeSheets, (hours) => {
    this.totalHours += hours.duration;
  });
  this.workHoursNumber = this.workHours.substring(0, this.workHours.length - 1);
  this.remainingHours = this.workHoursNumber - this.totalHours;
  this.userWorkDays = this.remainingWorkDays;
  this.estimatedDailyHours = this.remainingHours / this.userWorkDays;
  this.estimatedDailyHours = decimalToTime(this.estimatedDailyHours);
  this.totalHours = decimalToTime(this.totalHours);
  this.remainingHours = decimalToTime(this.remainingHours);
  this.loading = false;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Convert decimal number into hours and minutes.
 * @param hours the decimal number of hours
 */
function decimalToTime(hours) {
  var hrs = parseInt(Number(hours));
  var min = Math.round((Number(hours) - hrs) * 60);
  hours = hrs + 'h ' + min + 'm';
  return hours;
} // decimalToTime

/**
 * Convert time in hours and minutes into a decimal number of hours.
 * @param time the time in __h __m
 */
function timeToDecimal(time) {
  let words = time.split(' ');
  var hrs = parseInt(Number(words[0].substring(0, words[0].length - 1)));
  var min = parseInt(Number(words[1].substring(0, words[1].length - 1)));
  time = hrs + min / 60.0;
  return time;
} // timeToDecimal

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    jobHours,
    remainingWorkDays,
    workHours
  },
  created,
  data() {
    return {
      estimatedDailyHours: '',
      loading: false,
      month: '',
      monthlyMin: 0,
      remainingHours: 0,
      showDialog: false,
      timeSheets: [],
      totalHours: 0,
      userWorkDays: 0,
      workHoursNumber: 0,
      year: ''
    };
  },
  methods: {
    updateEstimate: function (event) {
      if (event.target.value > 0) {
        this.userWorkDays = event.target.value;
        console.log(timeToDecimal(this.remainingHours));
        this.estimatedDailyHours = timeToDecimal(this.remainingHours) / this.userWorkDays;
        this.estimatedDailyHours = decimalToTime(this.estimatedDailyHours);
      }
    }
  },
  props: ['employee'] // employee
};
</script>
