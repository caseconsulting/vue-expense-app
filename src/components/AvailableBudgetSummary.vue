<template>
  <v-dialog v-model="showDialog" max-width="400">
    <v-toolbar color="#565651" dark>
      <v-toolbar-title v-if="selectedBudget">{{ selectedBudget.expenseTypeName }}</v-toolbar-title>
    </v-toolbar>
    <v-divider></v-divider>
    <v-list v-if="selectedBudget" style="font-size: 13px;" dense>
      <!-- Display Start Date -->
      <v-list-item>
        <v-list-item-content>Start Date:</v-list-item-content>
        <v-list-item-content class="text-right">
          <div>{{ selectedBudget.budgetObject.fiscalStartDate | monthDayYearFormat }}</div>
        </v-list-item-content>
      </v-list-item>
      <!-- Display End Date -->
      <v-list-item>
        <v-list-item-content>End Date:</v-list-item-content>
        <v-list-item-content class="text-right">
          <div>{{ selectedBudget.budgetObject.fiscalEndDate | monthDayYearFormat }}</div>
        </v-list-item-content>
      </v-list-item>

      <!-- Display Budget Amount -->
      <v-list-item>
        <v-list-item-content>Budget:</v-list-item-content>
        <v-list-item-content class="text-right">
          <div>{{ getAmount(selectedBudget) | moneyValue }}</div>
        </v-list-item-content>
      </v-list-item>

      <!-- Display Reimbursed Amount -->
      <v-list-item>
        <v-list-item-content>Reimbursed:</v-list-item-content>
        <v-list-item-content class="text-right">
          <div>{{ getReimbursed(selectedBudget) | moneyValue }}</div>
        </v-list-item-content>
      </v-list-item>

      <!-- Display Pending Amount -->
      <v-list-item>
        <v-list-item-content>Pending:</v-list-item-content>
        <v-list-item-content class="text-right">
          <div>{{ getPending(selectedBudget) | moneyValue }}</div>
        </v-list-item-content>
      </v-list-item>

      <!-- Display Remaining Amount -->
      <v-list-item>
        <v-list-item-content class="bold">Remaining:</v-list-item-content>
        <v-list-item-content v-if="noRemaining(selectedBudget)" class="text-right bold red--text">
          <div>{{ calcRemaining(selectedBudget) | moneyValue }}</div>
        </v-list-item-content>
        <v-list-item-content v-else class="text-right bold black--text">
          <div>{{ calcRemaining(selectedBudget) | moneyValue }}</div>
        </v-list-item-content>
      </v-list-item>

      <!-- Display Overdraft Permissions -->
      <v-list-item>
        <v-list-item-content>Overdraft:</v-list-item-content>
        <v-list-item-content class="text-right">
          <div>{{ odFlagMessage(selectedBudget) }}</div>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-dialog>
</template>

<script>
import { isEmpty, moneyValue, monthDayYearFormat } from '@/utils/utils';

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
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    window.EventBus.$emit(msg, data);
  } else {
    // data does not exist
    window.EventBus.$emit(msg);
  }
} // emit

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
  return this.calcRemaining(budget) <= 0 && !budget.odFlag;
} // noRemaining

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      showDialog: false
    };
  },
  methods: {
    calcRemaining,
    emit,
    getAmount,
    getReimbursed,
    getPending,
    isEmpty,
    odFlagMessage,
    noRemaining
  },
  props: [
    'activator', // dialog activator
    'selectedBudget' // selected budget
  ],
  filters: {
    monthDayYearFormat,
    moneyValue
  },
  watch: {
    activator: function () {
      this.showDialog = this.activator;
    },
    showDialog: function () {
      if (!this.showDialog) {
        this.emit('close-summary');
      }
    }
  }
};
</script>
