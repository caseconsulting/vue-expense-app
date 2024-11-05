<template>
  <v-card class="w-100">
    <v-card-title class="d-flex align-center header_style text-h6">
      <h3>Plan PTO</h3>
    </v-card-title>
    <div v-if="months.length === monthsPlannable">
      <v-card-text v-if="employee">
        <!-- PTO BALANCES -->
        <v-row class="text-center balances">
          <!-- Current PTO balance -->
          <v-col>
            <p class="mb-0 font-weight-bold">{{ pto ?? 0 }}h</p>
            <p class="mt-0">Current<br />PTO Balance</p>
          </v-col>

          <!-- PTO Cashouts -->
          <v-col v-if="pendingPtoCashouts > 0">
            <p class="mb-0 font-weight-bold">{{ pendingPtoCashouts }}h</p>
            <p class="mt-0">Pending<br />Cashouts</p>
          </v-col>

          <!-- Current Holiday balance -->
          <v-col>
            <p class="mb-0 font-weight-bold">{{ holiday ?? 0 }}h</p>
            <p class="mt-0">Current<br />Holiday Balance</p>
          </v-col>

          <!-- Divider between current and calculated values -->
          <span class="left-line"></span>

          <!-- PTO after all months of plan (includes accrued from last month of plan) -->
          <v-col>
            <p :class="'mb-0 font-weight-bold ' + ptoBalanceClass(getPtoBalance())">{{ getPtoBalance() }}h</p>
            <p class="mt-0">PTO Balance<br />After {{ format(plannedMonths.at(-1)?.date, null, 'MMMM') || 'Plan' }}</p>
          </v-col>

          <!-- Holiday after all months of plan (includes accrued from last month of plan) -->
          <v-col>
            <p class="mb-0 font-weight-bold">{{ getHolidayBalance() }}h</p>
            <p class="mt-0">
              Holiday Balance<br />After {{ format(plannedMonths.at(-1)?.date, null, 'MMMM') || 'Plan' }}
            </p>
          </v-col>
        </v-row>

        <!-- RANGES TO SELECT FOR PLANNING -->
        <div class="my-2 d-flex justify-center">
          <v-btn-toggle v-model="selectedRanges" color="primary mx-auto" class="filter_color" text multiple>
            <v-btn v-for="range in ranges" :key="range" variant="text">
              {{ getRangeTitle(range) }}
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- PLANNING TABLE -->
        <v-data-table :headers="headers" :items="plannedMonths" :items-per-page="24" :hide-default-footer="true">
          <!-- edit PTO hours slot -->
          <template #[`item.ptoHours`]="{ item }">
            <v-text-field
              v-model="item.ptoHours"
              :rules="hoursRules"
              @blur="evalReplace(item, 'ptoHours')"
              validate-on="blur"
              variant="underlined"
            ></v-text-field>
          </template>

          <!-- edit Holiday hours slot -->
          <template #[`item.holidayHours`]="{ item }">
            <v-text-field
              v-model="item.holidayHours"
              :rules="hoursRules"
              @blur="evalReplace(item, 'holidayHours')"
              validate-on="blur"
              variant="underlined"
            ></v-text-field>
          </template>

          <!-- PTO balance slot -->
          <template #[`item.ptoBalance`]="{ item }">
            <p :class="ptoBalanceClass(getPtoBalance(item.date))">{{ getPtoBalance(item.date) }}</p>
          </template>

          <!-- holiday balance slot -->
          <template #[`item.holidayBalance`]="{ item }">
            <p>{{ getHolidayBalance(item.date) }}</p>
          </template>

          <!-- No data slot, encourage adding a date range -->
          <template #no-data>
            <p class="text-center">Select a date range to start planning PTO</p>
          </template>

          <!-- Remove footer by replacing it with nothing -->
          <template #bottom></template>
        </v-data-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <!-- Cancel Button -->
        <v-btn color="black" @click="cancel()" variant="text" class="mx-2"> Close </v-btn>
        <!-- Save Button -->
        <v-btn variant="text" class="mx-2" color="success" :disabled="loading" @click="save()">
          <template #prepend>
            <v-icon>mdi-content-save</v-icon>
          </template>
          {{ saveButtonText }}
        </v-btn>
      </v-card-actions>
    </div>
    <div v-else class="py-10 px-6">
      <v-progress-linear :indeterminate="true"></v-progress-linear>
    </div>
  </v-card>
