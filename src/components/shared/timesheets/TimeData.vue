<template>
  <div id="t-sheets-data">
    <v-card density="compact">
      <v-card-title class="header_style d-flex align-center justify-space-between py-0 pt-2 relative">
        <h3>{{ system }} Time Data</h3>
        <span v-if="getLastUpdatedText && employeeIsUser()" class="last-updated">
          {{ getLastUpdatedText }}
        </span>
        <v-btn class="pr-xs-1" variant="text" icon="mdi-refresh" @click="resetData()">
          <template v-slot:default>
            <v-tooltip activator="parent" location="top">Refresh {{ system }} data</v-tooltip>
            <v-icon color="white" size="large">mdi-refresh</v-icon>
          </template>
        </v-btn>
      </v-card-title>
      <v-card-text class="mt-3 px-7">
        <!-- Warning for not being "on track" with hours -->
        <v-alert v-if="notOnTrack" class="mb-4" color="#f27311" type="info">
          You are not on track to meet your 1860 hours, which may have an affect on your budgets. If you believe this is
          an error, ensure that your timesheet data is up-to-date.
        </v-alert>
        <v-progress-linear class="mb-3 mt-7" v-if="loading" indeterminate></v-progress-linear>
        <div v-else>
          <div v-if="errorMessage" class="d-flex flex-column justify-center align-center py-3 font-weight-bold">
            <v-icon class="mb-2">mdi-alert</v-icon>
            <span>{{ errorMessage }}</span>
          </div>
          <div v-else>
            <time-period-hours
              :employee="clonedEmployee"
              :timesheets="timesheets || {}"
              :ptoBalances="ptoBalances || {}"
              :supplementalData="supplementalData || {}"
              :KEYS="KEYS"
            ></time-period-hours>
            <hr class="mt-3 mb-5 mx-7" />
            <p-t-o-hours :employee="clonedEmployee" :ptoBalances="ptoBalances || {}" :system="system"></p-t-o-hours>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <PTOPlanningForm
      v-if="store.getters.employees"
      v-show="false"
      style="display: none"
      ref="hiddenPtoPlanningFormRef"
      :employeeId="employee.id"
      :isCyk="system === 'ADP'"
      :pto="convertToHours(ptoBalances?.['PTO']?.value ?? ptoBalances?.['PTO'] ?? 0)"
      :holiday="convertToHours(ptoBalances?.['Holiday']?.value ?? ptoBalances?.['Holiday'] ?? 0)"
    />
  </div>
</template>

<script setup>
import TimePeriodHours from '@/components/shared/timesheets/TimePeriodHours.vue';
import PTOHours from '@/components/shared/timesheets/PTOHours.vue';
import _isEmpty from 'lodash/isEmpty';
import _forEach from 'lodash/forEach';
import _find from 'lodash/find';
import PTOPlanningForm from '@/components/shared/PTOPlanningForm.vue';
import api from '@/shared/api';
import { computed, inject, onBeforeMount, onBeforeUnmount, ref, unref, watch } from 'vue';
import { useStore } from 'vuex';
import { difference, isBefore, now } from '@/shared/dateUtils';
import { updateStoreContracts, updateStoreTags } from '@/utils/storeUtils';
import { getCalendarYearPeriods, getContractYearPeriods } from './time-periods';
import { getTodaysDate } from '@/shared/dateUtils.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const hiddenPtoPlanningFormRef = ref(null);

const props = defineProps(['employee']);
const emitter = inject('emitter');
const store = useStore();

const clonedEmployee = ref(unref(props.employee));
const excludeIfZero = ref(['Jury Duty', 'Maternity/Paternity Time Off', 'Bereavement']);
const errorMessage = ref(null);
const lastUpdated = ref(null);
const loading = ref(true);
const ptoBalances = ref({});
const supplementalData = ref(null);
const system = ref(null);
const timesheets = ref(null);
const KEYS = ref({
  QB: 'qbData',
  PAY_PERIODS: 'payPeriods',
  CALENDAR_YEAR: 'calendarYear',
  CONTRACT_YEAR: 'contractYear'
});
let hasSavedPlannedPto = false;
const PTO_ACCRUALS = {
  red: 14,
  white: 15.33333, // per Dave B, accruals are exactly this
  gray: 15.33333 // per Dave B, accruals are exactly this
};
const notOnTrack = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * The Before Unmount lifesycle hook.
 */
