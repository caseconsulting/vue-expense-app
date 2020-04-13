this.expense<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="330">
      <v-card>
        <v-card-title class="headline">You've reached the budget limit for this expense type</v-card-title>
        <v-card-text>
          <p v-if="expense.od">
            The expense type you are about to submit is only covered up to {{ (expense.budget * 2) | moneyValue }}. You
            will be reimbursed {{ expense.remaining | moneyValue }} of {{ expense.cost | moneyValue }}.
          </p>
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
            <v-btn color="green darken-1" text @click.native="confirm('confirmSubmit')">Yes, submit</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  props: ['expense', 'activate'],
  methods: {
    emit(msg, data) {
      if (data) {
        window.EventBus.$emit(msg, data);
      } else {
        window.EventBus.$emit(msg);
      }
    },
    confirm(msg) {
      let adjustNote = `Expense type is only covered up to $${this.expense.budget}. You will be reimbursed $${this.expense.remaining} of $${this.expense.cost}`;
      if (this.expense.note) {
        this.expense.note += `\n\n${adjustNote}`;
      } else {
        this.expense.note = adjustNote;
      }
      this.expense.cost = this.expense.remaining;
      window.EventBus.$emit(msg);
    }
  },
  filters: {
    moneyValue: value => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    }
  }
};
</script>
