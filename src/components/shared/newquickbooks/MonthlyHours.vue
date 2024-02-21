<template>
  <div>
    <v-row>
      <v-col order="1" cols="12" sm="12" md="6" lg="6" xl="6" xxl="6">
        <div class="d-flex justify-space-evenly align-center mb-1">
          <div>
            <v-btn
              :disabled="!isMonthly || (isMonthly && getMonth(date) !== getMonth(today))"
              icon=""
              variant="text"
              size="large"
              density="compact"
              @click="date = subtract(date, 1, 'month')"
            >
              <v-tooltip activator="parent" location="top">Previous Month</v-tooltip>
              <v-icon size="x-large"> mdi-arrow-left-thin </v-icon>
            </v-btn>
            <v-btn
              :disabled="!isMonthly || (isMonthly && getMonth(date) === getMonth(today))"
              icon=""
              variant="text"
              size="large"
              density="compact"
              @click="date = add(date, 1, 'month')"
            >
              <v-tooltip activator="parent" location="top">Next Month</v-tooltip>
              <v-icon size="x-large"> mdi-arrow-right-thin </v-icon>
            </v-btn>
          </div>
          <h3 class="pr-10">{{ isMonthly ? format(date, null, 'MMMM') : format(today, null, 'YYYY') }}</h3>
          <v-btn
            icon=""
            variant="text"
            size="large"
            density="compact"
            :disabled="timePeriodLoading"
            @click="
              isMonthly = !isMonthly;
              timePeriodLoading = true;
            "
          >
            <v-tooltip activator="parent" location="top">{{ isMonthly ? 'Show yearly' : 'Show monthly' }}</v-tooltip>
            <v-icon size="large">
              {{ isMonthly ? 'mdi-calendar-expand-horizontal' : 'mdi-calendar-collapse-horizontal' }}
            </v-icon>
          </v-btn>
        </div>
        <v-progress-circular
          v-if="timePeriodLoading"
          size="120"
          width="10"
          class="mx-auto w-100"
          color="#AEAEAE"
          indeterminate="disable-shrink"
        ></v-progress-circular>
        <timesheets-chart
          v-else
          :key="getTimeData"
          :completed="formatNum(periodHoursCompleted)"
          :needed="totalPeriodHours"
          :jobcodes="getTimeData || {}"
          :remainingHours="formatNum(remainingHours)"
        ></timesheets-chart>
      </v-col>
      <v-col :order="$vuetify.display.mdAndUp ? 2 : 3" cols="12" md="6" lg="6" xl="6" xxl="6">
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4"></v-skeleton-loader>
        <div v-else>
          <h3 class="d-flex align-center mb-3 mt-1">
            <v-icon class="mr-2">mdi-book-open-outline</v-icon>
            {{ isMonthly ? 'Monthly' : 'Yearly' }} Details
          </h3>

          <div class="d-flex justify-space-between my-3">
            <div class="mr-2">Remaining</div>
            <div class="dotted-line"></div>
            <div class="ml-2">{{ formatNum(remainingHours) }}h</div>
          </div>
          <div class="d-flex justify-space-between my-3">
            <div class="mr-2">Remaining Avg/Day</div>
            <div class="dotted-line"></div>
            <div :class="getRemainingAverageHoursPerDay > 8 ? 'text-red font-weight-bold' : ''" class="ml-2">
              {{ formatNum(getRemainingAverageHoursPerDay) }}h
            </div>
          </div>
          <div class="d-flex justify-space-between my-3">
            <div class="mr-2">{{ getHoursBehindBy > 0 ? 'Behind By' : 'Ahead By' }}</div>
            <div class="dotted-line"></div>
            <div :class="getHoursBehindBy > 0 ? 'text-red font-weight-bold' : ''" class="ml-2">
              {{ Math.abs(formatNum(getHoursBehindBy)) }}h
            </div>
          </div>
          <div class="d-flex justify-space-between my-3">
            <div class="mr-3">Days Remaining</div>
            <div class="dotted-line"></div>
            <div class="ml-3">{{ formatNum(getRemainingWorkDays) }}</div>
          </div>
        </div>
      </v-col>
      <v-col :order="$vuetify.display.mdAndUp ? 3 : 2" cols="12">
        <v-skeleton-loader v-if="timePeriodLoading" type="list-item@4"></v-skeleton-loader>
        <div v-else>
          <h3 class="d-flex align-center">
            <v-icon class="mr-2">mdi-briefcase-outline</v-icon> {{ isMonthly ? 'Monthly' : 'Yearly' }} Job Codes
          </h3>
          <div v-if="Object.entries(getTimeData || {})?.length === 0" class="my-3">
            No job codes for this time period
          </div>
          <div v-else>
            <div v-for="jobcode in sortedJobcodesByDuration" :key="jobcode" class="d-flex justify-space-between my-3">
              <div class="mr-3">{{ jobcode }}</div>
              <div class="dotted-line"></div>
              <div class="ml-3">{{ formatNum(convertToHours(getTimeData[jobcode])) }}h</div>
            </div>
            <v-span v-if="!isMonthly" @click="showPtoJobCodes = !showPtoJobCodes" class="pointer text-blue">
              {{ showPtoJobCodes ? 'Hide PTO jobcodes' : 'Show PTO job codes' }}
              <v-icon>{{ showPtoJobCodes ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-span>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import TimesheetsChart from '@/components/charts/custom-charts/TimesheetsChart.vue';
import _ from 'lodash';
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

function created() {
  this.emitter.on('reset-data', () => {
    this.isMonthly = true;
    format(this.today, null, DEFAULT_ISOFORMAT);
  });
}

function formatNum(value) {
  return value?.toFixed(2)?.replace(/[.,]00$/, ''); // removes decimals if a whole number
}

function convertToHours(seconds) {
  return Number(seconds / 60 / 60);
}

function getTimeData() {
  if (this.isMonthly) {
    return this.timesheets[format(this.date, null, 'YYYY-MM')];
  } else {
    let timesheets = {};
    _.forEach(this.timesheets, (monthTimesheets) => {
      _.forEach(monthTimesheets, (duration, jobName) => {
        if (this.showPtoJobCodes || !this.ptoJobcodes?.includes(jobName)) {
          if (!timesheets[jobName]) timesheets[jobName] = 0;
          timesheets[jobName] += duration;
        }
      });
    });
    return timesheets;
  }
}

function periodHoursCompleted() {
  let total = 0;
  _.forEach(this.getTimeData, (duration) => {
    total += duration;
  });
  return convertToHours(total);
}

function totalPeriodHours() {
  if (this.isMonthly || this.showPtoJobCodes) {
    return this.getTotalWorkDays * this.getProRatedHours;
  } else {
    return this.BONUS_YEAR_TOTAL * (this.employee.workStatus / 100);
  }
}

function remainingHours() {
  let remaining = this.totalPeriodHours - this.periodHoursCompleted;
  return remaining > 0 ? remaining : 0;
}

/**
 * Calculates and returns the work days between start and end dates provided
 *
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
    if (isWeekDay(date)) {
      workDays += 1;
    }
    // increment to the next day
    date = add(date, 1, 'day', DEFAULT_ISOFORMAT);
  }
  return workDays;
} // getWorkDays

function getRemainingWorkDays() {
  if (this.isMonthly) {
    if (this.dateIsCurrentMonth()) {
      return this.getWorkDays(this.date, endOf(this.date, 'month')) - 1;
    } else {
      return 0;
    }
  } else {
    return this.getWorkDays(this.today, endOf(this.today, 'year')) - 1;
  }
}

function getTotalWorkDays() {
  if (this.isMonthly) {
    return this.getWorkDays(startOf(this.date, 'month'), endOf(this.date, 'month'));
  } else {
    return this.getWorkDays(startOf(this.today, 'year'), endOf(this.today, 'year'));
  }
}

function dateIsCurrentMonth() {
  return isSame(getMonth(this.date), getMonth(this.today));
}

function getRemainingAverageHoursPerDay() {
  if (Number(this.getRemainingWorkDays) > 0) {
    return this.remainingHours / this.getRemainingWorkDays;
  } else {
    return this.dateIsCurrentMonth() ? this.remainingHours : 0;
  }
}

function getHoursBehindBy() {
  if (this.isMonthly) {
    if (this.dateIsCurrentMonth()) {
      return (
        this.getWorkDays(startOf(this.date, 'month'), this.date) * this.getProRatedHours - this.periodHoursCompleted
      );
    } else {
      return this.getTotalWorkDays * this.getProRatedHours - this.periodHoursCompleted;
    }
  } else {
    return (
      this.getWorkDays(startOf(this.today, 'year'), this.today) * this.getProRatedHours - this.periodHoursCompleted
    );
  }
}

function getProRatedHours() {
  if (this.isMonthly || this.showPtoJobCodes) {
    return 8 * (this.employee.workStatus / 100);
  } else {
    return (this.totalPeriodHours / this.getTotalWorkDays) * (this.employee.workStatus / 100);
  }
}

function sortedJobcodesByDuration() {
  let timeData = this.getTimeData;
  let orderedKeys = Object.keys(timeData).sort(function (a, b) {
    return timeData[b] - timeData[a];
  });
  return orderedKeys;
}

/**
 * Returns true if `day` is a weekday
 */
function isWeekDay(day) {
  return getIsoWeekday(day) >= 1 && getIsoWeekday(day) <= 5;
}

export default {
  components: {
    TimesheetsChart
  },
  computed: {
    getTimeData,
    getHoursBehindBy,
    getProRatedHours,
    getRemainingAverageHoursPerDay,
    getRemainingWorkDays,
    getTotalWorkDays,
    periodHoursCompleted,
    totalPeriodHours,
    remainingHours,
    sortedJobcodesByDuration
  },
  created,
  data() {
    return {
      isMonthly: true,
      date: format(getTodaysDate(), null, DEFAULT_ISOFORMAT),
      showPtoJobCodes: false,
      today: format(getTodaysDate(), null, DEFAULT_ISOFORMAT),
      timePeriodLoading: false,
      ptoJobcodes: Object.keys(this.ptoBalances),
      BONUS_YEAR_TOTAL: 1860
    };
  },
  methods: {
    add,
    subtract,
    convertToHours,
    dateIsCurrentMonth,
    getMonth,
    getWorkDays,
    getTodaysDate,
    format,
    formatNum
  },
  props: ['employee', 'ptoBalances', 'timesheets'],
  watch: {
    timePeriodLoading: function () {
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
    },
    timesheets: function () {
      this.timePeriodLoading = false;
    }
  }
};
</script>

<style scoped>
.dotted-line {
  height: 0.8em;
  background-image: linear-gradient(to right, rgb(210, 210, 210) 33%, rgba(184, 184, 184, 0) 0%);
  background-position: bottom;
  background-size: 7px 1px;
  background-repeat: repeat-x;
  flex-grow: 2;
}
</style>