</template>
<script setup>
// |--------------------------------------------------|
// |                                                  |
// |                       IMPORTS                    |
// |                                                  |
// |--------------------------------------------------|

import { onMounted, ref, reactive, watch, inject, onBeforeMount, defineExpose } from 'vue';
import { useStore } from 'vuex';
import { updateStoreUser, updateStorePtoCashOuts } from '../../utils/storeUtils';
import {
  format,
  startOf,
  endOf,
  getTodaysDate,
  add,
  subtract,
  setMonth,
  setYear,
  isAfter,
  isBefore,
  isSame,
  isSameOrBefore
} from '../../shared/dateUtils';
import { formatNumber } from '@/utils/utils.js';
import api from '@/shared/api.js';

// |--------------------------------------------------|
// |                                                  |
// |                   GLOBAL VARS                    |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['employeeId', 'pto', 'holiday', 'isCyk']);
const store = useStore();
const emitter = inject('emitter');

const employee = ref(store.getters.employees.find((e) => e.id == props.employeeId));
const monthsPlannable = ref(13); // how many months can be planned (including current month)
const loading = ref(true);
const saveButtonText = ref('Save');

// for template
const months = ref([]); // months in year for chips
const hoursRules = [(v) => canEval(v) !== false || v === '' || 'Enter number or equation'];

// year ranges
const selectedRanges = ref([]);
const ranges = ref([
  // current year
  [
    format(add(getTodaysDate(), 1, 'month'), null, 'YYYY-MM'),
    format(endOf(getTodaysDate('YYYY-MM'), 'year'), null, 'YYYY-MM'),
    { isYear: true }
  ],
  // next year
  [
    format(startOf(add(getTodaysDate(), 1, 'year'), 'year'), null, 'YYYY-MM'),
    format(endOf(add(getTodaysDate(), 1, 'year'), 'year'), null, 'YYYY-MM'),
    { isYear: true }
  ]
]);

// data table
const headers = ref([
  {
    title: 'Month',
    sortable: false,
    width: '20%',
    key: 'date',
    value: (item) => format(item.date, null, getDateFormat(item.date))
  },
  { title: 'PTO hours', sortable: false, width: '17%', value: 'ptoHours' },
  { title: 'Holiday hours', sortable: false, width: '17%', value: 'holidayHours' },
  { title: 'PTO Balance', sortable: false, width: '23%', key: 'ptoBalance' },
  { title: 'Holiday Balance', sortable: false, width: '23%', key: 'holidayBalance' }
]);

/**
 * CYK variables: delete this section and any logic specific to this section once
 *                the merge is completed.
 */
const CYK = reactive({
  USE: props.isCyk, // whether or not current employee is CYK
  ACCRUAL_AMOUNT: 6.67, // Brandon Lally: "For CYK we accrue PTO currently at a bi-weekly rate of [exactly] 6.67 hours"
  ACCRUAL_MONTHS: {
    '2024-07': 2,
    '2024-08': 3,
    '2024-09': 2,
    '2024-10': 2,
    '2024-11': 2,
    '2024-12': 2
  }
});
let cykPTO = (date) => {
  if (!CYK.ACCRUAL_MONTHS[date]) return PTOPerMonth.value;
  return CYK.ACCRUAL_AMOUNT * CYK.ACCRUAL_MONTHS[date] * (employee.value.workStatus / 100);
};

// |--------------------------------------------------|
// |                                                  |
// |                    LIFECYCLES                    |
// |                                                  |
// |--------------------------------------------------|

/**
 * onBeforeMount lifecycle hook
 */
