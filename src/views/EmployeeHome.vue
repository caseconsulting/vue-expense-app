<template>
<v-container fill-height>
  <v-layout row wrap align-center justify-center>
    <v-flex text-xs-center lg10 md6 sm6>
      <budget-table></budget-table>
    </v-flex>
    <v-flex text-xs-center lg7 md6 sm6>
      <budget-chart></budget-chart>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import BudgetChart from '../components/BudgetChart.vue';
import BudgetTable from '../components/BudgetTable.vue';
export default {
  data() {
    return {};
  },
  components: {
    BudgetChart,
    BudgetTable
  }
};
</script>
<style>
</style>
