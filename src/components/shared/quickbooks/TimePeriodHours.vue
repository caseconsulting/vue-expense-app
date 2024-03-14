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
          :key="timeData"
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
        <time-period-job-codes
          v-else
          :isMonthly="isMonthly"
          :supplementalData="supplementalData"
          :timeData="timeData"
        ></time-period-job-codes>
      </v-col>
      <!-- End Time Period Job Codes -->
    </v-row>
  </div>
</template>

<script>
import TimesheetsChart from '@/components/charts/custom-charts/TimesheetsChart.vue';
import TimePeriodDetails from '@/components/shared/quickbooks/TimePeriodDetails.vue';
import TimePeriodJobCodes from '@/components/shared/quickbooks/TimePeriodJobCodes.vue';
import _ from 'lodash';
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
 * The Before Unmount lifecycle hook
 */
function beforeUnmount() {
  this.emitter.off('reset-data');
} // beforeUnmount

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
  beforeUnmount,
  components: {
    TimesheetsChart,
    TimePeriodDetails,
    TimePeriodJobCodes
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
      timePeriodLoading: false,
      today: format(getTodaysDate(), null, DEFAULT_ISOFORMAT)
    };
  },
  methods: {
    add,
    format,
    getMonth,
    getTodaysDate,
    subtract
  },
  props: ['employee', 'ptoBalances', 'supplementalData', 'timesheets'],
  watch: {
    timePeriodLoading: watchTimePeriodLoading,
    timesheets: watchTimesheets
  }
};
</script>