onBeforeMount(async () => {
  employee.value = store.getters.employees.find((e) => e.id == props.employeeId);
  // add current projects to `ranges`
  for (let contract of employee.value.contracts ?? []) {
    for (let project of contract.projects) {
      // skip if project is not active
      if (project.endDate) continue;
      // get YYYY-MM format of start and end dates, cutting off anything this month or before
      let projectStart = add(getTodaysDate(), 1, 'month');
      // get project end date for this contract year
      let projectEnd = subtract(project.startDate, 1, 'day');
      projectEnd = setYear(projectEnd, getTodaysDate('YYYY'));
      projectEnd = add(projectEnd, 1, 'year');
      // format dates and add changes
      [projectStart, projectEnd] = [format(projectStart, null, 'YYYY-MM'), format(projectEnd, null, 'YYYY-MM')];
      ranges.value.push([projectStart, projectEnd]);
    }
  }
});

/**
 * onMounted lifecycle hook
 */
onMounted(async () => {
  // get the employee and PTO cashout amounts
  if (!store.getters.ptoCashOuts) await updateStorePtoCashOuts();

  // update employee specific information
  PTOPerMonth.value *= employee.value.workStatus / 100;

  // load in employee's plan from database
  if (employee.value.plannedPto?.plan) {
    // get plannedMonths from database if user has a saved plan
    plannedMonths.value = employee.value.plannedPto.plan;
    // remove any months that are in the past
    for (var i = 0; i < plannedMonths.value.length; i++) {
      if (isSameOrBefore(plannedMonths.value[i].date, getTodaysDate(), 'month')) plannedMonths.value.splice(i--, 1);
      else break;
      // months are in order, can just break if current month is today or future
    }
  } else {
    plannedMonths.value = [];
  }

  // auto-select any ranges that are in the plan
  let monthsInPlan = new Set(plannedMonths.value.map((item) => item.date));
  for (let i in ranges.value) {
    let range = ranges.value[i];
    if (monthsInPlan.has(range[0]) && monthsInPlan.has(range[1])) {
      selectedRanges.value.push(i);
    }
  }

  // fill in months of year and monthData
  let curr = format(startOf(getTodaysDate(), 'month'), null, 'YYYY-MM');
  let title;
  for (let i = 0; i < monthsPlannable.value; i++) {
    // format visible year title
    title = format(curr, 'YYYY-MM', 'MMMM');
    if (isAfter(curr, endOf(getTodaysDate(), 'year'))) title += ` ${format(curr, 'YYYY-MM', 'YYYY')}`;
    // months of year for dropdown
    months.value.push({
      title: title, // visible date value
      value: curr // actual date value
    });
    curr = add(curr, 1, 'month', 'YYYY-MM');
  }

  // fill in PTO cashout amounts
  for (let cashout of store.getters.ptoCashOuts) {
    // skip other employees
    if (cashout.employeeId != props.employeeId) continue;
    // fill in pending amount
    if (!cashout.approvedDate) pendingPtoCashouts.value += cashout.amount;
  }

  // set loading stage
  loading.value = false;

  // emit to TimeData.vue that the save() function can be successfully executed now
  emitter.emit('auto-save-pto-planner');
}); // onMounted

// |--------------------------------------------------|
// |                                                  |
// |                  MONTHS PLANNER                  |
// |                                                  |
// |--------------------------------------------------|
const plannedMonths = ref(null); // months that are planned

/**
 * Add a month to the plan. Used by chips by proxy of toggleMonthInPlan().
 *
 * @param date the YYYY-MM to add
 */
function addMonthToPlan(date) {
  plannedMonths.value.push({
    date: date,
    ptoHours: '0',
    holidayHours: '0'
  });
  plannedMonths.value.sort((a, b) => (isAfter(a.date, b.date) ? 1 : -1));
} // addMonthToPlan

/**
 * Delete a month from the plan. Used by delete button and chips by
 * proxy of toggleMonthInPlan()
 *
 * @param month month to delete (option 1)
 * @param i index of month to delete in plannedMonths/chips array (option 2, pass null for month)
 */
function removeMonthFromPlan(month, i = null) {
  // find
  if (i === null) i = plannedMonths.value.findIndex((item) => item.date === month.date);
  // remove from plan
  plannedMonths.value.splice(i, 1);
} // removeMonthFromPlan

