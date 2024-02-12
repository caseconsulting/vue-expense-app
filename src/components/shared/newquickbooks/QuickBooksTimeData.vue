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
        <monthly-hours></monthly-hours>
        <hr class="my-5 mx-7" />
        <p-t-o-hours></p-t-o-hours>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import MonthlyHours from '@/components/shared/newquickbooks/MonthlyHours.vue';
import PTOHours from '@/components/shared/newquickbooks/PTOHours.vue';

export default {
  components: {
    MonthlyHours,
    PTOHours
  }
};
</script>
