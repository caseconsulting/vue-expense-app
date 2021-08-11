<template>
  <v-row>
    <v-col cols="12" md="9" lg="8" xl="9" offset-lg="1" offset-md="1">
      <!-- Expense Table -->
      <rollup-expense-type-table></rollup-expense-type-table>
    </v-col>
    <v-col cols="12" md="2" lg="3" xl="2">
      <div class="followScroll">
        <!-- Expense Info -->
        <expense-info class="jerryrig"></expense-info>
        <!-- Expenses Total -->
        <expense-type-totals></expense-type-totals>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import api from '@/shared/api.js';
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

.followScroll {
  position: fixed;
}
</style>
