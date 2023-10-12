<template>
  <div id="monthly-charges">
    <div class="d-flex justify-space-between">
      <div class="d-inline-block float-left">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn :disabled="isPrevPeriod || loading" icon @click="changePeriodData" v-on="on"
              ><v-icon x-large color="#bc3825"> mdi-arrow-left-thin </v-icon>
            </v-btn>
          </template>
          <span>{{ prevPayPeriod }}</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn :disabled="!isPrevPeriod || loading" icon @click="changePeriodData" v-on="on"
              ><v-icon x-large color="#bc3825"> mdi-arrow-right-thin </v-icon>
            </v-btn>
          </template>
          <span>{{ payPeriod }}</span>
        </v-tooltip>
      </div>
      <h3 align="center" class="d-inline-block">
        <span v-if="!isPrevPeriod">{{ payPeriod }}</span>
        <span v-else-if="isPrevPeriod"> {{ prevPayPeriod }}</span>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn @click="toFAQ()" class="mb-4" x-small icon v-on="on"><v-icon color="#3f51b5">info</v-icon></v-btn>
          </template>
          <span>Click for FAQ</span>
        </v-tooltip>
      </h3>
      <div class="filler"></div>
    </div>
    <!-- Error Getting Pay Period Hours -->
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
          <div class="pt-3 gray-border">
            <div v-if="!isPrevPeriod">
              <v-row v-for="job in quickBooksTimeData.jobcodeHours" :key="job.name">
                {{ job.name }}:
                <v-spacer></v-spacer>
                <p>{{ formatHours(job.hours) }}</p>
              </v-row>
            </div>
            <div v-else>
              <v-row v-for="job in quickBooksTimeData.previousPeriodJobcodeHours" :key="job.name">
                {{ job.name }}:
                <v-spacer></v-spacer>
                <p>{{ formatHours(job.hours) }}</p>
              </v-row>
            </div>
            <v-row class="bold">
              Total:
              <v-spacer></v-spacer>
              <div>
                <p v-if="remainingHours > 0">{{ formatHours(totalHours) }} / {{ formatHours(workHours) }}</p>
                <p v-else class="green--text">{{ formatHours(totalHours) }} / {{ formatHours(workHours) }}</p>
              </div>
            </v-row>
          </div>
          <!-- Average Hours per Day -->
          <v-row v-if="!isPrevPeriod" class="pt-3">
            Remaining Avg Hours/Day:
            <v-spacer></v-spacer>
            <p v-if="this.estimatedDailyHours < 24">{{ formatHours(this.estimatedDailyHours) }}</p>
            <p v-else class="red--text">{{ formatHours(this.estimatedDailyHours) }}</p>
          </v-row>
          <!-- Button to Show More -->
          <div v-if="!showMore" @click="showMore = true" align="center">
            <v-btn @click="showMore = true" top text small class="my-2">Show More &#9662; </v-btn>
          </div>
          <div v-if="showMore" max-width="400">
            <!-- Hours left this period -->
            <v-row :class="isPrevPeriod ? 'pt-3' : ''">
              Remaining:
              <v-spacer></v-spacer>
              <p>{{ formatHours(this.remainingHours) }}</p>
            </v-row>
            <!-- Hours worked this period -->
            <v-row>
              Completed:
              <v-spacer></v-spacer>
              <p v-if="this.workedHours < this.workHours - this.workDayHours * this.remainingWorkDays">
                {{ formatHours(this.workedHours) }}
              </p>
              <p v-else class="green--text">{{ formatHours(this.workedHours) }}</p>
            </v-row>
            <!-- Hours worked today -->
            <v-row v-if="!isPrevPeriod">
              Today:
              <v-spacer></v-spacer>
              <p v-if="this.todaysHours < this.workDayHours">
                {{ formatHours(this.todaysHours) }}
              </p>
              <p v-else class="green--text">{{ formatHours(this.todaysHours) }}</p>
            </v-row>
            <!-- Future hours for this period -->
            <v-row v-if="!isPrevPeriod">
              Future:
              <v-spacer></v-spacer>
              <p v-if="this.futureHours < this.workDayHours * (this.remainingWorkDays - 1)">
                {{ formatHours(this.futureHours) }}
              </p>
              <p v-else class="green--text">{{ formatHours(this.futureHours) }}</p>
            </v-row>
            <!-- Work days left -->
            <v-row v-if="!isPrevPeriod">
              Days Remaining:
              <v-spacer></v-spacer>
              <div>
                <div>
                  <p>
                    <input
                      v-if="!isPrevPeriod"
                      type="text"
                      class="text-right mw-50"
                      :value="this.userWorkDays"
                      @input="updateEstimate"
                    />
                    <input v-else type="text" class="text-right mw-50" :value="0" @input="updateEstimate" />
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
import api from '@/shared/api.js';
import _ from 'lodash';
import { isEmpty } from '@/utils/utils';
import {
  add,
  format,
  endOf,
  getIsoWeekday,
  getDay,
  getTodaysDate,
  setDay,
  subtract,
  DEFAULT_ISOFORMAT
} from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Calculates and returns the remaining work days of the period.
 *
 * @return int - number of remaining working days
 */
