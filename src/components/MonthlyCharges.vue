<template>
  <div id="monthly-charges">
    <h3 align="center">
      Hours for {{ month }} {{ year }}
      <v-btn @click="toFAQ()" class="mb-4" x-small icon><v-icon color="#3f51b5">info</v-icon></v-btn>
    </h3>
    <!-- Error Getting Monthly Hours -->
    <div v-if="monthlyHourError" class="pt-2 pb-6" align="center">
      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on">warning</v-icon>
        </template>
        <span>Error</span>
      </v-tooltip>
    </div>
    <!-- End Error -->
    <div v-else>
      <v-card-text>
        <div v-if="this.loading" class="pb-4">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <div v-else>
          <!-- Display Charge Code Hours -->
          <div class="pt-3 px-5" style="border: 1px solid grey">
            <v-row v-for="job in quickBooksTimeData.jobcodeHours" :key="job.name">
              {{ job.name }}:
              <v-spacer></v-spacer>
              <p>{{ formatHours(job.hours) }}</p>
            </v-row>
            <v-row class="bold">
              Total:
              <v-spacer></v-spacer>
              <div>
                <p v-if="remainingHours > 0">{{ formatHours(totalHours) }} / {{ formatHours(workHours) }}</p>
                <p v-else style="color: green">{{ formatHours(totalHours) }} / {{ formatHours(workHours) }}</p>
              </div>
            </v-row>
          </div>
          <!-- Average Hours per Day -->
          <v-row class="pt-3">
            Remaining Avg Hours/Day:
            <v-spacer></v-spacer>
            <p v-if="this.estimatedDailyHours < 24">{{ formatHours(this.estimatedDailyHours) }}</p>
            <p v-else style="color: red">{{ formatHours(this.estimatedDailyHours) }}</p>
          </v-row>
          <!-- Button to Show More -->
          <div v-if="!showMore" @click="showMore = true" align="center">
            <v-btn @click="showMore = true" top text small class="my-2">Show More &#9662; </v-btn>
          </div>
          <div v-if="showMore" max-width="400">
            <!-- Hours left this month -->
            <v-row>
              Remaining:
              <v-spacer></v-spacer>
              <p>{{ formatHours(this.remainingHours) }}</p>
            </v-row>
            <!-- Hours worked this month -->
            <v-row>
              Completed:
              <v-spacer></v-spacer>
              <p v-if="this.workedHours < this.workHours - this.workDayHours * this.remainingWorkDays">
                {{ formatHours(this.workedHours) }}
              </p>
              <p v-else style="color: green">{{ formatHours(this.workedHours) }}</p>
            </v-row>
            <!-- Hours worked today -->
            <v-row>
              Today:
              <v-spacer></v-spacer>
              <p v-if="this.todaysHours < this.workDayHours">
                {{ formatHours(this.todaysHours) }}
              </p>
              <p v-else style="color: green">{{ formatHours(this.todaysHours) }}</p>
            </v-row>
            <!-- Future hours for this month -->
            <v-row>
              Future:
              <v-spacer></v-spacer>
              <p v-if="this.futureHours < this.workDayHours * (this.remainingWorkDays - 1)">
                {{ formatHours(this.futureHours) }}
              </p>
              <p v-else style="color: green">{{ formatHours(this.futureHours) }}</p>
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
                      style="max-width: 40px"
                      :value="this.userWorkDays"
                      @input="updateEstimate"
                    />
                  </p>
                </div>
              </div>
            </v-row>
          </div>
          <!-- Button to Show Less -->
          <div v-if="showMore" align="center">
            <v-btn @click="showMore = false" top text small class="my-2">Show Less &#9650; </v-btn>
          </div>
        </div>
      </v-card-text>
    </div>
  </div>
</template>

<script>
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import api from '@/shared/api.js';
import _ from 'lodash';
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Calculates and returns the remaining work days of the month.
 */
function remainingWorkDays() {
  let remainingWorkDays = 0;
  let day = moment();
  let currMonth = day.month();
  while (day.month() === currMonth) {
    if (day.isoWeekday() >= 1 && day.isoWeekday() <= 5) {
      // monday - friday
      remainingWorkDays += 1;
    }
    // increment to the next day
    day = day.add(1, 'd');
  }
  return remainingWorkDays;
} // remainingWorkDays

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget information for employee. Creates event listeners.
 */
