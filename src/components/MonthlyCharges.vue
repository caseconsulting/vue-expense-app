<template>
  <div id="monthly-charges">
    <h3>Hours for {{ month }} {{ year }}</h3>
    <v-card-text>
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
              <div v-if="decimal">
                <p v-if="remainingHours > 0" style="color: red;">{{ this.totalHours }}h / {{ workHours }}</p>
                <p v-else style="color: green;">{{ this.totalHours }}h / {{ workHours }}</p>
              </div>
              <div v-else>
                <p v-if="remainingHours > 0" style="color: red;">{{ this.totalHoursHover }} / {{ workHours }}</p>
                <p v-else style="color: green;">{{ this.totalHoursHover }} / {{ workHours }}</p>
              </div>
            </div>
          </v-row>
          <template v-if="!showMore" @click="showMore = true">
            <v-btn @click="showMore = true" top text small class="my-2">Show More &#9662; </v-btn>
          </template>
          <div v-if="showMore" max-width="400">
            <!-- Hours worked this month -->
            <v-row>
              Previous:
              <v-spacer></v-spacer>
              <div>
                <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
                  <div v-if="decimal">
                    <p v-if="this.workedHours < this.workHours - 8 * this.remainingWorkDays">{{ this.workedHours }}h</p>
                    <p v-else style="color: green;">{{ this.workedHours }}h</p>
                  </div>
                  <div v-else>
                    <p v-if="this.workedHours < this.workHours - 8 * this.remainingWorkDays">
                      {{ this.workedHoursHover }}
                    </p>
                    <p v-else style="color: green;">{{ this.workedHoursHover }}</p>
                  </div>
                </div>
              </div>
            </v-row>
            <!-- Hours worked today -->
            <v-row>
              Today:
              <v-spacer></v-spacer>
              <div>
                <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
                  <div v-if="decimal">
                    <p v-if="this.todaysHours < 8">{{ this.todaysHours }}h</p>
                    <p v-else style="color: green;">{{ this.todaysHours }}h</p>
                  </div>
                  <div v-else>
                    <p v-if="this.todaysHours < 8">{{ this.todaysHoursHover }}</p>
                    <p v-else style="color: green;">{{ this.todaysHoursHover }}</p>
                  </div>
                </div>
              </div>
            </v-row>
            <!-- Future hours for this month -->
            <v-row>
              Future:
              <v-spacer></v-spacer>
              <div>
                <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
                  <div v-if="decimal">
                    <p v-if="this.futureHours < 8 * (this.remainingWorkDays - 1)">{{ this.futureHours }}h</p>
                    <p v-else style="color: green;">{{ this.futureHours }}h</p>
                  </div>
                  <div v-else>
                    <div>
                      <p v-if="this.futureHours < 8 * (this.remainingWorkDays - 1)">
                        {{ this.futureHoursHover }}
                      </p>
                      <p v-else style="color: green;">{{ this.futureHoursHover }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </v-row>
            <!-- Hours left this month -->
            <v-row>
              Remaining:
              <v-spacer></v-spacer>
              <div>
                <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
                  <p v-if="decimal">{{ this.remainingHours }}h</p>
                  <p v-else>{{ this.remainingHoursHover }}</p>
                </div>
              </div>
            </v-row>
            <!-- Work days left -->
            <v-row>
              Days Remaining:
              <v-spacer></v-spacer>
              <div>
                <div>
                  <p>
                    <input
                      type="text"
                      class="text-right"
                      style="max-width: 40px;"
                      :value="this.userWorkDays"
                      @input="updateEstimate"
                    />
                  </p>
                </div>
              </div>
            </v-row>
            <!-- Average Hours per Day -->
            <v-row>
              Avg Hours/Day:
              <v-spacer></v-spacer>
              <div>
                <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
                  <p v-if="decimal">{{ this.estimatedDailyHours }}h</p>
                  <p v-else>{{ this.estimatedDailyHoursHover }}</p>
                </div>
              </div>
            </v-row>
          </div>
          <template v-if="showMore">
            <v-btn @click="showMore = false" top text small class="my-2">Show Less &#9650; </v-btn>
          </template>
        </div>
      </div>
    </v-card-text>
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
  let allTimeSheets = _.union(this.previousTimeSheets, this.todaysTimeSheets, this.futureTimeSheets);
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
  let allTimeSheets = _.union(this.previousTimeSheets, this.todaysTimeSheets, this.futureTimeSheets);
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
  // set the current month
  this.month = moment().format('MMMM');
  // set the current year
  this.year = moment().format('YYYY');
  // get the first day of the month in the proper format
  let firstDay = moment().startOf('month').format(IsoFormat);
  // get last day of the month
  let lastDay = moment().endOf('month').format(IsoFormat);
  let yesterday = moment().subtract(1, 'days').endOf('day').format(IsoFormat);
  let today = moment().startOf('day').format(IsoFormat);
  let tomorrow = moment().add(1, 'days').startOf('day').format(IsoFormat);
  if (yesterday >= firstDay) {
    this.previousTimeSheets = await api.getTimeSheets(this.employee.employeeNumber, firstDay, yesterday);
    _.forEach(this.previousTimeSheets, (hours) => {
      this.workedHours += hours.duration;
    });
  }
  this.todaysTimeSheets = await api.getTimeSheets(this.employee.employeeNumber, today, today);
  _.forEach(this.todaysTimeSheets, (hours) => {
    this.todaysHours += hours.duration;
  });
  if (tomorrow <= lastDay) {
    this.futureTimeSheets = await api.getTimeSheets(this.employee.employeeNumber, tomorrow, lastDay);
    _.forEach(this.futureTimeSheets, (hours) => {
      this.futureHours += hours.duration;
    });
  }
  this.totalHours = this.workedHours + this.todaysHours + this.futureHours;
  this.totalHoursHover = decimalToTime(this.totalHours);
  this.workHoursNumber = this.workHours.substring(0, this.workHours.length - 1);
  this.remainingHours = this.workHoursNumber - this.totalHours;
  this.userWorkDays = this.remainingWorkDays;
  this.estimatedDailyHours = this.remainingHours / this.userWorkDays;
  this.estimatedDailyHoursHover = decimalToTime(this.estimatedDailyHours);
  this.workedHoursHover = decimalToTime(this.workedHours);
  this.remainingHoursHover = decimalToTime(this.remainingHours);
  this.todaysHoursHover = decimalToTime(this.todaysHours);
  this.futureHoursHover = decimalToTime(this.futureHours);
  this.estimatedDailyHours = roundHours(this.estimatedDailyHours);
  this.workedHours = roundHours(this.workedHours);
  this.todaysHours = roundHours(this.todaysHours);
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
  var min = Math.ceil((Number(hours) - hrs) * 60);
  if (min == 60) {
    min = 0;
    hrs++;
  }
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
      employee: {},
      estimatedDailyHours: 0,
      estimatedDailyHoursHover: '',
      futureHours: 0,
      futureHoursHover: '',
      futureTimeSheets: [],
      loading: false,
      month: '',
      monthlyMin: 0,
      previousTimeSheets: [],
      remainingHours: 0,
      remainingHoursHover: '',
      showMore: false,
      todaysHours: 0,
      todaysHoursHover: '',
      todaysTimeSheets: [],
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
