<template>
  <div>
    <v-row>
      <v-col order="1" cols="12" sm="12" md="6" lg="6" xl="6" xxl="6">
        <v-row class="mb-1" dense>
          <!-- Next and Previous Months, Title, and Expand/Collapse Time Period -->
          <v-col cols="3" class="d-flex align-center justify-center pa-0">
            <v-btn
              :disabled="isYearly || (!isYearly && periodIndex === 0)"
              icon=""
              variant="text"
              density="comfortable"
              @click="periodIndex -= 1"
            >
              <v-tooltip activator="parent" location="top">Previous Pay Period</v-tooltip>
              <v-icon size="x-large"> mdi-arrow-left-thin </v-icon>
            </v-btn>
            <v-btn
              :disabled="isYearly || (!isYearly && dateIsCurrentPeriod)"
              icon=""
              variant="text"
              density="comfortable"
              @click="periodIndex += 1"
            >
              <v-tooltip activator="parent" location="top">Next Pay Period</v-tooltip>
              <v-icon size="x-large"> mdi-arrow-right-thin </v-icon>
            </v-btn>
          </v-col>
          <v-col cols="6" class="d-flex align-center justify-center pa-0">
            <v-skeleton-loader v-if="timePeriodLoading" type="text" width="100"></v-skeleton-loader>
            <h3 v-else class="text-center">
              {{ timesheets[periodIndex]?.title }}
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
                isYearly = !isYearly;
                timePeriodLoading = true;
              "
            >
              <v-tooltip activator="parent" location="top">
                {{ isYearly ? 'Show Pay Periods' : 'Show yearly' }}
              </v-tooltip>
              <v-icon size="large">
                {{ isYearly ? 'mdi-calendar' : 'mdi-calendar-multiple' }}
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
          :nonBillables="isYearly ? supplementalData.nonBillables : null"
        ></timesheets-chart>
        <!-- End Timesheets Donut Chart -->
      </v-col>
      <!-- Time Period Details -->
      <v-col :order="$vuetify.display.mdAndUp ? 2 : 3" cols="12" md="6" lg="6" xl="6" xxl="6">
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4"></v-skeleton-loader>
        <time-period-details
          v-else
          :key="timeData"
          :dateIsCurrentPeriod="dateIsCurrentPeriod"
          :employee="employee"
          :isYearly="isYearly"
          :period="timesheets[periodIndex]"
          :supplementalData="supplementalData"
          :timeData="timeData"
        ></time-period-details>
      </v-col>
      <!-- End Time Period Details -->
      <!-- Time Period Job Codes -->
      <v-col :order="$vuetify.display.mdAndUp ? 3 : 2" cols="12">
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4"></v-skeleton-loader>
        <time-period-job-codes
          v-else
          :isYearly="isYearly"
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
    this.isYearly = false;
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
function dateIsCurrentPeriod() {
  return this.periodIndex === this.timesheets.length - 1;
} // dateIsCurrentPeriod

/**
 * The jobcodes and their durations all sorted by duration within the time period.
 *
 * @returns Object - Key Value pairs of jobcodes and their durations
 */
function timeData() {
  let timeData = this.timesheets[this.periodIndex].timesheets;
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
    this.emitter.emit('get-period-data', {
      isYearly: this.isYearly
    });
  }
} // watchTimePeriodLoading

/**
 * The watcher for the timesheets prop
 */
function watchTimesheets() {
  if (this.isYearly) this.periodIndex = 0;
  else this.periodIndex = this.timesheets.length - 1;
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
    dateIsCurrentPeriod,
    timeData
  },
  created,
  data() {
    return {
      periodIndex: this.timesheets.length - 1,
      isYearly: false,
      timePeriodLoading: false
    };
  },
  props: ['employee', 'ptoBalances', 'supplementalData', 'timesheets'],
  watch: {
    timePeriodLoading: watchTimePeriodLoading,
    timesheets: watchTimesheets
  }
};
</script>