/**
 * Sets dates to be dates selected based on selectedRanges. Finds the earliest and
 * latest dates and fills in everything in between.
 */
function refreshDates() {
  // get what start and end dates should be
  let startDate = '9999-01-01';
  let endDate = '0000-01-01';
  let range;
  for (let i of selectedRanges.value) {
    range = ranges.value[i];
    if (isBefore(range[0], startDate)) startDate = range[0];
    if (isAfter(range[1], endDate)) endDate = range[1];
  }

  // make sure date is in future
  if (isSameOrBefore(startDate, getTodaysDate(), 'month')) startDate = add(getTodaysDate(), 1, 'month', 'YYYY-MM');

  // loop through plannedMonths and remove any bad dates
  let month;
  for (let i = 0; i < plannedMonths.value.length; i++) {
    month = plannedMonths.value[i].date;
    if (isBefore(month, startDate) || isAfter(month, endDate)) removeMonthFromPlan(null, i--);
  }

  // loop through start/end dates and add any missing ones
  let monthsInPlan = new Set(plannedMonths.value.map((item) => item.date));
  let curr = format(startDate, null, 'YYYY-MM');
  while (!isAfter(curr, endDate, 'month')) {
    if (!monthsInPlan.has(curr)) addMonthToPlan(curr);
    curr = add(curr, 1, 'month', 'YYYY-MM');
  }
} // refreshDates

/**
 * Watch user (un)selecting ranges, refresh table when they do
 */
watch(selectedRanges, () => {
  refreshDates();
}); // watchSelectedRanges

// |--------------------------------------------------|
// |                                                  |
// |               TEMPLATE FUNCTIONS                 |
// |                                                  |
// |--------------------------------------------------|

/**
 * Cancel button handler
 */
function cancel() {
  emitter.emit('close-pto-planning-form');
} // cancel

/**
 * Save info to database and emit to other components. Note that this is called from TimeData.vue
 * as a recalculation method to ensure that people don't have previous months in their plan
 *
 * @param preventUpload - whether or not to prevent uploading the new PTO value to the DB
 */
async function save(preventUpload = false) {
  // set loading status
  loading.value = true;

  // save planned months to database
  let endDate = plannedMonths.value.at(-1)?.date;
  let data = {
    id: employee.value.id,
    plannedPto: {
      plan: plannedMonths.value,
      results: {
        pto: getPtoBalance(),
        holiday: getHolidayBalance(),
        endDate: format(endDate, null, getDateFormat(endDate)) || undefined
      }
    }
  };
  if (!preventUpload) await api.updateAttribute(api.EMPLOYEES, data, 'plannedPto');

  // refresh store user from DB and reset emitter
  await updateStoreUser();
  emitter.emit('update-planned-pto-results-time-data', data.plannedPto);
  emitter.emit('update-planned-pto-results-time-period', data.plannedPto);
  emitter.emit('update-planned-pto-results-job-codes', data.plannedPto);

  // set loading status
  loading.value = false;

  // inform user that plan was saved successfully
  saveButtonText.value = 'Saved!';
  setTimeout(() => {
    saveButtonText.value = 'Save';
  }, 2500);
} // save

/**
 * Returns the format that a date should be in in the table.
 * @param date
 */
function getDateFormat(date) {
  return isSame(getTodaysDate(), date, 'year') ? 'MMMM' : 'MMMM YYYY';
} // getDateFormat

function getRangeTitle(range) {
  // return YYYY for exact year ranges
  if (range.at(-1).isYear) return format(range[0], null, 'YYYY');

  // otherwise return month, year ranged format
  let start = format(range[0], null, 'MMMM YYYY');
  let end = format(range[1], null, 'MMMM YYYY');
  return `${start} - ${end}`;
} // getRangeTitle

/**
 * Get class for PTO balance
 *
 * @param balance PTO balance to get class for
 */
