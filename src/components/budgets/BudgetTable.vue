<template>
  <div id="budget-table">
    <div v-if="expenseTypeData && expenseTypeData.length > 0">
      <v-row :justify="expenseTypeData.length === 1 ? 'center' : 'start'">
        <!-- Loop all budgets -->
        <v-col v-for="(item, i) in expenseTypeData" :key="i" cols="12" sm="6" lg="6">
          <v-card>
            <!-- Budget Name -->
            <v-card-title class="d-flex align-center header_style">
              <h3 class="text-white">{{ item.expenseTypeName }}</h3>
            </v-card-title>
            <v-divider></v-divider>
            <div class="pb-2 pt-4 px-4" density="compact">
              <!-- Display Budget Amount -->
              <div class="pb-5 d-flex justify-space-between">
                <div class="d-inline-block">Budget:</div>
                <div class="d-inline-block">
                  {{ convertToMoneyString(getAmount(item)) }}
                </div>
              </div>

              <!-- Display Reimbursed Amount -->
              <div class="pb-5 d-flex justify-space-between">
                <div>Reimbursed:</div>
                <div class="text-right">
                  <div>{{ convertToMoneyString(getReimbursed(item)) }}</div>
                </div>
              </div>

              <!-- Display Pending Amount -->
              <div class="pb-5 d-flex justify-space-between">
                <div>Pending:</div>
                <div class="text-right">
                  <div>{{ convertToMoneyString(getPending(item)) }}</div>
                </div>
              </div>

              <!-- Display Remaining Amount -->
              <div class="pb-5 d-flex justify-space-between font-weight-bold">
                Remaining:
                <div :class="['text-right', noRemaining(item) ? 'text-red' : 'text-black']">
                  <div>{{ convertToMoneyString(calcRemaining(item)) }}</div>
                </div>
              </div>

              <!-- Display Overdraft Permissions -->
              <div class="pb-5 d-flex justify-space-between">
                <div>Overdraft:</div>
                <div class="text-right">
                  <div>{{ odFlagMessage(item) }}</div>
                </div>
              </div>

              <!-- Display when available -->
              <div class="pb-5 d-flex justify-space-between">
                <div>Available:</div>
                <div class="text-right">
                  <div>{{ getDate(item) }}</div>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
        <!-- End Loop all budgets -->
      </v-row>
    </div>
    <div align="center" class="mt-3 text-h5" v-else>No budgets to display</div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { convertToMoneyString, getCurrentBudgetYear, isFullTime } from '@/utils/utils';
import { format, getYear, isBetween, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT } from '../../shared/dateUtils';
import api from '@/shared/api';
import _filter from 'lodash/filter';
import _some from 'lodash/some';
import _forEach from 'lodash/forEach';
import _isEmpty from 'lodash/isEmpty';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const expenseTypeData = ref(null);
const props = defineProps(['employee', 'accessibleBudgets', 'fiscalDateView', 'expenses', 'expenseTypes']);

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sets the data for the budgets given an employee id
 */
onBeforeMount(async () => {
  await refreshBudgets();
});

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
    format(item.budgetObject.fiscalStartDate, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT) +
    ' to ' +
    format(item.budgetObject.fiscalEndDate, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT)
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
  return calcRemaining(budget) <= 0;
} // noRemaining

/**
 * Refresh and sets the aggregated budgets to draw the graph
 */
async function refreshBudgets() {
  let budgetsVar;
  if (props.fiscalDateView == getCurrentBudgetYear(props.employee.hireDate)) {
    // viewing active budget year
    budgetsVar = props.accessibleBudgets;
  } else {
    // get existing budgets for the budget year being viewed
    let existingBudgets = await api.getFiscalDateViewBudgets(props.employee.id, props.fiscalDateView);
    existingBudgets = _filter(existingBudgets, (e) => !!e);
    budgetsVar = existingBudgets;
  }

  // remove inactive budgets (exception: there contains a pending expense under that budget)
  budgetsVar = _filter(budgetsVar, (b) => {
    let budget = b.budgetObject;
    return (
      !_some(
        props.expenseTypes,
        (e) =>
          e.id == budget.expenseTypeId &&
          (e.isInactive ||
            !isBetween(
              getYear(props.fiscalDateView),
              getYear(budget.fiscalStartDate),
              getYear(budget.fiscalEndDate),
              'year',
              '[]'
            ))
      ) || _some(props.expenses, (e) => e.expenseTypeId == budget.expenseTypeId && _isEmpty(e.reimbursedDate))
    );
  });

  // prohibit overdraft if employee is not full time
  _forEach(budgetsVar, async (budget) => {
    if (!isFullTime(props.employee)) {
      budget.odFlag = false;
    }
  });

  // remove any budgets where budget amount is 0 and 0 total expenses
  expenseTypeData.value = _filter(budgetsVar, (data) => {
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
watch(
  () => props.fiscalDateView,
  async () => {
    await refreshBudgets();
  }
);
</script>
