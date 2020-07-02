<template v-slot="{ active }">
  <div id="available-budgets">
    <v-card>
      <v-card-title class="header_style">
        <v-hover v-slot:default="{ hover }">
          <router-link to="/myBudgets" style="text-decoration: none;">
            <h4
              class="white--text px-2"
              :class="[active || hover ? 'darken' : 'transparent', hover ? 'elevation-4' : '']"
            >
              Available Budgets
            </h4>
          </router-link>
        </v-hover>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <div v-if="this.loading" class="pb-4">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <div v-else>
          <!-- If no avaible budgets -->
          <div v-if="budgets.length == 0">
            <v-row justify="center">
              <p>No available budgets</p>
            </v-row>
          </div>
          <div v-else>
            <!-- Loop all budgets -->
            <v-list-item
              v-for="budget in budgets"
              :key="budget.expenseTypeId"
              @click="selectBudget(budget)"
              class="ma-auto pa-auto"
              :dense="true"
              >{{ budget.expenseTypeName }}:
              <v-spacer></v-spacer>
              <p v-if="noRemaining(budget)">{{ calcRemaining(budget) | moneyValue }}</p>
              <p v-else>{{ calcRemaining(budget) | moneyValue }}</p>
            </v-list-item>
            <!-- End Loop all budgets -->
            <router-link to="/myExpenses" style="text-decoration: none;">
              <button class="home_buttons">Create an Expense</button>
            </router-link>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <available-budget-summary :activator="showDialog" :selectedBudget="selectedBudget"></available-budget-summary>
  </div>
</template>

<script>
import AvailableBudgetSummary from './AvailableBudgetSummary.vue';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Calculates how much of a budget is remaining. Returns the remaining amount if it exists. Returns zero if the budget
 * itself does not exist.
 *
 * @param budget - aggregate budget
 * @return int - remaining budget
 */
function calcRemaining(budget) {
  if (budget.budgetObject) {
    return Math.max(
      budget.budgetObject.amount - budget.budgetObject.pendingAmount - budget.budgetObject.reimbursedAmount,
      0
    );
  }
  return 0;
} // calcRemaining

async function created() {
  window.EventBus.$on('close-summary', () => {
    this.showDialog = false;
  });
} // created

/**
 * Determines if a budget has no remaining budget. Returns true if the budget is zero or negative. False otherwise.
 *
 * @param budget - budget to check
 * @return boolean - budget has no remaining budget
 */
function noRemaining(budget) {
  return this.calcRemaining(budget) <= 0 && !budget.odFlag;
} // noRemaining

/**
 * Selects the budget for the dialog box.
 *
 * @param budget - budget
 */
function selectBudget(budget) {
  this.selectedBudget = budget;
  this.showDialog = true;
} // selectBudget

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    AvailableBudgetSummary
  },
  created,
  data() {
    return {
      active: false,
      dense: false,
      selectedBudget: null,
      showDialog: false
    };
  },
  filters: {
    moneyValue: (value) => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    }
  },
  methods: {
    calcRemaining,
    noRemaining,
    selectBudget
  },
  props: ['budgets', 'loading'] // budgets, loading
};
</script>
