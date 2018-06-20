<template>
  <div>
<v-card>
  <v-card-title>
    <h3>Unreimbursed Expenses</h3>
    <v-spacer></v-spacer>
    <v-text-field
      v-model="search"
      append-icon="search"
      label="Search"
      single-line
      hide-details
    ></v-text-field>
  </v-card-title>
  <v-data-table
    v-model="selected"
    :headers="headers"
    :items="processedExpenses"
    :pagination.sync="pagination"
    :search="search"
    select-all
    item-key="name"
    class="elevation-1"
  >
    <template slot="headers" slot-scope="props">
      <tr>
        <th>
          <v-checkbox
            :input-value="props.all"
            :indeterminate="props.indeterminate"
            primary
            hide-details
            @click.native="toggleAll"
          ></v-checkbox>
        </th>
        <th
          v-for="header in props.headers"
          :key="header.text"
          :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
          @click="changeSort(header.value)"
        >
          <v-icon small>arrow_upward</v-icon>
          {{ header.text }}
        </th>
      </tr>
    </template>
    <template slot="items" slot-scope="props">
      <tr :active="props.selected" @click="props.selected = !props.selected">
        <td>
          <v-checkbox
            :input-value="props.item.reimbursedDate"
            primary
            hide-details
          ></v-checkbox>
        </td>
        <td class="text-xs-left">{{ props.item.employeeName }}</td>
        <td class="text-xs-left">{{ props.item.budgetName }}</td>
        <td class="text-xs-left">{{ props.item.cost }}</td>
        <td class="text-xs-left">{{ props.item.purchaseDate }}</td>
        <td class="text-xs-left">{{ props.item.description }}</td>
      </tr>
    </template>
    <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
  </v-data-table>
  </v-card>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';

export default {
  data: () => ({
    expenses: [],
    processedExpenses: [],
    pagination: {
      sortBy: 'employeeName'
    },
    search: '',
    selected: [],
    headers: [
      {
        text: 'Employee',
        value: 'employeeName'
      },
      { text: 'Expense Type', value: 'budgetName' }, //change value to call a function
      { text: 'Cost', value: 'cost' },
      { text: 'Purchase Date', value: 'purchaseDate' },
      { text: 'Description', value: 'description' }
    ]
  }),
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
    toggleAll() {
      if (this.selected.length) this.selected = [];
      else this.selected = this.expenses.slice();
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
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
    }
  }
};
</script>
<style scoped>
.card {
  display: flex;
}
</style>
