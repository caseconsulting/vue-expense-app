<template>
  <div>
    <v-card>
      <v-container fluid>
        <!-- table header -->
        <v-card-title>
          <h2>Unreimbursed Expenses</h2>
          <v-spacer></v-spacer>

          <!-- search filters -->
          <v-autocomplete
            :items="employees"
            :filter="customFilter"
            v-model="employee"
            item-text="text"
            label="Filter by Employee"
            clearable
          ></v-autocomplete>
          <p>&nbsp;</p>
          <v-autocomplete
            :items="expenseTypes"
            :filter="customFilter"
            v-model="expenseType"
            item-text="text"
            label="Filter by Expense Type"
            clearable
          ></v-autocomplete>
          <!-- end search filters -->
        </v-card-title>
        <!-- end table header -->

        <!-- unreimbursed datatable -->
        <v-data-table
          v-model="selected"
          :headers="headers"
          :items="filteredItems"
          :pagination.sync="pagination"
          select-all
          item-key="key"
          class="elevation-1"
          :loading="loading"
        >
          <!-- header for datatable -->
          <v-progress-linear slot="progress" color="radioactive" indeterminate></v-progress-linear>
          <template slot="headers" slot-scope="props">
            <tr style="box-shadow: 0px 1.5px #888888;">
              <!-- checkbox for select all table expenses -->
              <th>
                <v-checkbox :input-value="everythingSelected" primary hide-details @change="toggleAll"></v-checkbox>
              </th>
              <th
                v-for="header in props.headers"
                :key="header.text"
                :class="[
                  'column sortable',
                  pagination.descending ? 'desc' : 'asc',
                  header.value === pagination.sortBy ? 'active' : ''
                ]"
                @click="changeSort(header.value)"
              >
                <v-icon small>arrow_upward</v-icon>
                {{ header.text }}
              </th>
            </tr>
          </template>
          <!-- end header for datatable -->

          <!-- top level rows in datatable -->
          <template slot="items" slot-scope="props">
            <tr v-if="!loading" :active="props.selected" @click="props.expanded = !props.expanded">
              <!-- checkbox for select all row expenses -->
              <td>
                <v-checkbox
                  v-model="props.item.allSelected"
                  @change="props.item = toggleExpenses(props.item)"
                  primary
                  hide-details
                ></v-checkbox>
              </td>
              <td class="text-xs-center">{{ props.item.employeeName }}</td>
              <td class="text-xs-center">{{ props.item.budgetName }}</td>
              <td class="text-xs-center" id="money-team">{{ getExpenseTotal(props.item.expenses) | moneyValue }}</td>
            </tr>
          </template>
          <!-- end top level rows in datatable -->

          <!-- expandable of rows in datatable -->
          <template slot="expand" slot-scope="props">
            <unrolled-table-info
              @expensePicked="addExpenseToSelected"
              @changedAllSelected="props.item.allSelected = $event"
              :allSelected="props.item.allSelected"
              :expenses="props.item.expenses"
            ></unrolled-table-info>
          </template>
          <!-- end expandable of rows in datatable -->
        </v-data-table>
        <!-- end unreimbursed datatable -->

        <!-- unreimburse button -->
        <v-flex offset-md10>
          <v-fab-transition>
            <v-btn
              @click="button_clicked = true"
              id="custom-button-color"
              :loading="reimbursing"
              v-show="showSubmitButton"
              fab
              dark
              large
              bottom
              left
              fixed
            >
              <icon name="dollar-sign"></icon>
            </v-btn>
          </v-fab-transition>
        </v-flex>
        <!-- end unreimburse button -->
      </v-container>

      <!-- activate reimburse button -->
      <reimburse-modal :activate="button_clicked"></reimburse-modal>
    </v-card>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import employeeUtils from '@/shared/employeeUtils';
