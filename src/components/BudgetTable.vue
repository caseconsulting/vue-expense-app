<template>
  <div id="budget-table">
    <v-container fluid class="pt-0" v-if="expenseTypeData">
      <v-data-iterator :items="expenseTypeData" hide-default-footer>
        <template v-slot:default="props">
          <v-row>
            <!-- Loop all budgets -->
            <v-col v-for="item in props.items" :key="item.name" cols="12" sm="6" lg="6">
              <v-card>
                <!-- Budget Name -->
                <v-card-title class="header_style">
                  <h3 class="white--text">{{ item.expenseTypeName }}</h3>
                </v-card-title>
                <v-divider></v-divider>
                <v-list class="pt-1" dense>
                  <!-- Display Budget Amount -->
                  <v-list-item>
                    <v-list-item-content>Budget:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ convertToMoneyString(getAmount(item)) }}</div>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Display Reimbursed Amount -->
                  <v-list-item>
                    <v-list-item-content>Reimbursed:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ convertToMoneyString(getReimbursed(item)) }}</div>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Display Pending Amount -->
                  <v-list-item>
                    <v-list-item-content>Pending:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ convertToMoneyString(getPending(item)) }}</div>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Display Remaining Amount -->
                  <v-list-item>
                    <v-list-item-content class="bold">Remaining:</v-list-item-content>
                    <v-list-item-content v-if="noRemaining(item)" class="text-right bold red--text">
                      <div>{{ convertToMoneyString(calcRemaining(item)) }}</div>
                    </v-list-item-content>
                    <v-list-item-content v-else class="text-right bold black--text">
                      <div>{{ convertToMoneyString(calcRemaining(item)) }}</div>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Display Overdraft Permissions -->
                  <v-list-item>
                    <v-list-item-content>Overdraft:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ odFlagMessage(item) }}</div>
                    </v-list-item-content>
                  </v-list-item>

                  <!-- Display when available -->
                  <v-list-item>
                    <v-list-item-content>Available:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ getDate(item) }}</div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
            <!-- End Loop all budgets -->
          </v-row>
        </template>
        <template slot="no-data">
          <div></div>
        </template>
      </v-data-iterator>
    </v-container>
  </div>
</template>

<script>
import { convertToMoneyString, isFullTime, formatDateDashToSlash } from '@/utils/utils';
import api from '@/shared/api';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |              LIFECYCLE HOOKS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * updated lifecycle hook
 */
function updated() {
  this.$emit('rendered'); //This is to ensure that the
  //chart renders after the table
} // updated

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
 * Date
 */
function getDate(item) {
  return (
    formatDateDashToSlash(item.budgetObject.fiscalStartDate) +
    ' to ' +
    formatDateDashToSlash(item.budgetObject.fiscalEndDate)
  );
} // getDate

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

/**
 * Sets the data for the budgets given an employee id
 */
async function created() {
  let budgetsVar;
  budgetsVar = await api.getAllActiveEmployeeBudgets(this.employee.id);

  // get existing budgets for the budget year being viewed
  let existingBudgets = await api.getFiscalDateViewBudgets(this.employee.id, this.fiscalDateView);
  // append inactive tag to end of budget expense type name
  // the existing budget duplicates will later be removed (order in array comes after active budgets)
  _.forEach(existingBudgets, (budget) => {
    budget.expenseTypeName += ' (Inactive)';
  });

  budgetsVar = _.union(budgetsVar, existingBudgets); // combine existing and active budgets
  budgetsVar = _.uniqBy(budgetsVar, 'expenseTypeId'); // remove duplicate expense types
  budgetsVar = _.sortBy(budgetsVar, (budget) => {
    return budget.expenseTypeName;
  }); // sort by expense type name

  // prohibit overdraft if employee is not full time
  _.forEach(budgetsVar, (budget) => {
    if (!isFullTime(this.employee)) {
      budget.odFlag = false;
    }
  });

  // remove any budgets where budget amount is 0 and 0 total expenses
  this.expenseTypeData = _.filter(budgetsVar, (data) => {
    let budget = data.budgetObject;
    return budget.amount != 0 || budget.reimbursedAmount != 0 || budget.pendingAmount != 0;
  });
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      expenseTypeData: null
    };
  },
  methods: {
    calcRemaining,
    convertToMoneyString,
    getAmount,
    getDate,
    getReimbursed,
    getPending,
    noRemaining,
    odFlagMessage
  },
  updated,
  props: ['employee', 'fiscalDateView'] // employee of budgets
};
</script>

<style scoped>
.bold {
  font-weight: 900;
}
</style>
