<!-- Confirmation box should only be displayed if the expense exceeds the available budget remaining -->
<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="330">
      <v-card>
        <v-card-text v-if="isCovered" class="font-weight-medium text-h6"
          >You've reached the budget limit for this expense type
        </v-card-text>
        <v-card-text v-else class="font-weight-medium text-h6">
          You've reached the overdraft limit for this expense type
        </v-card-text>
        <v-card-text>
          <!-- Overdraft Allowed start above overdraft and not going over overdraft limit -->
          <p v-if="isOverCovered">
            You are already above the initial budget of {{ convertToMoneyString(expense.budget) }}. However you are
            still within the overdraft limit of {{ convertToMoneyString(expense.budget * 2) }}. You will be reimbursed
            but will be charged next year for an additional {{ convertToMoneyString(expense.cost) }}.
          </p>
          <!-- Overdraft Allowed and Going over initial budget-->
          <p v-else-if="expense.od && isCovered">
            The expense type you are about to submit is covered up to {{ convertToMoneyString(expense.budget) }} but
            allows overdraft. You will be reimbursed but will be charged the following year for
            {{ convertToMoneyString(expense.cost - expense.remaining) }}.
          </p>
          <!-- Overdraft Allowed and going over overdraft budget -->
          <p v-else-if="expense.od && !isCovered">
            The expense type you are about to submit is only covered up to
            {{ convertToMoneyString(expense.budget * 2) }} with overdraft. You will be reimbursed
            {{ convertToMoneyString(expense.remaining) }} of {{ convertToMoneyString(expense.cost) }}.
          </p>
          <!-- Overdraft not allowed and going over budget -->
          <p v-else>
            The expense type you are about to submit is only covered up to
            {{ convertToMoneyString(expense.budget) }} and does not allow overdraft. You will be reimbursed
            {{ convertToMoneyString(expense.remaining) }} of {{ convertToMoneyString(expense.cost) }}.
          </p>
          <p>Do you want to continue?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <div>
            <v-btn color="red" variant="text" @click="emit('canceledSubmit')">No, take me back</v-btn>
            <v-btn color="green-darken-1" variant="text" @click="emit('confirmSubmit', expense)">Yes, submit</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { isEmpty, convertToMoneyString } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists. Appends adjustment message to the expense note and sets
 * the expense cost to the remaining budget.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    if (!this.isCovered) {
      let adjustNote = '';
      if (!this.expense.od) {
        adjustNote = `Expense type is only covered up to $${
          this.expense.budget
        }. You will be reimbursed $${this.expense.remaining.toFixed(2)} of $${this.expense.cost}`; // added toFixed(2) to resolve decimal issue in notes.
      } else {
        adjustNote = `Expense type is only covered up to $${(2 * this.expense.budget).toFixed(
          2
        )}. You will be reimbursed $${this.expense.remaining} of $${this.expense.cost}`;
      }
      if (!this.isEmpty(this.expense.note)) {
        // expense has a note
        this.expense.note += `\n\n${adjustNote}`;
      } else {
        // expense does not have a note
        this.expense.note = adjustNote;
      }
      this.expense.cost = this.expense.remaining;
    }
    this.emitter.emit(msg, data);
  } else {
    // data does not exist
    this.emitter.emit(msg);
  }
  this.activate = false;
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleConfirmationBox
 */
function watchToggleConfirmationBox() {
  this.activate = true;
} // watchToggleConfirmationBox

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      activate: false // dialog activator
    };
  },
  methods: {
    convertToMoneyString,
    emit,
    isEmpty
  },
  props: [
    'expense', // expense to confirm
    'toggleConfirmationBox', // dialog activator
    'isCovered',
    'isOverCovered'
  ],
  watch: {
    toggleConfirmationBox: watchToggleConfirmationBox
  }
};
</script>
