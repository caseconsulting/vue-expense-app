<template>
  <v-card class="w-100">
    <v-card-title class="d-flex align-center header_style text-h6">
      <h3>Plan PTO</h3>
    </v-card-title>
    <div v-if="months.length === monthsPlannable">
      <v-card-text v-if="employee">
        <!-- PTO BALANCES -->
        <v-row class="text-center">
          <!-- Current PTO balance -->
          <v-col>
            <p class="mb-0 font-weight-bold">{{ pto }}h</p>
            <p class="mt-0">Current<br />PTO Balance</p>
          </v-col>

          <!-- PTO Cashouts -->
          <v-col v-if="pendingPtoCashouts > 0">
            <p class="mb-0 font-weight-bold">{{ pendingPtoCashouts }}h</p>
            <p class="mt-0">Pending<br />Cashouts</p>
          </v-col>

          <!-- Current Holiday balance -->
          <v-col>
            <p class="mb-0 font-weight-bold">{{ holiday }}h</p>
            <p class="mt-0">Current<br />Holiday Balance</p>
          </v-col>

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

        <!-- CHIPS TO ADD MONTH -->
        <div class="my-2">
          <v-chip
            :class="'mr-1 mb-1 ' + selectedClass(month)"
            v-for="month in months"
            :key="month.value"
            @click="toggleMonthInPlan(month)"
          >
            {{ month.title }}
          </v-chip>
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

          <!-- Action buttons -->
          <template #[`item.actions`]="{ item }">
            <v-btn icon="mdi-delete" variant="text" @click="removeMonthFromPlan(item)"></v-btn>
          </template>

          <!-- No data slot, encourage adding a month -->
          <template #no-data>
            <p class="text-center">Add a month to start planning PTO</p>
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

import { onMounted, ref, inject } from 'vue';
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
  isAfter,
  isBefore,
  isSame
} from '../../shared/dateUtils';
import { formatNumber } from '@/utils/utils.js';
import api from '@/shared/api.js';

// |--------------------------------------------------|
// |                                                  |
// |                   GLOBAL VARS                    |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['employeeId', 'pto', 'holiday']);
const store = useStore();
const emitter = inject('emitter');

const employee = ref(null);
const monthsPlannable = ref(13); // how many months can be planned (including current month)
const loading = ref(true);
const saveButtonText = ref('Save');

// for template
const months = ref([]); // months in year for chips
const hoursRules = [(v) => canEval(v) !== false || v === '' || 'Enter number or equation'];

// data table
// helper to add year if needed (also used in save() function)
let getDateFormat = (date) => {
  return isSame(getTodaysDate(), date, 'year') ? 'MMMM' : 'MMMM YYYY';
};
const headers = ref([
  {
    title: 'Month',
    sortable: false,
    width: '17%',
    key: 'date',
    value: (item) => format(item.date, null, getDateFormat(item.date))
  },
  { title: 'PTO', sortable: false, width: '15%', value: 'ptoHours' },
  { title: 'Holiday', sortable: false, width: '15%', value: 'holidayHours' },
  { title: 'PTO Balance', sortable: false, width: '20%', key: 'ptoBalance' },
  { title: 'Holiday Balance', sortable: false, width: '20%', key: 'holidayBalance' },
  { title: '', sortable: false, width: '13%', key: 'actions' }
]);

// |--------------------------------------------------|
// |                                                  |
// |                    LIFECYCLES                    |
// |                                                  |
// |--------------------------------------------------|
/**
 * Created lifecycle hook
 */
