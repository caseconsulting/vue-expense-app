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
    <badge-expiration-modal v-if="isAdmin" :employee="employee"></badge-expiration-modal>
  </v-row>
</template>

<script>
import api from '@/shared/api.js';
import BadgeExpirationModal from '@/components/modals/BadgeExpirationModal.vue';
import ExpenseInfo from '@/components/ExpenseInfo.vue';
import ExpenseTypeTotals from '@/components/ExpenseTypeTotals.vue';
import RollupExpenseTypeTable from '@/components/RollupExpenseTypeTable.vue';

async function created() {
  this.employee = await api.getUser();
  if (this.employee.employeeRole === 'admin') {
    this.isAdmin = true;
  }
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    BadgeExpirationModal,
    ExpenseInfo,
    ExpenseTypeTotals,
    RollupExpenseTypeTable
  },
  created,
  data() {
    return {
      employee: {},
      isAdmin: false
    };
  }
};
</script>

<style>
.jerryrig {
  margin-bottom: 15px;
}
</style>
