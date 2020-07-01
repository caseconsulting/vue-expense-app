<template>
  <div>
    <!-- Status Alert -->
    <v-alert v-for="(alert, index) in alerts" :key="index" :type="alert.status" :color="alert.color" dense class="mb-1">
      {{ alert.message }}
    </v-alert>
    <v-card>
      <v-container fluid>
        <!-- Table Header -->
        <v-card-title>
          <h3>Unreimbursed Expenses</h3>
          <v-spacer></v-spacer>

          <!-- Search Filters -->
          <v-autocomplete
            :items="employees"
            v-model="employee"
            item-text="text"
            label="Filter by Employee"
            clearable
          ></v-autocomplete>
          <p>&nbsp;</p>
          <v-autocomplete
            :items="expenseTypes"
            v-model="expenseType"
            item-text="text"
            label="Filter by Expense Type"
            clearable
          ></v-autocomplete>
        </v-card-title>

        <!-- Unreimbursed Datatable -->
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :expanded.sync="expanded"
          :loading="loading"
          :items-per-page.sync="itemsPerPage"
          show-select
          item-key="key"
          class="elevation-1 text-center"
        >
          <!-- Check box in datatable header -->
          <template v-slot:header.data-table-select>
            <v-checkbox
              :input-value="mainCheckBox.all"
              :indeterminate="mainCheckBox.indeterminate"
              primary
              hide-details
              @click.stop="toggleAll"
              class="ma-0"
            ></v-checkbox>
          </template>
          <!-- End check box in datatable header -->

          <!-- Rows in datatable -->
          <template v-slot:item="{ item }">
            <tr @click="clickedRow(item)">
              <!-- Checkbox for individual expense -->
              <td style="width: 1px;">
                <v-checkbox
                  :input-value="item.checkBox.all"
                  :indeterminate="item.checkBox.indeterminate"
                  primary
                  hide-details
                  @click.stop="toggleGroup(item)"
                  class="ma-0"
                ></v-checkbox>
              </td>

              <!-- Employee Name -->
              <td>{{ item.employeeName }}</td>

              <!-- Budget Name -->
              <td>{{ item.budgetName }}</td>

              <!-- Total Expense Amount -->
              <td id="money-team">{{ getBudgetTotal(item.expenses) | moneyValue }}</td>
            </tr>
          </template>
          <!-- End rows in datatable -->

          <!-- Expanded slot in datatable -->
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="pa-0">
              <unrolled-table-info :expenses="item.expenses" @selectExpense="selectExpense"></unrolled-table-info>
            </td>
          </template>
          <!-- End expanded slot in datatable -->
        </v-data-table>
        <!-- End unreimbursed datatable -->

        <!-- Reimburse Button -->
        <v-flex offset-md10>
          <v-fab-transition class="reimburse_button">
            <v-btn
              @click="buttonClicked = true"
              id="custom-button-color"
              :loading="reimbursing"
              v-show="showReimburseButton"
              fab
              dark
              large
              bottom
              left
              fixed
              class="reimburse_button"
            >
              <icon name="dollar-sign"></icon>
            </v-btn>
          </v-fab-transition>
        </v-flex>
      </v-container>

      <!-- Activate Reimburse Modal -->
      <reimburse-modal :activate="buttonClicked"></reimburse-modal>
    </v-card>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import moment from 'moment';
import ReimburseModal from './ReimburseModal.vue';
import UnrolledTableInfo from './UnrolledTableInfo.vue';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Filter budgets based on employee and/or expense type. Returns budget if the employee and expense type match.
 *
 * @return Array - filtered budgets
 */
function filteredItems() {
  return _.filter(this.empBudgets, (budget) => {
    if (!this.employee && !this.expenseType) {
      return true;
    } else if (!this.employee && this.expenseType) {
      return budget.expenseTypeId === this.expenseType;
    } else if (!this.expenseType && this.employee) {
      return budget.employeeId === this.employee;
    } else {
      return budget.employeeId === this.employee && budget.expenseTypeId === this.expenseType;
    }
  });
} // filteredItems

/**
 * State of datatable header check box based on selected expeneses.
 *
 * @return Object - main checkbox state
 */
function mainCheckBox() {
  let checkBox = {
    all: true,
    indeterminate: false
  };

  _.forEach(this.empBudgets, (budget) => {
    if (_.some(budget.expenses, { selected: false })) {
      checkBox.all = false;
    }
    if (_.some(budget.expenses, { selected: true })) {
      checkBox.indeterminate = true;
    }
  });

  if (checkBox.all) {
    checkBox.indeterminate = false;
  }
  return checkBox;
} // mainCheckBox

