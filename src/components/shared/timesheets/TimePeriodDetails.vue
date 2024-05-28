<template>
  <div>
    <h3 class="d-flex align-center mb-3">
      <v-icon class="mr-2">mdi-book-open-outline</v-icon>
      {{ isYearly ? (isCalendarYear ? 'Calendar Year' : 'Contract Year') : 'Pay Period' }} Details
      <v-avatar
        @click="openLink($router.resolve({ path: '/help/timesheetCalculations' })?.href)"
        class="ml-2 nudge-up pointer"
        size="x-small"
        density="compact"
      >
        <v-tooltip activator="parent" location="top">Click to see calculations</v-tooltip>
        <v-icon icon="mdi-information" color="#3f51b5" size="x-small" />
      </v-avatar>
    </h3>

    <div class="d-flex justify-space-between my-3">
      <div class="mr-2">Remaining</div>
      <div class="dotted-line"></div>
      <div class="ml-2">{{ formatNumber(remainingHours) }}h</div>
    </div>
    <div class="d-flex justify-space-between my-3">
      <div class="mr-2">Remaining Avg/Day</div>
      <div class="dotted-line"></div>
      <div :class="remainingAverageHoursPerDay > WORK_HOURS_PER_DAY ? 'text-red font-weight-bold' : ''" class="ml-2">
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
    <div v-if="(!isYearly && dateIsCurrentPeriod) || isYearly" class="d-flex justify-space-between my-3">
      <div class="mr-2">Future</div>
      <div class="dotted-line"></div>
      <div class="ml-2">{{ formatNumber(futureHours) }}h</div>
    </div>
    <div class="d-flex justify-space-between my-3 pointer" @click="showCustomWorkDayInput = true">
      <div class="mr-3">
        Work Days Remaining
        <span
          v-if="(futureDays > 0 && !isYearly && dateIsCurrentPeriod) || (futureDays > 0 && isYearly)"
          class="text-blue"
        >
          *
        </span>
        <v-tooltip
          v-if="(futureDays > 0 && !isYearly && dateIsCurrentPeriod) || (futureDays > 0 && isYearly)"
          activator="parent"
          location="top"
          class="text-center"
        >
          {{ futureDays }} {{ futureDays > 1 ? 'days' : 'day' }} subtracted to account for future timesheets<span
            v-if="getPlannedPTO() > 0"
            >,<br />including {{ getPlannedPTO(true) }} {{ getPlannedPTO(true) > 1 ? 'days' : 'day' }} of planned
            PTO/Holiday</span
          >
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
</template>

<script>
import _ from 'lodash';
import { formatNumber, openLink } from '@/utils/utils';
import {
  add,
  getIsoWeekday,
  isAfter,
  isSameOrAfter,
  isSameOrBefore,
  format,
  getTodaysDate,
  DEFAULT_ISOFORMAT
} from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * The Mounted lifecycle hook
 */
function mounted() {
  this.emitter.emit('timesheets-chart-data', {
    completed: this.formatNumber(this.periodHoursCompleted),
    needed: this.totalPeriodHours,
    remainingHours: this.remainingHours
  });
  this.emitter.on('update-planned-pto-results-time-period', (data) => {
    this.employee.plannedPto = data;
  });
} // mounted

/**
 * The beforeUnmount lifecycle hook
 */
function beforeUnmount() {
  this.emitter.off('timesheets-chart-data');
  this.emitter.off('update-planned-pto-results-time-period');
} // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                 COMPUTED                         |
// |                                                  |
// |--------------------------------------------------|

/**
 * HELPER
 * Gets number of days that PTO is planned for. Rounds based on hours
 * in work day. Rounds up because 50% of a day planned means that you've
 * planned that day.
 *
 * @param convertToDays boolean - whether or not to convert to days
 */
function getPlannedPTO(convertToDays) {
  // do not include this value in the month view
  if (!this.isYearly) return 0;

  // early exit conditions
  let ptoPlan = this.employee.plannedPto?.plan;
  if (!ptoPlan) return 0;
  // get start and end dates
  let startDate = this.period.startDate;
  let endDate = this.period.endDate;
  // go through plan and tally up hours that fall between startDate and endDate
  let hoursPlanned = 0;
  for (let item of ptoPlan) {
    if (isSameOrAfter(item.date, startDate, 'month') && isSameOrBefore(item.date, endDate, 'month')) {
      hoursPlanned += Number(item.ptoHours) + Number(item.holidayHours);
    }
  }
  // convert hours to days (rounding up) and return result
  if (convertToDays) hoursPlanned = Math.ceil(hoursPlanned / this.WORK_HOURS_PER_DAY);
  return hoursPlanned;
} // getPlannedPTO

/**
 * The amount of different days timesheets were entered in the future.
 *
 * @returns Number - The amount of entered future days
 */