function remainingWorkDays() {
  let remainingWorkDays = 0;
  let startDay = getTodaysDate(DEFAULT_ISOFORMAT);
  let endDay = this.isPrevPeriod ? _.cloneDeep(this.prevPeriodEndDay) : _.cloneDeep(this.periodEndDay);
  while (startDay <= endDay) {
    if (getIsoWeekday(startDay) >= 1 && getIsoWeekday(startDay) <= 5) {
      // monday - friday
      remainingWorkDays += 1;
    }
    // increment to the next day
    startDay = format(add(startDay, 1, 'd'), null, DEFAULT_ISOFORMAT);
  }
  return remainingWorkDays;
} // remainingWorkDays

/**
 * Gets the formatted pay period.
 *
 * @returns the formatted pay period
 */
function payPeriod() {
  return `Hours for ${format(this.periodStartDay, null, 'MMM')} ${format(this.periodStartDay, null, 'DD')}-${format(
    this.periodEndDay,
    null,
    'DD'
  )}, ${format(this.periodStartDay, null, 'YYYY')}`;
} // payPeriod

/**
 * Gets the formatted previous pay period.
 *
 * @returns the formatted previous pay period
 */
function prevPayPeriod() {
  return `Hours for ${format(this.prevPeriodStartDay, null, 'MMM')} ${this.prevPeriodStartDay.split('-')[2]}-${
    this.prevPeriodEndDay.split('-')[2]
  }, ${this.prevPeriodEndDay.split('-')[0]}`;
} // prevPayPeriod

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget information for employee. Creates event listeners.
 */
async function created() {
  await this.setData();
} // created

/**
 * The mounted lifecycle hook.
 */
async function mounted() {
  this.emitter.on('refresh-quickbooks-data', async () => {
    this.refresh = true;
    await this.setData();
    this.refresh = false;
  });
} // mounted

/**
 * destroy listeners
 */
function beforeDestroy() {
  this.emitter.off('refresh-quickbooks-data');
} // beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * calculates remaning work hours and sets workHours
 */
function calcWorkHours() {
  let workHours = 0;
  let startDay = this.isPrevPeriod ? _.cloneDeep(this.prevPeriodStartDay) : _.cloneDeep(this.periodStartDay);
  let endDay = this.isPrevPeriod ? _.cloneDeep(this.prevPeriodEndDay) : _.cloneDeep(this.periodEndDay);
  while (startDay <= endDay) {
    // if day.isoWeekday() >= 1 && <= 5 then add user hours to workHours
    if (getIsoWeekday(startDay) >= 1 && getIsoWeekday(startDay) <= 5) {
      workHours += this.workDayHours;
    }
    // increment to the next day
    startDay = format(add(startDay, 1, 'd'), null, DEFAULT_ISOFORMAT);
  }
  this.workHours = workHours;
} // calcWorkHours

