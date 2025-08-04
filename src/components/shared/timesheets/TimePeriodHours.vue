<template>
  <div :key="refreshKey">
    <v-row class="bottom-border d-flex justify-space-evenly pa-0 pb-2 my-1 mx-7">
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
      <div class="wrapper">
        <div v-if="isYearly && isCalendarYear && !timePeriodLoading">
          <v-icon size="x-small" class="top-left" color="green">mdi-currency-usd</v-icon>
          <v-icon size="x-small" class="top-right" color="green">mdi-currency-usd</v-icon>
          <v-icon size="x-small" class="bottom-left" color="green">mdi-currency-usd</v-icon>
          <v-icon size="x-small" class="bottom-right" color="green">mdi-currency-usd</v-icon>
        </div>
        <v-btn
          variant="text"
          class="mx-2"
          :class="isYearly ? (isCalendarYear ? 'text-green-darken-2 bg-green-lighten-5' : '') : ''"
          :disabled="timePeriodLoading"
          @click="
            customWorkDayInput = null;
            isYearly = true;
            isCalendarYear = true;
            timePeriodLoading = true;
          "
        >
          <v-icon size="x-large">mdi-calendar-multiple</v-icon>
          <v-tooltip activator="parent" location="top"> Calendar Year (towards bonus) </v-tooltip>
        </v-btn>
      </div>
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
          <span>{{ showContractYear() ? 'Contract Year' : 'Contract year has not been enabled by an admin' }}</span>
        </v-tooltip>
      </div>
    </v-row>
    <v-row class="pa=0 ma-0">
      <v-col order="1" cols="12" sm="12" md="6" lg="6" xl="6" xxl="6" class="pa-1">
        <!-- Title -->
        <v-row dense>
          <v-col cols="3" class="d-flex align-center justify-center pa-0">
            <v-btn :disabled="periodIndex === 0" icon="" variant="text" density="comfortable" @click="periodIndex -= 1">
              <v-tooltip activator="parent" location="top">Previous Pay Period</v-tooltip>
              <v-icon size="x-large"> mdi-arrow-left-thin </v-icon>
            </v-btn>
          </v-col>
          <v-col class="d-flex align-center justify-center pa-0">
            <v-skeleton-loader v-if="timePeriodLoading" type="text" width="100"></v-skeleton-loader>
            <div v-else class="d-flex justify-center">
              <div v-if="timesheets[periodIndex]?.title?.includes('-')" class="d-flex flex-column justify-start w-100">
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
              :disabled="dateIsCurrentPeriod"
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
          :nonBillables="isYearly ? supplementalDataWithPlan.nonBillables : null"
          :title="timesheets[periodIndex].title"
        />
        <!-- End Timesheets Donut Chart -->
      </v-col>
      <!-- Time Period Details -->
      <v-col :order="$vuetify.display.mdAndUp ? 2 : 3" cols="12" md="6" lg="6" xl="6" xxl="6" class="pa-1">
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4" />

        <div v-else-if="!timesheets[periodIndex]" class="d-flex align-center justify-center">
          Couldn't load time period info
        </div>

        <time-period-details
          v-else
          :key="timeData"
          :dateIsCurrentPeriod="dateIsCurrentPeriod"
          :employee="employee"
          :isCalendarYear="isCalendarYear"
          :isYearly="isYearly"
          :period="timesheets[periodIndex]"
          :supplementalData="supplementalDataWithPlan"
          :timeData="timeData"
          :title="timesheets[periodIndex]?.title"
        />
      </v-col>
      <!-- End Time Period Details -->
      <!-- Time Period Job Codes -->
      <v-col
        :order="$vuetify.display.mdAndUp ? 3 : 2"
        cols="12"
        :class="$vuetify.display.mdAndUp ? 'pa-0 mt-4' : 'pa-0 mt-8 mb-2'"
      >
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4" />
        <time-period-job-codes
          v-else
          :employee="employee"
          :isCalendarYear="isCalendarYear"
          :isYearly="isYearly"
          :supplementalData="supplementalDataWithPlan"
          :timeData="timeData"
          :title="timesheets[periodIndex]?.title"
          :periodType="periodType"
        />
      </v-col>
      <!-- End Time Period Job Codes -->
    </v-row>
  </div>
</template>

<script setup>
import TimesheetsChart from '@/components/charts/custom-charts/TimesheetsChart.vue';
import TimePeriodDetails from '@/components/shared/timesheets/TimePeriodDetails.vue';
import TimePeriodJobCodes from '@/components/shared/timesheets/TimePeriodJobCodes.vue';
import { getEmployeeCurrentContracts } from '@/shared/employeeUtils';
import { isAfter, isBefore, isSameOrBefore, getTodaysDate } from '@/shared/dateUtils';
import _find from 'lodash/find';
import _forEach from 'lodash/forEach';
import { computed, inject, ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['employee', 'ptoBalances', 'supplementalData', 'timesheets', 'KEYS']);
const emitter = inject('emitter');
const store = useStore();

const periodIndex = ref(props.timesheets.length - 1);
const isYearly = ref(false);
const isCalendarYear = ref(false);
const timePeriodLoading = ref(false);
const refreshKey = ref(0);
let plannedTimeData = reactive({});

// |--------------------------------------------------|
// |                                                  |
// |                    LIFECYCLE                     |
// |                                                  |
// |--------------------------------------------------|
onMounted(() => {
  // init PTO plan from employee object
  refreshPtoPlan();

  // get employee plan when updated
  emitter.on('update-planned-pto-results-job-codes', () => {
    refreshPtoPlan();
  });
});

