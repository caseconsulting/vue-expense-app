<template>
  <div>
    <h1>Expense Types</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Budget Name</th>
              <th>Description</th>
              <th>Budget</th>
              <th>Overdraft Allowed</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expenseType in expenseTypes" :key="expenseType.id">
              <td>{{ expenseType.id }}</td>
              <td>{{ expenseType.budgetName }}</td>
              <td>{{ expenseType.description }}</td>
              <td>{{ expenseType.budget }}</td>
              <td>{{ expenseType.odFlag }}</td>
              <td class="text-right">
                <a href="#" @click.prevent="populateExpenseTypeToEdit(expenseType)">Edit</a> - 
                <a href="#" @click.prevent="deleteExpenseType(expenseType.id)">Delete</a>
              </td>
            </tr>
          </tbody>
        </table>
      </b-col>
      <b-col lg="4">
        <b-card :title="(model.id ? 'Edit Expense Type ID#' + model.id : 'New Expense Type')">
          <form @submit.prevent="saveExpenseType">
            <b-form-group label="Budget Name">
              <b-form-input type="text" v-model="model.budgetName"></b-form-input>
            </b-form-group>
            <b-form-group label="Description">
              <b-form-textarea rows="4" v-model="model.description"></b-form-textarea>
            </b-form-group>
            <b-form-group label="Budget">
              <b-form-input type="text" v-model="model.budget"></b-form-input>
            </b-form-group>
            <b-form-checkbox v-model="model.odFlag" value="false" unchecked-value="true">
              Overdraft Allowed?
            </b-form-checkbox>
            <div>
              <b-btn type="submit" variant="success">Save Expense Type</b-btn>
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
      expenseTypes: [],
      errors: [],
      model: {}
    }
  },

  // Fetches posts when the component is created.
  async created() {
    this.refreshExpenseTypes()
  },
  methods: {
    async refreshExpenseTypes () {
      this.loading = true
      this.expenseTypes = await api.getItems(api.EXPENSE_TYPES)
      this.loading = false
    },
    async populateExpenseTypeToEdit (expenseType) {
      this.model = Object.assign({}, expenseType);
    },
    async saveExpenseType () {
      if (this.model.id) {
        await api.updateItem(api.EXPENSE_TYPES, this.model.id, this.model);
      } else {
        await api.createItem(api.EXPENSE_TYPES, this.model);
      }
      this.model = {}; // reset form
      await this.refreshExpenseTypes();
    },
    async deleteExpenseType (id) {
      if (confirm('Are you sure you want to delete this expense type?')) {
        // if we are editing an expense type we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = {};
        }
        await api.deleteItem(api.EXPENSE_TYPES, id)
        await this.refreshExpenseTypes();
      }
    }
  }
}
</script>
