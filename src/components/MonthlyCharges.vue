<template>
  <div id="monthly-charges">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Hours for {{ month }} {{ year }}</h4>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
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
      </v-card-text>
    </v-card>
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
      return job.name;
    }
  ]);
  return jobHours;
} // jobHours

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
  this.totalHours = decimalToTime(this.totalHours);
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Convert decimal number in to hours and minutes.
 * @param hours the decimal number of hours
 */
function decimalToTime(hours) {
  var hrs = parseInt(Number(hours));
  var min = Math.round((Number(hours) - hrs) * 60);
  hours = hrs + 'h ' + min + 'm';
  return hours;
} // decimalToTime

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    jobHours,
    workHours
  },
  created,
  data() {
    return {
      month: '',
      monthlyMin: 0,
      timeSheets: [],
      totalHours: 0,
      year: ''
    };
  },
  props: ['employee'] // employee
};
</script>
