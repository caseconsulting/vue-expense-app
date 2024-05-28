<template>
  <div>
    <v-row class="tmp d-flex justify-space-evenly pa-0 pb-2 my-1 mx-7">
      <v-btn
        variant="text"
        :class="!isYearly ? 'text-blue-darken-2 bg-blue-lighten-5' : ''"
        :disabled="timePeriodLoading"
        @click="
          customWorkDayInput = null;
          isYearly = false;
          timePeriodLoading = true;
        "
      >
        <v-icon size="x-large">mdi-calendar</v-icon>
        <v-tooltip activator="parent" location="top">Pay Period</v-tooltip>
      </v-btn>
      <v-btn
        variant="text"
        class="mx-2"
        :class="isYearly ? (isCalendarYear ? 'text-blue-darken-2 bg-blue-lighten-5' : '') : ''"
        :disabled="timePeriodLoading"
        @click="
          customWorkDayInput = null;
          isYearly = true;
          isCalendarYear = true;
          timePeriodLoading = true;
        "
      >
        <v-icon size="x-large">mdi-calendar-multiple</v-icon>
        <v-tooltip activator="parent" location="top">Calendar Year</v-tooltip>
      </v-btn>
      <div>
        <v-btn
          variant="text"
          :class="isYearly ? (!isCalendarYear ? 'text-blue-darken-2 bg-blue-lighten-5' : '') : ''"
          :disabled="timePeriodLoading || !showContractYear()"
          @click="
            customWorkDayInput = null;
            isYearly = true;
            isCalendarYear = false;
            timePeriodLoading = true;
          "
        >
          <v-icon size="x-large">mdi-calendar-weekend</v-icon>
        </v-btn>
        <v-tooltip v-if="!timePeriodLoading" activator="parent" location="top">
          <span>{{ showContractYear() ? 'Contract Year' : 'Coming soon: contract year view' }}</span>
        </v-tooltip>
      </div>
    </v-row>
    <v-row class="pa=0 ma-0">
      <v-col order="1" cols="12" sm="12" md="6" lg="6" xl="6" xxl="6" class="pa-1">
        <!-- Title -->
        <v-row dense>
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
          </v-col>
          <v-col class="d-flex align-center justify-center pa-0">
            <v-skeleton-loader v-if="timePeriodLoading" type="text" width="100"></v-skeleton-loader>
            <div v-else class="d-flex justify-center">
              <div v-if="timesheets[periodIndex]?.title.includes('-')" class="d-flex flex-column justify-start w-100">
                <h4>{{ timesheets[periodIndex]?.title.split('-')[0] }} -</h4>
                <h4>{{ timesheets[periodIndex]?.title.split('-')[1] }}</h4>
              </div>
              <h3 v-else>
                {{ timesheets[periodIndex]?.title }}
              </h3>
            </div>
          </v-col>
          <v-col cols="3" class="d-flex align-center justify-center pa-0">
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
        </v-row>
        <!-- End Title -->
        <!-- Timesheets Donut Chart -->
        <v-progress-circular
          v-if="timePeriodLoading"
          size="120"
          width="15"
          class="mx-auto w-100 mt-2"
          color="#AEAEAE"
          indeterminate="disable-shrink"
        ></v-progress-circular>
        <timesheets-chart
          v-else
          class="mt-2"
          :key="timeData"
          :jobcodes="timeData || {}"
          :nonBillables="isYearly ? supplementalData.nonBillables : null"
        ></timesheets-chart>
        <!-- End Timesheets Donut Chart -->
      </v-col>
      <!-- Time Period Details -->
      <v-col :order="$vuetify.display.mdAndUp ? 2 : 3" cols="12" md="6" lg="6" xl="6" xxl="6" class="pa-1">
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4"></v-skeleton-loader>
        <time-period-details
          v-else
          :key="timeData"
          :dateIsCurrentPeriod="dateIsCurrentPeriod"
          :employee="employee"
          :isCalendarYear="isCalendarYear"
          :isYearly="isYearly"
          :period="timesheets[periodIndex]"
          :supplementalData="supplementalData"
          :timeData="timeData"
        ></time-period-details>
      </v-col>
      <!-- End Time Period Details -->
      <!-- Time Period Job Codes -->
      <v-col
        :order="$vuetify.display.mdAndUp ? 3 : 2"
        cols="12"
        :class="$vuetify.display.mdAndUp ? 'pa-0 mt-4' : 'pa-0 mt-8 mb-2'"
      >
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4"></v-skeleton-loader>
        <time-period-job-codes
          v-else
          :isCalendarYear="isCalendarYear"
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
import TimePeriodDetails from '@/components/shared/timesheets/TimePeriodDetails.vue';
import TimePeriodJobCodes from '@/components/shared/timesheets/TimePeriodJobCodes.vue';
import _ from 'lodash';

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
 * Whether or not to allow a user/admin to see a contract year view.
 *
 * @returns Boolean - True if an admin has selected to show a users contract year for a project.
 */
function showContractYear() {
  return _.some(this.employee.contracts, (c) => _.find(c.projects, (p) => p.bonusCalculationDate));
} // showContractYear

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
      isCalendarYear: this.isCalendarYear,
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
  components: {
    TimesheetsChart,
    TimePeriodDetails,
    TimePeriodJobCodes
  },
  computed: {
    dateIsCurrentPeriod,
    timeData
  },
  data() {
    return {
      periodIndex: this.timesheets.length - 1,
      isYearly: false,
      isCalendarYear: false,
      timePeriodLoading: false
    };
  },
  methods: {
    showContractYear
  },
  props: ['employee', 'ptoBalances', 'supplementalData', 'timesheets'],
  watch: {
    timePeriodLoading: watchTimePeriodLoading,
    timesheets: watchTimesheets
  }
};
</script>

<style>
.tmp {
  border-bottom: 1px solid rgb(225, 225, 225);
}
</style>
