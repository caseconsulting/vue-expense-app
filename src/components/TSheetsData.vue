<template>
  <div id="t-sheets-data">
    <v-card>
      <v-card-title class="header_style">
        <h4>TSheets Data</h4>
      </v-card-title>
      <v-card-text class="pt-5 pb-0 black--text">
        <monthly-charges></monthly-charges>
        <v-divider></v-divider>
        <balances></balances>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import MonthlyCharges from '../components/MonthlyCharges.vue';
import Balances from '../components/Balances.vue';

export default {
  components: {
    Balances,
    MonthlyCharges
  }
};
</script>
