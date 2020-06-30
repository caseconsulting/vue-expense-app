<template>
  <div id="monthly-charges">
    <h3>Hours for {{ month }} {{ year }}</h3>
    <v-card-text class="px-7 pt-5 pb-1 black--text">
      <div v-if="this.loading" class="pb-4">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <div v-else>
        <!-- If the user has no hours -->
        <v-row v-if="jobHours.length == 0" justify="center">
          <p>No hours for this month</p>
        </v-row>
        <div v-else>
          <div v-if="decimal">
            <v-row v-for="job in jobHours" :key="job.name">
              {{ job.name }}:
              <v-spacer></v-spacer>
              <p @mouseover="decimal = !decimal">{{ job.hours }}h</p>
            </v-row>
          </div>
          <div v-else>
            <v-row v-for="job in jobHoursHover" :key="job.name">
              {{ job.name }}:
              <v-spacer></v-spacer>
              <p @mouseleave="decimal = !decimal">{{ job.hours }}</p>
            </v-row>
          </div>
          <v-row class="bold">
            Total:
            <v-spacer></v-spacer>
            <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
              <p v-if="decimal">{{ this.totalHours }}h / {{ workHours }}</p>
              <p v-else>{{ this.totalHoursHover }} / {{ workHours }}</p>
            </div>
          </v-row>
          <v-row @click="showDialog = true">
            Avg Hours/Day to meet {{ month }} Hours:
            <v-spacer></v-spacer>
            <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
              <p v-if="decimal">{{ this.estimatedDailyHours }}h</p>
              <p v-else>{{ this.estimatedDailyHoursHover }}</p>
            </div>
          </v-row>
        </div>
      </div>
    </v-card-text>
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
            <div @mouseover="decimalDialog = !decimalDialog" @mouseleave="decimalDialog = !decimalDialog">
              <p v-if="decimalDialog">{{ this.workedHours }}h</p>
              <p v-else>{{ this.workedHoursHover }}</p>
            </div>
          </v-list-item-content>
        </v-list-item>
        <!-- Future hours for this month -->
        <v-list-item>
          <v-list-item-content>Future Hours:</v-list-item-content>
          <v-list-item-content class="text-right">
            <div @mouseover="decimalDialog = !decimalDialog" @mouseleave="decimalDialog = !decimalDialog">
              <p v-if="decimalDialog">{{ this.futureHours }}h</p>
              <p v-else>{{ this.futureHoursHover }}</p>
            </div>
          </v-list-item-content>
        </v-list-item>
        <!-- Hours left this month -->
        <v-list-item>
          <v-list-item-content>Hours Remaining:</v-list-item-content>
          <v-list-item-content class="text-right">
            <div @mouseover="decimalDialog = !decimalDialog" @mouseleave="decimalDialog = !decimalDialog">
              <p v-if="decimalDialog">{{ this.remainingHours }}h</p>
              <p v-else>{{ this.remainingHoursHover }}</p>
            </div>
          </v-list-item-content>
        </v-list-item>
        <!-- Work days left -->
        <v-list-item>
          <v-list-item-content>Work Days Remaining:</v-list-item-content>
          <v-list-item-content class="text-right">
            <div>
              <input type="text" class="text-right" :value="this.userWorkDays" @input="updateEstimate" />
            </div>
          </v-list-item-content>
        </v-list-item>
        <!-- Average Hours per Day -->
        <v-list-item>
          <v-list-item-content>Avg Hours/Day ({{ month }}):</v-list-item-content>
          <v-list-item-content class="text-right">
            <div @mouseover="decimalDialog = !decimalDialog" @mouseleave="decimalDialog = !decimalDialog">
              <p v-if="decimalDialog">{{ this.estimatedDailyHours }}h</p>
              <p v-else>{{ this.estimatedDailyHoursHover }}</p>
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
  let allTimeSheets = _.union(this.timeSheets, this.futureTimeSheets);
  jobHours = _.map(allTimeSheets, (item) => {
    return {
      name: item.jobcode,
      hours: 0
    };
  });
  jobHours = _.uniqWith(jobHours, _.isEqual);
  _.forEach(allTimeSheets, (hours) => {
    _.forEach(jobHours, (total) => {
      if (total.name === hours.jobcode) {
        total.hours += hours.duration;
      }
    });
  });
  _.forEach(jobHours, (total) => {
    total.hours = roundHours(total.hours);
  });
  jobHours = _.sortBy(jobHours, [
    function (job) {
      return job.name.toLowerCase();
    }
  ]);
  return jobHours;
} // jobHours
/**
 * Sets the total cost per each expense type.
 *
 * @return Array - expense type and each total
 */
