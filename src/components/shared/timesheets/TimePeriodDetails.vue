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
      <div :class="remainingAverageHoursPerDay > WORK_HOURS_PER_DAY ? avgDayColor : ''" class="ml-2">
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
    <div
      class="d-flex justify-space-between my-3 pointer"
      @click="
        showCustomWorkDayInput = true;
        customWorkDayInput = remainingWorkDays;
      "
    >
      <div class="mr-3">
        Work Days Remaining
        <span v-if="remainingWorkDaysTooltip" class="text-blue"> * </span>
        <v-tooltip v-if="remainingWorkDaysTooltip" activator="parent" location="top" class="text-center">
          <div v-for="line in remainingWorkDaysTooltip.split('NEWLINE')" :key="line" class="text-left">{{ line }}</div>
        </v-tooltip>
      </div>
      <div class="dotted-line"></div>
      <div class="ml-2">
        <div v-if="!showCustomWorkDayInput" class="work-days-box">
          {{ formatNumber(remainingWorkDays) }}
        </div>
        <v-text-field
          v-else
          v-model="customWorkDayInput"
          autofocus
          type="text"
          variant="outlined"
          class="ma-0 pa-0 work-days-custom-input"
          @blur="showCustomWorkDayInput = false"
          hide-details
        ></v-text-field>
      </div>
    </div>
  </div>
</template>

<script setup>
import _forEach from 'lodash/forEach';
import { computed, inject, ref, onMounted, onBeforeUnmount } from 'vue';
import { formatNumber, openLink } from '@/utils/utils';
import {
  add,
  getIsoWeekday,
  isAfter,
  isSameOrAfter,
  isSameOrBefore,
  format,
  getTodaysDate,
  DEFAULT_ISOFORMAT,
  startOf,
  endOf
} from '@/shared/dateUtils';
import { getEmployeeCurrentProjects } from '@/shared/employeeUtils';
import { updateStoreTags } from '@/utils/storeUtils';
import api from '@/shared/api';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps([
  'dateIsCurrentPeriod',
  'employee',
  'isCalendarYear',
  'isYearly',
  'period',
  'supplementalData',
  'timeData'
]);
import _find from 'lodash/find';
const emitter = inject('emitter');
const store = useStore();

const clonedEmployee = ref(props.employee);
const BONUS_YEAR_TOTAL = ref(1860);
const WORK_HOURS_PER_DAY = ref(8); // normal hours per day for full time employees
const customCompleted = ref(null);
const customNeeded = ref(null);
const customWorkDayInput = ref(null);
const showCustomWorkDayInput = ref(false);
const today = ref(format(getTodaysDate(), null, DEFAULT_ISOFORMAT));
const contractHours = ref(undefined);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * The Mounted lifecycle hook
 */
onMounted(() => {
  // get custom contract hours if it exists
  contractHours.value = getEmployeeCurrentProjects(props.employee)?.[0]?.contractHours;
  if (contractHours.value) contractHours.value = Number(contractHours.value);

  emitter.emit('timesheets-chart-data', {
    completed: formatNumber(periodHoursCompleted.value),
    needed: formatNumber(totalPeriodHours.value),
    remainingHours: remainingHours.value
  });
  emitter.on('update-planned-pto-results-time-period', (data) => {
    clonedEmployee.value.plannedPto = data;
  });
  emitter.on('update-time-data-completed', (c) => {
    customCompleted.value = c;
  });
  emitter.on('update-time-data-needed', (n) => {
    customNeeded.value = n;
  });

  // check for being on track for 1860 yearly hours in the background
  check1860OnTrack();
}); // mounted

/**
 * The beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('timesheets-chart-data');
  emitter.off('update-planned-pto-results-time-period');
}); // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

const avgDayColor = computed(() => {
  if (remainingAverageHoursPerDay.value < 9) {
    return 'text-orange font-weight-bold';
  } else {
    return 'text-red font-weight-bold';
  }
});

/**
 * The amount of different days timesheets were entered in the future.
 *
 * @returns Number - The amount of entered future days
 */
const futureDays = computed(() => {
  // future work days planned
  let days = props.supplementalData?.future?.days || 0;
  // future PTO days planned
  days += getPlannedPTO(true);
  return days;
}); // futureDays

/**
 * The amount of timesheets hours that are in the future.
 *
 * @returns Integer - The amount of hours entered in the future
 */
