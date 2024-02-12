<template>
  <div id="t-sheets-data">
    <v-card density="compact">
      <v-card-title class="header_style d-flex align-center py-0">
        <h3 class="d-inline-block">QuickBooks Time Data</h3>
      </v-card-title>
      <v-card-text class="py-5 px-7">
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