function ptoBalanceClass(balance) {
  let bold = 'font-weight-bold';
  let warning = 'text-orange-darken-3';
  let danger = 'text-red-darken-3';

  // switch(true) allows you to use boolean expressions
  switch (true) {
    case balance < 0: // negative balance
      return `${danger} ${bold}`;
    case balance < 40: // low balance, should have at least 1 full week of PTO
      return `${warning} ${bold}`;
    case balance == maxPTO.value: // max balance, won't accrue ANY PTO next month
      return `${danger} ${bold}`;
    case balance > maxPTO.value - PTOPerMonth.value: // high balance, won't accrue full PTO next month
      return `${warning} ${bold}`;
    default:
      return '';
  }
} // ptoBalanceClass

// |--------------------------------------------------|
// |                                                  |
// |                 BALANCE GETTERS                  |
// |                                                  |
// |--------------------------------------------------|
const PTOPerMonth = ref(14); // 14 hours per pay period (month), equals 21 days per year (168 hours)
const maxPTO = ref(208); // maximum PTO hours you can have at one time
const holidayPerYear = ref(88); // 11 days per year

const pendingPtoCashouts = ref(0);

/**
 * Helper function to check if eval() works on a given string. Returns the result
 * if it does, otherwise returns false
 *
 * @param equation string to evaluate
 */
function canEval(equation) {
  try {
    let result = eval(equation);
    return result;
  } catch {
    return false;
  }
} // canEval

/**
 * Helper function to replace an item from plannedMonths with its eval'd result
 *
 * @param item item from the data table
 */
function evalReplace(item, attr) {
  let index = plannedMonths?.value?.findIndex((curr) => curr.date == item.date);
  if (index >= 0) {
    let oldValue = plannedMonths.value[index][attr];
    plannedMonths.value[index][attr] = canEval(item[attr]) || oldValue;
  }
} // evalReplace

/**
 * Helper to get the PTO or holiday balance for a given month. Also resolves equations.
 *
 * @param date YYYY-MM value to get balance for
 * @param attr which balance to get (ptoHours or holidayHours)
 */
function plannedMonthsBalance(date, attr) {
  // find raw value
  let value = plannedMonths?.value?.find((item) => item.date == date)?.[attr] || 0;

  // resolve equations
  value = canEval(value) || 0;

  // return raw number (no rounding), min at 0
  value = Math.max(value, 0);
  return Number(value);
} // plannedMonthsBalance

/**
 * Returns PTO amount at the end of a given month
 *
 * @param date YYYY-MM to get PTO for. if null, defaults to last date in plannedMonths.
 */
let ptoCache = {};
function getPtoBalance(date = null) {
  // return default of current PTO balance if no planned months
  if (plannedMonths.value.length == 0) return formatNumber((props.pto ?? 0) - pendingPtoCashouts.value);
  // default date value to last planned month
  date = date || plannedMonths.value[plannedMonths.value.length - 1].date;
  // start with current PTO balance minus pending cashouts
  let ptoBalance = (props.pto ?? 0) - pendingPtoCashouts.value;

  // quick helper to max out PTO value
  const maxedPTO = (pto) => (CYK.USE ? pto : Math.min(pto, maxPTO.value));

  // calculate and update this month's cache values
  if (!ptoCache[date]) ptoCache[date] = {};
  ptoCache[date].count = plannedMonths.value.length; // update count
  let sum = 0;
  for (let m of plannedMonths.value) {
    if (isAfter(m.date, date, 'month')) break;
    sum += Number(m.ptoHours);
  }
  ptoCache[date].sum = sum; // update sum

  // base cases: date is current month, date is in past
  if (isSame(date, getTodaysDate('YYYY-MM'), 'month')) {
    ptoBalance -= plannedMonthsBalance(date, 'ptoHours');
    ptoCache[date].balance = ptoBalance;
    return Number(maxedPTO(ptoBalance).toFixed(2));
  } else if (isBefore(date, getTodaysDate('YYYY-MM'), 'month')) {
    return 0;
  }

  // check last month's cache values compares to this month's, use cache if
  // they match. if false, recursively calculate it.
  let lastMonth = subtract(date, 1, 'month', 'YYYY-MM');
  let sumCheck = ptoCache[lastMonth]?.sum === ptoCache[date].sum - plannedMonthsBalance(date, 'ptoHours');
  let countCheck = ptoCache[lastMonth]?.count === ptoCache[date].count;
  let undefinedCheck = ptoCache[lastMonth]?.sum && ptoCache[lastMonth]?.count;
  if (sumCheck && countCheck && undefinedCheck) {
    ptoBalance = ptoCache[lastMonth].balance;
  } else {
    ptoBalance = getPtoBalance(lastMonth);
  }

  // factor in this month's PTO accrual and PTO taken, staying below max
  ptoBalance += CYK.USE ? cykPTO(date) : PTOPerMonth.value;
  ptoBalance = maxedPTO(ptoBalance);
  ptoBalance -= plannedMonthsBalance(date, 'ptoHours');
  ptoBalance = maxedPTO(ptoBalance);
  ptoBalance = Number(ptoBalance.toFixed(2)); // round for floating-point precision

  // update cache balance and return
  ptoCache[date].balance = ptoBalance;
  return ptoBalance;
} // getPtoBalance

