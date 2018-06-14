<template>
  <div>
    <h1>Expenses</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col lg="8" md="12" sm="12">
        <div class="table-responsive">

        <table class="table table-hover table-striped">
        <thead>
          <tr>
            <th>Description</th>
            <th>Cost</th>
            <th>Expense Type</th>
            <th>Employee</th>
            <th>Note</th>
            <th>Purchase Date</th>
            <th>Reimbursed Date</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
        <expense-row v-for="expense in expenses" :expense="expense" v-on:edit-expense="populateExpenseToEdit" v-on:delete-expense="deleteExpense"></expense-row>
        </tbody>
      </table>
      </div>
      </b-col>
      <b-col lg="4" md="12" sm="12">
        <expense-form :model="model" v-on:clear-form="clearExpenseToEdit" v-on:submit-form="saveExpense"></expense-form>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import ExpenseRow from '../components/ExpenseRow.vue';
import ExpenseForm from '../components/ExpenseForm.vue';

export default {
  data() {
    return {
      loading: false,
      expenses: [],
      errors: [],
      model: {}
    };
  },
  components: {
    ExpenseRow,
    ExpenseForm
  },
  async created() {
    // Fetches posts when the component is created.
    this.refreshExpenses();
  },
  methods: {
    async refreshExpenses() {
      this.loading = true;
      this.expenses = await api.getItems(api.EXPENSES);
      this.loading = false;
    },
    async populateExpenseToEdit(expense) {
      this.model = Object.assign({}, expense);
    },
    async clearExpenseToEdit() {
      this.model = {};
    },
    async saveExpense() {
      console.log(this.model);
      if (this.model.id) {
        await api.updateItem(api.EXPENSES, this.model.id, this.model);
      } else {
        console.log('Creating new item');
        await api.createItem(api.EXPENSES, this.model);
      }
      this.model = {}; // reset form
      await this.refreshExpenses();
    },
    async logHello() {
      console.log('Hello');
    },
    async deleteExpense(expense) {
      if (confirm('Are you sure you want to delete this expense?')) {
        // if we are editing an expense type we deleted, remove it from the form
        if (this.model.id === expense.id) {
          this.model = {};
        }
        await api.deleteItem(api.EXPENSES, expense.id);
        await this.refreshExpenses();
      }
    }
  }
};
</script>
