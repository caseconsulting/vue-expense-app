<template>
  <v-layout row wrap>
    <v-flex offset-lg1 offset-md2 lg9 md10 sm12>
      <rollup-expense-type-table @selection="selection"></rollup-expense-type-table>
    </v-flex>
    <v-flex lg2 md2 sm12>
      <expense-info class="jerryrig"></expense-info>
      <expense-type-totals :selectedObj="tableSelected.data"></expense-type-totals>
    </v-flex>
  </v-layout>
</template>

<script>
import ExpenseInfo from '../components/ExpenseInfo.vue';
import ExpenseTypeTotals from '../components/ExpenseTypeTotals.vue';
import RollupExpenseTypeTable from '../components/RollupExpenseTypeTable.vue';

export default {
  data() {
    return {
      tableSelected: {}
    };
  },
  watch: {
    tableSelected: {
      handler: function(val) {
        this.tableSelected = val;
      },
      deep: true
    }
  },
  methods: {
    selection(item) {
      this.tableSelected = item;
    }
  },

  components: {
    ExpenseInfo,
    ExpenseTypeTotals,
    RollupExpenseTypeTable
  }
};
</script>
<style>
.jerryrig {
  margin-bottom: 15px;
}
</style>
