<template>
  <div>
    <!-- Status Alert -->
    <v-alert
      v-for="(alert, index) in alerts"
      :key="index"
      :type="alert.status"
      :color="alert.color"
      dense
      class="mb-1"
      id="alert"
    >
      {{ alert.message }}
    </v-alert>
    <v-card class="mt-3">
      <v-container fluid>
        <!-- Table Header -->
        <v-card-title>
          <h3>Unreimbursed Expenses</h3>
          <v-spacer></v-spacer>

          <!-- Search Filters -->
          <v-autocomplete
            :items="employees"
            v-model="employee"
            id="filterEmployee"
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

        <!-- NEW DATA TABLE -->
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :custom-sort="customSort"
          :expanded.sync="expanded"
          :loading="loading"
          :items-per-page.sync="itemsPerPage"
          show-select
          item-key="key"
          class="elevation-1 text-center"
          @click:row="clickedRow"
        >
          <!-- Select item slot in data table -->
          <template v-slot:[`item.data-table-select`]="{ item }">
            <v-checkbox
              id="itemCheckbox"
              :input-value="item.checkBox.all"
              :indeterminate="item.checkBox.indeterminate"
              primary
              hide-details
              @click.stop="
                toggleGroup(item);
                determineShowOnFeed(item);
              "
              class="ma-0"
            >
            </v-checkbox>
          </template>
          <!-- Employee Name slot in data table-->
          <template v-slot:[`item.employeeName`]="{ item }"
            ><v-badge
              v-if="item.expenses.length > 1"
              :content="item.expenses.length"
              :value="true"
              :left="true"
              :offset-x="-10"
              color="grey"
            ></v-badge>
            {{ item.employeeName }}</template
          >
          <!-- Show on feed item slot in data table -->
          <template v-slot:[`item.showOnFeed`]="{ item }">
            <v-switch
              :input-value="item.showSwitch && item.selected"
              @click.native.stop
              @change="toggleShowOnFeedGroup(item)"
              :disabled="!item.checkBox.all"
            ></v-switch>
          </template>
          <!-- Item cost in data table slot -->
          <template v-slot:[`item.cost`]="{ item }">
            <p id="money-team" style="margin-bottom: 0px">{{ convertToMoneyString(getBudgetTotal(item.expenses)) }}</p>
          </template>
          <!-- Header select slot in data table -->
          <template v-slot:[`header.data-table-select`]>
            <v-checkbox
              :input-value="mainCheckBox.all"
              :indeterminate="mainCheckBox.indeterminate"
              primary
              hide-details
              @click.stop="toggleAll"
              class="ma-0"
            >
            </v-checkbox>
          </template>
          <!-- Expanded slot in datatable -->
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="pa-0">
              <unrolled-table-info
                :expenses="item.expenses"
                @toggleExpense="toggleShowOnFeed"
                @selectExpense="selectExpense"
              ></unrolled-table-info>
            </td>
          </template>
        </v-data-table>
        <!-- NEW DATA TABLE -->
        <!-- Reimburse Button -->
        <v-fab-transition class="reimburse_button">
          <v-btn
            @click="buttonClicked = !buttonClicked"
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
      </v-container>

      <!-- Activate Reimburse Modal -->
      <reimburse-modal
        :toggleReimburseModal="buttonClicked"
        :selectedReimbursements="getSelectedExpensesToReimburse"
        v-on:confirm-reimburse="reimburseExpenses"
      ></reimburse-modal>
    </v-card>
  </div>
</template>

<script>
import api from '@/shared/api.js';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import ReimburseModal from '@/components/modals/ReimburseModal.vue';
import UnrolledTableInfo from '@/components/UnrolledTableInfo.vue';
import _ from 'lodash';
import { asyncForEach, isEmpty, convertToMoneyString } from '@/utils/utils';

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
  let data = _.filter(this.empBudgets, (budget) => {
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
  data.sort((a, b) => (a.lastName < b.lastName ? 1 : -1));
  return data;
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
 * Gets all selected expenses
 */
function getSelectedExpensesToReimburse() {
  return _.filter(this.pendingExpenses, (expense) => {
    if (expense.selected) {
      return true;
    }
  });
} // getSelectedExpensesToReimburse

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
    let additionalAttributes = {
      checkBox: {
        all: false,
        indeterminate: false
      },
      selected: false,
      showSwitch: false,
      failed: false
    };
    return _.merge(expense, additionalAttributes);
  });
} // createExpenses

/**
 * Custom sorter for each column in the table.
 * @param items - a users buget item
 * @param index - the index name of the array
 * @param isDesc - true if the sorted is in descending order
 * @return Array - the sorted array
 */
function customSort(items, index, isDesc) {
  if (index[0] === 'employeeName') {
    // sort by last name
    if (!isDesc[0]) {
      items.sort((a, b) => (a.lastName.toUpperCase() > b.lastName.toUpperCase() ? 1 : -1));
    } else {
      items.sort((a, b) => (b.lastName.toUpperCase() > a.lastName.toUpperCase() ? 1 : -1));
    }
  } else if (index[0] === 'cost') {
    // sort by the total expenses per budget
    if (!isDesc[0]) {
      items.sort((a, b) => (getBudgetTotal(a.expenses) > getBudgetTotal(b.expenses) ? 1 : -1));
    } else {
      items.sort((a, b) => (getBudgetTotal(b.expenses) > getBudgetTotal(a.expenses) ? 1 : -1));
    }
  } else {
    // sort alphabetically/numerically
    if (!isDesc[0]) {
      items.sort((a, b) => (a[index] > b[index] ? 1 : -1));
    } else {
      items.sort((a, b) => (b[index] > a[index] ? 1 : -1));
    }
  }
  return items;
} // customSort

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
 * Determine the state of the group toggle based on expenses show on
 * feed toggle
 *
 * @param budget - budget group toggled
 * @return Object - toggle switch
 */
