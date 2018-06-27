<template>
<div>
  <v-layout row wrap>
    <v-flex lg8 md12 sm12>
      <v-card>
        <v-card-title>
          <h2>Expenses</h2>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="processedExpenses" :search="search" item-key="name" class="elevation-1">
          <template slot="items" slot-scope="props">
              <tr @click="onSelect(props.item)">
                <td class="text-xs-left">{{ props.item.employeeName }}</td>
                <td class="text-xs-left">{{ props.item.budgetName }}</td>
                <td class="text-xs-left">{{ props.item.cost }}</td>
                <td class="text-xs-left">{{ props.item.purchaseDate }}</td>
                <td class="text-xs-left">{{ props.item.reimbursedDate }}</td>
                <td class="text-xs-left">{{ props.item.description }}</td>
              </tr>
            </template>
          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-card>
    </v-flex>
    <v-flex lg4 md12 sm12>
      <expense-form :model="model" v-on:submit-form="refreshExpenses"></expense-form>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import api from '@/shared/api.js';
import ExpenseForm from '../components/ExpenseForm.vue';
export default {
  data() {
    return {
      search: '',
      loading: false,
      expenses: [],
      processedExpenses: [],
      errors: [],
      headers: [
        {
          text: 'Employee',
          value: 'employeeName'
        },
        { text: 'Expense Type', value: 'budgetName' }, //change value to call a function
        { text: 'Cost', value: 'cost' },
        { text: 'Purchase Date', value: 'purchaseDate' },
        { text: 'Reimburse Date', value: 'reimbursedDate' },
        { text: 'Description', value: 'description' }
      ],
      model: {
        description: '',
        cost: '',
        notes: '',
        userId: '',
        expenseTypeId: '',
        purchaseDate: null,
        reimbursedDate: null
      }
    };
  },
  components: {
    ExpenseForm
  },
  async created() {
    this.refreshExpenses();
  },
  methods: {
    async getEmployeeName(expense) {
      let employee = await api.getItem(api.EMPLOYEES, expense.userId);
      expense.employeeName = `${employee.firstName} ${employee.middleName} ${
        employee.lastName
      }`;
      return expense;
    },
    async getExpenseTypeName(expense) {
      let expenseType = await api.getItem(
        api.EXPENSE_TYPES,
        expense.expenseTypeId
      );
      expense.budgetName = expenseType.budgetName;
      return expense;
    },
    async refreshExpenses() {
      this.loading = true;
      this.expenses = await api.getItems(api.EXPENSES);
      this.processedExpenses = _.map(this.expenses, expense => {
        return this.getEmployeeName(expense);
      });
      this.processedExpenses = _.map(this.expenses, expense => {
        return this.getExpenseTypeName(expense);
      });
      Promise.all(this.processedExpenses).then(values => {
        this.processedExpenses = values;
      });
      this.loading = false;
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
    },
    onSelect(item) {
      this.model.description = item.description;
      this.model.cost = item.cost;
      this.model.note = item.note;
      this.model.userId = item.userId;
      this.model.expenseTypeId = item.expenseTypeId;
      this.model.purchaseDate = item.purchaseDate;
      this.model.reimbursedDate = item.reimbursedDate;
    }
  }
};
</script>