onBeforeUnmount(() => {
  emitter.off('update-planned-pto-results-job-codes');
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the date is in the current month.
 *
 * @returns Boolean - Whether or not the date is in the current month
 */
const dateIsCurrentPeriod = computed(() => {
  return periodIndex.value === Object.keys(props.timesheets).length - 1;
}); // dateIsCurrentPeriod

/**
 * The jobcodes and their durations all sorted by duration within the time period.
 *
 * @returns Object - Key Value pairs of jobcodes and their durations
 */
const timeData = computed(() => {
  let timesheets = { ...props.timesheets[periodIndex.value]?.timesheets };
  // searching store employees fixes bug where switching user profiles erases legacy job codes
  let legacyCodes = props.employee.legacyJobCodes;
  legacyCodes = legacyCodes || store.getters.employees?.find((e) => e.id === props.employee.id)?.legacyJobCodes;
  if (isYearly.value && legacyCodes) {
    let val;
    for (let key of Object.keys(legacyCodes || {})) {
      val = legacyCodes[key];
      if (typeof val === 'object') {
        // LJC is in new structure, only unpack if it's the right type
        if (periodType.value === key) timesheets = { ...timesheets, ...val };
      } else {
        // LJC is in old structure, which is just contract year
        if (periodType.value === props.KEYS.CONTRACT_YEAR) timesheets[key] = val;
      }
    }
  }
  // add in planned pto/holiday
  if (plannedTimeData) {
    if (plannedTimeData.PTO) {
      if (!timesheets['Planned PTO']) timesheets['Planned PTO'] = 0;
      timesheets['Planned PTO'] += plannedTimeData.PTO;
    }
    if (plannedTimeData.Holiday) {
      if (!timesheets['Planned Holiday']) timesheets['Planned Holiday'] = 0;
      timesheets['Planned Holiday'] += plannedTimeData.Holiday;
    }
  }
  // sort by duration
  let orderedKeys = Object.keys(timesheets).sort(function (a, b) {
    return timesheets[b] - timesheets[a];
  });
  // reassign object in sorted key value pairs
  let orderedTimeData = {};
  _forEach(orderedKeys, (jobcode) => {
    orderedTimeData[jobcode] = timesheets[jobcode];
  });
  return orderedTimeData;
}); // timeData

/**
 * Adds Planned PTO/Holiday to non-billables
 */
const supplementalDataWithPlan = computed(() => {
  let data = { ...props.supplementalData };
  data.nonBillables = [...(data.nonBillables ?? []), 'Planned PTO', 'Planned Holiday'];
  return data;
});

let periodType = computed(() => {
  if (!isYearly.value) return props.KEYS.PAY_PERIODS; // either bi-weekly or monthly, sometimes depends on employee and if there's a merger
  return isCalendarYear.value ? props.KEYS.CALENDAR_YEAR : props.KEYS.CONTRACT_YEAR; // currently the only two options
});

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Whether or not to allow a user/admin to see a contract year view.
 *
 * @returns Boolean - True if an admin has selected to show a users contract year for a project.
 */
function showContractYear() {
  let empCurContract = getEmployeeCurrentContracts(props.employee)?.[0];
  let contract = _find(store.getters.contracts, (c) => c.id === empCurContract?.contractId);
  return contract?.settings?.timesheetsContractViewOption;
} // showContractYear

/**
 * Refreshes PTO plan data
 */
function refreshPtoPlan() {
  if (props.timesheets.length == 0) return;

  // sum up and save the results of plan within time range
  let startDate = props.timesheets[periodIndex.value].startDate;
  let endDate = props.timesheets[periodIndex.value].endDate;
  plannedTimeData.PTO = 0;
  plannedTimeData.Holiday = 0;
  for (let plan of props.employee.plannedPto?.plan ?? []) {
    // skip if past, stop if future
    if (isSameOrBefore(plan.date, getTodaysDate(), 'month')) continue;
    if (isBefore(plan.date, startDate, 'month')) continue;
    if (isAfter(plan.date, endDate, 'month')) break;
    // else, add it (* 3600 to convert hours to seconds)
    plannedTimeData.PTO += Number(plan.ptoHours) * 3600;
    plannedTimeData.Holiday += Number(plan.holidayHours) * 3600;
  }
} // refreshPtoPlan

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * The watcher for the time period loader. If a user expands or collapses time period, emit the
 * new start and end dates.
 */
watch(
  () => timePeriodLoading.value,
  () => {
    if (timePeriodLoading.value) {
      emitter.emit('get-period-data', {
        isCalendarYear: isCalendarYear.value,
        isYearly: isYearly.value
      });
    }
  }
); // watchTimePeriodLoading

/**
 * The watcher for the timesheets prop.
 */
watch(
  () => props.timesheets,
  () => {
    periodIndex.value = props.timesheets.length - 1;
    refreshPtoPlan();
    timePeriodLoading.value = false;
  }
); // watchTimesheets
</script>

<style>
.bottom-border {
  border-bottom: 1px solid rgb(225, 225, 225);
}
.top-left {
  position: absolute !important;
  top: 1px;
  left: 7px;
  font-size: 12px !important;
  z-index: 9999;
}
.top-right {
  position: absolute !important;
  top: 1px;
  right: 7px;
  font-size: 12px !important;
  z-index: 9999;
}
.bottom-left {
  position: absolute !important;
  bottom: 1px;
  left: 7px;
  font-size: 12px !important;
  z-index: 9999;
}
.bottom-right {
  position: absolute !important;
  bottom: 1px;
  right: 7px;
  font-size: 12px !important;
  z-index: 9999;
}
.wrapper {
  position: relative !important;
}
</style>
