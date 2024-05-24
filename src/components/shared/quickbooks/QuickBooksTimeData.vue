<template>
  <div id="t-sheets-data">
    <v-card density="compact">
      <v-card-title class="header_style d-flex align-center justify-space-between py-0 relative">
        <h3>{{ system }} Time Data</h3>
        <span v-if="getLastUpdatedText && employeeIsUser()" class="last-updated">
          {{ getLastUpdatedText }}
        </span>
        <v-btn variant="text" icon="mdi-refresh" @click="resetData()">
          <template v-slot:default>
            <v-tooltip activator="parent" location="top">Refresh QuickBooks data</v-tooltip>
            <v-icon color="white" size="large">mdi-refresh</v-icon>
          </template>
        </v-btn>
      </v-card-title>
      <v-card-text class="mt-3 px-7">
        <v-progress-linear class="mb-3 mt-7" v-if="loading" indeterminate></v-progress-linear>
        <div v-else>
          <div v-if="errorMessage" class="d-flex flex-column justify-center align-center py-3 font-weight-bold">
            <v-icon class="mb-2">mdi-alert</v-icon>
            <span>{{ errorMessage }}</span>
          </div>
          <div v-else>
            <time-period-hours
              :employee="employee"
              :timesheets="timesheets || {}"
              :ptoBalances="ptoBalances || {}"
              :supplementalData="supplementalData || {}"
            ></time-period-hours>
            <hr class="mt-3 mb-5 mx-7" />
            <p-t-o-hours :employee="employee" :ptoBalances="ptoBalances || {}" :system="system"></p-t-o-hours>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import TimePeriodHours from '@/components/shared/quickbooks/TimePeriodHours.vue';
import PTOHours from '@/components/shared/quickbooks/PTOHours.vue';
import _ from 'lodash';
import api from '@/shared/api';
import { difference, isBefore, now } from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * The Before Unmount lifesycle hook.
 */
function beforeUnmount() {
  this.emitter.off('get-period-data');
} // beforeUnmount

/**
 * The Created lifecycle hook.
 */
