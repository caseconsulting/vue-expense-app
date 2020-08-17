<template>
  <div id="t-sheets-data">
    <v-card>
      <v-card-title class="header_style">
        <h3>TSheets Data</h3>
        <v-spacer></v-spacer>
        <v-switch v-model="showMinutes" dense hide-details color="gray" class="my-0 py-0"></v-switch>
      </v-card-title>
      <v-card-text class="pt-5 pb-0 black--text">
        <monthly-charges :passedEmployee="employee" :showMinutes="showMinutes"></monthly-charges>
        <v-divider></v-divider>
        <balances :passedEmployee="employee" :showMinutes="showMinutes"></balances>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import MonthlyCharges from '@/components/MonthlyCharges.vue';
import Balances from '@/components/Balances.vue';

export default {
  components: {
    Balances,
    MonthlyCharges
  },
  data() {
    return {
      showMinutes: false
    };
  },
  props: ['employee']
};
</script>