/**
 * Changes all data for hours for the period chosen by the user, which is either this period's hours or last period's hours.
 */
function changePeriodData() {
  this.isPrevPeriod = !this.isPrevPeriod;
  if (this.isPrevPeriod) {
    if (_.isNil(this.quickBooksTimeData.previousPeriodHours)) {
      this.monthlyHourError = true;
    } else {
      this.workedHours = this.quickBooksTimeData.previousPeriodHours;
      this.totalHours = this.workedHours;
      this.calcWorkHours();
      this.remainingHours = this.workHours - this.totalHours;
    }
  } else {
    // if the user switches back to this period's hours after seeing the previous period's hours
    if (_.isNil(this.quickBooksTimeData.previousHours)) {
      this.monthlyHourError = true;
    } else {
      this.previousHours = this.quickBooksTimeData.previousHours;
      this.workedHours = this.previousHours + this.todaysHours;
      this.totalHours = this.previousHours + this.todaysHours + this.futureHours;
      this.calcWorkHours();
      this.remainingHours = this.workHours - this.totalHours;
    }
  }
} // changePeriodData

/**
 * Rounds hours to 2 decimal places.
 *
 * @param hours the decimal number of hours
 * @return number - the rounded number of hours
 */
function roundHours(hours) {
  hours = Number(hours.toFixed(2));
  return hours;
} // roundHours

/**
 * formats hours to a format for display
 *
 * @return string - the formatted hours and minutes (if showMinutes is true)
 */
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
  hours = this.roundHours(hours);
  return `${hours}h`;
} // formatHours

/**
 * Sets all of the fields on initial load or refresh.
 */
async function setData() {
  this.loading = true;
  let today = getTodaysDate(DEFAULT_ISOFORMAT);

  // determine if employee is in first or second pay period of the period
  this.isFirstPeriod = getDay(today) < 16;

  // set the first day of the current pay period
  this.periodStartDay = this.isFirstPeriod
    ? format(setDay(today, 1), null, DEFAULT_ISOFORMAT)
    : format(setDay(today, 16), null, DEFAULT_ISOFORMAT);

  // set last day of current pay period
  this.periodEndDay = this.isFirstPeriod
    ? format(setDay(today, 15), null, DEFAULT_ISOFORMAT)
    : format(endOf(today, 'month'), null, DEFAULT_ISOFORMAT);

  // set first day of previous pay period
  this.prevPeriodStartDay = this.isFirstPeriod
    ? format(setDay(subtract(today, 1, 'months'), 16), null, DEFAULT_ISOFORMAT)
    : format(setDay(today, 1), null, DEFAULT_ISOFORMAT);

  // set last day of previous pay period
  this.prevPeriodEndDay = this.isFirstPeriod
    ? format(endOf(subtract(today, 1, 'months'), 'month'), null, DEFAULT_ISOFORMAT)
    : format(setDay(today, 15), null, DEFAULT_ISOFORMAT);

  await this.setPeriodCharges();
} // setData

/**
 * Sets the pay period charges for the employee (or user if no employee is specified).
 */
