<template>
  <div>
    <h1>Expenses</h1>
    <v-layout row wrap>
      <v-flex lg8 md12 sm12>
        <v-card>
        <v-data-table
            :headers="headers"
            :items="processedExpenses"
            item-key="name"
            class="elevation-1"
          >
            <template slot="headers" slot-scope="props">
              <tr>
                <th
                  v-for="header in props.headers"
                  :key="header.text"
                  @click="changeSort(header.value)"
                >
                  <v-icon small>arrow_upward</v-icon>
                  {{ header.text }}
                </th>
              </tr>
            </template>
            <template slot="items" slot-scope="props">
              <tr>
                <td class="text-xs-right">{{ props.item.employeeName }}</td>
                <td class="text-xs-right">{{ props.item.budgetName }}</td>
                <td class="text-xs-right">{{ props.item.cost }}</td>
                <td class="text-xs-right">{{ props.item.purchaseDate }}</td>
                <td class="text-xs-right">{{ props.item.reimbursedDate }}</td>
                <td class="text-xs-right">{{ props.item.description }}</td>
              </tr>
            </template>
          </v-data-table>
          </v-card>
      </v-flex>
      <v-flex lg4 md12 sm12>
        <expense-form :model="model" v-on:clear-form="clearExpenseToEdit" v-on:submit-form="saveExpense"></expense-form>
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
        purchaseDate: null,
        reimbursedDate: null
      }
    };
  },
  components: {
    ExpenseForm
  },
  async created() {
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
      this.loading = false;
    },
    async populateExpenseToEdit(expense) {
      this.model = Object.assign({}, expense);
    },
    async clearExpenseToEdit() {
      this.model = {
        purchaseDate: null,
        reimbursedDate: null
      };
    },
    async saveExpense() {
      await this.refreshExpenses();
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
