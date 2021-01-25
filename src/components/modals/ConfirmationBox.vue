<!-- Confirmation box should only be displayed if the expense exceeds the available budget remaining -->
<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="330">
      <v-card>
        <v-card-title v-if="isCovered" class="headline"
          >You've reached the budget limit for this expense type</v-card-title
        >
        <v-card-title v-else class="headline">You've reached the overdraft limit for this expense type</v-card-title>
        <v-card-text>
          <!-- Overdraft Allowed start above overdraft and not going over overdraft limit -->
          <p v-if="isOverCovered">
            You are already above the initial budget of {{ expense.budget | moneyValue }}. However you are still within
            the overdraft limit of {{ (expense.budget * 2) | moneyValue }}. You will be reimbursed the full amount but
            will be charged next year for an additional {{ expense.cost | moneyValue }}.
          </p>
          <!-- Overdraft Allowed and Going over initial budget-->
          <p v-else-if="expense.od && isCovered">
            The expense type you are about to submit is covered up to {{ expense.budget | moneyValue }} but allows
            overdraft. You will be reimbursed but will be charged the following year for
            {{ (expense.cost - expense.remaining) | moneyValue }}.
          </p>
          <!-- Overdraft Allowed and going over overdraft budget -->
          <p v-else-if="expense.od && !isCovered">
            The expense type you are about to submit is only covered up to {{ (expense.budget * 2) | moneyValue }} with
            overdraft. You will be reimbursed {{ expense.remaining | moneyValue }} of {{ expense.cost | moneyValue }}.
          </p>
          <!-- Overdraft not allowed and going over budget -->
          <p v-else>
            The expense type you are about to submit is only covered up to {{ expense.budget | moneyValue }} and does
            not allow overdraft. You will be reimbursed {{ expense.remaining | moneyValue }} of
            {{ expense.cost | moneyValue }}.
          </p>
          <p>Do you want to continue?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <div>
            <v-btn
              color="red"
              text
              @click.native="
                emit('canceledSubmit');
                activate = false;
              "
              >No, take me back</v-btn
            >
            <v-btn
              color="green darken-1"
              text
              @click.native="
                emit('confirmSubmit', expense);
                activate = false;
              "
              >Yes, submit</v-btn
            >
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/utils';

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
        adjustNote = `Expense type is only covered up to $${this.expense.budget}. You will be reimbursed $${this.expense.remaining} of $${this.expense.cost}`;
      } else {
        adjustNote = `Expense type is only covered up to $${2 * this.expense.budget}. You will be reimbursed $${
          this.expense.remaining
        } of $${this.expense.cost}`;
      }
      if (!isEmpty(this.expense.note)) {
        // expense has a note
        this.expense.note += `\n\n${adjustNote}`;
      } else {
        // expense does not have a note
        this.expense.note = adjustNote;
      }
      this.expense.cost = this.expense.remaining;
    }
    window.EventBus.$emit(msg, data);
  } else {
    // data does not exist
    window.EventBus.$emit(msg);
  }
} // emit

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
    toggleConfirmationBox: function () {
      this.activate = true;
    }
  }
};
</script>
