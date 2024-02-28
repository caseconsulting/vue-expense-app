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
            <monthly-hours
              :employee="employee"
              :timesheets="timesheets || {}"
              :ptoBalances="ptoBalances || {}"
              :supplementalData="supplementalData || {}"
            ></monthly-hours>
            <hr class="my-5 mx-7" />
            <p-t-o-hours :employee="employee" :ptoBalances="ptoBalances || {}"></p-t-o-hours>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import MonthlyHours from '@/components/shared/newquickbooks/MonthlyHours.vue';
import PTOHours from '@/components/shared/newquickbooks/PTOHours.vue';
import _ from 'lodash';
import api from '@/shared/api';
import { difference, format, getTodaysDate, now, startOf, subtract } from '@/shared/dateUtils';

async function created() {
  this.emitter.on('get-period-data', async ({ startDate, endDate, isMonthly }) => {
    await this.setData(startDate, endDate, isMonthly);
  });

  await this.setInitialData();
  this.loading = false;
}

function beforeUnmount() {
  this.emitter.off('get-period-data');
}

function setDataFromStorage(qbStorage, key) {
  this.timesheets = qbStorage[key]?.timesheets;
  this.supplementalData = qbStorage[key]?.supplementalData;
  this.lastUpdated = qbStorage[key]?.lastUpdated;
  this.ptoBalances = qbStorage?.ptoBalances;
}

function setStorage(isMonthly) {
  let storage = this.hasQbStorage();
  let key = isMonthly ? 'monthly' : 'yearly';
  let data = {
    [key]: {
      timesheets: this.timesheets,
      supplementalData: this.supplementalData,
      lastUpdated: this.lastUpdated
    },
    ptoBalances: this.ptoBalances
  };

  // overwrite storage
  localStorage.setItem('qbData', JSON.stringify({ ...storage, ...data }));
}

async function setDataFromApi(startDate, endDate, isMonthly) {
  let timesheetsData = await api.getTimesheetsData(this.employee.employeeNumber, startDate, endDate);
  if (!this.hasError(timesheetsData)) {
    this.timesheets = timesheetsData.timesheets;
    this.ptoBalances = timesheetsData.ptoBalances;
    this.supplementalData = timesheetsData.supplementalData;
    this.lastUpdated = now();
    this.removeExcludedPtoBalances();
    if (this.employeeIsUser()) {
      this.setStorage(isMonthly);
    }
  }
}

function removeExcludedPtoBalances() {
  _.forEach(this.ptoBalances, (balance, jobcode) => {
    if (this.excludeIfZero.includes(jobcode) && balance === 0) delete this.ptoBalances[jobcode];
  });
}

function employeeIsUser() {
  return this.employee.id === this.$store.getters.user.id;
}

async function setData(startDate, endDate, isMonthly) {
  let storage = this.hasQbStorage();
  let key = isMonthly ? 'monthly' : 'yearly';
  if (storage && storage[key] && this.employeeIsUser() && !this.isStorageExpired()) {
    this.setDataFromStorage(storage, key);
  } else {
    await this.setDataFromApi(startDate, endDate, isMonthly);
  }
}

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
}

function hasQbStorage() {
  return localStorage.getItem('qbData') ? JSON.parse(localStorage.getItem('qbData')) : null;
}

async function setInitialData() {
  let today = getTodaysDate();
  let startDate = format(startOf(subtract(today, 1, 'month'), 'month'), null, 'YYYY-MM');
  let endDate = format(today, null, 'YYYY-MM');
  await this.setData(startDate, endDate, true);
}

async function resetData() {
  this.loading = true;
  this.timesheets = null;
  this.ptoBalances = null;
  this.supplementalData = null;
  this.lastUpdated = null;
  if (this.employeeIsUser()) {
    localStorage.removeItem('qbData');
  }
  this.emitter.emit('reset-data');
  await this.setInitialData();
  this.loading = false;
}

function isStorageExpired() {
  // last updated will either be now, or retrived from local storage
  return difference(now(), this.lastUpdated, 'hour') >= 24;
}

function getLastUpdatedText() {
  let now = this.now();
  let lastUpdated = this.lastUpdated;
  let minutes = parseInt(difference(now, lastUpdated, 'minute') || 0);
  let hours = parseInt(minutes / 60);
  if (hours < 1 && minutes > 0) {
    return `Last updated ${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
  } else {
    return null;
  }
}

export default {
  beforeUnmount,
  components: {
    MonthlyHours,
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
      timesheets: null,
      supplementalData: null
    };
  },
  methods: {
    employeeIsUser,
    hasError,
    hasQbStorage,
    isStorageExpired,
    now,
    removeExcludedPtoBalances,
    setInitialData,
    setData,
    setDataFromApi,
    setDataFromStorage,
    setStorage,
    resetData
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