/**
 * Returns Holiday amount at the end of a given month
 *
 * @param date YYYY-MM to get Holiday for. if null, defaults to last date in plannedMonths.
 */
let holidayCache = {};
function getHolidayBalance(date = null) {
  // return default of current Holiday balance if no planned months
  if (plannedMonths.value.length == 0) return props.holiday ?? 0;
  // default date value to last planned month
  date = date || plannedMonths.value[plannedMonths.value.length - 1].date;
  // start with current holiday balance
  let holidayBalance = props.holiday ?? 0;

  // calculate and update this month's cache values
  if (!holidayCache[date]) holidayCache[date] = {};
  holidayCache[date].count = plannedMonths.value.length; // update count
  let sum = 0;
  for (let m of plannedMonths.value) {
    if (isAfter(m.date, date, 'month')) break;
    sum += Number(m.holidayHours);
  }
  holidayCache[date].sum = sum; // update sum

  // base case: date is current month
  if (isSame(date, getTodaysDate('YYYY-MM'), 'month')) {
    holidayBalance -= plannedMonthsBalance(date, 'holidayHours');
    holidayCache[date].balance = holidayBalance;
    return Number(holidayBalance.toFixed(2));
  } else if (isBefore(date, getTodaysDate('YYYY-MM'), 'month')) {
    return 0;
  }

  // check last month's cache values compares to this month's, use cache if
  // they match. if false, recursively calculate it.
  let lastMonth = subtract(date, 1, 'month', 'YYYY-MM');
  let sumCheck = holidayCache[lastMonth]?.sum === holidayCache[date].sum - plannedMonthsBalance(date, 'holidayHours');
  let countCheck = holidayCache[lastMonth]?.count === holidayCache[date].count;
  let undefinedCheck = holidayCache[lastMonth]?.sum && holidayCache[lastMonth]?.count;
  if (sumCheck && countCheck && undefinedCheck) {
    holidayBalance = holidayCache[lastMonth].balance;
  } else {
    holidayBalance = getHolidayBalance(lastMonth);
  }

  // reset to yearly holiday balance if this month is January
  let nextJan = setMonth(add(getTodaysDate(), 1, 'year'), 0);
  if (isSame(date, nextJan, 'month')) holidayBalance = holidayPerYear.value;

  // factor in holiday hours taken this month
  holidayBalance -= plannedMonthsBalance(date, 'holidayHours');
  holidayBalance = Number(holidayBalance.toFixed(2)); // round for floating-point precision

  // update cache balance and return
  holidayCache[date].balance = holidayBalance;
  return holidayBalance;
} // getHolidayBalance

defineExpose({
  save
});
</script>

<style scoped>
h3 {
  line-height: 20px;
}
.balances {
  display: flex;
  justify-content: center;
  align-items: center;
}
.left-line {
  height: 30px;
  border-left: 1px solid gray;
  margin-bottom: 20px;
}
</style>
