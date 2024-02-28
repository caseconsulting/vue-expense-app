<template>
  <div id="t-sheets-data">
    <v-card density="compact">
      <v-card-title class="header_style d-flex align-center justify-space-between py-0">
        <h3>QuickBooks Time Data</h3>
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
import { format, getTodaysDate, startOf, subtract } from '@/shared/dateUtils';

async function created() {
  this.emitter.on('get-period-data', async ({ startDate, endDate, isMonthly }) => {
    if (isMonthly) {
      let monthlyTimesheetsStorage = localStorage.getItem('timesheetsMonthly');
      let monthlySupplementalStorage = localStorage.getItem('supplementalDataMonthly');
      if (monthlyTimesheetsStorage && monthlySupplementalStorage) {
        this.timesheets = JSON.parse(monthlyTimesheetsStorage);
        this.supplementalData = JSON.parse(monthlySupplementalStorage);
      }
    } else {
      let yearlyTimesheetsStorage = localStorage.getItem('timesheetsYearly');
      let yearlySupplementalStorage = localStorage.getItem('supplementalDataYearly');
      if (!yearlyTimesheetsStorage || !yearlySupplementalStorage || this.$store.getters.user.id !== this.employee.id) {
        let timesheetsData = await api.getTimesheetsData(this.employee.employeeNumber, startDate, endDate);
        this.timesheets = timesheetsData.timesheets;
        this.supplementalData = timesheetsData.supplementalData;
        if (this.timesheets && this.supplementalData) {
          localStorage.setItem('timesheetsYearly', JSON.stringify(this.timesheets));
          localStorage.setItem('supplementalDataYearly', JSON.stringify(this.supplementalData));
        }
      } else {
        this.timesheets = JSON.parse(yearlyTimesheetsStorage);
        this.supplementalData = JSON.parse(yearlySupplementalStorage);
      }
    }
  });

  await this.setInitialData();
  this.loading = false;
}

async function setInitialData() {
  let today = getTodaysDate();
  let timesheetsData = await api.getTimesheetsData(
    this.employee.employeeNumber,
    format(startOf(subtract(today, 1, 'month'), 'month'), null, 'YYYY-MM'),
    format(today, null, 'YYYY-MM')
  );
  if (timesheetsData?.name !== 'AxiosError') {
    this.errorMessage = null;
    this.ptoBalances = timesheetsData.ptoBalances;
    this.timesheets = timesheetsData.timesheets;
    this.supplementalData = timesheetsData.supplementalData;
    if (this.ptoBalances['Jury Duty'] <= 0) delete this.ptoBalances['Jury Duty'];
    if (this.ptoBalances['Maternity/Paternity Time Off'] <= 0) delete this.ptoBalances['Maternity/Paternity Time Off'];
    if (this.ptoBalances && this.timesheets && this.supplementalData) {
      localStorage.setItem('ptoBalances', JSON.stringify(this.ptoBalances));
      localStorage.setItem('timesheetsMonthly', JSON.stringify(this.timesheets));
      localStorage.setItem('supplementalDataMonthly', JSON.stringify(this.supplementalData));
    }
  } else {
    this.errorMessage = timesheetsData?.response?.data?.message;
    if (_.isEmpty(this.errorMessage)) {
      this.errorMessage = 'An error has occurred';
    }
  }
}

async function resetData() {
  this.loading = true;
  localStorage.removeItem('ptoBalances');
  localStorage.removeItem('timesheetsMonthly');
  localStorage.removeItem('timesheetsYearly');
  localStorage.removeItem('supplementalDataMonthly');
  localStorage.removeItem('supplementalDataYearly');
  this.emitter.emit('reset-data');
  await this.setInitialData();
  this.loading = false;
}

export default {
  components: {
    MonthlyHours,
    PTOHours
  },
  created,
  data() {
    return {
      errorMessage: null,
      loading: true,
      ptoBalances: null,
      timesheets: null,
      supplementalData: null
    };
  },
  methods: {
    setInitialData,
    resetData
  },
  props: ['employee']
};
</script>
