this.expense<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">You've reached the budget limit for this expense type</v-card-title>
        <v-card-text>
          <p v-if="expense.od">
            The expense you are about to submit is only covered up to {{ (expense.budget * 2) | moneyValue }}. You will
            be reimbursed {{ expense.remaining | moneyValue }} of {{ expense.cost | moneyValue }}.
          </p>
          <p v-else>
            The expense you are about to submit is only covered up to {{ expense.budget | moneyValue }}. You will be
            reimbursed {{ expense.remaining | moneyValue }} of {{ expense.cost | moneyValue }}.
          </p>
          <p>Do you want to continue?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <div>
            <v-btn color="red" flat @click.native="emit('canceledSubmit')">No, take me back</v-btn>
            <v-btn color="green darken-1" flat @click.native="confirm('confirmSubmit')">Yes, submit</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
// import { eventBus } from '../main.js';

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
      this.expense.note = `The expense you are about to submit is only covered up to $
        ${this.expense.budget}. You will be reimbursed $${this.expense.remaining} of $
        ${this.expense.cost}`;
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
