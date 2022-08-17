<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="9">
        <!-- Expense Table -->
        <rollup-expense-type-table></rollup-expense-type-table>
      </v-col>
      <v-col v-if="!isMobile" cols="3" class="followScroll">
        <!-- Expense Info -->
        <expense-info class="mb-3"></expense-info>
        <!-- Expenses Total -->
        <expense-type-totals></expense-type-totals>
        <!-- Status Alert -->
        <v-alert
          v-for="(alert, index) in alerts"
          :key="index"
          :type="alert.status"
          :color="alert.color"
          dense
          class="mt-1"
          id="alert"
        >
          {{ alert.message }}
        </v-alert>
      </v-col>
      <v-col v-else cols="12">
        <!-- Expense Info -->
        <expense-info class="mb-3"></expense-info>
        <!-- Expenses Total -->
        <expense-type-totals></expense-type-totals>
        <!-- Status Alert -->
        <v-alert
          v-for="(alert, index) in alerts"
          :key="index"
          :type="alert.status"
          :color="alert.color"
          dense
          id="alert"
        >
          {{ alert.message }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ExpenseInfo from '@/components/ExpenseInfo.vue';
import ExpenseTypeTotals from '@/components/ExpenseTypeTotals.vue';
import RollupExpenseTypeTable from '@/components/RollupExpenseTypeTable.vue';
import { isMobile } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created
 */
async function created() {
  window.EventBus.$on('reimburseAlert', (alerts) => {
    this.alerts = alerts;
  });
} // created

/**
 * beforeDestroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('reimburseAlert');
} //beforeDestroy

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
/* .followScroll {
  position: fixed;
  left: 75%;
} */
</style>