/**
 * Returns the display status of the reimburse button. Returns true if an expense is selected, otherwise returns false.
 *
 * @return boolean - display reimbursed button
 */
function showReimburseButton() {
  return this.pendingExpenses.length > 0 && (this.mainCheckBox.all || this.mainCheckBox.indeterminate);
} // showReimburseButton

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Async function to loop an array.
 *
 * @param array - Array of elements to iterate over
 * @param callback - callback function
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
} // asyncForEach

/**
 * Check all expenses and boxes.
 */
function checkAllBoxes() {
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    budget.checkBox.all = true;
    budget.checkBox.indeterminate = false;
    return _.forEach(budget.expenses, (expense) => {
      emitSelectionChange(expense, true);
      expense.selected = true;
    });
  });
} // checkAllBoxes

/**
 * Clears the response status snackbar.
 */
function clearStatus() {
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
} // clearStatus

/**
 * Expands an expense. Adds the expense to expanded row when clicked.
 *
 * @param value - expense to expand
 */
function clickedRow(value) {
  if (_.isEmpty(this.expanded) || this.expanded[0].key != value.key) {
    this.expanded = [];
    this.expanded.push(value);
  } else {
    this.expanded = [];
  }
} // clickedRow

/**
 * Constructs the auto complete lists for the employee and expense type filter.
 *
 * @param aggregatedData - expenses data
 */
function constructAutoComplete(aggregatedData) {
  // set employees
  this.employees = _.map(aggregatedData, (data) => {
    if (data && data.employeeName && data.employeeId) {
      return {
        text: data.employeeName,
        value: data.employeeId
      };
    }
  }).filter((data) => {
    return data != null;
  });
  // set expense types
  this.expenseTypes = _.map(aggregatedData, (data) => {
    if (data && data.budgetName && data.expenseTypeId) {
      return {
        text: data.budgetName,
        value: data.expenseTypeId
      };
    }
  }).filter((data) => {
    return data != null;
  });
} // constructAutoComplete

/**
 *  Maps dataset to expenses.
 *
 * @param aggregatedData - data
 * return Array - List of aggregated expenses
 */
function createExpenses(aggregatedData) {
  return _.map(aggregatedData, (expense) => {
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
      employeeId: expense.employeeId,
      checkBox: {
        all: false,
        indeterminate: false
      },
      selected: false,
      url: expense.url,
      category: expense.category,
      createdAt: expense.createdAt,
      failed: false,
      showOnFeed: false
    };
  });
} // createExpenses

/**
 * Determine the state of the group check box based on expenses.
 *
 * @param budget - budget group selected
 * @return Object - checkbox
 */
function determineCheckBox(budget) {
  let checkBox = {
    all: true,
    indeterminate: false
  };

  // determine if all expenses in group are selected or not
  _.forEach(budget.expenses, (expense) => {
    if (!expense.selected) {
      // at least one of the expenses is not selected
      checkBox.all = false;
    }

    if (expense.selected) {
      // at least one of the expenses is selected
      checkBox.indeterminate = true;
    }
  });

  if (checkBox.all) {
    // set indeterminate to false if all is selected
    checkBox.indeterminate = false;
  }

  return checkBox;
} // determineCheckBox

/**
 * Displays an error in the response status snackbar.
 */
async function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
} // displayError

/**
 * Emits expense select change for expense type totals component.
 *
 * @param expense - expense changed
 * @param newSelect - select status is changed
 */
function emitSelectionChange(expense, newSelect) {
  if (expense.selected != newSelect) {
    window.EventBus.$emit('expenseChange', expense);
  }
} // emitSelectionChange

/**
 * Remove reimbursed expenses and returns a list of pending expenses.
 *
 * @param expenses - list of expenses
 * @return Array - pending expenses
 */
function filterOutReimbursed(expenses) {
  return _.filter(expenses, (expense) => !isReimbursed(expense));
} // filterOutReimbursed

/**
 * Get the total cost of expenses in a group budget.
 *
 * @param expenses - list of expenses
 * @return Number - total cost of expenses
 */
function getBudgetTotal(expenses) {
  let total = 0;
  _.forEach(expenses, (expense) => (total += expense.cost));
  return total;
} // getBudgetTotal

/**
 * Group expenses with the same employee name and expense type.
 *
 * @param expenses - list of expenses
 * @return Array - list of grouped expenses
 */
