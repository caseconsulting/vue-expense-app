<template>
  <v-layout row wrap>
    <v-flex offset-lg1 offset-md1 lg9 md9 sm12>
      <!-- Expense Table -->
      <rollup-expense-type-table
        v-on:resetReimbursements="confirmReimbursements = false"
        :confirmReimburse="confirmReimbursements"
      ></rollup-expense-type-table>
    </v-flex>
    <v-flex lg2 md2 sm12>
      <!-- Expense Info -->
      <expense-info class="jerryrig"></expense-info>

      <confirm-reimbursements
        class="mb-4"
        v-on:reimburse-button-click="confirmReimbursements = true"
      ></confirm-reimbursements>
      <v-spacer></v-spacer>
      <!-- Expenses Total -->
      <expense-type-totals></expense-type-totals>
    </v-flex>
  </v-layout>
</template>

<script>
import ExpenseInfo from '../components/ExpenseInfo.vue';
import ExpenseTypeTotals from '../components/ExpenseTypeTotals.vue';
import RollupExpenseTypeTable from '../components/RollupExpenseTypeTable.vue';
import ConfirmReimbursements from '../components/ConfirmReimbursements.vue';
// import ReimburseModal from '../components/ReimburseModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    ExpenseInfo,
    ExpenseTypeTotals,
    RollupExpenseTypeTable,
    ConfirmReimbursements
  },
  data() {
    return {
      confirmReimbursements: false
    };
  }
};
</script>

<style>
.jerryrig {
  margin-bottom: 15px;
}
</style>
