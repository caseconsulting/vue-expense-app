<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Are you sure you want to unreimburse?</v-card-title>
        <v-card-text
          >This will create a new {{ expense.budgetName }} expense with a negative balance of ${{ expense.cost }} for
          employee, {{ expense.employeeName }}</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" flat @click.native="emit(`canceled-unreimburse-expense`)"
            >No, keep reimbursed</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn color="red" flat @click.native="emit(`confirm-unreimburse-expense`)">Unreimburse</v-btn>
          <v-spacer></v-spacer>
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
    }
  }
};
</script>