function groupEmployeeExpenses(expenses) {
  let data = _.forEach(expenses, (expense) => {
    expense.key = `${expense.employeeId}${expense.expenseTypeId}`;
  });

  // Create a list of expenses under each group
  data = _.forEach(data, (item) => {
    return (item.expenses = _.filter(expenses, (expense) => {
      return matchingEmployeeAndExpenseType(expense, item);
    }));
  });

  data = _.uniqWith(data, (el1, el2) => el1.key === el2.key);

  return data;
} // groupEmployeeExpenses

/**
 * Checks if a value is empty. Returns true if the value is null or a single character space String.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return value == null || value === ' ' || value === '';
} // isEmpty

/**
 * Checks if the expense is reimbursed. Returns true if the expense is reimbursed, otherwise returns false.
 *
 * @param expense - expense to check
 * @return boolean - expense is reimbursed
 */
function isReimbursed(expense) {
  return expense && !isEmpty(expense.reimbursedDate);
} // isReimbursed

/**
 * Return true if two items have the same employeeId and expenseTypeId and not reimbursed.
 *
 * @param expense - first expense to compare
 * @param item - other expense to compare
 * @return boolean - item not reimbursed and employee and expense type match
 */
function matchingEmployeeAndExpenseType(expense, item) {
  let reimbursed = isReimbursed(item);
  return expense.employeeId === item.employeeId && expense.expenseTypeId === item.expenseTypeId && !reimbursed;
} // matchingEmployeeAndExpenseType

/**
 * Refresh expenses.
 */
function refreshExpenses() {
  this.pendingExpenses = [];
  _.forEach(this.empBudgets, (budget) => {
    _.forEach(budget.expenses, (budgetExpense) => {
      if (!isReimbursed(budgetExpense)) {
        this.pendingExpenses.push(budgetExpense);
      }
    });
  });
  this.empBudgets = groupEmployeeExpenses(this.pendingExpenses);
  this.unCheckAllBoxes();
} // refreshExpenses

/**
 * Reimburse the selected list of expenses.
 */
async function reimburseExpenses(show) {
  if (this.buttonClicked) {
    // reimburse button is clicked
    let expensesToReimburse = [];
    this.buttonClicked = false;
    this.reimbursing = true; // set reimbursing status to true

    // get selected expenses and set reimburse date
    this.empBudgets = _.forEach(this.empBudgets, async (budget) => {
      return await _.forEach(budget.expenses, async (expense) => {
        if (expense.selected) {
          this.$set(expense, 'showOnFeed', show);
          expense.reimbursedDate = moment().format('YYYY-MM-DD');
          expensesToReimburse.push(submitExpenseObject(expense));
        }
      });
    });

    // reimburse expense on back end
    await this.asyncForEach(expensesToReimburse, async (expense) => {
      let reimbursedExpense = await api.updateItem(api.EXPENSES, expense);
      let msg;
      if (!reimbursedExpense.id) {
        // failed to reimburse expense
        msg = reimbursedExpense.response.data.message;
        this.alerts.push({ status: 'error', message: msg, color: 'red' });
        let self = this;
        setTimeout(function () {
          self.alerts.shift();
        }, 10000);

        // revert reimburse date change
        let groupIndex = _.findIndex(this.empBudgets, {
          employeeId: expense.employeeId,
          expenseTypeId: expense.expenseTypeId
        });
        let expenseIndex = _.findIndex(this.empBudgets[groupIndex].expenses, { id: expense.id });
        this.empBudgets[groupIndex].expenses[expenseIndex].reimbursedDate = ' ';
        this.empBudgets[groupIndex].expenses[expenseIndex].failed = true;
      } else {
        // successfully reimbursed expense
        msg = 'Successfully reimbursed expense';
        this.alerts.push({ status: 'success', message: msg, color: 'green' });
        let self = this;
        setTimeout(function () {
          self.alerts.shift();
        }, 10000);
      }
    });

    this.refreshExpenses();
    this.reimbursing = false; // set reimbursing status to false
  }
} // reimburseExpenses

/**
 * Select an expense and change check box status.
 *
 * @param expense - expense selected
 */
function selectExpense(expense) {
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (expense.key === budget.key) {
      return _.forEach(budget.expenses, (budgetExpense) => {
        if (expense === budgetExpense) {
          budgetExpense.selected = !budgetExpense.selected;
        }
      });
    }
  });

  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (expense.key === budget.key) {
      budget.checkBox = determineCheckBox(budget);
    }
  });
} // selectExpense

/**
 * Sets up an expense object to be submitted.
 *
 * @param expense - expense data to submit
 * @return Object - expense object
 */