const futureHours = computed(() => {
  // future work hours planned
  let hours = Number((props.supplementalData?.future?.duration || 0) / 60 / 60);
  // future PTO hours planned
  hours += getPlannedPTO(false);
  return hours;
}); // futureHours

/**
 * The amount of hours an employee is behind schedule by. If there has been 3 work days so far, then a full time employee
 * should have 24 hours entered. If the number is negative, then the user is ahead in hours.
 *
 * @returns Number - The number of hours an employee is behind schedule by
 */
const hoursBehindBy = computed(() => {
  return remainingHours.value - remainingWorkDays.value * proRatedHours.value;
}); // hoursBehindBy

/**
 * The amount of hours an employee has completed in the current time period.
 *
 * @returns Number - The time period hours an employee has completed
 */
const periodHoursCompleted = computed(() => {
  let total = 0;
  _forEach(props.timeData, (duration, jobName) => {
    if (!props.isYearly || (props.isYearly && !props.supplementalData.nonBillables?.includes(jobName))) {
      total += duration;
    }
  });
  // convert to hours
  return customCompleted.value ?? Number(total / 60 / 60);
}); // periodHoursCompleted

/**
 * The amount of hours an employee should ideally enter per day. Full-time = 8, part-time (75%) = 6, part-time (50%) = 4.
 *
 * @returns The employees pro-rated hours needed per day
 */
const proRatedHours = computed(() => {
  if (props.isYearly) {
    return (
      (BONUS_YEAR_TOTAL.value / getWorkDays(props.period.startDate, props.period.endDate, true)) *
      (props.employee.workStatus / 100)
    );
  } else {
    return WORK_HOURS_PER_DAY.value * (props.employee.workStatus / 100);
  }
}); // proRatedHours

/**
 * The remaining hours needed for the time period.
 *
 * @returns Number - The reimaining hours needed
 */
const remainingHours = computed(() => {
  let remaining = totalPeriodHours.value - periodHoursCompleted.value;
  return Math.max(remaining, 0);
}); // remainingHours

/**
 * The remaining work days for the time period. Future hours will affect the number of work days remaining.
 *
 * @returns Number - The remaining work days for the time period.
 */
const remainingWorkDays = computed(() => {
  let remainingDays;
  let daysToSubtract = futureDays.value;
  // subtract a day if hours were entered for today's date
  if (props.supplementalData?.today > 0 && isWeekDay(today.value)) daysToSubtract += 1;

  if (customWorkDayInput.value && Number(customWorkDayInput.value)) {
    remainingDays = customWorkDayInput.value || remainingWorkDays.value;
  } else {
    remainingDays = getWorkDays(today.value, props.period.endDate) - daysToSubtract;
    if (!props.dateIsCurrentPeriod) {
      remainingDays = 0;
    }
  }
  return Math.max(remainingDays, 0);
}); // remainingWorkDays

/**
 * The remaining work days tooltip for the amount of days subtracted.
 *
 * @returns String - The tooltip text to display
 */
const remainingWorkDaysTooltip = computed(() => {
  let tooltip = '';
  if (props.supplementalData?.today > 0 && isWeekDay(today.value)) {
    tooltip += '1 day subtracted to account for timesheets entered today';
  }
  if (futureDays.value > 0) {
    if (tooltip.length > 0) tooltip += 'NEWLINE';
    tooltip += `${futureDays.value} ${futureDays.value === 1 ? 'day' : 'days'} subtracted to account for future timesheets`;
    if (getPlannedPTO() > 0) {
      tooltip += `,NEWLINEincluding ${getPlannedPTO(true)} ${getPlannedPTO(true) > 1 ? 'days' : 'day'} of planned PTO/Holiday`;
    }
  }
  return tooltip;
}); // remainingWorkDaysTooltip

/**
 * The remaining average hours needed per day.
 *
 * @returns Number - The remaining average number of hours needed per day
 */
const remainingAverageHoursPerDay = computed(() => {
  if (Number(remainingWorkDays.value) > 0) {
    return remainingHours.value / remainingWorkDays.value;
  } else {
    return props.dateIsCurrentPeriod ? remainingHours.value : 0;
  }
}); // remainingAverageHoursPerDay

/**
 * The total number of hours needed for a time period.
 *
 * @returns Number - The total number of hours needed
 */
