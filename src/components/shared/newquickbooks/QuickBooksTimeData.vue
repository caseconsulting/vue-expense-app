<template>
  <div id="t-sheets-data">
    <v-card density="compact">
      <v-card-title class="header_style d-flex align-center justify-space-between py-0">
        <h3>QuickBooks Time Data</h3>
        <v-btn variant="text" icon="mdi-refresh">
          <template v-slot:default>
            <v-tooltip activator="parent" location="top">Refresh Quickbooks Time Data</v-tooltip>
            <v-icon color="white" size="large">mdi-refresh</v-icon>
          </template>
        </v-btn>
      </v-card-title>
      <v-card-text class="mt-3 px-7">
        <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
        <div v-else>
          <monthly-hours :timesheets="timesheets"></monthly-hours>
          <hr class="my-5 mx-7" />
          <p-t-o-hours :ptoBalances="ptoBalances"></p-t-o-hours>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import MonthlyHours from '@/components/shared/newquickbooks/MonthlyHours.vue';
import PTOHours from '@/components/shared/newquickbooks/PTOHours.vue';
import api from '@/shared/api';

async function created() {
  let timesheetsData = await api.getTimesheetsData(10066, '2024-01', '2024-02');
  this.ptoBalances = timesheetsData.ptoBalances;
  this.timesheets = timesheetsData.timesheets;
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
      loading: true,
      ptoBalances: null,
      timesheets: null
    };
  }
};
</script>