function submitExpenseObject(expense) {
  return {
    cost: expense.cost,
    description: expense.description,
    expenseTypeId: expense.expenseTypeId,
    id: expense.id,
    purchaseDate: expense.purchaseDate,
    reimbursedDate: expense.reimbursedDate,
    note: expense.note,
    employeeId: expense.employeeId,
    receipt: expense.receipt,
    category: expense.category,
    createdAt: expense.createdAt,
    showOnFeed: expense.showOnFeed,
    url: expense.url
  };
} // submitExpenseObject

/**
 * Toggle all expenses selected.
 */
function toggleAll() {
  if (!this.mainCheckBox.all) {
    // check all boxes
    this.checkAllBoxes();
  } else {
    // clear all checkboxes
    this.unCheckAllBoxes();
  }
} // toggleAll

/**
 * Toggle expenses in a group selected.
 *
 * @param value - expense group selected
 */
function toggleGroup(value) {
  // updated group expenses selected
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (value === budget) {
      // matching budget
      if (determineCheckBox(budget).all) {
        // unselect all expenses
        return _.forEach(budget.expenses, (expense) => {
          emitSelectionChange(expense, false);
          expense.selected = false;
        });
      } else {
        // select all expenses
        return _.forEach(budget.expenses, (expense) => {
          emitSelectionChange(expense, true);
          expense.selected = true;
        });
      }
    }
  });

  // set the group check box
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (value === budget) {
      budget.checkBox = determineCheckBox(budget);
    }
  });
} // toggleGroup

/**
 * Uncheck all expenses and boxes
 */
function unCheckAllBoxes() {
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    budget.checkBox.all = false;
    budget.checkBox.indeterminate = false;
    return _.forEach(budget.expenses, (expense) => {
      emitSelectionChange(expense, false);
      expense.selected = false;
    });
  });
} // unCheckAllBoxes

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Sets the aggregated expeneses and datatable. Creates event listeners.
 */
async function created() {
  window.EventBus.$on('selectExpense', this.selectExpense);
  window.EventBus.$on('confirm-reimburse-true', () => {
    this.reimburseExpenses(true);
  });
  window.EventBus.$on('confirm-reimburse-false', () => {
    this.reimburseExpenses(false);
  });

  window.EventBus.$on('canceled-reimburse', () => (this.buttonClicked = false));
  let aggregatedData = await api.getAllAggregateExpenses();

  let allExpenses = createExpenses(aggregatedData);
  this.pendingExpenses = filterOutReimbursed(allExpenses);
  this.constructAutoComplete(this.pendingExpenses);
  this.empBudgets = groupEmployeeExpenses(this.pendingExpenses);
  this.unCheckAllBoxes();
  this.loading = false;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    ReimburseModal,
    UnrolledTableInfo
  },
  computed: {
    filteredItems,
    mainCheckBox,
    showReimburseButton
  },
  created,
  data: () => ({
    alerts: [], // status alerts
    buttonClicked: false, // reimburse button clicked
    empBudgets: [], // grouped employee and expense types
    employee: null, // employee autocomplete filter
    employees: [], // employee autocomplete options
    expanded: [], // datatable expanded
    expenseType: null, // expense type autocomplete filter
    expenseTypes: [], // expense type autocomplete options
    headers: [
      {
        text: 'Employee',
        value: 'employeeName',
        align: 'center'
      },
      {
        text: 'Expense Type',
        value: 'budgetName',
        align: 'center'
      },
      {
        text: 'Total',
        value: 'cost',
        align: 'center'
      }
    ], // datatable headers
    itemsPerPage: -1, // data table elements per page
    loading: true, // is loading
    pendingExpenses: [], // pending expenses
    reimbursing: false, // is reimbursing
    sortBy: 'employeeName', // sort datatable items
    sortDesc: false, // sort datatable items
    status: {
      statusType: undefined,
      statusMessage: '',
      color: ''
    } // reimburse status
  }),
  filters: {
    moneyValue: (value) => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    }
  },
  methods: {
    asyncForEach,
    checkAllBoxes,
    clearStatus,
    clickedRow,
    constructAutoComplete,
    displayError,
    emitSelectionChange,
    filterOutReimbursed,
    getBudgetTotal,
    groupEmployeeExpenses,
    isEmpty,
    isReimbursed,
    matchingEmployeeAndExpenseType,
    refreshExpenses,
    reimburseExpenses,
    selectExpense,
    submitExpenseObject,
    toggleAll,
    toggleGroup,
    unCheckAllBoxes
  }
};
</script>