const totalPeriodHours = computed(() => {
  let contractHoursFiltered = props.isYearly && !props.isCalendarYear ? contractHours.value : undefined;
  let total = totalWorkDays.value * proRatedHours.value;
  total = props.isYearly ? Math.round(total) : total;
  return customNeeded.value ?? contractHoursFiltered ?? total;
}); // totalPeriodHours

/**
 * The total number of work days for a time period.
 *
 * @returns Number - The total number of works days
 */
const totalWorkDays = computed(() => {
  return getWorkDays(props.period.startDate, props.period.endDate);
}); // totalWorkDays

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
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
  if (!props.isYearly) return 0;

  // early exit conditions
  let ptoPlan = props.employee.plannedPto?.plan;
  if (!ptoPlan) return 0;
  // get start and end dates
  let startDate = props.period.startDate;
  let endDate = props.period.endDate;
  // go through plan and tally up hours that fall between startDate and endDate
  let hoursPlanned = 0;
  for (let item of ptoPlan) {
    if (
      isAfter(item.date, getTodaysDate(), 'month') &&
      isSameOrAfter(item.date, startDate, 'month') &&
      isSameOrBefore(item.date, endDate, 'month')
    ) {
      hoursPlanned += Number(item.ptoHours) + Number(item.holidayHours);
    }
  }
  // convert hours to days (rounding up) and return result
  if (convertToDays) hoursPlanned = Math.ceil(hoursPlanned / WORK_HOURS_PER_DAY.value);
  return hoursPlanned;
} // getPlannedPTO

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
  let hireDate = props.employee.hireDate;
  if (!excludeProRated && isAfter(hireDate, startDate, 'day') && isSameOrAfter(endDate, hireDate, 'day')) {
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

/**
 * Returns true if day is a weekday.
 *
 * @param {String} day - The day
 * @returns Boolean - Whether or not the day is a weekday
 */
function isWeekDay(day) {
  return getIsoWeekday(day) >= 1 && getIsoWeekday(day) <= 5;
} // isWeekDay

// Checks if a user if behind on their 1860 hours. This is designed to be run in the background, and not
// be dependant on any other functions in this file, other than getWorkDays (and non-function variables)
async function check1860OnTrack() {
  // if the employee is on the 'Non Billable' tag, then they are exempt from this rule
  // and we don't need to wait for the api call to finish
  if (!store.getters.tags) await updateStoreTags();
  let tags = store.getters.tags;
  let nonBillableTag = _find(tags, (t) => t.tagName === 'Non Billable');
  if (!nonBillableTag) return;
  if (nonBillableTag.employees.includes(props.employee.id)) return;

  // calc minimum hours that are needed per month for this employee
  const MIN_1860_HOURS = 155 * (props.employee.workStatus / 100);

  // calc time variables
  let startOfYear = format(startOf(today.value, 'year'), null, 'YYYY-MM-DD');
  let startOfMonth = format(startOf(today.value, 'month'), null, 'YYYY-MM-DD');
  let workDaysThisMonth = getWorkDays(startOfMonth, endOf(today.value, 'month'));

  // calc how many hours are needed total to be on track
  let completeMonthsWorked = Number(format(today.value, null, 'M')) - 1;
  let hoursNeeded = MIN_1860_HOURS * completeMonthsWorked; // months worked, not including current month
  hoursNeeded += (MIN_1860_HOURS / workDaysThisMonth) * getWorkDays(startOfMonth, today.value); // include days worked in current month

  // fetch employee's timesheet data from start of year to today
  let yearlyTimesheetData = await api.getTimesheetsData(clonedEmployee.value.employeeNumber, {
    code: null,
    employeeId: props.employee.id,
    periods: [{ startDate: startOfYear, endDate: today.value, title: '1860 Check' }]
  });

  // sum up employee's billable hours
  let hoursWorked = 0;
  let actualTimesheets = yearlyTimesheetData.timesheets[0].timesheets;
  let nonBillables = yearlyTimesheetData.supplementalData.nonBillables;
  _forEach(actualTimesheets, (duration, jobName) => {
    if (!nonBillables?.includes(jobName)) {
      hoursWorked += duration;
    }
  });
  hoursWorked = hoursWorked / 60 / 60; // convert seconds to hours

  // compare and emit if employee is short
  if (hoursNeeded > hoursWorked) {
    emitter.emit('1860-not-on-track', props.employee.id);
  }
}
</script>

<style>
.work-days-custom-input input {
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