function determineShowSwitch(budget) {
  let showSwitch = true;

  _.forEach(budget.expenses, (expense) => {
    if (!expense.showOnFeed) {
      // at least one of the expenses is not selected to show on feed
      showSwitch = false;
    }
  });

  return showSwitch;
} // determineShowSwitch

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
async function reimburseExpenses() {
  if (this.buttonClicked) {
    // reimburse button is clicked
    let expensesToReimburse = [];
    //this.buttonClicked = false;
    this.reimbursing = true; // set reimbursing status to true

    // get selected expenses and set reimburse date
    this.empBudgets = _.forEach(this.empBudgets, async (budget) => {
      return await _.forEach(budget.expenses, async (expense) => {
        if (expense.selected) {
          //to remove the expense type data in the ExpenseTypeTotal modal
          window.EventBus.$emit('expenseChange', expense);
          expense.reimbursedDate = moment().format('YYYY-MM-DD');
          expensesToReimburse.push(removeAggregateExpenseData(expense));
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
        this.empBudgets[groupIndex].expenses[expenseIndex].reimbursedDate = null;
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
          if (!budgetExpense.selected) {
            budget.showSwitch = determineShowSwitch(budget);
          } else {
            budgetExpense.showOnFeed = expense.showOnFeed;
            budget.showSwitch = determineShowSwitch(budget);
          }
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
 * Toggles show on feed switch for individual expenses
 *
 * @param expense - expense toggled
 */
function toggleShowOnFeed(expense) {
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (expense.key === budget.key) {
      return _.forEach(budget.expenses, (budgetExpense) => {
        if (expense === budgetExpense) {
          budgetExpense.showOnFeed = !budgetExpense.showOnFeed;
        }
      });
    }
  });

  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (expense.key === budget.key) {
      budget.showSwitch = determineShowSwitch(budget);
    }
  });
} // toggleShowOnFeed

/**
 * Toggles show on feed switch for individual expenses
 *
 * @param expense - expense toggled
 */
function determineShowOnFeed(expense) {
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (expense.key === budget.key) {
      budget.showSwitch = determineShowSwitch(budget);
    }
  });
} // determineShowOnFeed

/**
 * Remove additional attributes from the aggregate expense.
 *
 * @param expense - expense data to remove aggregate data from
 * @return Object - simplified expense object
 */
function removeAggregateExpenseData(expense) {
  let localExpense = _.cloneDeep(expense);
  delete localExpense.expenses;
  delete localExpense.checkBox;
  delete localExpense.failed;
  delete localExpense.selected;
  delete localExpense.showSwitch;
  return localExpense;
} // removeAggregateExpenseData

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
 * Toggle show on feed on group of expenses
 *
 * @param value - expense group toggled
 */
function toggleShowOnFeedGroup(value) {
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (value === budget) {
      let check = true;
      for (let i = 0; i < budget.expenses.length; i++) {
        if (!budget.expenses[i].showOnFeed) {
          check = false;
        }
      }
      _.forEach(budget.expenses, (expense) => {
        expense.showOnFeed = !check;
      });
    }
  });

  // set the group check box
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (value === budget) {
      budget.showSwitch = determineShowSwitch(budget);
    }
  });
} // toggleShowOnFeedGroup

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

/**
 * Resets show on feed toggles when page is created
 */
function resetShowOnFeedToggles() {
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    budget.showSwitch = false;
  });
} // resetShowOnFeedToggles

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
  window.EventBus.$on('toggleExpense', this.toggleShowOnFeed);

  //window.EventBus.$on('canceled-reimburse', () => (this.buttonClicked = false));
  window.EventBus.$on('confirm-reimburse', () => this.reimburseExpenses());
  let aggregatedData = await api.getAllAggregateExpenses();

  let allExpenses = createExpenses(aggregatedData);
  this.pendingExpenses = filterOutReimbursed(allExpenses);
  this.constructAutoComplete(this.pendingExpenses);
  this.empBudgets = groupEmployeeExpenses(this.pendingExpenses);
  this.unCheckAllBoxes();
  this.resetShowOnFeedToggles();
  this.loading = false;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  prop: ['confirmReimburse'],
  components: {
    ReimburseModal,
    UnrolledTableInfo
  },
  computed: {
    filteredItems,
    mainCheckBox,
    showReimburseButton,
    getSelectedExpensesToReimburse
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
      },
      {
        text: 'Show on Feed',
        value: 'showOnFeed',
        align: 'center',
        width: '4px',
        sortable: false
      }
    ], // datatable headers
    itemsPerPage: -1, // data table elements per page
    loading: true, // is loading
    pendingExpenses: [], // pending expenses
    reimbursing: false, // is reimbursing
    status: {
      statusType: undefined,
      statusMessage: '',
      color: ''
    } // reimburse status
  }),
  methods: {
    asyncForEach,
    checkAllBoxes,
    clickedRow,
    constructAutoComplete,
    convertToMoneyString,
    customSort,
    determineShowOnFeed,
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
    resetShowOnFeedToggles,
    selectExpense,
    removeAggregateExpenseData,
    toggleAll,
    toggleGroup,
    toggleShowOnFeedGroup,
    toggleShowOnFeed,
    unCheckAllBoxes
  },
  watch: {
    employee: function () {
      //unchecks all checkboxes when filter changes
      this.unCheckAllBoxes();
    },
    expenseType: function () {
      //unchecks all checkboxes when filter changes
      this.unCheckAllBoxes();
    }
  }
};
</script>
