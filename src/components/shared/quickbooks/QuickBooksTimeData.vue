<template>
  <div id="t-sheets-data">
    <v-card density="compact">
      <v-card-title class="header_style d-flex align-center justify-space-between py-0 relative">
        <h3>QuickBooks Time Data</h3>
        <span v-if="getLastUpdatedText && employeeIsUser()" class="last-updated">
          {{ getLastUpdatedText }}
        </span>
        <v-btn variant="text" icon="mdi-refresh" @click="resetData()">
          <template v-slot:default>
            <v-tooltip activator="parent" location="top">Refresh Quickbooks data</v-tooltip>
            <v-icon color="white" size="large">mdi-refresh</v-icon>
          </template>
        </v-btn>
      </v-card-title>
      <v-card-text class="mt-3 px-7">
        <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
        <div v-else>
          <div class="d-flex flex-column justify-center align-center py-3 font-weight-bold" v-if="errorMessage">
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
            <hr class="my-5 mx-7" />
            <p-t-o-hours :employee="employee" :ptoBalances="ptoBalances || {}"></p-t-o-hours>
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
import { difference, format, getTodaysDate, isBefore, now, startOf, subtract } from '@/shared/dateUtils';

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
  this.emitter.on('get-period-data', async ({ startDate, endDate, isMonthly }) => {
    await this.setData(startDate, endDate, isMonthly);
  });
  await this.setInitialData();
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
  if (timesheetsData?.name === 'AxiosError') {
    this.errorMessage = timesheetsData?.response?.data?.message;
    if (_.isEmpty(this.errorMessage)) {
      this.errorMessage = 'An error has occurred';
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
 * Resets components data and removes timesheets local storage.
 */
async function resetData() {
  this.loading = true;
  this.timesheets = null;
  this.ptoBalances = null;
  this.supplementalData = null;
  this.lastUpdated = null;
  if (this.employeeIsUser()) {
    localStorage.removeItem(this.KEYS.QB);
  }
  this.emitter.emit('reset-data');
  await this.setInitialData();
  this.loading = false;
} // resetData

/**
 * Retrieves, sets, and stores components data from API.
 *
 * @param {String} startDate - The time period start date (YYYY-MM) format
 * @param {String} endDate - The time period end date (YYYY-MM) format
 * @param {Boolean} isMonthly - Whether or not the time period is monthly
 */
async function setDataFromApi(startDate, endDate, isMonthly) {
  let timesheetsData = await api.getTimesheetsData(this.employee.employeeNumber, startDate, endDate);
  if (!this.hasError(timesheetsData)) {
    this.timesheets = timesheetsData.timesheets;
    this.ptoBalances = timesheetsData.ptoBalances;
    this.supplementalData = timesheetsData.supplementalData;
    this.lastUpdated = now();
    this.removeExcludedPtoBalances();
    if (this.employeeIsUser()) {
      // only set local storage if user is looking at their own data
      this.setStorage(isMonthly);
    }
  }
} // setDataFromApi

/**
 * Sets the main components data used throughout child components.
 *
 * @param {Object} qbStorage - The local storage timesheets object
 * @param {String} key - The monthly or yearly object key
 */
function setDataFromStorage(qbStorage, key) {
  this.timesheets = qbStorage[key]?.timesheets;
  this.supplementalData = qbStorage[key]?.supplementalData;
  this.lastUpdated = qbStorage[key]?.lastUpdated;
  this.ptoBalances = qbStorage?.ptoBalances;
} // setDataFromStorage

/**
 * Sets local storage for Quickbooks data.
 *
 * @param {Boolean} isMonthly - Whether or not the time period is monthly
 */
function setStorage(isMonthly) {
  let storage = this.qbStorageExists();
  let key = isMonthly ? this.KEYS.MONTHLY : this.KEYS.YEARLY;
  let data = {
    [key]: {
      timesheets: this.timesheets,
      supplementalData: this.supplementalData,
      lastUpdated: this.lastUpdated
    },
    ptoBalances: this.ptoBalances
  };

  // overwrite storage
  localStorage.setItem(this.KEYS.QB, JSON.stringify({ ...storage, ...data }));
} // setStorage

/**
 * Retrieves and sets timesheets data from API or local storage.
 *
 * @param {String} startDate - The time period start date (YYYY-MM) format
 * @param {String} endDate - The time period end date (YYYY-MM) format
 * @param {Boolean} isMonthly - Whether or not the time period is monthly
 */
async function setData(startDate, endDate, isMonthly) {
  let storage = this.qbStorageExists();
  let key = isMonthly ? this.KEYS.MONTHLY : this.KEYS.YEARLY;
  if (storage && storage[key] && this.employeeIsUser() && !this.isStorageExpired(storage[key].lastUpdated)) {
    this.setDataFromStorage(storage, key);
  } else {
    await this.setDataFromApi(startDate, endDate, isMonthly);
  }
} // setData

/**
 * Sets the timesheets data on initial load based on a monthly time period (current and previous month displayed).
 */
async function setInitialData() {
  let today = getTodaysDate();
  // last month
  let startDate = format(startOf(subtract(today, 1, 'month'), 'month'), null, 'YYYY-MM');
  // this month
  let endDate = format(today, null, 'YYYY-MM');
  await this.setData(startDate, endDate, true);
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
      timesheets: null,
      KEYS: {
        QB: 'qbData',
        MONTHLY: 'monthly',
        YEARLY: 'yearly'
      }
    };
  },
  methods: {
    employeeIsUser,
    hasError,
    isStorageExpired,
    now,
    qbStorageExists,
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
