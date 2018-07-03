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
                <td class="text-xs-left">{{ props.item.cost ? props.item.cost : 0 | moneyValue}}</td>
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
      <!-- v-on:form-cleared="clearModel" -->
      <expense-form :expense="expense" v-on:add="addModelToTable" v-on:update="updateModelInTable"  v-on:delete="deleteModelFromTable"></expense-form>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import api from '@/shared/api.js';
import ExpenseForm from '../components/ExpenseForm.vue';
export default {
  filters: {
    moneyValue: (value) => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`
    }
  },
  data() {
    return {
      expense: {
        id: '',
        description: '',
        cost: '',
        note: null,
        userId: '',
        expenseTypeId: '',
        purchaseDate: null,
        reimbursedDate: null,
        reciept: null,
        employeeName: '',
        budgetName: ''
      },
      search: '',
      expenses: [],
      processedExpenses: [],
      errors: [],
      headers: [{
          text: 'Employee',
          value: 'employeeName'
        },
        {
          text: 'Expense Type',
          value: 'budgetName'
        }, //change value to call a function
        {
          text: 'Cost',
          value: 'cost'
        },
        {
          text: 'Purchase Date',
          value: 'purchaseDate'
        },
        {
          text: 'Reimburse Date',
          value: 'reimbursedDate'
        },
        {
          text: 'Description',
          value: 'description'
        }
      ],
      pagination: {
        sortBy: 'employeeName',
        rowsPerPage: 25
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
      this.expenses = await api.getItems(api.EXPENSES);
      this.processedExpenses = _.map(this.expenses, async expense => {
        return await this.getEmployeeName(expense);
      });
      this.processedExpenses = _.map(this.expenses, async expense => {
        return await this.getExpenseTypeName(expense);
      });
      Promise.all(this.processedExpenses).then(values => {
        this.processedExpenses = values;
      });
    },
    onSelect(item) {
      this.expense = {
        id: item.id,
        description: item.description,
        cost: item.cost,
        note: item.note,
        userId: item.userId,
        expenseTypeId: item.expenseTypeId,
        purchaseDate: item.purchaseDate,
        reimbursedDate: item.reimbursedDate,
        employeeName: item.employeeName,
        budgetName: item.budgetName,
        reciept: null
      };
    },
    updateModelInTable() {
      api.getItem(api.EMPLOYEES, this.expense.userId).then(employee => {
        this.expense.employeeName = `${employee.firstName} ${
          employee.middleName
        } ${employee.lastName}`;
      });

      api
        .getItem(api.EXPENSE_TYPES, this.expense.expenseTypeId)
        .then(expenseType => {
          this.expense.budgetName = expenseType.budgetName;
        });

      let modelIndex = _.findIndex(
        this.processedExpenses,
        expense => expense.id === this.expense.id
      );
      this.processedExpenses.splice(modelIndex, 1, this.expense);
      console.log('after update', this.processedExpenses[modelIndex]);
    },
    addModelToTable(newExpense) {
      let matchingExpenses = _.filter(
        this.processedExpenses,
        expense => expense.id === newExpense.id
      );
      console.log(matchingExpenses);

      if (!matchingExpenses.length) {
        api.getItem(api.EMPLOYEES, this.expense.userId).then(employee => {
          this.expense.employeeName = `${employee.firstName} ${
            employee.middleName
          } ${employee.lastName}`;
        });

        api
          .getItem(api.EXPENSE_TYPES, this.expense.expenseTypeId)
          .then(expenseType => {
            this.expense.budgetName = expenseType.budgetName;
          });

        this.processedExpenses.push(this.expense);
      }
    },
    deleteModelFromTable() {
      let modelIndex = _.findIndex(
        this.processedExpenses,
        expense => expense.id === this.expense.id
      );
      this.processedExpenses.splice(modelIndex, 1);
    }
  }
};
</script>
