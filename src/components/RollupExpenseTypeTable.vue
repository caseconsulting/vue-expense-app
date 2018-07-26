<template>
<div>
  <v-card>
    <v-container fluid>
      <v-card-title>
        <h2>Unreimbursed Expenses</h2>
        <v-spacer></v-spacer>
        <v-select :items="employees" :filter="customFilter" v-model="employee" item-text="text" label="Filter by Employee" clearable autocomplete></v-select>
        <v-select :items="expenseTypes" :filter="customFilter" v-model="expenseType" item-text="text" label="Filter by Expense Type" clearable autocomplete></v-select>
      </v-card-title>

      <v-data-table v-model="selected" :headers="headers" :items="filteredItems" :pagination.sync="pagination" select-all item-key="key" class="elevation-1" :loading="loading">
        <v-progress-linear slot="progress" color="radioactive" indeterminate></v-progress-linear>
        <template slot="headers" slot-scope="props">
          <tr>
            <th>
              <v-checkbox
                :input-value="everythingSelected"
                primary
                hide-details
                @click="toggleAll"
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
          <tr v-if="!loading" :active="props.selected" @click="props.expanded = !props.expanded">
          <td>
            <v-checkbox
              v-model="props.item.allSelected"
              @click="props.item = toggleExpenses(props.item)"
              primary
              hide-details
            ></v-checkbox>
            </td>
            <td class="text-xs-center">{{ props.item.employeeName }}</td>
            <td class="text-xs-center">{{ props.item.budgetName }}</td>
            <td  class="text-xs-center" id="money-team">{{ getExpenseTotal(props.item.expenses) | moneyValue }}</td>
          </tr>
        </template>

        <template slot="expand" slot-scope="props">
          <unrolled-table-info
            @expensePicked="addExpenseToSelected"
            @changedAllSelected="props.item.allSelected = $event"
            :allSelected="props.item.allSelected"
            :expenses="props.item.expenses"
            ></unrolled-table-info>
        </template>

      </v-data-table>
      <v-flex offset-md10>

        <v-fab-transition>
          <v-btn @click="reminbureExpenses" id="custom-button-color" v-show="showSubmitButton" fab dark large bottom left fixed>
            <icon name="dollar-sign"></icon>
          </v-btn>
        </v-fab-transition>
      </v-flex>
    </v-container>
  </v-card>
</div>
</template>

<script>
import api from '@/shared/api.js';
import UnrolledTableInfo from './UnrolledTableInfo.vue';
import _ from 'lodash';

