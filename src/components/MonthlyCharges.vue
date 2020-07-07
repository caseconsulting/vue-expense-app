<template>
  <div id="monthly-charges">
    <h3>
      Hours for {{ month }} {{ year }}
      <router-link to="/help" tag="v-icon">info</router-link>
    </h3>
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
          <div class="pt-3 px-5" style="border: 1px solid grey;">
            <div v-if="decimal">
              <v-row v-for="job in jobHours" :key="job.name">
                {{ job.name }}:
                <v-spacer></v-spacer>
                <p @mouseover="decimal = !decimal">{{ job.hours }}h</p>
              </v-row>
            </div>
            <div v-else>
              <v-row v-for="job in jobHours" :key="job.name">
                {{ job.name }}:
                <v-spacer></v-spacer>
                <p @mouseleave="decimal = !decimal">{{ job.hours | decimalToTime }}</p>
              </v-row>
            </div>
            <v-row class="bold">
              Total:
              <v-spacer></v-spacer>
              <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
                <div v-if="decimal">
                  <p v-if="remainingHours > 0">{{ this.totalHours }}h / {{ workHours }}</p>
                  <p v-else style="color: green;">{{ this.totalHours }}h / {{ workHours }}</p>
                </div>
                <div v-else>
                  <p v-if="remainingHours > 0">{{ this.totalHours | decimalToTime }} / {{ workHours }}</p>
                  <p v-else style="color: green;">{{ this.totalHours | decimalToTime }} / {{ workHours }}</p>
                </div>
              </div>
            </v-row>
          </div>
          <!-- Average Hours per Day -->
          <v-row class="pt-3">
            Avg Hours/Day:
            <v-spacer></v-spacer>
            <div>
              <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
                <p v-if="decimal">{{ this.estimatedDailyHours }}h</p>
                <p v-else>{{ this.estimatedDailyHours | decimalToTime }}</p>
              </div>
            </div>
          </v-row>
          <template v-if="!showMore" @click="showMore = true">
            <v-btn @click="showMore = true" top text small class="my-2">Show More &#9662; </v-btn>
          </template>
          <div v-if="showMore" max-width="400">
            <!-- Hours left this month -->
            <v-row>
              Remaining:
              <v-spacer></v-spacer>
              <div>
                <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
                  <p v-if="decimal">{{ this.remainingHours }}h</p>
                  <p v-else>{{ this.remainingHours | decimalToTime }}</p>
                </div>
              </div>
            </v-row>
            <!-- Hours worked this month -->
            <v-row>
              Completed:
              <v-spacer></v-spacer>
              <div>
                <div @mouseover="decimal = !decimal" @mouseleave="decimal = !decimal">
                  <div v-if="decimal">
                    <p v-if="this.workedHours < this.workHoursNumber - 8 * this.remainingWorkDays">
                      {{ this.workedHours }}h
                    </p>
                    <p v-else style="color: green;">{{ this.workedHours }}h</p>
                  </div>
                  <div v-else>
                    <p v-if="this.workedHours < this.workHoursNumber - 8 * this.remainingWorkDays">
                      {{ this.workedHours | decimalToTime }}
                    </p>
                    <p v-else style="color: green;">{{ this.workedHours | decimalToTime }}</p>
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
                    <p v-if="this.todaysHours < 8">{{ this.todaysHours | decimalToTime }}</p>
                    <p v-else style="color: green;">{{ this.todaysHours | decimalToTime }}</p>
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
                        {{ this.futureHours | decimalToTime }}
                      </p>
                      <p v-else style="color: green;">{{ this.futureHours | decimalToTime }}</p>
                    </div>
                  </div>
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
  this.workHoursNumber = this.workHours.substring(0, this.workHours.length - 1);
  this.remainingHours = this.workHoursNumber - this.totalHours;
  this.userWorkDays = this.remainingWorkDays;
  this.estimatedDailyHours = this.remainingHours / this.userWorkDays;
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
 * Rounds hours to 2 decimal places.
 * @param hours the decimal number of hours
 */
function roundHours(hours) {
  hours = hours.toFixed(2);
  return hours;
} // roundHours
// |--------------------------------------------------|
// |                                                  |
// |                     FILTERS                      |
// |                                                  |
// |--------------------------------------------------|
/**
 * Convert decimal number into hours and minutes.
 * @param hours the decimal number of hours
 */
function decimalToTime(hours) {
  var hrs = parseInt(Number(hours));
  var min = Math.round((Number(hours) - hrs) * 60);
  if (min == 60) {
    min = 0;
    hrs++;
  }
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
    remainingWorkDays,
    workHours
  },
  created,
  data() {
    return {
      decimal: true,
      employee: {},
      estimatedDailyHours: 0,
      futureHours: 0,
      futureTimeSheets: [],
      loading: false,
      month: '',
      monthlyMin: 0,
      previousTimeSheets: [],
      remainingHours: 0,
      remainingHoursHover: '',
      showMore: false,
      todaysHours: 0,
      todaysTimeSheets: [],
      totalHours: 0,
      userWorkDays: 0,
      workedHours: 0,
      workHoursNumber: 0,
      year: ''
    };
  },
  filters: {
    decimalToTime
  },
  methods: {
    updateEstimate: function (event) {
      if (event.target.value > 0) {
        this.userWorkDays = event.target.value;
        this.estimatedDailyHours = roundHours(this.estimatedDailyHours);
      }
    }
  }
};
</script>
