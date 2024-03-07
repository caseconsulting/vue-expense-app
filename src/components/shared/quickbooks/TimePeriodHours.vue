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
          :jobcodes="timeData || {}"
          :nonBillables="!isMonthly ? supplementalData.nonBillables : null"
        ></timesheets-chart>
        <!-- End Timesheets Donut Chart -->
      </v-col>
      <!-- Time Period Details -->
      <v-col :order="$vuetify.display.mdAndUp ? 2 : 3" cols="12" md="6" lg="6" xl="6" xxl="6">
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4"></v-skeleton-loader>
        <time-period-details
          v-else
          :date="date"
          :dateIsCurrentMonth="dateIsCurrentMonth"
          :employee="employee"
          :isMonthly="isMonthly"
          :supplementalData="supplementalData"
          :timeData="timeData"
          :today="today"
        ></time-period-details>
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
import TimePeriodDetails from '@/components/shared/quickbooks/TimePeriodDetails';
import _ from 'lodash';
import { formatNumber, openLink } from '@/utils/utils';
import {
  add,
  subtract,
  getMonth,
  getTodaysDate,
  isSame,
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
    TimesheetsChart,
    TimePeriodDetails
  },
  computed: {
    dateIsCurrentMonth,
    timeData
  },
  created,
  data() {
    return {
      date: format(getTodaysDate(), null, DEFAULT_ISOFORMAT),
      isMonthly: true,
      showNonBillables: false,
      timePeriodLoading: false,
      today: format(getTodaysDate(), null, DEFAULT_ISOFORMAT)
    };
  },
  methods: {
    add,
    convertToHours,
    format,
    formatNumber,
    getMonth,
    getTodaysDate,
    hasNonBillables,
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