onMounted(async () => {
  // get the employee and PTO cashout amounts
  if (!store.getters.ptoCashOuts) await updateStorePtoCashOuts();
  employee.value = store.getters.user;

  // get plannedMonths from database if user has a saved plan
  if (employee.value.plannedPto?.plan) {
    plannedMonths.value = employee.value.plannedPto.plan;
    // remove any months that are in the past
    for (var i = 0; i < plannedMonths.value; i++) {
      if (isBefore(plannedMonths.value[i].date, getTodaysDate(), 'month')) delete plannedMonths.value[i];
      else break; // months are in order, can just break if current month is today or future
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
  fillInCashoutAmounts(props.employeeId);

  // set loading stage
  loading.value = false;
});

/**
 * Gets the user's pending PTO cash out amount
 *
 * @param employeeId employee's employee ID to get PTO balances for
 * @returns Number - The pending cash out amount
 */
function fillInCashoutAmounts(employeeId) {
  for (let cashout of store.getters.ptoCashOuts) {
    // skip other employees
    if (cashout.employeeId != employeeId) continue;
    // fill in both pending and non-pending amounts
    if (!cashout.approvedDate) pendingPtoCashouts.value += cashout.amount;
  }
} // getPendingPtoCashoutAmount

// |--------------------------------------------------|
// |                                                  |
// |                  MONTHS PLANNER                  |
// |                                                  |
// |--------------------------------------------------|
const plannedMonths = ref([]); // months that are planned

/**
 * Removes or adds a month to the plan, used by chips
 */
function toggleMonthInPlan(chip) {
  let i = plannedMonths.value.findIndex((item) => item.date == chip.value);
  if (i >= 0) removeMonthFromPlan(null, i);
  else addMonthToPlan(chip.value);
}

/**
 * Add a month to the plan. Used by chips by proxy of toggleMonthInPlan()
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
  // HERE
} // removeMonthFromPlan

const pendingPtoCashouts = ref(0);

// |--------------------------------------------------|
// |                                                  |
// |               TEMPLATE FUNCTIONS                 |
// |                                                  |
// |--------------------------------------------------|

/**
 * Cancel event handler
 */
function cancel() {
  emitter.emit('close-pto-planning-form');
} // cancel

/**
 * Saves user's plan to database
 */
async function save() {
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
  await api.updateAttribute(api.EMPLOYEES, data, 'plannedPto');

  // refresh store user from DB and reset emitter
  await updateStoreUser();
  emitter.emit('update-planned-pto-results-time-data', data.plannedPto);
  emitter.emit('update-planned-pto-results-time-period', data.plannedPto);

  // set loading status
  loading.value = false;

  // inform user that plan was saved successfully
  saveButtonText.value = 'Saved!';
  setTimeout(() => {
    saveButtonText.value = 'Save';
  }, 2500);
}

/**
 * Gets proper class for chip by deciding whether or not it is selected
 * @param chip chip to get class for
 */
function selectedClass(chip) {
  let i = plannedMonths.value.findIndex((item) => item.date == chip.value);
  if (i >= 0) return 'text-primary';
  return '';
} //

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
    case balance < 40: // low balance (should have at least 1 week of PTO)
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

/**
 * Returns PTO amount after given date
 *
 * @param date date of desired PTO balance (inclusive). if null, defaults to last planned date.
 * if no date and no planned months, defaults to today.
 */
let ptoCache = {};
function getPtoBalance(date = null) {
  // return default of current PTO balance if no planned months
  if (plannedMonths.value.length == 0) return formatNumber(props.pto - pendingPtoCashouts.value);
  // default date value to last planned month
  date = date || plannedMonths.value[plannedMonths.value.length - 1].date;
  // start with current PTO balance minus pending cashouts
  let ptoBalance = props.pto - pendingPtoCashouts.value;

  // quick helper to max out PTO value
  const maxedPTO = (pto) => Math.min(pto, maxPTO.value);

  // calculate and update this month's cache values
  if (!ptoCache[date]) ptoCache[date] = {};
  ptoCache[date].count = plannedMonths.value.length; // update count
  let sum = 0;
  for (let m of plannedMonths.value) {
    if (isAfter(m.date, date, 'month')) break;
    sum += Number(m.ptoHours);
  }
  ptoCache[date].sum = sum; // update sum

  // base case: date is current month
  if (isSame(date, getTodaysDate('YYYY-MM'))) {
    ptoBalance -= plannedMonthsBalance(date, 'ptoHours');
    ptoCache[date].balance = ptoBalance;
    return Number(maxedPTO(ptoBalance).toFixed(2));
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
  ptoBalance += PTOPerMonth.value;
  ptoBalance = maxedPTO(ptoBalance);
  ptoBalance -= plannedMonthsBalance(date, 'ptoHours');
  ptoBalance = maxedPTO(ptoBalance);
  ptoBalance = Number(ptoBalance.toFixed(2)); // round for floating-point precision

  // update cache balance and return
  ptoCache[date].balance = ptoBalance;
  return ptoBalance;
}

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
}

/**
 * Replaces the item with the evaluated version of the item
 *
 * @param item item from the data table
 */
function evalReplace(item, attr) {
  let index = plannedMonths?.value?.findIndex((curr) => curr.date == item.date);
  if (index >= 0) {
    let oldValue = plannedMonths.value[index][attr];
    plannedMonths.value[index][attr] = canEval(item[attr]) || oldValue;
  }
}

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
}

/**
 * Returns PTO amount after given date
 *
 * @param date date of desired PTO balance (inclusive). if null, defaults to last planned date.
 * if no date and no planned months, defaults to today.
 */
let holidayCache = {};
function getHolidayBalance(date = null) {
  // return default of current Holiday balance if no planned months
  if (plannedMonths.value.length == 0) return props.holiday;
  // default date value to last planned month
  date = date || plannedMonths.value[plannedMonths.value.length - 1].date;
  // start with current holiday balance
  let holidayBalance = props.holiday;

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
  if (isSame(date, getTodaysDate('YYYY-MM'))) {
    holidayBalance -= plannedMonthsBalance(date, 'holidayHours');
    holidayCache[date].balance = holidayBalance;
    return Number(holidayBalance.toFixed(2));
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
}
</script>

<style scoped>
h3 {
  line-height: 20px;
}
.title {
  position: relative;
}
.monthSelector {
  min-width: 50%;
  max-width: 50%;
}
</style>