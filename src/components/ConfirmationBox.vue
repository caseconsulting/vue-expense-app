<!-- Confirmation box should only be displayed if the expense exceeds the available budget remaining -->
<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="330">
      <v-card>
        <v-card-title class="headline">You've reached the budget limit for this expense type</v-card-title>
        <v-card-text>
          <!-- overdraft allowed -->
          <p v-if="expense.od">
            The expense type you are about to submit is only covered up to {{ (expense.budget * 2) | moneyValue }}. You
            will be reimbursed {{ expense.remaining | moneyValue }} of {{ expense.cost | moneyValue }}.
          </p>
          <!-- overdraft not allowed -->
          <p v-else>
            The expense type you are about to submit is only covered up to {{ expense.budget | moneyValue }}. You will
            be reimbursed {{ expense.remaining | moneyValue }} of {{ expense.cost | moneyValue }}.
          </p>
          <p>Do you want to continue?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <div>
            <v-btn color="red" text @click.native="emit('canceledSubmit')">No, take me back</v-btn>
            <v-btn color="green darken-1" text @click.native="emit('confirmSubmit', expense)">Yes, submit</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
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
    let adjustNote = `Expense type is only covered up to $${this.expense.budget}. You will be reimbursed $${this.expense.remaining} of $${this.expense.cost}`;
    if (!isEmpty(this.expense.note)) {
      // expense has a note
      this.expense.note += `\n\n${adjustNote}`;
    } else {
      // expense does not have a note
      this.expense.note = adjustNote;
    }
    this.expense.cost = this.expense.remaining;
    window.EventBus.$emit(msg, data);
  } else {
    // data does not exist
    window.EventBus.$emit(msg);
  }
} // emit

/**
 * Checks if a value is empty. Returns true if the value is null or a single character space String.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return value == null || value === ' ' || value === '';
} // isEmpty

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
    confirm,
    emit,
    isEmpty
  },
  props: [
    'expense', // expense to confirm
    'activate' // dialog activator
  ]
};
</script>