function jobHoursHover() {
  let jobHoursHover = [];
  let allTimeSheets = _.union(this.timeSheets, this.futureTimeSheets);
  jobHoursHover = _.map(allTimeSheets, (item) => {
    return {
      name: item.jobcode,
      hours: 0
    };
  });
  jobHoursHover = _.uniqWith(jobHoursHover, _.isEqual);
  _.forEach(allTimeSheets, (hours) => {
    _.forEach(jobHoursHover, (total) => {
      if (total.name === hours.jobcode) {
        total.hours += hours.duration;
      }
    });
  });
  _.forEach(jobHoursHover, (total) => {
    total.hours = decimalToTime(total.hours);
  });
  jobHoursHover = _.sortBy(jobHoursHover, [
    function (job) {
      return job.name.toLowerCase();
    }
  ]);
  return jobHoursHover;
} // jobHoursHover
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
  this.employee = await api.getUser();
  // get the current day & time in the proper format
  let now = moment().format(IsoFormat);
  // set the current month
  this.month = moment().format('MMMM');
  // set the current year
  this.year = moment().format('YYYY');
  // get the first day of the month in the proper format
  let firstDay = moment().startOf('month').format(IsoFormat);
  // get last day of the month
  let lastDay = moment().endOf('month').format(IsoFormat);
  // get timesheets from api
  this.timeSheets = await api.getTimeSheets(this.employee.employeeNumber, firstDay, now);
  _.forEach(this.timeSheets, (hours) => {
    this.workedHours += hours.duration;
  });
  let tomorrow = moment().add(1, 'days').format(IsoFormat);
  if (tomorrow <= lastDay) {
    this.futureTimeSheets = await api.getTimeSheets(this.employee.employeeNumber, tomorrow, lastDay);
    _.forEach(this.futureTimeSheets, (hours) => {
      this.futureHours += hours.duration;
    });
  }
  this.totalHours = this.workedHours + this.futureHours;
  this.totalHoursHover = decimalToTime(this.totalHours);
  this.workHoursNumber = this.workHours.substring(0, this.workHours.length - 1);
  this.remainingHours = this.workHoursNumber - this.totalHours;
  this.userWorkDays = this.remainingWorkDays;
  this.estimatedDailyHours = this.remainingHours / this.userWorkDays;
  this.estimatedDailyHoursHover = decimalToTime(this.estimatedDailyHours);
  this.workedHoursHover = decimalToTime(this.workedHours);
  this.remainingHoursHover = decimalToTime(this.remainingHours);
  this.futureHoursHover = decimalToTime(this.futureHours);
  this.estimatedDailyHours = roundHours(this.estimatedDailyHours);
  this.workedHours = roundHours(this.workedHours);
  this.futureHours = roundHours(this.futureHours);
  this.remainingHours = roundHours(this.remainingHours);
  this.totalHours = roundHours(this.totalHours);
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
 * Rounds hours to 2 decimal places.
 * @param hours the decimal number of hours
 */
function roundHours(hours) {
  hours = hours.toFixed(2);
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
    jobHoursHover,
    remainingWorkDays,
    workHours
  },
  created,
  data() {
    return {
      decimal: true,
      decimalDialog: true,
      employee: {},
      estimatedDailyHours: 0,
      estimatedDailyHoursHover: '',
      futureHours: 0,
      futureHoursHover: '',
      futureTimeSheets: [],
      loading: false,
      month: '',
      monthlyMin: 0,
      remainingHours: 0,
      remainingHoursHover: '',
      showDialog: false,
      timeSheets: [],
      totalHours: 0,
      totalHoursHover: '',
      userWorkDays: 0,
      workedHours: 0,
      workedHoursHover: '',
      workHoursNumber: 0,
      year: ''
    };
  },
  methods: {
    updateEstimate: function (event) {
      if (event.target.value > 0) {
        this.userWorkDays = event.target.value;
        this.estimatedDailyHours = timeToDecimal(this.remainingHoursHover) / this.userWorkDays;
        this.estimatedDailyHours = roundHours(this.estimatedDailyHours);
        this.estimatedDailyHoursHover = decimalToTime(this.estimatedDailyHours);
      }
    }
  }
};
</script>