async function created() {
  this.emitter.on('get-period-data', async ({ isCalendarYear, isYearly }) => {
    await this.setData(isCalendarYear, isYearly);
  });
  await this.setInitialData();

  // add planned PTO and Holiday to ptoBalances
  this.refreshPlannedPto();
  // listen for planned PTO results
  this.emitter.on('update-planned-pto-results-time-data', (data) => {
    this.employee.plannedPto = data;
    this.refreshPlannedPto();
  });

  this.loading = false;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                 COMPUTED                         |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the text for when timesheets data was last updated.
 *
 * @returns String - The string to display for last updated
 */
function getLastUpdatedText() {
  let now = this.now();
  let lastUpdated = this.lastUpdated;
  let minutes = parseInt(difference(now, lastUpdated, 'minute') || 0);
  let hours = parseInt(minutes / 60);
  if (hours < 1 && minutes > 0) {
    return `Last updated ${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
  } else if (hours > 0) {
    return `Last updated ${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
  } else {
    return null;
  }
} // getLastUpdatedText

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * True if the user is the employee from props
 *
 * @returns Boolean - Whether or not the employee prop is the user
 */
function employeeIsUser() {
  return this.employee.id === this.$store.getters.user.id;
} // employeeIsUser

/**
 * Sets an error message if the API returned an error.
 *
 * @param {Object} timesheetsData - The timesheets data object
 * @returns Boolean - Whether or not the API returned an error
 */
function hasError(timesheetsData) {
  if (timesheetsData?.name === 'AxiosError' || timesheetsData.code >= 400) {
    this.errorMessage = timesheetsData?.response?.data?.message;
    if (_.isEmpty(this.errorMessage) || typeof this.errorMessage === 'object') {
      this.errorMessage = 'An error has occurred, try refreshing the widget';
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
  return localStorage.getItem(this.KEYS.QB) ? JSON.parse(localStorage.getItem(this.KEYS.QB)) : null;
} // qbStorageExists

/**
 * Removes a jobcode key value pair from PTO balances object if it is not relevant to a user.
 */
function removeExcludedPtoBalances() {
  _.forEach(this.ptoBalances, (balance, jobcode) => {
    if (this.excludeIfZero.includes(jobcode) && balance === 0) delete this.ptoBalances[jobcode];
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
 * Helper to add items to the ptoBalances object
 * @param balanceKey key in ptoBalances to modify
 * @param itemsKey key in ptoBalances[balanceKey].items object to add
 * @param planResults object of results of planned PTO
 * @param planKey key in planResults to grab from
 */
function addPlanToBalances(balanceKey, itemsKey, planResults, planKey) {
  let balanceItem = this.ptoBalances[balanceKey];
  if (!balanceItem.value) this.ptoBalances[balanceKey] = { value: balanceItem, items: {} };
  this.ptoBalances[balanceKey].items[itemsKey] = this.convertToSeconds(planResults[planKey]);
} // addPlanToBalances

/**
 * Refreshes the PTO plan to put in the ptoBalances object, based on the
 * employee's plannedPto in their employee object by default.
 *
 * @param planResults (optional) object of results of planned PTO
 */
function refreshPlannedPto() {
  // set plan to employee object
  let plan = {
    pto: this.employee.plannedPto?.results?.pto,
    holiday: this.employee.plannedPto?.results?.holiday,
    endDate: this.employee.plannedPto?.results?.endDate
  };
  // yeet outta here if there is no planned PTO
  if (!plan.endDate) {
    delete this.ptoBalances?.['PTO']?.items?.['PTO after plan'];
    delete this.ptoBalances?.['Holiday']?.items?.['Holiday after plan'];
    return;
  }
  // set planned PTO and Holiday balances
  this.addPlanToBalances('PTO', 'PTO after plan', plan, 'pto');
  this.addPlanToBalances('Holiday', 'Holiday after plan', plan, 'holiday');
} // refreshPlannedPto

/**
 * Resets components data and removes timesheets local storage.
 */
async function resetData() {
  this.loading = true;
  this.timesheets = null;
  this.ptoBalances = null;
  this.supplementalData = null;
  this.system = null;
  this.lastUpdated = null;
  this.errorMessage = null;
  if (this.employeeIsUser()) {
    localStorage.removeItem(this.KEYS.QB);
  }
  this.emitter.emit('reset-data');
  await this.setInitialData(false);
  this.loading = false;
} // resetData

/**
 * Retrieves, sets, and stores components data from API.
 *
 * @param {Boolean} isCalendarYear - Whether or not the time period is the calendar year
 * @param {Boolean} isYearly - Whether or not the time period is yearly
 */
async function setDataFromApi(isCalendarYear, isYearly) {
  let code = isYearly ? (isCalendarYear ? 3 : 4) : 2;
  let timesheetsData = await api.getTimesheetsData(this.employee.employeeNumber, {
    code,
    employeeId: this.employee.id
  });
  if (!this.hasError(timesheetsData)) {
    this.timesheets = timesheetsData.timesheets;
    this.ptoBalances = timesheetsData.ptoBalances;
    this.supplementalData = timesheetsData.supplementalData;
    this.system = timesheetsData.system;
    this.lastUpdated = now();
    this.removeExcludedPtoBalances();
    if (this.employeeIsUser()) {
      // only set local storage if user is looking at their own data
      this.setStorage(isCalendarYear, isYearly);
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
  this.timesheets = qbStorage[key]?.timesheets;
  this.supplementalData = qbStorage[key]?.supplementalData;
  this.lastUpdated = qbStorage[key]?.lastUpdated;
  this.ptoBalances = qbStorage?.ptoBalances;
  this.syetem = qbStorage?.system;
} // setDataFromStorage

/**
 * Sets local storage for Quickbooks data.
 *
 * @param {Boolean} isCalendarYear - Whether or not the time period is the calendar year
 * @param {Boolean} isYearly - Whether or not the time period is yearly
 */
function setStorage(isCalendarYear, isYearly) {
  let storage = this.qbStorageExists();
  let key = isYearly ? (isCalendarYear ? this.KEYS.CALENDAR_YEAR : this.KEYS.CONTRACT_YEAR) : this.KEYS.PAY_PERIODS;
  let data = {
    [key]: {
      timesheets: this.timesheets,
      supplementalData: this.supplementalData,
      lastUpdated: this.lastUpdated
    },
    ptoBalances: this.ptoBalances,
    system: this.system
  };

  // overwrite storage
  localStorage.setItem(this.KEYS.QB, JSON.stringify({ ...storage, ...data }));
} // setStorage

/**
 * Retrieves and sets timesheets data from API or local storage.
 *
 * @param {Boolean} isCalendarYear - Whether or not the time period is the calendar year
 * @param {Boolean} isYearly - Whether or not the time period is yearly
 */
async function setData(isCalendarYear, isYearly) {
  let storage = this.qbStorageExists();
  let key = isYearly ? (isCalendarYear ? this.KEYS.CALENDAR_YEAR : this.KEYS.CONTRACT_YEAR) : this.KEYS.PAY_PERIODS;
  if (storage && storage[key] && this.employeeIsUser() && !this.isStorageExpired(storage[key].lastUpdated)) {
    this.setDataFromStorage(storage, key);
  } else {
    await this.setDataFromApi(isCalendarYear, isYearly);
  }
  this.refreshPlannedPto();
} // setData

/**
 * Sets the timesheets data on initial load based on a time period (current and previous pay period displayed).
 */
async function setInitialData() {
  await this.setData();
} // setInitialData

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeUnmount,
  components: {
    TimePeriodHours,
    PTOHours
  },
  computed: {
    getLastUpdatedText
  },
  created,
  data() {
    return {
      excludeIfZero: ['Jury Duty', 'Maternity/Paternity Time Off'],
      errorMessage: null,
      lastUpdated: null,
      loading: true,
      ptoBalances: null,
      supplementalData: null,
      system: null,
      timesheets: null,
      KEYS: {
        QB: 'qbData',
        PAY_PERIODS: 'payPeriods',
        CALENDAR_YEAR: 'calendarYear',
        CONTRACT_YEAR: 'contractYear'
      }
    };
  },
  methods: {
    addPlanToBalances,
    convertToSeconds,
    employeeIsUser,
    hasError,
    isStorageExpired,
    now,
    qbStorageExists,
    refreshPlannedPto,
    removeExcludedPtoBalances,
    resetData,
    setInitialData,
    setData,
    setDataFromApi,
    setDataFromStorage,
    setStorage
  },
  props: ['employee']
};
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
</style>
