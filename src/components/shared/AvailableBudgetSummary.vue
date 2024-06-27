<template>
  <v-dialog v-model="showDialog" max-width="400">
    <v-toolbar color="#565651" dark>
      <v-toolbar-title v-if="selectedBudget">{{ selectedBudget.expenseTypeName }}</v-toolbar-title>
    </v-toolbar>
    <v-divider></v-divider>
    <v-list v-if="selectedBudget" class="font-13" density="compact">
      <!-- Display Start Date -->
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span>Start Date:</span>
          <span>{{ monthDayYearFormat(selectedBudget.budgetObject.fiscalStartDate) }}</span>
        </div>
      </v-list-item>
      <!-- Display End Date -->
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span>End Date:</span>
          <span>{{ monthDayYearFormat(selectedBudget.budgetObject.fiscalEndDate) }}</span>
        </div>
      </v-list-item>

      <!-- Display Budget Amount -->
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span>Budget:</span>
          <span>{{ convertToMoneyString(getAmount(selectedBudget)) }}</span>
        </div>
      </v-list-item>

      <!-- Display Reimbursed Amount -->
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span>Reimbursed:</span>
          <span>{{ convertToMoneyString(getReimbursed(selectedBudget)) }}</span>
        </div>
      </v-list-item>

      <!-- Display Pending Amount -->
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span>Pending:</span>
          <span>{{ convertToMoneyString(getPending(selectedBudget)) }}</span>
        </div>
      </v-list-item>

      <!-- Display Remaining Amount -->
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span class="font-weight-bold">Remaining:</span>
          <span v-if="noRemaining(selectedBudget)" class="font-weight-bold text-red">{{
            convertToMoneyString(calcRemaining(selectedBudget))
          }}</span>
          <span v-else class="font-weight-bold text-black">{{
            convertToMoneyString(calcRemaining(selectedBudget))
          }}</span>
        </div>
      </v-list-item>

      <!-- Display Overdraft Permissions -->
      <v-list-item>
        <div class="d-flex justify-space-between">
          <span>Overdraft:</span>
          <span>{{ odFlagMessage(selectedBudget) }}</span>
        </div>
      </v-list-item>
    </v-list>
  </v-dialog>
</template>

<script setup>
import { convertToMoneyString, monthDayYearFormat } from '@/utils/utils';
import { inject, ref, watch } from 'vue';
// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|
const props = defineProps(['activator', 'selectedBudget']);
const emitter = inject('emitter');
const showDialog = ref(false);

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
 * @return string - converted boolean to human readable message
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
  return calcRemaining(budget) <= 0 && !budget.odFlag;
} // noRemaining

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for activator - activates dialog if activator changes
 */
watch(
  () => props.activator,
  () => {
    showDialog.value = props.activator;
  }
); // watchActivator

/**
 * watcher for showDialog - emits if false
 */
watch(showDialog, () => {
  if (!showDialog.value) {
    emitter.emit('close-summary');
  }
}); // watchShowDialog
</script>
