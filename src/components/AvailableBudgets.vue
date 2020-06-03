<template>
  <div id="available-budgets">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Available Budgets</h4>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <!-- Loop all budgets -->
        <v-row v-for="budget in budgets" :key="budget.expenseTypeId">
          {{ budget.expenseTypeName }}:
          <v-spacer></v-spacer>
          <p v-if="noRemaining(budget)">
            {{ calcRemaining(budget) | moneyValue }}
          </p>
          <p v-else>
            {{ calcRemaining(budget) | moneyValue }}
          </p>
        </v-row>
        <!-- End Loop all budgets -->
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
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

/**
 * Determines if a budget has no remaining budget. Returns true if the budget is zero or negative. False otherwise.
 *
 * @param budget - budget to check
 * @return boolean - budget has no remaining budget
 */
function noRemaining(budget) {
  return this.calcRemaining(budget) <= 0 && !budget.odFlag;
} // noRemaining

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
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
    noRemaining
  },
  props: ['budgets'] // budgets
};
</script>