export default {
  filters: {
    moneyValue: value => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    }
  },
  components: {
    UnrolledTableInfo
  },
  data: () => ({
    loading: true,
    everythingSelected: false,
    indeterminate: false,
    unreimbursedExpenses: [],
    empBudgets: [],
    employees: [], //For autocomplete
    expenseTypes: [], //For autocomplete
    employee: null,
    expenseType: null,
    pagination: {
      sortBy: 'lastName',
      rowsPerPage: 10
    },
    selected: [],
    headers: [{
        text: 'Employee',
        value: 'lastName'
      },
      {
        text: 'Expense Type',
        value: 'budgetName'
      },
      {
        text: 'Total',
        value: 'expenses'
      }
    ]
  }),
  async created() {
    EventBus.$on('expensePicked', this.addExpenseToSelected);
    let aggregatedData = await api.getAggregate();
    let expenses = this.createExpensesForUnrolled(aggregatedData);
    this.constructAutoComplete();
    aggregatedData = this.modifyAggregateDate(aggregatedData, expenses);
    this.unreimbursedExpenses = _.filter(expenses, expense => {
      return !expense.reimbursedDate;
    });
    this.loading = false;
    this.empBudgets = aggregatedData;
  },
  computed: {
    filteredItems() {
      return _.filter(this.empBudgets, expense => {
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
    },
    showSubmitButton() {
      if (this.selected.length === 0) {
        return false;
      } else {
        return true;
      }
    }
  },
  methods: {
    createExpensesForUnrolled(aggregatedData) {
      return _.map(aggregatedData, expense => {
        return {
          selected: false,
          cost: expense.cost,
          description: expense.description,
          purchaseDate: expense.purchaseDate,
          userId: expense.userId,
          expenseTypeId: expense.expenseTypeId
        }
      });
    },
    modifyAggregateDate(aggregatedData, expenses) {
      //Maps each expense and only returns if not reimbursed
      aggregatedData = _.forEach(aggregatedData, expense => {
        if (!expense.reimbursedDate) {
          expense.key = `${expense.userId}${expense.expenseTypeId}`;
          expense.allSelected = false;
        }
      })
      //Remove undefined stuff
      aggregatedData = _.filter(aggregatedData, item => item !== undefined);
      //Remove duplicates
      aggregatedData = _.uniqWith(aggregatedData, _.isEqual);
      //Create a list of arrays if the userId matches, expenseTypeId matches and hasn't been reimbursed
      aggregatedData = _.forEach(aggregatedData, item => {
        return (item.expenses = _.filter(expenses, expense => {
          return this.matchingEmployeeAndExpenseType(expense, item);
        }));
      });
      return aggregatedData;
    },
    matchingEmployeeAndExpenseType(expense, item) {
      return (expense.userId === item.userId &&
        expense.expenseTypeId === item.expenseTypeId &&
        !expense.reimbursedDate);
    },
    async constructAutoComplete() {
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
        return {
          text: expenseType.budgetName,
          value: expenseType.id
        };
      });
    },
    reminbureExpenses() {
      let expensesToSubmit = _.map(this.selected, item => {
        return {
          cost: item.cost,
          description: item.description,
          expenseTypeId: item.expenseTypeId,
          id: item.id,
          purchaseDate: item.purchaseDate,
          reimbursedDate: this.moment().format('YYYY-MM-DD'),
          note: !item.note ? null : item.note,
          userId: item.userId,
          receipt: null
        };
      });

      _.forEach(expensesToSubmit, expense => {
        api
          .updateItem(api.EXPENSES, expense.id, expense)
          .then(this.removeExpenseFromList(this.selected));
      });
      this.selected = [];
    },
    removeExpenseFromList(selected) {
      _.forEach(this.empBudgets, item => {

        _.forEach(item.expenses, expense => {
          let itemIndex = _.indexOf(selected, expense);

          if (itemIndex > -1) {
            item.expenses.splice(_.indexOf(item.expenses, expense), 1);
          }
        });
      });

      this.empBudgets = _.filter(
        this.empBudgets,
        item => item.expenses.length
      );
      EventBus.$emit('expenseChange', []);
    },
    addExpenseToSelected(expense) {
      if (_.indexOf(this.selected, expense) === -1) {
        this.selected.push(expense);
        if (this.unreimbursedExpenses.length === this.selected.length) {
          this.everythingSelected = true;
        }
      } else {
        _.forEach(this.selected, exp => {
          if (exp && exp.id === expense.id) {
            this.selected.splice(_.indexOf(this.selected, exp), 1);
          }
        });
        this.indeterminate = true;
        this.everythingSelected = false;
      }
    },
    toggleExpenses(item) {
      if (!item.allSelected) {
        _.forEach(item.expenses, expense => {
          expense.selected = true;
          this.selected.push(expense);
        });
        this.indeterminate = true;
        this.everythingSelected = false;
        if (this.unreimbursedExpenses.length === this.selected.length) {
          this.everythingSelected = true;
        }
      } else {
        _.forEach(item.expenses, expense => {
          expense.selected = false;
        });
        if (this.selected.length === 1) {
          this.selected = [];
          this.indeterminate = false;
        } else {
          _.forEach(item.expenses, expense => {
            _.forEach(this.selected, exp => {
              if (exp && exp.id === expense.id) {
                this.selected.splice(_.indexOf(this.selected, exp), 1);
              }
            });
          });
          this.everythingSelected = false;
          this.indeterminate = true;
        }
      }
      EventBus.$emit('expenseChange', this.selected);

      return item;
    },
    getExpenseTotal(expenses) {
      let total = 0;
      _.forEach(expenses, expense => (total += expense.cost));
      return total;
    },
    toggleAll() {
      if (this.selected.length) {
        _.forEach(this.filteredItems, item => {
          this.toggleExpenses(item);
          item.allSelected = false;
        });
        this.everythingSelected = false;
        this.selected = [];
      } else {
        _.forEach(this.filteredItems, item => {
          this.toggleExpenses(item);
          item.allSelected = true;
        });
        this.everythingSelected = true;
      }
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
      expense.lastName = employee.lastName;
      expense.firstName = employee.firstName;
      expense.selected = false;
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
    },
    defaultSort() {
      let arrayLength = this.empBudgets.length;

      empBudgets.map(item => {
        for (var i = 0; i < arrayLength; i++) {
          if (item.lastName === this.empBudgets[i].lastName) {}
        }
      });
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
