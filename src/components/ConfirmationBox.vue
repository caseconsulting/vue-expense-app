this.expense<template>
<v-layout row justify-center>
  <v-dialog v-model="activate" persistent max-width="290">
    <v-card>
      <v-card-title class="headline">You've reached the budget limit for this expense type</v-card-title>
      <v-card-text>
        <p>
          The expense you are about to submit is only covered up to {{ expense.budget|moneyValue }} you will be reimbursed {{expense.remaining|moneyValue}} of {{expense.cost|moneyValue}}
          <p>Do you want to continue?</p>
        </p>
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
export default {
  props: ['expense', 'activate'],
  methods: {
    emit(msg, data) {
      if (data) {
        EventBus.$emit(msg, data);
      } else {
        EventBus.$emit(msg);
      }
    },
    confirm(msg) {
      this.expense.note = `The expense you are about to submit is only covered up to ＄${this.expense.budget} you will be reimbursed ＄${this.expense.remaining} of ＄${this.expense.cost}`
      this.expense.cost = this.expense.remaining;
      EventBus.$emit(msg);
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

}
</script>