import UnrolledTableInfo from './UnrolledTableInfo.vue';
import ReimburseModal from './ReimburseModal.vue';
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
    UnrolledTableInfo,
    ReimburseModal
  },
  data: () => ({
    loading: true,
    reimbursing: false,
    button_clicked: false,
    everythingSelected: false,
    indeterminate: false,
    unreimbursedExpenses: [],
    empBudgets: [],
    employees: [], //For autocomplete
    expenseTypes: [], //For autocomplete
    employee: null, //For autocomplete
    expenseType: null, //For autocomplete
    pagination: {
      sortBy: 'compareName',
      rowsPerPage: -1
    },
    selected: [],
    headers: [
      {
        text: 'Employee',
        value: 'compareName'
      },
      {
        text: 'Expense Type',
        value: 'compareBudget'
      },
      {
        text: 'Total',
        value: 'compareCost'
      }
    ]
  }),
  async created() {
    window.EventBus.$on('expensePicked', this.addExpenseToSelected);
    window.EventBus.$on('confirm-reimburse', this.reimburseExpenses);
    window.EventBus.$on('canceled-reimburse', () => (this.button_clicked = false));
    let aggregatedData = await api.getAggregate();
    let expenses = this.createExpensesForUnrolled(aggregatedData);
    this.constructAutoComplete(aggregatedData);
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
        let cost = this.getExpenseTotal(expense.expenses);
        expense.compareName = `${expense.lastName}${expense.firstName}${expense.middleName}${expense.budgetName}`;
        expense.compareBudget = `${expense.budgetName}${expense.lastName}${expense.middleName}${expense.firstName}`;
        expense.compareCost = `${cost}`;

        if (!this.employee && !this.expenseType) {
          return true;
        } else if (!this.employee && this.expenseType) {
          return expense.expenseTypeId === this.expenseType;
        } else if (!this.expenseType && this.employee) {
          return expense.userId === this.employee;
        } else {
          return expense.userId === this.employee && expense.expenseTypeId === this.expenseType;
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
    //test
    createExpensesForUnrolled(aggregatedData) {
      return _.map(aggregatedData, expense => {
        return {
          budgetName: expense.budgetName,
          cost: expense.cost,
          description: expense.description,
          employeeName: expense.employeeName,
          expenseTypeId: expense.expenseTypeId,
          firstName: expense.firstName,
          id: expense.id,
          lastName: expense.lastName,
          middleName: expense.middleName,
          note: expense.note,
          purchaseDate: expense.purchaseDate,
          receipt: expense.receipt,
          reimbursedDate: expense.reimbursedDate,
          userId: expense.userId,
          selected: false,
          createdAt: expense.createdAt
        };
      });
    },
    modifyAggregateDate(aggregatedData, expenses) {
      //Remove undefined stuff
      aggregatedData = _.filter(aggregatedData, item => item !== undefined && !item.reimbursedDate);
      //Maps each expense and only returns if not reimbursed
      aggregatedData = _.forEach(aggregatedData, expense => {
        expense.key = `${expense.userId}${expense.expenseTypeId}`;
        expense.allSelected = false;
      });
      //Remove duplicates

      //Create a list of arrays if the userId matches, expenseTypeId matches and hasn't been reimbursed
      aggregatedData = _.forEach(aggregatedData, item => {
        return (item.expenses = _.filter(expenses, expense => {
          return this.matchingEmployeeAndExpenseType(expense, item);
        }));
      });
      aggregatedData = _.uniqWith(aggregatedData, (el1, el2) => el1.key === el2.key);
      return aggregatedData;
    },
    matchingEmployeeAndExpenseType(expense, item) {
      return expense.userId === item.userId && expense.expenseTypeId === item.expenseTypeId && !expense.reimbursedDate;
    },
    constructAutoComplete(aggregatedData) {
      this.employees = _.map(aggregatedData, data => {
        if (data && data.employeeName && data.userId) {
          return {
            text: data.employeeName,
            value: data.userId
          };
        }
      }).filter(data => {
        return data != null;
      });
      //Get expense Types
      this.expenseTypes = _.map(aggregatedData, data => {
        if (data && data.budgetName && data.expenseTypeId) {
          return {
            text: data.budgetName,
            value: data.expenseTypeId
          };
        }
      }).filter(data => {
        return data != null;
      });
    },
    async reimburseExpenses() {
      this.button_clicked = false;
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
          receipt: null,
          createdAt: item.createdAt
        };
      });
      this.reimbursing = true;
      let itemsToRemoveFromTable = [];

      await this.asyncForEach(expensesToSubmit, async expense => {
        await api.updateItem(api.EXPENSES, expense.id, expense);
        itemsToRemoveFromTable.push(expense);
      });

      _.forEach(itemsToRemoveFromTable, item => {
        item.allSelected = false;
        this.removeExpenseFromList(item);
      });
      this.everythingSelected = false;
      this.reimbursing = false;
      this.selected = [];
    },
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
    removeExpenseFromList(selected) {
      let employeeIndex = _.findIndex(this.empBudgets, employee => employee.userId === selected.userId);
      let expenseIndex = _.findIndex(this.empBudgets[employeeIndex].expenses, expense => selected.id === expense.id);
      this.empBudgets[employeeIndex].expenses.splice(expenseIndex, 1);

      this.empBudgets = _.filter(this.empBudgets, item => item.expenses.length); //remove empty arrays
      window.EventBus.$emit('expenseChange', []);
      window.EventBus.$emit('clickedExpense');
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
      if (item.allSelected) {
        _.forEach(item.expenses, expense => {
          expense.selected = true;
          if (this.selected.includes(expense) === false) {
            this.selected.push(expense);
          }
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
      window.EventBus.$emit('expenseChange', this.selected);

      return item;
    },
    getExpenseTotal(expenses) {
      let total = 0;
      _.forEach(expenses, expense => (total += expense.cost));
      return total;
    },
    toggleAll() {
      if (this.unreimbursedExpenses.length == this.selected.length) {
        _.forEach(this.filteredItems, item => {
          item.allSelected = false;
          this.toggleExpenses(item);
        });
        this.everythingSelected = false;
        this.selected = [];
      } else {
        _.forEach(this.filteredItems, item => {
          item.allSelected = true;
          this.toggleExpenses(item);
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
      expense.employeeName = employeeUtils.fullName(employee);
      expense.lastName = employee.lastName;
      expense.firstName = employee.firstName;
      expense.selected = false;
      return expense;
    },
    async getExpenseTypeName(expense) {
      let expenseType = await api.getItem(api.EXPENSE_TYPES, expense.expenseTypeId);
      expense.budgetName = expenseType.budgetName;
      return expense;
    },
    customFilter(item, queryText) {
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

      this.empBudgets.map(item => {
        for (var i = 0; i < arrayLength; i++) {
          if (item.lastName === this.empBudgets[i].lastName) {
            // TODO: What should happen here?
          }
        }
      });
    }
  }
};
</script>
<style>
#money-team {
  color: green;
}
</style>