onBeforeUnmount(() => {
  emitter.off('get-period-data');
  emitter.off('auto-save-pto-planner');
}); // beforeUnmount

/**
 * The Created lifecycle hook.
 */
onBeforeMount(async () => {
  emitter.on('get-period-data', async ({ isCalendarYear, isYearly }) => {
    await setData(isCalendarYear, isYearly);
  });
  await setInitialData();

  // intial set of getting planned PTO data
  refreshPlannedPto();

  // listen for planned PTO results
  emitter.on('update-planned-pto-results-time-data', (data) => {
    if (data) clonedEmployee.value.plannedPto = data;
    refreshPlannedPto();
  });

  // listen for ability to refresh PTO plan results
  emitter.on('auto-save-pto-planner', () => {
    // run the PTO planner save function
    if (!hasSavedPlannedPto) {
      hiddenPtoPlanningFormRef.value.save(true);
      hasSavedPlannedPto = true;
    }
  });

  emitter.on('1860-not-on-track', () => {
    notOnTrack.value = true;
  });

  loading.value = false;
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the text for when timesheets data was last updated.
 *
 * @returns String - The string to display for last updated
 */
const getLastUpdatedText = computed(() => {
  let minutes = parseInt(difference(now(), lastUpdated.value, 'minute') || 0);
  let hours = parseInt(minutes / 60);
  if (hours < 1 && minutes > 0) {
    return `Last updated ${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
  } else if (hours > 0) {
    return `Last updated ${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
  } else {
    return null;
  }
}); // getLastUpdatedText

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * True if the user is the employee from props.
 *
 * @returns Boolean - Whether or not the employee prop is the user
 */
function employeeIsUser() {
  return clonedEmployee.value.id === store.getters.user.id;
} // employeeIsUser

/**
 * Sets an error message if the API returned an error.
 *
 * @param {Object} timesheetsData - The timesheets data object
 * @returns Boolean - Whether or not the API returned an error
 */
function hasError(timesheetsData) {
  if (timesheetsData?.name === 'AxiosError' || timesheetsData.code >= 400) {
    errorMessage.value = timesheetsData?.response?.data?.message;
    if (_isEmpty(errorMessage.value) || typeof errorMessage.value === 'object') {
      errorMessage.value = 'An error has occurred, try refreshing the widget';
    }
    return true;
  } else {
    return false;
  }
} // hasError

/**
 * Timesheets local storage expires if the storage is from a previous day.
 *
 * @returns Boolean - Whether or not timesheets local storage has expired
 */
function isStorageExpired(lastUpdated) {
  // last updated will either be now, or retrived from local storage
  return isBefore(lastUpdated, now(), 'day');
} // isStorageExpired

/**
 * True if timesheets exists in local storage.
 *
 * @returns Boolean - Whether or not timesheets exists in lcoal storage
 */
function qbStorageExists() {
  return localStorage.getItem(KEYS.value.QB) ? JSON.parse(localStorage.getItem(KEYS.value.QB)) : null;
} // qbStorageExists

/**
 * Removes a jobcode key value pair from PTO balances object if it is not relevant to a user.
 */
function removeExcludedPtoBalances() {
  _forEach(ptoBalances.value, (balance, jobcode) => {
    if (excludeIfZero.value.includes(jobcode) && balance === 0) delete ptoBalances.value[jobcode];
  });
} // removeExcludedPtoBalances

/**
 * Converts hours to seconds with 2 decimal places if needed.
 *
 * @param {Number} hours - The number of hours
 */
function convertToSeconds(hours) {
  return Number(hours * 60 * 60)
    ?.toFixed(2)
    ?.replace(/[.,]00$/, ''); // removes decimals if a whole number
} // convertToSeconds

/**
 * Converts seconds to hours with 2 decimal places if needed.
 *
 * @param {Number} seconds - The number of seconds
 */
function convertToHours(seconds) {
  return Number(seconds / 60 / 60)
    ?.toFixed(2)
    ?.replace(/[.,]00$/, ''); // removes decimals if a whole number
} // convertToHours

/**
 * Helper to add items to the ptoBalances object
 * @param balanceKey key in ptoBalances to modify
 * @param itemsKey key in ptoBalances[balanceKey].items object to add
 * @param planResults object of results of planned PTO
 * @param planKey key in planResults to grab from
 */
function addPlanToBalances(balanceKey, itemsKey, planResults, planKey) {
  if (!ptoBalances.value[balanceKey]?.items) {
    let oldBalance = ptoBalances.value[balanceKey]?.value || ptoBalances.value[balanceKey] || 0;
    ptoBalances.value[balanceKey] = { value: oldBalance, items: {} };
  }
  ptoBalances.value[balanceKey].items[itemsKey] = convertToSeconds(planResults[planKey]);
} // addPlanToBalances

/**
 * Refreshes the PTO plan to put in the ptoBalances object, based on the
 * employee's plannedPto in their employee object by default.
 */
async function refreshPlannedPto() {
  // set plan to employee object
  let employeePlan = clonedEmployee.value.plannedPto;
  let planResults = {
    pto: Number(employeePlan?.results?.pto),
    holiday: Number(employeePlan?.results?.holiday),
    endDate: employeePlan?.results?.endDate
  };
  // yeet outta here if there is no planned PTO
  if (!planResults.endDate) {
    delete ptoBalances.value?.['PTO']?.items?.['PTO after plan'];
    delete ptoBalances.value?.['Holiday']?.items?.['Holiday after plan'];
    return;
  }

  // set planned PTO and Holiday balances
  addPlanToBalances('PTO', 'PTO after plan', planResults, 'pto');
  addPlanToBalances('Holiday', 'Holiday after plan', planResults, 'holiday');
} // refreshPlannedPto

/**
 * Resets components data and removes timesheets local storage.
 */
async function resetData() {
  loading.value = true;
  timesheets.value = null;
  ptoBalances.value = null;
  supplementalData.value = null;
  system.value = null;
  lastUpdated.value = null;
  errorMessage.value = null;
  if (employeeIsUser()) {
    localStorage.removeItem(KEYS.value.QB);
  }
  emitter.emit('reset-data');
  await setInitialData(false);
  refreshPlannedPto();
  loading.value = false;
} // resetData

/**
 * Retrieves, sets, and stores components data from API.
 *
 * @param {Boolean} isCalendarYear - Whether or not the time period is the calendar year
 * @param {Boolean} isYearly - Whether or not the time period is yearly
 * @param {Boolean} prevYear - Whether or not to get the previous year
 */
async function setDataFromApi(isCalendarYear, isYearly) {
  let code = !isYearly ? 2 : null;
  let periods = {};
  if (isYearly) {
    if (isCalendarYear) periods = getCalendarYearPeriods();
    else periods = getContractYearPeriods(clonedEmployee.value);
  }
  let timesheetsData = await api.getTimesheetsData(clonedEmployee.value.employeeNumber, {
    code,
    employeeId: clonedEmployee.value.id,
    periods
  });

  if (!hasError(timesheetsData)) {
    timesheets.value = timesheetsData.timesheets;
    ptoBalances.value = timesheetsData.ptoBalances;
    supplementalData.value = timesheetsData.supplementalData;
    system.value = timesheetsData.system;
    lastUpdated.value = now();
    removeExcludedPtoBalances();
    if (employeeIsUser()) {
      // only set local storage if user is looking at their own data
      setStorage(isCalendarYear, isYearly);
    }
  }
} // setDataFromApi

/**
 * Sets the main components data used throughout child components.
 *
 * @param {Object} qbStorage - The local storage timesheets object
 * @param {String} key - The pay periods or yearly object key
 */
function setDataFromStorage(qbStorage, key) {
  timesheets.value = qbStorage[key]?.timesheets;
  supplementalData.value = qbStorage[key]?.supplementalData;
  lastUpdated.value = qbStorage[key]?.lastUpdated;
  ptoBalances.value = qbStorage?.ptoBalances;
  system.value = qbStorage?.system;
} // setDataFromStorage

/**
 * Sets local storage for Quickbooks data.
 *
 * @param {Boolean} isCalendarYear - Whether or not the time period is the calendar year
 * @param {Boolean} isYearly - Whether or not the time period is yearly
 */
function setStorage(isCalendarYear, isYearly) {
  let storage = qbStorageExists();
  let key = isYearly ? (isCalendarYear ? KEYS.value.CALENDAR_YEAR : KEYS.value.CONTRACT_YEAR) : KEYS.value.PAY_PERIODS;
  let data = {
    [key]: {
      timesheets: timesheets.value,
      supplementalData: supplementalData.value,
      lastUpdated: lastUpdated.value
    },
    ptoBalances: ptoBalances.value,
    system: system.value
  };

  // overwrite storage
  localStorage.setItem(KEYS.value.QB, JSON.stringify({ ...storage, ...data }));
} // setStorage

/**
 * Retrieves and sets timesheets data from API or local storage.
 *
 * @param {Boolean} isCalendarYear - Whether or not the time period is the calendar year
 * @param {Boolean} isYearly - Whether or not the time period is yearly
 */
async function setData(isCalendarYear, isYearly) {
  let storage = qbStorageExists();
  let key = isYearly ? (isCalendarYear ? KEYS.value.CALENDAR_YEAR : KEYS.value.CONTRACT_YEAR) : KEYS.value.PAY_PERIODS;
  if (storage && storage[key] && employeeIsUser() && !isStorageExpired(storage[key].lastUpdated)) {
    setDataFromStorage(storage, key);
  } else {
    await setDataFromApi(isCalendarYear, isYearly);
  }
} // setData

/**
 * Sets the timesheets data on initial load based on a time period (current and previous pay period displayed).
 */
async function setInitialData() {
  await Promise.all([
    setData(),
    !store.getters.contracts ? updateStoreContracts() : '',
    !store.getters.tags ? updateStoreTags() : ''
  ]);
} // setInitialData

/**
 * Helper function get get an employee's plan tag (ie: red/white/gray)
 * @param emp
 */
async function getEmployeePlanTagName(emp) {
  if (!store.getters.tags) await updateStoreTags();
  let plans = ['red', 'white', 'gray'];
  for (let tag of store.getters.tags) {
    if (plans.includes(tag.tagName.toLowerCase()) && tag.employees.includes(emp.id)) {
      return tag.tagName;
    }
  }
  return undefined;
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => store.getters.employees,
  () => {
    clonedEmployee.value = _find(store.getters.employees, (e) => e.id === clonedEmployee.value.id);
  },
  { deep: true }
);

watch(
  () => ptoBalances.value,
  async () => {
    let balance = (ptoBalances.value?.['PTO']?.value ?? ptoBalances.value?.['PTO']) / 60 / 60;
    let plan = await getEmployeePlanTagName(clonedEmployee.value);
    plan = plan?.toLowerCase();
    let ptoAccrual = PTO_ACCRUALS[plan ?? 'red']; // default to red to set to 14
    let ptoMax = 208;
    if (clonedEmployee.value.id === store.getters.user.id && ptoAccrual > ptoMax - balance) {
      let notification = {
        type: 'pto-accrual',
        closeable: true,
        status: 'info',
        color: '#f27311',
        message: `You will not accrue ${balance >= ptoMax ? 'any' : `your full ${ptoAccrual.toFixed(2)} hours of`} PTO next month. Consider using your PTO balance or cashing it out using the Timesheet Widget. Your current balance is ${balance.toFixed(2)} hours.`,
        id: `PTO-ACCRUE-WARNING-${getTodaysDate('YYYY-MM')}`
      };
      emitter.emit('add-notification', notification);
    }
  }
);
</script>

<style scoped>
.last-updated {
  position: absolute !important;
  font-size: 10px;
  top: 0px;
  right: 0px;
  margin-right: 10px;
}
.relative {
  position: relative !important;
}
.on-track-alert {
  background-color: #f27311;
  color: white;
  border-radius: 4px;
}
</style>
