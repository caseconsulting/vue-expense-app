<template>
  <v-container fluid class="px-0 px-md-4">
    <v-row>
      <v-col cols="12" md="9">
        <!-- Expense Table -->
        <unreimbursed-expenses-table></unreimbursed-expenses-table>
      </v-col>
      <v-col v-if="!isMobile" cols="3" class="followScroll pr-7 pl-0">
        <!-- Expense Info -->
        <reimbursement-expense-details class="mb-3"></reimbursement-expense-details>
        <!-- Expenses Total -->
        <reimbursement-totals></reimbursement-totals>
        <!-- Status Alert -->
        <v-alert
          v-for="(alert, index) in alerts"
          :key="index"
          :type="alert.status"
          :color="alert.color"
          density="compact"
          class="mt-1"
          id="alert"
        >
          {{ alert.message }}
        </v-alert>
      </v-col>
      <v-col v-else cols="12">
        <!-- Expense Info -->
        <reimbursement-expense-details class="mb-3"></reimbursement-expense-details>
        <!-- Expenses Total -->
        <expense-type-totals></expense-type-totals>
        <!-- Status Alert -->
        <v-alert
          v-for="(alert, index) in alerts"
          :key="index"
          :type="alert.status"
          :color="alert.color"
          density="compact"
          id="alert"
        >
          {{ alert.message }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ReimbursementExpenseDetails from '@/components/reimbursements/ReimbursementExpenseDetails.vue';
import ReimbursementTotals from '@/components/reimbursements/ReimbursementTotals.vue';
import UnreimbursedExpensesTable from '@/components/reimbursements/UnreimbursedExpensesTable.vue';
import { isMobile } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook.
 */
async function created() {
  this.emitter.on('reimburseAlert', (alerts) => {
    this.alerts = alerts;
  });
} // created

/**
 * beforeDestroy lifecycle hook.
 */
function beforeDestroy() {
  this.emitter.off('reimburseAlert');
} // beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    ReimbursementExpenseDetails,
    ReimbursementTotals,
    UnreimbursedExpensesTable
  },
  computed: {
    isMobile
  },
  created,
  beforeDestroy,
  data() {
    return {
      alerts: [], // status alerts
      employee: {}
    };
  }
};
</script>

<style>
.followScroll {
  position: fixed;
  left: 75%;
}
</style>
