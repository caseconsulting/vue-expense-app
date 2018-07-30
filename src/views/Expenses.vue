<template>
<div>
  <v-layout row wrap>
    <v-snackbar v-model="status.statusType" :color="status.color" :multi-line="true" :right="true" :timeout="5000" :top="true" :vertical="true">
      <v-card-title headline color="white">
        <span class="headline">{{status.statusMessage}}</span>
      </v-card-title>
      <v-btn color="white" flat @click="clearStatus">
        Close
      </v-btn>
    </v-snackbar>
    <v-flex lg12 md12 sm12>
      <!-- <v-alert v-if="error" dismissible :value="error" color="error" icon="warning" outline>
        {{error.response.data.message}}
      </v-alert> -->
    </v-flex>
    <v-flex lg8 md12 sm12>
      <v-card>
        <v-card-title>
          <h2>Expenses</h2>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table :loading="loading" :headers="headers" :items="sorting" :search="search" :pagination.sync="pagination" item-key="name" class="elevation-1">
          <v-progress-linear slot="progress" color="radioactive" indeterminate></v-progress-linear>
          <template slot="headers" slot-scope="props">
            <tr>
              <th class="text-xs-left"
                v-for="header in props.headers"
                :key="header.text"
                :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                @click="changeSort(header.value)"
              >
                {{ header.text }}
                <v-icon small>arrow_upward</v-icon>
              </th>
            </tr>
          </template>
          <template slot="items" slot-scope="props">
              <tr v-if="!loading" @click="onSelect(props.item)">
                <td class="text-xs-left">{{ props.item.employeeName }}</td>
                <td class="text-xs-left">{{ props.item.budgetName }}</td>
                <td class="text-xs-left">{{ props.item.cost ? props.item.cost : 0 | moneyValue}}</td>
                <td class="text-xs-left">{{ props.item.purchaseDate | dateFormat }}</td>
                <td class="text-xs-left">{{ props.item.reimbursedDate |dateFormat }}</td>
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
      <expense-form :expense="expense" v-on:add="addModelToTable" v-on:update="updateModelInTable" v-on:delete="deleteModelFromTable" v-on:error="displayError"></expense-form>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import api from '@/shared/api.js';
import ExpenseForm from '../components/ExpenseForm.vue';
import moment from 'moment';
export default {
  filters: {
    moneyValue: value => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    },
    dateFormat: value => {
      if (value) {
        return moment(value).format('MMM Do, YYYY');
      } else {
        return '';
      }
    }
  },
  data() {
    return {
      loading: true,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      },
      expense: {
        id: '',
        description: '',
        cost: "0",
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
        sortBy: 'purchaseDate',
        rowsPerPage: 25
      }
    };
  },
  computed: {
    sorting() {
      return this.processedExpenses;
    }
  },
  components: {
    ExpenseForm
  },
  async created() {
    this.refreshExpenses();
  },
  methods: {
    clearStatus() {
      this.$set(this.status, 'statusType', undefined);
      this.$set(this.status, 'statusMessage', '');
      this.$set(this.status, 'color', '');
    },
    async displayError(err) {
      this.$set(this.status, 'statusType', 'ERROR');
      this.$set(this.status, 'statusMessage', err);
      this.$set(this.status, 'color', 'red');
    },
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
      let aggregatedData = await api.getAggregate();

      this.processedExpenses = aggregatedData;
      this.loading = false;
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
    updateModelInTable(updatedExpense) {
      let matchingExpensesIndex = _.findIndex(
        this.processedExpenses,
        expense => expense.id === updatedExpense.id
      );

      api.getItem(api.EMPLOYEES, updatedExpense.userId).then(employee => {
        let employeeName = `${employee.firstName} ${employee.middleName} ${
          employee.lastName
        }`;
        this.$set(updatedExpense, 'employeeName', employeeName);
      });

      api
        .getItem(api.EXPENSE_TYPES, updatedExpense.expenseTypeId)
        .then(expenseType => {
          this.$set(updatedExpense, 'budgetName', expenseType.budgetName);
        });
      this.processedExpenses.splice(matchingExpensesIndex, 1, updatedExpense);
      this.$set(this.status, 'statusType', 'SUCCESS');
      this.$set(this.status, 'statusMessage', 'Item was successfully updated!');
      this.$set(this.status, 'color', 'green');
    },
    addModelToTable(newExpense) {
      let matchingExpenses = _.filter(
        this.processedExpenses,
        expense => expense.id === newExpense.id
      );

      if (!matchingExpenses.length) {
        api.getItem(api.EMPLOYEES, newExpense.userId).then(employee => {
          let employeeName = `${employee.firstName} ${employee.middleName} ${
            employee.lastName
          }`;
          this.$set(newExpense, 'employeeName', employeeName);
        });

        api
          .getItem(api.EXPENSE_TYPES, newExpense.expenseTypeId)
          .then(expenseType => {
            this.$set(newExpense, 'budgetName', expenseType.budgetName);
          });

        this.processedExpenses.push(newExpense);
        this.$set(this.status, 'statusType', 'SUCCESS');
        this.$set(
          this.status,
          'statusMessage',
          'Item was successfully submitted!'
        );
        this.$set(this.status, 'color', 'green');
      }
    },
    deleteModelFromTable() {
      let modelIndex = _.findIndex(
        this.processedExpenses,
        expense => expense.id === this.expense.id
      );
      this.processedExpenses.splice(modelIndex, 1);
      this.$set(this.status, 'statusType', 'SUCCESS');
      this.$set(this.status, 'statusMessage', 'Item was successfully deleted!');
      this.$set(this.status, 'color', 'green');
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    }
  }
};
</script>
