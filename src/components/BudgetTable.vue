<template>
  <div id="budget-table">
    <v-container fluid class="pt-0">
      <v-data-iterator :items="employee" hide-default-footer>
        <template v-slot:default="props">
          <v-row>
            <!-- Loop all budgets -->
            <v-col v-for="item in props.items" :key="item.name" cols="12" sm="6" lg="6">
              <v-card>
                <!-- Budget Name -->
                <v-card-title class="header_style">
                  <h4 class="white--text">{{ item.expenseTypeName }}</h4>
                </v-card-title>
                <v-divider></v-divider>
                <v-list class="pt-1" dense>
                  <!-- Display Budget Amount -->
                  <v-list-item>
                    <v-list-item-content>Budget:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ getAmount(item) | moneyValue }}</div>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Display Reimbursed Amount -->
                  <v-list-item>
                    <v-list-item-content>Reimbursed:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ getReimbursed(item) | moneyValue }}</div>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Display Pending Amount -->
                  <v-list-item>
                    <v-list-item-content>Pending:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ getPending(item) | moneyValue }}</div>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Display Remaining Amount -->
                  <v-list-item>
                    <v-list-item-content class="bold">Remaining:</v-list-item-content>
                    <v-list-item-content v-if="noRemaining(item)" class="text-right bold red--text">
                      <div>{{ calcRemaining(item) | moneyValue }}</div>
                    </v-list-item-content>
                    <v-list-item-content v-else class="text-right bold black--text">
                      <div>{{ calcRemaining(item) | moneyValue }}</div>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Display Overdraft Permissions -->
                  <v-list-item>
                    <v-list-item-content>Overdraft:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ odFlagMessage(item) }}</div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
            <!-- End Loop all budgets -->
          </v-row>
        </template>
      </v-data-iterator>
    </v-container>
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
    return budget.budgetObject.amount - budget.budgetObject.pendingAmount - budget.budgetObject.reimbursedAmount;
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
 * Get the reimbursed amount of an aggregate budget. Returns the reimbursed amount if exists. Returns zero if the
 * budget itself does not exist.
 *
 * @param budget - aggregate budget
 * @return int - reimbursed amount
 */
function getReimbursed(budget) {
  return budget.budgetObject ? budget.budgetObject.reimbursedAmount : 0;
} // getReimbursed

/**
 * Get the pending amount of an aggregate budget. Returns the pending amount if exists. Returns zero if the budget
 * itself does not exist.
 *
 * @param budget - aggregate budget
 * @return int - pending amount
 */
function getPending(budget) {
  return budget.budgetObject ? budget.budgetObject.pendingAmount : 0;
} // getPending

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
  return this.calcRemaining(budget) <= 0;
} // noRemaining

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data: () => ({
    pagination: {
      rowsPerPage: 4
    },
    rowsPerPageItems: [1, 4, 8, 12]
  }),
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
    getReimbursed,
    getPending,
    noRemaining,
    odFlagMessage
  },
  props: ['employee'] // employee of budgets
};
</script>

<style>
.bold {
  font-weight: 900;
}
</style>
