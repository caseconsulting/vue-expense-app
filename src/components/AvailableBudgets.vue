<template>
  <div id="available-budgets">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Available Budgets</h4>
      </v-card-title>
      <!-- Loop all budgets -->

      <!-- <v-row v-for="item in employee" :key="item.expenseTypeId">
            <v-list> -->
      <!-- Display Remaining Amount -->
      <!-- <v-list-item>
                <v-list-item-content class="text-left black--text">{{ item.expenseTypeName }}: </v-list-item-content>
                <v-spacer></v-spacer>
                <v-list-item-content v-if="noRemaining(item)" class="text-right bold red--text">
                <div>{{ calcRemaining(item) | moneyValue }}</div>
                </v-list-item-content>
                <v-list-item-content v-else class="text-right bold black--text">
                <div>{{ calcRemaining(item) | moneyValue }}</div>
                </v-list-item-content>
            </v-list-item>
            </v-list>
        </v-row> -->
      <v-card-text class="px-7 pt-5 pb-1 black--text">
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
      </v-card-text>
      <!-- End Loop all budgets -->
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
 * Get the amount of an aggregate budget. Returns the amount if it exists. Returns zero if the budget itself does not
 * exist.
 *
 * @param budget - aggregate budget
 * @return int - budget amount
 */
function getAmount(budget) {
  return budget.budgetObject ? budget.budgetObject.amount : 0;
} // getAmount

/**
 * Returns 'Allowed' or 'Not Allowed' depending on whether an expense type allows overdraft.
 *
 * @param expenseType - expense type to check
 */
function odFlagMessage(expenseType) {
  return expenseType.odFlag ? 'Allowed' : 'Not Allowed';
} // odFlagMessage

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
  data: () => ({}),
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
    getAmount,
    noRemaining,
    odFlagMessage
  },
  props: ['budgets'] // budgets
};
</script>

<style>
.bold {
  font-weight: 900;
}
</style>