async function setPeriodCharges() {
  this.employee = this.passedEmployee ? this.passedEmployee : this.$store.getters.user;
  if (this.employee && !this.isEmpty(this.employee.id)) {
    this.workDayHours *= this.employee.workStatus * 0.01;
    // make call to api to get data
    if (
      !this.$store.getters.quickbooksMonthlyHours ||
      this.$store.getters.user.id != this.employee.id ||
      this.refresh
    ) {
      this.quickBooksTimeData = await api.getMonthlyHours(this.employee.employeeNumber);
      if (!(this.quickBooksTimeData instanceof Error) && this.$store.getters.user.id == this.employee.id) {
        // only set vuex store if the user is looking at their own quickbooks data
        this.$store.dispatch('setQuickbooksMonthlyHours', { quickbooksMonthlyHours: this.quickBooksTimeData });
      }
    } else {
      this.quickBooksTimeData = this.$store.getters.quickbooksMonthlyHours;
    }

    if (
      _.isNil(this.quickBooksTimeData.previousHours) ||
      _.isNil(this.quickBooksTimeData.todaysHours) ||
      _.isNil(this.quickBooksTimeData.futureHours)
    ) {
      this.monthlyHourError = true;
    } else {
      this.previousHours = this.quickBooksTimeData.previousHours;
      this.todaysHours = this.quickBooksTimeData.todaysHours;
      this.futureHours = this.quickBooksTimeData.futureHours;
      this.workedHours = this.previousHours + this.todaysHours;
      this.totalHours = this.previousHours + this.todaysHours + this.futureHours;
      this.calcWorkHours();
      this.remainingHours = this.workHours - this.totalHours;
      this.userWorkDays = this.remainingWorkDays;
      this.estimatedDailyHours = this.userWorkDays === 0 ? 0 : this.remainingHours / this.userWorkDays;
    }
    this.loading = false;
  }
} // setPeriodCharges

/**
 * Opens new tab when info icon is selected w/in Quickbooks time box
 */
function toFAQ() {
  let faq = this.$router.resolve({ path: '/help/hoursInfo' });
  window.open(faq.href, '_blank');
} // toFAQ

/**
 * Updates the estimated daily hours based on number of work days and hours remaining
 *
 * @param event - the event is used for the number of user work days
 */
function updateEstimate(event) {
  if (event.target.value > 0) {
    this.userWorkDays = event.target.value;
    this.estimatedDailyHours = this.remainingHours / this.userWorkDays;
    this.estimatedDailyHours = roundHours(this.estimatedDailyHours);
  }
} //updateEstimate

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for passedEmployee.id
 */
async function watchPassedEmployeeID() {
  if (this.passedEmployee) {
    this.loading = true;
    this.isPrevPeriod = false;
    this.monthlyHourError = false;
    this.refresh = true;
    await this.setPeriodCharges();
  }
} // watchPassedEmployeeID

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|
export default {
  computed: {
    payPeriod,
    prevPayPeriod,
    remainingWorkDays
  },
  beforeDestroy,
  created,
  data() {
    return {
      employee: null, // employee to view
      estimatedDailyHours: 0, // estimated hours each day
      isFirstPeriod: false, // if the pay period is days 1-15 or not
      futureHours: 0, // hours recorded for the future
      isPrevPeriod: false, // viewing previous period hours
      loading: false, // loading
      month: '', // the period of the pay period
      periodStartDay: '', // current pay period start
      periodEndDay: '', // current pay period end
      monthlyHourError: false, // error getting pay period hours
      prevPeriodStart: '', // previous pay period start
      prevPeriodEnd: '', // previous pay period end
      refresh: false, // if the data has been refreshed
      remainingHours: 0, // remaining hours this period
      showMore: false, // show more time details
      todaysHours: 0, // hours completed today
      totalHours: 0, // total hours completed this period
      quickBooksTimeData: {}, // time sheet data
      userWorkDays: 0, // work days remaining this period
      workDayHours: 8, // average work day hours
      workedHours: 0, // total hours worked this period
      previousHours: 0, // total hours recorded prior to today
      year: '' // the year of the pay period
    };
  },
  methods: {
    add, // dateUtils
    calcWorkHours,
    changePeriodData,
    endOf,
    format, // dateUtils
    formatHours,
    getIsoWeekday, // dateUtils
    getDay,
    getTodaysDate, // dateUtils
    isEmpty,
    roundHours,
    setDay, // dateUtils
    setData,
    setPeriodCharges,
    subtract, // dateUtils
    toFAQ,
    updateEstimate
  },
  mounted,
  props: ['passedEmployee', 'showMinutes'],
  watch: {
    'passedEmployee.id': watchPassedEmployeeID
  }
};
</script>

<style scoped>
.filler {
  width: 72px;
}
</style>
