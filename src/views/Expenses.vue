<template>
  <div>
    <h1>Expenses</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
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
            <tr v-for="expense in expenses" :key="expense.id">
              <td>{{ expense.id }}</td>
              <td>{{ expense.description }}</td>
              <td>{{ expense.cost }}</td>
              <td>{{ expense.expenseTypeId }}</td>
              <td>{{ expense.userId }}</td>
              <td>{{ expense.note }}</td>
              <td>{{ expense.purchaseDate }}</td>
              <td>{{ expense.reimbursedDate }}</td>
              <td class="text-right">
                <a href="#" @click.prevent="populateExpenseToEdit(expense)">Edit</a> - 
                <a href="#" @click.prevent="deleteExpense(expense.id)">Delete</a>
              </td>
            </tr>
          </tbody>
        </table>
      </b-col>
      <b-col lg="4">
        <b-card :title="(model.id ? 'Edit Expense ID#' + model.id : 'New Expense')">
          <form @submit.prevent="saveExpense">
            <b-form-group label="Description">
              <b-form-input type="text" v-model="model.description"></b-form-input>
            </b-form-group>
            <b-form-group label="Cost">
              <b-form-input rows="4" v-model="model.cost"></b-form-input>
            </b-form-group>
            <b-form-group label="Expense Type">
              <b-form-input type="text" v-model="model.expenseTypeId"></b-form-input>
            </b-form-group>
            <b-form-group label="Employee">
              <b-form-input type="text" v-model="model.userId"></b-form-input>
            </b-form-group>
            <b-form-group label="Note">
              <b-form-input type="text" v-model="model.note"></b-form-input>
            </b-form-group>
            <b-form-group label="Purchase Date">
              <b-form-input type="text" v-model="model.purchaseDate"></b-form-input>
            </b-form-group>
            <b-form-group label="Reimbursed Date">
              <b-form-input type="text" v-model="model.reimbursedDate"></b-form-input>
            </b-form-group>
            <div>
              <b-btn type="submit" variant="success">Save Expense</b-btn>
            </div>
          </form>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/shared/api.js';

export default {
  data() {
    return {
      loading: false,
      expenses: [],
      errors: [],
      model: {}
    }
  },

  // Fetches posts when the component is created.
  async created() {
    this.refreshExpenses()
  },
  methods: {
    async refreshExpenses () {
      this.loading = true
      this.expenses = await api.getItems(api.EXPENSES)
      this.loading = false
    },
    async populateExpenseToEdit (expense) {
      this.model = Object.assign({}, expense);
    },
    async saveExpense () {
      if (this.model.id) {
        await api.updateItem(api.EXPENSES, this.model.id, this.model);
      } else {
        await api.createItem(api.EXPENSES, this.model);
      }
      this.model = {}; // reset form
      await this.refreshExpenses();
    },
    async deleteExpense (id) {
      if (confirm('Are you sure you want to delete this expense?')) {
        // if we are editing an expense type we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = {};
        }
        await api.deleteItem(api.EXPENSES, id)
        await this.refreshExpenses();
      }
    }
  }
}
</script>
