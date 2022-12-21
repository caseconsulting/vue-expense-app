<template>
  <div id="budget-table">
    <div v-if="expenseTypeData">
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
                  <v-list-item class="font-weight-bold">
                    <v-list-item-content>Remaining:</v-list-item-content>
                    <v-list-item-content v-if="noRemaining(item)" class="text-right red--text">
                      <div>{{ convertToMoneyString(calcRemaining(item)) }}</div>
                    </v-list-item-content>
                    <v-list-item-content v-else class="text-right black--text">
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
    </div>
  </div>
</template>

<script>
import { convertToMoneyString, getCurrentBudgetYear, isFullTime } from '@/utils/utils';
import { format, getTodaysDate, isBetweenDates, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT } from '../../shared/dateUtils';
import api from '@/shared/api';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |              LIFECYCLE HOOKS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sets the data for the budgets given an employee id
 */
function created() {
  this.refreshBudgets();
}

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
    // checks to see if the remaining is 0... there's a wierd float rounding issue with the subtraction
    if (
      Number(
        (budget.budgetObject.amount - budget.budgetObject.pendingAmount - budget.budgetObject.reimbursedAmount).toFixed(
          9
        )
      ) === 0
    ) {
      return 0;
    }
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
 * formatted date
 *
 * @param item - expenseTypeData item
 * @return string - string formatted from item object dates
 */
function getDate(item) {
  return (
    this.format(item.budgetObject.fiscalStartDate, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT) +
    ' to ' +
    this.format(item.budgetObject.fiscalEndDate, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT)
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
 * @return String - boolean that has been converted to human readable format
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
 * Refresh and sets the aggregated budgets to draw the graph
 */
async function refreshBudgets() {
  let budgetsVar;
  if (this.fiscalDateView == this.getCurrentBudgetYear(this.employee.hireDate)) {
    // viewing active budget year
    budgetsVar = this.accessibleBudgets;
  } else {
    // get existing budgets for the budget year being viewed
    let existingBudgets = await api.getFiscalDateViewBudgets(this.employee.id, this.fiscalDateView);

    budgetsVar = existingBudgets;
  }

  // remove inactive budgets (exception: there contains a pending expense under that budget)
  budgetsVar = _.filter(budgetsVar, (b) => {
    let budget = b.budgetObject;
    return (
      !_.some(
        this.expenseTypes,
        (e) =>
          e.id == budget.expenseTypeId &&
          (e.isInactive ||
            !isBetweenDates(
              getTodaysDate('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
              budget.fiscalStartDate,
              budget.fiscalEndDate,
              'day',
              false
            ))
      ) || _.some(this.expenses, (e) => e.expenseTypeId == budget.expenseTypeId && _.isEmpty(e.reimbursedDate))
    );
  });

  // prohibit overdraft if employee is not full time
  _.forEach(budgetsVar, async (budget) => {
    if (!this.isFullTime(this.employee)) {
      budget.odFlag = false;
    }
  });

  // remove any budgets where budget amount is 0 and 0 total expenses
  this.expenseTypeData = _.filter(budgetsVar, (data) => {
    let budget = data.budgetObject;
    return budget.amount != 0 || budget.reimbursedAmount != 0 || budget.pendingAmount != 0;
  });
} // refreshBudgets

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for fiscalDateView - refresh budgets and draw graph
 */
async function watchFiscalDateView() {
  await this.refreshBudgets();
} // watchFiscalDateView

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
    refreshBudgets,
    calcRemaining,
    convertToMoneyString,
    getCurrentBudgetYear,
    isFullTime,
    format,
    getAmount,
    getDate,
    getReimbursed,
    getPending,
    noRemaining,
    odFlagMessage
  },
  props: ['employee', 'accessibleBudgets', 'fiscalDateView', 'expenses', 'expenseTypes'],
  watch: {
    fiscalDateView: watchFiscalDateView
  }
};
</script>
