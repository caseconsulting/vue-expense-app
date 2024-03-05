<template>
  <div>
    <v-row>
      <v-col order="1" cols="12" sm="12" md="6" lg="6" xl="6" xxl="6">
        <v-row class="mb-1" dense>
          <!-- Next and Previous Months, Title, and Expand/Collapse Time Period -->
          <v-col cols="3" class="d-flex align-center justify-center pa-0">
            <v-btn
              :disabled="!isMonthly || (isMonthly && !dateIsCurrentMonth)"
              icon=""
              variant="text"
              density="comfortable"
              @click="date = subtract(date, 1, 'month')"
            >
              <v-tooltip activator="parent" location="top">Previous Month</v-tooltip>
              <v-icon size="x-large"> mdi-arrow-left-thin </v-icon>
            </v-btn>
            <v-btn
              :disabled="!isMonthly || (isMonthly && dateIsCurrentMonth)"
              icon=""
              variant="text"
              density="comfortable"
              @click="date = add(date, 1, 'month')"
            >
              <v-tooltip activator="parent" location="top">Next Month</v-tooltip>
              <v-icon size="x-large"> mdi-arrow-right-thin </v-icon>
            </v-btn>
          </v-col>
          <v-col cols="6" class="d-flex align-center justify-center pa-0">
            <h3 class="text-center">
              {{ isMonthly ? format(date, null, 'MMMM') : format(today, null, 'YYYY') }}
            </h3>
          </v-col>
          <v-col cols="3" class="d-flex align-center justify-center pa-0">
            <v-btn
              icon=""
              variant="text"
              size="large"
              density="compact"
              :disabled="timePeriodLoading"
              @click="
                customWorkDayInput = null;
                isMonthly = !isMonthly;
                timePeriodLoading = true;
              "
            >
              <v-tooltip activator="parent" location="top">{{ isMonthly ? 'Show yearly' : 'Show monthly' }}</v-tooltip>
              <v-icon size="large">
                {{ isMonthly ? 'mdi-calendar-multiple' : 'mdi-calendar' }}
              </v-icon>
            </v-btn>
          </v-col>
          <!-- End Next and Previous Months, Title, and Expand/Collapse Time Period -->
        </v-row>
        <!-- Timesheets Donut Chart -->
        <v-progress-circular
          v-if="timePeriodLoading"
          size="120"
          width="15"
          class="mx-auto w-100"
          color="#AEAEAE"
          indeterminate="disable-shrink"
        ></v-progress-circular>
        <timesheets-chart
          v-else
          :key="timeData"
          :completed="formatNumber(periodHoursCompleted)"
          :needed="totalPeriodHours"
          :jobcodes="timeData || {}"
          :nonBillables="!isMonthly ? supplementalData.nonBillables : null"
          :remainingHours="formatNumber(remainingHours)"
        ></timesheets-chart>
        <!-- End Timesheets Donut Chart -->
      </v-col>
      <!-- Time Period Details -->
      <v-col :order="$vuetify.display.mdAndUp ? 2 : 3" cols="12" md="6" lg="6" xl="6" xxl="6">
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4"></v-skeleton-loader>
        <div v-else>
          <h3 class="d-flex align-center mb-3">
            <v-icon class="mr-2">mdi-book-open-outline</v-icon>
            {{ isMonthly ? 'Monthly' : 'Yearly' }} Details
          </h3>

          <div class="d-flex justify-space-between my-3">
            <div class="mr-2">Remaining</div>
            <div class="dotted-line"></div>
            <div class="ml-2">{{ formatNumber(remainingHours) }}h</div>
          </div>
          <div class="d-flex justify-space-between my-3">
            <div class="mr-2">Remaining Avg/Day</div>
            <div class="dotted-line"></div>
            <div :class="remainingAverageHoursPerDay > 8 ? 'text-red font-weight-bold' : ''" class="ml-2">
              {{ formatNumber(remainingAverageHoursPerDay) }}h
            </div>
          </div>
          <div class="d-flex justify-space-between my-3">
            <div class="mr-2">{{ hoursBehindBy > 0 ? 'Behind By' : 'Ahead By' }}</div>
            <div class="dotted-line"></div>
            <div :class="hoursBehindBy > 0 ? 'text-red font-weight-bold' : ''" class="ml-2">
              {{ Math.abs(formatNumber(hoursBehindBy)) }}h
            </div>
          </div>
          <div v-if="(isMonthly && dateIsCurrentMonth) || !isMonthly" class="d-flex justify-space-between my-3">
            <div class="mr-2">Future</div>
            <div class="dotted-line"></div>
            <div class="ml-2">{{ formatNumber(futureHours) }}h</div>
          </div>
          <div class="d-flex justify-space-between pointer my-3" @click="showCustomWorkDayInput = true">
            <div class="mr-3">
              Work Days Remaining
              <span
                v-if="(futureDays > 0 && isMonthly && dateIsCurrentMonth) || (futureDays > 0 && !isMonthly)"
                class="text-blue"
              >
                *
              </span>
              <v-tooltip
                v-if="(futureDays > 0 && isMonthly && dateIsCurrentMonth) || (futureDays > 0 && !isMonthly)"
                activator="parent"
                location="top"
              >
                {{ futureDays }} {{ futureDays > 1 ? 'days' : 'day' }} subtracted to account for future timesheets
              </v-tooltip>
            </div>
            <div class="dotted-line"></div>
            <div class="ml-3">
              <div v-if="!showCustomWorkDayInput" class="work-days-box">
                {{ formatNumber(remainingWorkDays) }}
              </div>
              <v-text-field
                v-else
                v-model="customWorkDayInput"
                autofocus
                type="text"
                variant="outlined"
                class="ma-0 pa-0 custom-input"
                @blur="showCustomWorkDayInput = false"
                hide-details
              ></v-text-field>
            </div>
          </div>
        </div>
      </v-col>
      <!-- End Time Period Details -->
      <!-- Time Period Job Codes -->
      <v-col :order="$vuetify.display.mdAndUp ? 3 : 2" cols="12">
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4"></v-skeleton-loader>
        <div v-else>
          <h3 class="d-flex align-center">
            <v-icon class="mr-2">mdi-briefcase-outline</v-icon> {{ isMonthly ? 'Monthly' : 'Yearly' }} Job Codes
            <v-avatar
              v-if="!isMonthly"
              @click="
                openLink(
                  'https://3.basecamp.com/3097063/buckets/4708396/messages/7069270310#:~:text=New%20Bonus%20Opportunity'
                )
              "
              class="ml-2 nudge-up"
              size="x-small"
              density="compact"
            >
              <v-tooltip activator="parent" location="top">Click for more information</v-tooltip>
              <v-icon size="x-small" color="#3f51b5">mdi-information</v-icon>
            </v-avatar>
          </h3>
          <div v-if="Object.entries(timeData || {})?.length === 0" class="my-3">No job codes for this time period</div>
          <div v-else>
            <div v-for="(duration, jobcode) in timeData" :key="jobcode">
              <div
                v-if="
                  isMonthly ||
                  showNonBillables ||
                  (!showNonBillables && !supplementalData.nonBillables.includes(jobcode))
                "
                :class="!isMonthly && supplementalData.nonBillables.includes(jobcode) ? 'text-grey' : ''"
                class="d-flex justify-space-between my-3"
              >
                <div class="mr-3">{{ jobcode }}</div>
                <div class="dotted-line"></div>
                <div class="ml-3">{{ formatNumber(convertToHours(duration)) }}h</div>
              </div>
            </div>
            <v-span
              v-if="!isMonthly && hasNonBillables()"
              @click="showNonBillables = !showNonBillables"
              class="pointer text-blue"
            >
              {{ showNonBillables ? 'Hide non-billables' : 'Show non-billables' }}
              <v-icon>{{ showNonBillables ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-span>
          </div>
        </div>
      </v-col>
      <!-- End Time Period Job Codes -->
    </v-row>
  </div>
</template>

<script>
import TimesheetsChart from '@/components/charts/custom-charts/TimesheetsChart.vue';
import _ from 'lodash';
import { formatNumber, openLink } from '@/utils/utils';
import {
  add,
  subtract,
  getIsoWeekday,
  getMonth,
  getTodaysDate,
  isAfter,
  isSame,
  isSameOrAfter,
  format,
  startOf,
  endOf,
  DEFAULT_ISOFORMAT
} from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * The Created lifecycle hook.
 */
function created() {
  this.emitter.on('reset-data', () => {
    this.isMonthly = true;
    format(this.today, null, DEFAULT_ISOFORMAT);
  });
} // created

// |--------------------------------------------------|
// |                                                  |
// |                 COMPUTED                         |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the date is in the current month.
 *
 * @returns Boolean - Whether or not the date is in the current month
 */
function dateIsCurrentMonth() {
  return isSame(getMonth(this.date), getMonth(this.today));
} // dateIsCurrentMonth

/**
 * The amount of different days timesheets were entered in the future.
 *
 * @returns Number - The amount of entered future days
 */
function futureDays() {
  return this.supplementalData?.future?.days || 0;
} // futureDays

/**
 * The amount of timesheets hours that are in the future.
 *
 * @returns Integer - The amount of hours entered in the future
 */
function futureHours() {
  return this.convertToHours(this.supplementalData?.future?.duration || 0);
} // futureHours

/**
 * Whether or not the employee has non-billables entered in their timesheets within the set time period.
 *
 * @returns Boolean - True if the employee has non-billable jobcodes in their timesheets within the time period
 */
function hasNonBillables() {
  let hasNonBillable = false;
  let jobcodes = Object.keys(this.timeData || {});
  for (let i = 0; i < jobcodes.length && !hasNonBillable; i++) {
    if (this.supplementalData.nonBillables?.includes(jobcodes[i])) hasNonBillable = true;
  }
  return hasNonBillable;
} // hasNonBillables

/**
 * The amount of hours an employee is behind schedule by. If there has been 3 work days so far, then a full time employee
 * should have 24 hours entered. If the number is negative, then the user is ahead in hours.
 *
 * @returns Number - The number of hours an employee is behind schedule by
 */
function hoursBehindBy() {
  return this.totalPeriodHours - this.remainingWorkDays * this.proRatedHours - this.periodHoursCompleted;
} // hoursBehindBy

/**
 * The amount of hours an employee has completed in the current time period.
 *
 * @returns Number - The time period hours an employee has completed
 */
function periodHoursCompleted() {
  let total = 0;
  _.forEach(this.timeData, (duration, jobName) => {
    if (this.isMonthly || (!this.isMonthly && !this.supplementalData.nonBillables?.includes(jobName))) {
      total += duration;
    }
  });
  return convertToHours(total);
} // periodHoursCompleted

/**
 * The amount of hours an employee should ideally enter per day. Full-time = 8, part-time (75%) = 6, part-time (50%) = 4.
 *
 * @returns The employees pro-rated hours needed per day
 */
function proRatedHours() {
  if (this.isMonthly) {
    return 8 * (this.employee.workStatus / 100);
  } else {
    return (this.totalPeriodHours / this.totalWorkDays) * (this.employee.workStatus / 100);
  }
} // proRatedHours

/**
 * The remaining hours needed for the time period.
 *
 * @returns Number - The reimaining hours needed
 */
function remainingHours() {
  let remaining = this.totalPeriodHours - this.periodHoursCompleted;
  return remaining > 0 ? remaining : 0;
} // remainingHours

/**
 * The remaining work days for the time period. Future hours will affect the number of work days remaining.
 *
 * @returns Number - The remaining work days for the time period.
 */
function remainingWorkDays() {
  if (this.customWorkDayInput && Number(this.customWorkDayInput)) {
    this.customWorkDayInput = Number(this.customWorkDayInput) ?? null;
    return this.customWorkDayInput || this.remainingWorkDays;
  } else if (this.isMonthly) {
    if (this.dateIsCurrentMonth) {
      return this.getWorkDays(this.date, endOf(this.date, 'month')) - this.futureDays - 1;
    } else {
      return 0;
    }
  } else {
    return this.getWorkDays(this.today, endOf(this.today, 'year')) - this.futureDays - 1;
  }
} // remainingWorkDays

/**
 * The remaining average hours needed per day.
 *
 * @returns Number - The remaining average number of hours needed per day
 */
function remainingAverageHoursPerDay() {
  if (Number(this.remainingWorkDays) > 0) {
    return this.remainingHours / this.remainingWorkDays;
  } else {
    return this.dateIsCurrentMonth ? this.remainingHours : 0;
  }
} // remainingAverageHoursPerDay

/**
 * The jobcodes and their durations all sorted by duration within the time period.
 *
 * @returns Object - Key Value pairs of jobcodes and their durations
 */
function timeData() {
  let timeData = {};
  if (this.isMonthly) {
    timeData = this.timesheets[format(this.date, null, 'YYYY-MM')];
  } else {
    _.forEach(this.timesheets, (monthTimesheets) => {
      _.forEach(monthTimesheets, (duration, jobName) => {
        if (!timeData[jobName]) timeData[jobName] = 0;
        timeData[jobName] += duration;
      });
    });
  }
  // sort by duration
  let orderedKeys = Object.keys(timeData).sort(function (a, b) {
    return timeData[b] - timeData[a];
  });
  // reassign object in sorted key value pairs
  let orderedTimeData = {};
  _.forEach(orderedKeys, (jobcode) => {
    orderedTimeData[jobcode] = timeData[jobcode];
  });
  return orderedTimeData;
} // timeData

/**
 * The total number of hours needed for a time period.
 *
 * @returns Number - The total number of hours needed
 */
function totalPeriodHours() {
  if (this.isMonthly) {
    return this.totalWorkDays * this.proRatedHours;
  } else {
    return this.BONUS_YEAR_TOTAL * (this.employee.workStatus / 100);
  }
} // totalPeriodHours

/**
 * The total number of work days for a time period.
 *
 * @returns Number - The total number of works days
 */
function totalWorkDays() {
  if (this.isMonthly) {
    return this.getWorkDays(startOf(this.date, 'month'), endOf(this.date, 'month'));
  } else {
    return this.getWorkDays(startOf(this.today, 'year'), endOf(this.today, 'year'));
  }
} // totalWorkDays

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Converts seconds to hours.
 *
 * @param {Number} seconds - The number of seconds to convert
 * @returns Number - The number of hours
 */
function convertToHours(seconds) {
  return Number(seconds / 60 / 60);
} // convertToHours

/**
 * Calculates and returns the work days between start and end dates provided
 *
 * @param {String} startDate - The start date (in YYYY-MM format)
 * @param {String} endDate - The end date (in YYYY-MM format)
 * @return int - number of remaining working days
 */
function getWorkDays(startDate, endDate) {
  let workDays = 0;
  let hireDate = this.employee.hireDate;
  startDate = format(startDate, null, DEFAULT_ISOFORMAT);
  endDate = format(endDate, null, DEFAULT_ISOFORMAT);
  if (isAfter(hireDate, startDate, 'day') && isSameOrAfter(endDate, hireDate, 'day')) {
    startDate = hireDate;
  }
  let date = startDate;
  while (!isAfter(date, endDate, 'day')) {
    if (this.isWeekDay(date)) {
      workDays += 1;
    }
    // increment to the next day
    date = add(date, 1, 'day', DEFAULT_ISOFORMAT);
  }
  return workDays;
} // getWorkDays

/**
 * Returns true if day is a weekday.
 *
 * @param {Number} day - The day of the week as an integer
 * @returns Boolean - Whether or not the day is a weekday
 */
function isWeekDay(day) {
  return getIsoWeekday(day) >= 1 && getIsoWeekday(day) <= 5;
} // isWeekDay

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * The watcher for the time period loader. If a user expands or collapses time period, emit the
 * new start and end dates.
 */
function watchTimePeriodLoading() {
  if (this.timePeriodLoading) {
    if (this.isMonthly) {
      this.emitter.emit('get-period-data', {
        startDate: format(startOf(subtract(this.today, 1, 'month'), 'month'), null, 'YYYY-MM'),
        endDate: format(endOf(this.today, 'month'), null, 'YYYY-MM'),
        isMonthly: this.isMonthly
      });
    } else {
      this.emitter.emit('get-period-data', {
        startDate: format(startOf(this.today, 'year'), null, 'YYYY-MM'),
        endDate: format(endOf(this.today, 'year'), null, 'YYYY-MM'),
        isMonthly: this.isMonthly
      });
    }
  }
} // watchTimePeriodLoading

/**
 * The watcher for the timesheets prop
 */
function watchTimesheets() {
  this.timePeriodLoading = false;
} // watchTimesheets

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    TimesheetsChart
  },
  computed: {
    dateIsCurrentMonth,
    futureDays,
    futureHours,
    hoursBehindBy,
    periodHoursCompleted,
    proRatedHours,
    remainingAverageHoursPerDay,
    remainingHours,
    remainingWorkDays,
    timeData,
    totalPeriodHours,
    totalWorkDays
  },
  created,
  data() {
    return {
      customWorkDayInput: null,
      date: format(getTodaysDate(), null, DEFAULT_ISOFORMAT),
      isMonthly: true,
      showCustomWorkDayInput: false,
      showNonBillables: false,
      timePeriodLoading: false,
      today: format(getTodaysDate(), null, DEFAULT_ISOFORMAT),
      BONUS_YEAR_TOTAL: 1860
    };
  },
  methods: {
    add,
    convertToHours,
    format,
    formatNumber,
    getMonth,
    getWorkDays,
    getTodaysDate,
    hasNonBillables,
    isWeekDay,
    openLink,
    subtract
  },
  props: ['employee', 'ptoBalances', 'supplementalData', 'timesheets'],
  watch: {
    timePeriodLoading: watchTimePeriodLoading,
    timesheets: watchTimesheets
  }
};
</script>

<style>
.custom-input input {
  padding: 5px 10px 3px 9px;
  width: 45px !important;
  height: 10px !important;
  min-height: 30px;
  font-size: 12px !important;
}
</style>

<style scoped>
.work-days-box {
  border-radius: 5px;
  color: black;
  background-color: rgba(0, 0, 0, 0.08);
  padding: 5px 10px 3px 9px;
}
.dotted-line {
  height: 0.8em;
  background-image: linear-gradient(to right, rgb(210, 210, 210) 33%, rgba(184, 184, 184, 0) 0%);
  background-position: bottom;
  background-size: 7px 1px;
  background-repeat: repeat-x;
  flex-grow: 2;
}
</style>
