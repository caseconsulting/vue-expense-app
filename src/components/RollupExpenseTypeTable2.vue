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
          :headers="headers"
          :items="filteredItems"
          :pagination.sync="pagination"
          select-all
          item-key="key"
          class="elevation-1"
          :loading="loading"
        >
          <!-- header for sub-datatable -->
          <v-progress-linear slot="progress" color="radioactive" indeterminate></v-progress-linear>

          <template v-slot:headers="props">
            <tr style="box-shadow: 0px 1.5px #888888;">
              <th>
                <v-checkbox
                  :input-value="headBox.all"
                  :indeterminate="headBox.indeterminate"
                  primary
                  hide-details
                  @click.stop="toggleAll"
                ></v-checkbox>
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
          <!-- end header for sub-datatable -->

          <!-- rows in sub-datatable -->
          <template v-slot:items="props">
            <tr v-if="!loading" :active="props.selected">
              <!-- checkbox for individual expense -->
              <td style="width: 1px">
                <v-checkbox
                  :input-value="props.item.checkBox.all"
                  :indeterminate="props.item.checkBox.indeterminate"
                  primary
                  hide-details
                  @change="
                    props.selected = !props.selected;
                    props.item.checkBox.all = !props.item.checkBox.all;
                    props.item.checkBox.indeterminate = false;
                    toggleExpenses(props.item);
                  "
                ></v-checkbox>
              </td>
              <td
                class="text-xs-center"
                @click="
                  handleExpanded(props);
                  props.expanded = props.item.expanded;
                "
              >
                {{ props.item.employeeName }}
              </td>
              <td
                class="text-xs-center"
                @click="
                  handleExpanded(props);
                  props.expanded = props.item.expanded;
                "
              >
                {{ props.item.budgetName }}
              </td>
              <td
                class="text-xs-center"
                id="money-team"
                @click="
                  handleExpanded(props);
                  props.expanded = props.item.expanded;
                "
              >
                {{ getExpenseTotal(props.item.expenses) | moneyValue }}
              </td>
            </tr>
          </template>
          <!-- end rows in sub-datatable -->

          <!-- expandable of rows in datatable -->
          <template v-slot:expand="props">
            <unrolled-table-info2
              @expensePicked="addExpenseToSelected"
              :headBox="props.item.checkBox"
              :expenses="props.item.expenses"
              :budgetId="props.item.id"
              :savedChecked="selected"
            ></unrolled-table-info2>
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
//mport UnrolledTableInfo from './UnrolledTableInfo.vue';
import UnrolledTableInfo2 from './UnrolledTableInfo2.vue';
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
    //UnrolledTableInfo,
    UnrolledTableInfo2,
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
    headBox: { indeterminate: false, all: false },
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
    window.EventBus.$on('allCheckBoxChange', this.updateCheckBoxes);
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
    updateCheckBoxes(checkBox) {
      this.filteredItems.forEach(e => {
        if (e.id === checkBox.b_id) {
          e.checkBox.all = checkBox.all;
          e.checkBox.indeterminate = checkBox.indeterminate;
        }
      });
    },
    modifyAggregateDate(aggregatedData, expenses) {
      //Remove undefined stuff
      aggregatedData = _.filter(aggregatedData, item => item !== undefined && !item.reimbursedDate);
      //Maps each expense and only returns if not reimbursed
      aggregatedData = _.forEach(aggregatedData, expense => {
        expense.key = `${expense.userId}${expense.expenseTypeId}`;
        expense.checkBox = {
          all: false,
          indeterminate: false
        };
        expense.expanded = false;
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
      if (this.button_clicked) {
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

        // reimburse expense on back end
        await this.asyncForEach(expensesToSubmit, async expense => {
          await api.updateItem(api.EXPENSES, expense.id, expense);
          itemsToRemoveFromTable.push(expense);
        });

        // remove expense from empBudgets
        _.forEach(itemsToRemoveFromTable, item => {
          this.removeExpenseFromList(item);
        });

        // reset each invidiual row checkbox to empty
        _.forEach(this.filteredItems, item => {
          item.checkBox.all = false;
          item.checkBox.indeterminate = false;
        });

        // remove reimbursed expenses from list of unreimbursed expenses
        this.unreimbursedExpenses = _.differenceWith(this.unreimbursedExpenses, this.selected);

        this.selected = [];
        this.reimbursing = false;
        // location.reload();
      }
    },
    async asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    },
    removeExpenseFromList(selected) {
      let employeeIndex = _.findIndex(
        this.empBudgets,
        employee => employee.userId === selected.userId && employee.expenseTypeId === selected.expenseTypeId
      );
      let expenseIndex = _.findIndex(this.empBudgets[employeeIndex].expenses, expense => selected.id === expense.id);

      this.empBudgets[employeeIndex].expenses.splice(expenseIndex, 1);

      this.empBudgets = _.filter(this.empBudgets, item => item.expenses.length); //remove empty arrays
    },

    addExpenseToSelected(expense) {
      if (_.indexOf(this.selected, expense) === -1) {
        this.selected.push(expense);
        _.findIndex(this.filteredItems, function(item) {
          return item.id == expense.budgetId;
        });
      } else {
        _.forEach(this.selected, exp => {
          if (exp && exp.id === expense.id) {
            this.selected.splice(_.indexOf(this.selected, exp), 1);
          }
        });
      }
    },
    handleExpanded(props) {
      if (!props.item.expanded) {
        _.forEach(this.filteredItems, item => {
          item.expanded = props.item === item;
        });
      } else {
        _.forEach(this.filteredItems, item => {
          item.expanded = false;
        });
      }
    },
    toggleExpenses(item) {
      if (!item.expanded) {
        if (item.checkBox.all) {
          _.forEach(item.expenses, exp => {
            if (_.indexOf(this.selected, exp) === -1) {
              this.selected.push(exp);
            }
          });
        } else {
          this.selected = _.filter(this.selected, expense => {
            return !this.matchingEmployeeAndExpenseType(expense, item);
          });
        }
        window.EventBus.$emit('expenseChange', this.selected);
      }
    },
    toggleAll() {
      if (this.selected.length != this.unreimbursedExpenses.length) {
        // check all boxes
        this.filteredItems.forEach(e => {
          e.checkBox.all = true;
          e.checkBox.indeterminate = false;

          this.toggleExpenses(e);
        });
      } else {
        // clear all checkboxes
        this.filteredItems.forEach(e => {
          e.checkBox.all = false;
          e.checkBox.indeterminate = false;

          this.toggleExpenses(e);
        });
      }
      window.EventBus.$emit('expenseChange', this.selected);
    },
    getExpenseTotal(expenses) {
      let total = 0;
      _.forEach(expenses, expense => (total += expense.cost));
      return total;
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
  },
  watch: {
    selected: function() {
      this.headBox.all = this.selected.length === this.unreimbursedExpenses.length;
      this.headBox.indeterminate = !this.headBox.all && this.selected.length > 0;
    }
  }
};
</script>
<style>
#money-team {
  color: green;
}
</style>
