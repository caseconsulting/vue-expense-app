<template>
  <v-row>
    <v-col cols="12" md="9" lg="8" xl="9" offset-lg="1" offset-md="1">
      <!-- Expense Table -->
      <rollup-expense-type-table></rollup-expense-type-table>
    </v-col>
    <v-col cols="12" md="2" lg="3" xl="2">
      <!-- Expense Info -->
      <expense-info class="jerryrig"></expense-info>
      <!-- Expenses Total -->
      <expense-type-totals></expense-type-totals>
    </v-col>
  </v-row>
</template>

<script>
import ExpenseInfo from '@/components/ExpenseInfo.vue';
import ExpenseTypeTotals from '@/components/ExpenseTypeTotals.vue';
import RollupExpenseTypeTable from '@/components/RollupExpenseTypeTable.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
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
