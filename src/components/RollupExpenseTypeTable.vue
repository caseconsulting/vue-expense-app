<template>
<div>
  <v-card>
    <v-container fluid>
      <v-card-title>
        <h3>Expense Type Table</h3>
        <v-spacer></v-spacer>
        <v-select :items="employees" :filter="customFilter" v-model="employee" item-text="text" label="Filter by Employee" clearable autocomplete></v-select>
        <v-select :items="expenseTypes" :filter="customFilter" v-model="expenseType" item-text="text" label="Filter by Expense Type" clearable autocomplete></v-select>
      </v-card-title>

      <v-data-table v-model="selected" :headers="headers" :items="filteredItems" :pagination.sync="pagination" select-all item-key="key" class="elevation-1">
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
          <tr v-if="!props.item.reimbursedDate" :active="props.selected" @click="props.expanded=!props.expanded">
          <td>
            <v-checkbox
              @click="props.selected = !props.selected"
              :input-value="props.selected"
              primary
              hide-details
            ></v-checkbox>
            </td>
            <td class="text-xs-center">{{ props.item.employeeName }}</td>
            <td class="text-xs-center">{{ props.item.budgetName }}</td>
            <td class="text-xs-center" id="money-team">{{ getExpenseTotal(props.item.expenses) }}</td>
          </tr>
        </template>

        <v-flex offset-md11>

          <v-fab-transition>
            <v-btn id="custom-button-color" v-show="selected.length>0" fab dark small absolute bottom left>
              <icon name="dollar-sign"></icon>
            </v-btn>
          </v-fab-transition>
        </v-flex>

        <template slot="expand" slot-scope="props">
          <unrolled-table-info  :expenses="props.item.expenses"></unrolled-table-info>
        </template>

      </v-data-table>
    </v-container>
  </v-card>
</div>
</template>

<script>
import api from '@/shared/api.js';
import UnrolledTableInfo from './UnrolledTableInfo.vue';

import _ from 'lodash';

export default {
  components: {
    UnrolledTableInfo
  },
  data: () => ({
    empBudgets: [],
    expenses: [],
    employees: [],
    expenseTypes: [],
    employee: null,
    expenseType: null,
    processedExpenses: [],
    pagination: {
      sortBy: 'employeeName'
    },
    selected: [],
    headers: [{
        text: 'Employee',
        value: 'employeeName'
      },
      { text: 'Expense Type', value: 'budgetName' },
      { text: 'Total' }
    ]
  }),
  async created() {
    // TODO: Since we get all the employees and expense types, we no longer need to
    // talk to the api to retrieve the employee name and expense type name for each expense
    //Get employees
    let employees = await api.getItems(api.EMPLOYEES);

    this.employees = await employees.map(employee => {
      return {
        text: `${employee.firstName} ${employee.middleName} ${
          employee.lastName
        }`,
        value: employee.id
      };
    });
    //Get expense Types
    let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
    this.expenseTypes = expenseTypes.map(expenseType => {
      return { text: expenseType.budgetName, value: expenseType.id };
    });

    //Get expenses
    this.expenses = await api.getItems(api.EXPENSES);

    this.processedExpenses = _.map(this.expenses, expense => {
      return this.getEmployeeName(expense);
    });

    this.processedExpenses = _.map(this.expenses, expense => {
      return this.getExpenseTypeName(expense);
    });
    Promise.all(this.processedExpenses).then(values => {
      this.empBudgets = values;

      this.empBudgets = _.map(this.empBudgets, (expense) => {
        if (!expense.reimbursedDate) {
          return {
            employeeName: expense.employeeName,
            userId: expense.userId,
            budgetName: expense.budgetName,
            expenseTypeId: expense.expenseTypeId,
            expenses: [],
            key: `${expense.userId}${expense.expenseTypeId}`
          }
        }
      });

      this.empBudgets = _.filter(this.empBudgets, (item) => item !== undefined);

      this.empBudgets = _.uniqWith(this.empBudgets, _.isEqual);
      this.empBudgets = _.forEach(this.empBudgets, (item) => {
        return item.expenses = _.filter(this.expenses, (expense) => {

          if ((expense.userId === item.userId) && (expense.expenseTypeId === item.expenseTypeId) && (!expense.reimbursedDate)) {
            return true;
          } else {
            return false;
          }
        });
      });
      this.processedExpenses = this.empBudgets;
    });

  },
  computed: {
    filteredItems() {
      return _.filter(this.processedExpenses, expense => {
        if (!this.employee && !this.expenseType) {
          return true;
        } else if (!this.employee && this.expenseType) {
          return expense.expenseTypeId === this.expenseType;
        } else if (!this.expenseType && this.employee) {
          return expense.userId === this.employee;
        } else {
          return (
            expense.userId === this.employee &&
            expense.expenseTypeId === this.expenseType
          );
        }
      });
    }
  },
  methods: {
    getExpenseTotal(expenses) {
      let total = 0;
      _.forEach(expenses, (expense) => total += parseInt(expense.cost, 10));
      return total;

    },
    toggleAll() {
      if (this.selected.length) this.selected = [];
      else this.selected = this.filteredItems;
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
    },
    customFilter(item, queryText, itemText) {
      const hasValue = val => (val != null ? val : '');
      const text = hasValue(item.text);
      const query = hasValue(queryText);
      return (
        text
        .toString()
        .toLowerCase()
        .indexOf(query.toString().toLowerCase()) > -1
      );
    }
  }
};
</script>
<style>
.card {
  display: flex;
}

#money-team {
  color: green;
}
</style>
