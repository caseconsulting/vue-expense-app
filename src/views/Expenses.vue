<template>
  <div>
    <h1>Expenses</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
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
            <tr v-for="expense in expenses" :key="expense.id">
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
        <form @submit.prevent="saveExpense">
          <b-card :header="(model.id ? 'Edit Expense' : 'New Expense')">
            <b-form-group label="Description">
              <b-form-input type="text" v-model="model.description"></b-form-input>
            </b-form-group>
            <b-form-group label="Cost">
              <b-input-group prepend="$">
                <b-form-input v-model="model.cost"></b-form-input>
              </b-input-group>
            </b-form-group>
            <b-form-group label="Expense Type">
              <b-form-input type="text" v-model="model.expenseTypeId"></b-form-input>
            </b-form-group>
            <b-form-group label="Employee">
              <b-form-input type="text" v-model="model.userId"></b-form-input>
            </b-form-group>
            <b-form-group label="Note">
              <b-form-textarea rows="2" type="text" v-model="model.note"></b-form-textarea>
            </b-form-group>
            <b-form-group label="Purchase Date">
              <datepicker v-model="model.purchaseDate" format="MM/dd/yyyy" initial-view="year" :bootstrap-styling="true"></datepicker>
            </b-form-group>
            <b-form-group label="Reimbursed Date">
              <datepicker v-model="model.reimbursedDate" format="MM/dd/yyyy" initial-view="year" :bootstrap-styling="true"></datepicker>
            </b-form-group>
            <div slot="footer" class="footer-buttons">
              <b-btn @click.prevent="clearExpenseToEdit()" variant="default" class="mr-1">Cancel</b-btn>
              <b-btn type="submit" variant="success">Save Expense</b-btn>
            </div>
          </b-card>
        </form>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import Datepicker from 'vuejs-datepicker';

export default {
  data() {
    return {
      loading: false,
      expenses: [],
      errors: [],
      model: {}
    }
  },
  components: {
    Datepicker
  },
  async created() {
    // Fetches posts when the component is created.
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
    async clearExpenseToEdit () {
      this.model = {};
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