function futureDays() {
  // future work days planned
  let days = this.supplementalData?.future?.days || 0;
  // future PTO days planned
  days += this.getPlannedPTO(true);
  return days;
} // futureDays

/**
 * The amount of timesheets hours that are in the future.
 *
 * @returns Integer - The amount of hours entered in the future
 */
function futureHours() {
  // future work hours planned
  let hours = Number((this.supplementalData?.future?.duration || 0) / 60 / 60);
  // future PTO hours planned
  hours += this.getPlannedPTO(false);
  return hours;
} // futureHours

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
    if (!this.isYearly || (this.isYearly && !this.supplementalData.nonBillables?.includes(jobName))) {
      total += duration;
    }
  });
  // convert to hours
  return Number(total / 60 / 60);
} // periodHoursCompleted

/**
 * The amount of hours an employee should ideally enter per day. Full-time = 8, part-time (75%) = 6, part-time (50%) = 4.
 *
 * @returns The employees pro-rated hours needed per day
 */
function proRatedHours() {
  if (this.isYearly) {
    return this.BONUS_YEAR_TOTAL / this.getWorkDays(this.period.startDate, this.period.endDate, true);
  } else {
    return this.WORK_HOURS_PER_DAY * (this.employee.workStatus / 100);
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
  let remainingDays;
  let daysToSubtract = this.futureDays;
  if (this.isWeekDay(this.today)) daysToSubtract += 1;

  if (this.customWorkDayInput && Number(this.customWorkDayInput)) {
    this.customWorkDayInput = Number(this.customWorkDayInput) ?? null;
    remainingDays = this.customWorkDayInput || this.remainingWorkDays;
  } else {
    remainingDays = this.getWorkDays(this.today, this.period.endDate) - daysToSubtract;
    if (!this.dateIsCurrentPeriod) {
      remainingDays = 0;
    }
  }
  return Math.max(remainingDays, 0);
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
    return this.dateIsCurrentPeriod ? this.remainingHours : 0;
  }
} // remainingAverageHoursPerDay

/**
 * The total number of hours needed for a time period.
 *
 * @returns Number - The total number of hours needed
 */
function totalPeriodHours() {
  let total = this.totalWorkDays * this.proRatedHours;
  return this.isYearly ? Math.round(total) : total;
} // totalPeriodHours

/**
 * The total number of work days for a time period.
 *
 * @returns Number - The total number of works days
 */
function totalWorkDays() {
  return this.getWorkDays(this.period.startDate, this.period.endDate);
} // totalWorkDays

/**
 * Calculates and returns the work days between start and end dates provided
 *
 * @param {String} startDate - The start date
 * @param {String} endDate - The end date
 * @param {Boolean} excludeProRated - Whether or not to pro-rate based on hire date (default is to pro-rate)
 * @return int - number of remaining working days
 */
function getWorkDays(startDate, endDate, excludeProRated = false) {
  let workDays = 0;
  let hireDate = this.employee.hireDate;
  if (!excludeProRated && isAfter(hireDate, startDate, 'day') && isSameOrAfter(endDate, hireDate, 'day')) {
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
 * @param {String} day - The day
 * @returns Boolean - Whether or not the day is a weekday
 */
function isWeekDay(day) {
  return getIsoWeekday(day) >= 1 && getIsoWeekday(day) <= 5;
} // isWeekDay

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    futureDays,
    futureHours,
    hoursBehindBy,
    periodHoursCompleted,
    proRatedHours,
    remainingHours,
    remainingWorkDays,
    remainingAverageHoursPerDay,
    totalPeriodHours,
    totalWorkDays
  },
  data() {
    return {
      BONUS_YEAR_TOTAL: 1860,
      WORK_HOURS_PER_DAY: 8, // normal hours per day for full time employees
      customWorkDayInput: null,
      showCustomWorkDayInput: false,
      today: format(getTodaysDate(), null, DEFAULT_ISOFORMAT)
    };
  },
  methods: {
    formatNumber,
    getPlannedPTO,
    getWorkDays,
    isWeekDay,
    openLink
  },
  mounted,
  beforeUnmount,
  props: ['dateIsCurrentPeriod', 'employee', 'isCalendarYear', 'isYearly', 'period', 'supplementalData', 'timeData']
};
</script>

<style>
.custom-input input {
  padding: 5px 10px 3px 9px;
  width: 45px;
  height: 10px;
  min-height: 30px;
  font-size: 12px;
}
</style>

<style scoped>
.dotted-line {
  height: 0.8em;
  background-image: linear-gradient(to right, rgb(210, 210, 210) 33%, rgba(184, 184, 184, 0) 0%);
  background-position: bottom;
  background-size: 7px 1px;
  background-repeat: repeat-x;
  flex-grow: 2;
}
.nudge-up {
  top: -7px;
}
.work-days-box {
  border-radius: 5px;
  color: black;
  background-color: rgba(0, 0, 0, 0.08);
  padding: 5px 10px 3px 9px;
}
</style>