async function created() {
  this.isEmployeeView = this.$route.name === 'employee';

  this.loading = true;
  // set the current month
  this.month = moment().format('MMMM');
  // set the current year
  this.year = moment().format('YYYY');

  await this.setMonthlyCharges();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

async function calcWorkHours() {
  let workHours = 0;
  let day = moment().set('date', 1);
  let currMonth = day.month();
  while (day.month() === currMonth) {
    // if day.isoWeekday() >= 1 && <=6 then add user hours to workHours
    if (day.isoWeekday() >= 1 && day.isoWeekday() <= 5) {
      workHours += this.workDayHours;
    }
    // increment to the next day
    day = day.add(1, 'd');
  }
  this.workHours = workHours;
} // calcWorkHours

/**
 * Rounds hours to 2 decimal places.
 * @param hours the decimal number of hours
 */
function roundHours(hours) {
  hours = Number(hours.toFixed(2));
  return hours;
} // roundHours

function formatHours(hours) {
  if (this.showMinutes) {
    let hrs = parseInt(Number(hours));
    let min = Math.round((Number(hours) - hrs) * 60);
    if (min == 60) {
      min = 0;
      hrs++;
    }
    hours = hrs + 'h ' + min + 'm';
    return hours;
  }
  hours = roundHours(hours);
  return `${hours}h`;
} // formatHours

/**
 * Sets the monthly charges for the employee (or user if no employee is specified).
 */
async function setMonthlyCharges() {
  this.employee = this.isEmployeeView ? this.passedEmployee : await api.getUser();
  if (!isEmpty(this.employee.id)) {
    this.workDayHours *= this.employee.workStatus * 0.01;
    // make call to api to get data
    this.quickBooksTimeData = await api.getMonthlyHours(this.employee.employeeNumber);

    if (
      _.isNil(this.quickBooksTimeData.previousHours) ||
      _.isNil(this.quickBooksTimeData.todaysHours) ||
      _.isNil(this.quickBooksTimeData.futureHours)
    ) {
      this.monthlyHourError = true;
    } else {
      this.workedHours = this.quickBooksTimeData.previousHours;
      this.todaysHours = this.quickBooksTimeData.todaysHours;
      this.futureHours = this.quickBooksTimeData.futureHours;
      this.totalHours = this.workedHours + this.todaysHours + this.futureHours;
      await this.calcWorkHours();
      this.remainingHours = this.workHours - this.totalHours;
      this.userWorkDays = this.remainingWorkDays;
      this.estimatedDailyHours = this.remainingHours / this.userWorkDays;
    }
    this.loading = false;
  }
} // setMonthlyCharges

/**
 * Opens new tab when info icon is selected w/in Quickbooks time box
 */
function toFAQ() {
  let faq = this.$router.resolve({ path: '/help/hoursInfo' });
  window.open(faq.href, '_blank');
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|
export default {
  computed: {
    remainingWorkDays
  },
  created,
  data() {
    return {
      employee: null, // employee to view
      estimatedDailyHours: 0, // estimated hours each day
      futureHours: 0, // hours recorded for the future
      isEmployeeView: false, // viewing component on the employee page
      loading: false, // loading
      month: '', // current month
      monthlyHourError: false, // error getting monthly hours
      remainingHours: 0, // remaining hours this month
      showMore: false, // show more time details
      todaysHours: 0, // hours completed today
      totalHours: 0, // total hours completed this month
      quickBooksTimeData: {}, // time sheet data
      userWorkDays: 0, // work days remaining this month
      workDayHours: 8, // average work day hours
      workedHours: 0, // total hours worked this month
      year: '' // current year
    };
  },
  methods: {
    calcWorkHours,
    formatHours,
    isEmpty,
    setMonthlyCharges,
    toFAQ,
    updateEstimate: function (event) {
      if (event.target.value > 0) {
        this.userWorkDays = event.target.value;
        this.estimatedDailyHours = this.remainingHours / this.userWorkDays;
        this.estimatedDailyHours = roundHours(this.estimatedDailyHours);
      }
    }
  },
  props: ['passedEmployee', 'showMinutes'],
  watch: {
    'passedEmployee.id': async function () {
      if (this.isEmployeeView) {
        await this.setMonthlyCharges();
      }
    }
  }
};
</script>
