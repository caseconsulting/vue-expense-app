<template>
  <div>
    <v-card>
      <v-container fluid>
        <!-- table header -->
        <v-card-title class="subtitle-1">
          <h2>Unreimbursed Expenses</h2>
          <v-spacer></v-spacer>
          <!-- search filters -->
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
          <!-- end search filters -->
        </v-card-title>
        <!-- end table header -->
        <!-- unreimbursed datatable -->
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :single-expanded="singleExpand"
          :expanded.sync="expanded"
          :loading="loading"
          :items-per-page="-1"
          @click:row="clickedRow"
          show-select
          item-key="key"
          class="elevation-1 text-center"
        >
          <!-- check box in datatable header -->
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
          <!-- end check box in datatable header -->
          <!-- rows in datatable -->
          <template v-slot:item="{ item }">
            <tr @click="clickedRow(item)">
              <!-- checkbox for individual expense -->
              <td style="width: 1px">
                <v-checkbox
                  :input-value="item.checkBox.all"
                  :indeterminate="item.checkBox.indeterminate"
                  primary
                  hide-details
                  @click.stop="toggleGroup(item)"
                  class="ma-0"
                ></v-checkbox>
              </td>
              <td>{{ item.employeeName }}</td>
              <td>{{ item.budgetName }}</td>
              <td id="money-team">{{ getBudgetTotal(item.expenses) | moneyValue }}</td>
            </tr>
          </template>
          <!-- end rows in datatable -->
          <!-- expanded slot in datatable -->
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="pa-0">
              <unrolled-table-info :expenses="item.expenses" @selectExpense="selectExpense"></unrolled-table-info>
            </td>
          </template>
          <!-- end expanded slot in datatable -->
        </v-data-table>
        <!-- end unreimbursed datatable -->
        <!-- reimburse button -->
        <v-flex offset-md10>
          <v-fab-transition class="reimburse_button">
            <v-btn
              @click="button_clicked = true"
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
        <!-- end unreimburse button -->
      </v-container>
      <!-- activate reimburse button -->
      <reimburse-modal :activate="button_clicked"></reimburse-modal>
    </v-card>
  </div>
</template>

<script>
import api from '@/shared/api.js';
//import employeeUtils from '@/shared/employeeUtils';
import UnrolledTableInfo from './UnrolledTableInfo.vue';
import ReimburseModal from './ReimburseModal.vue';
import _ from 'lodash';
const moment = require('moment');

/* methods */

/*
 * Returns true if the reimburse date is reimbursed
 */
function isReimbursed(reimbursedDate) {
  return reimbursedDate && reimbursedDate.trim().length > 0;
}

/*
 *  Maps dataset to objects
 */
function createExpenses(aggregatedData) {
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
      checkBox: {
        all: false,
        indeterminate: false
      },
      selected: false,
      createdAt: expense.createdAt
    };
  });
}

/*
 * Remove reimbursed expenses
 */
function filterOutReimbursed(expenses) {
  return _.filter(expenses, expense => !isReimbursed(expense.reimbursedDate));
}

/*
 * Group expenses with the same employee name and expense type
 */
function groupEmployeeExpenses(expenses) {
  let data = _.forEach(expenses, expense => {
    expense.key = `${expense.userId}${expense.expenseTypeId}`;
  });

  // Create a list of expenses under each group
  data = _.forEach(data, item => {
    return (item.expenses = _.filter(expenses, expense => {
      return matchingEmployeeAndExpenseType(expense, item);
    }));
  });

  data = _.uniqWith(data, (el1, el2) => el1.key === el2.key);

  return data;
}

/*
 * Return true if two items have the same userId and expenseTypeId and not reimbursed
 */
function matchingEmployeeAndExpenseType(expense, item) {
  let reimbursed = isReimbursed(item.reimbursedDate);
  return expense.userId === item.userId && expense.expenseTypeId === item.expenseTypeId && !reimbursed;
}

/*
 * Constructs the auto complete lists for the filters
 */
function constructAutoComplete(aggregatedData) {
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
}

/*
 * Add expense to expanded row when clicked
 */
function clickedRow(value) {
  if (_.isEmpty(this.expanded)) {
    this.expanded.push(value);
  } else {
    this.expanded = [];
  }
}

/*
 * Determine the state of the group check box based on expenses
 */
function determineCheckBox(budget) {
  let checkBox = {
    all: true,
    indeterminate: false
  };

  // determine if all grouped expeneses is selected or not
  _.forEach(budget.expenses, expense => {
    if (!expense.selected) {
      checkBox.all = false;
    }
    if (expense.selected) {
      checkBox.indeterminate = true;
    }
  });

  if (checkBox.all) {
    checkBox.indeterminate = false;
  }
  return checkBox;
}

/*
 * Toggle expenses in a group selected
 */
function toggleGroup(value) {
  // updated group expenses selected
  this.empBudgets = _.forEach(this.empBudgets, budget => {
    if (value === budget) {
      if (determineCheckBox(budget).all) {
        return _.forEach(budget.expenses, expense => {
          emitSelectionChange(expense, false);
          expense.selected = false;
        });
      } else {
        return _.forEach(budget.expenses, expense => {
          emitSelectionChange(expense, true);
          expense.selected = true;
        });
      }
    }
  });

  this.empBudgets = _.forEach(this.empBudgets, budget => {
    if (value === budget) {
      budget.checkBox = determineCheckBox(budget);
    }
  });
}

function emitSelectionChange(expense, newSelect) {
  if (expense.selected != newSelect) {
    window.EventBus.$emit('expenseChange', expense);
  }
}

/*
 * Toggle all expenses selected
 */
function toggleAll() {
  if (!this.mainCheckBox.all) {
    // check all boxes
    this.checkAllBoxes();
  } else {
    // clear all checkboxes
    this.unCheckAllBoxes();
  }
}

/*
 * Check all expenses and boxes
 */
function checkAllBoxes() {
  this.empBudgets = _.forEach(this.empBudgets, budget => {
    budget.checkBox.all = true;
    budget.checkBox.indeterminate = false;
    return _.forEach(budget.expenses, expense => {
      emitSelectionChange(expense, true);
      expense.selected = true;
    });
  });
}

/*
 * Uncheck all expenses and boxes
 */
function unCheckAllBoxes() {
  this.empBudgets = _.forEach(this.empBudgets, budget => {
    budget.checkBox.all = false;
    budget.checkBox.indeterminate = false;
    return _.forEach(budget.expenses, expense => {
      emitSelectionChange(expense, false);
      expense.selected = false;
    });
  });
}

/*
 * Get the total cost of expenses in a group budget
 */
function getBudgetTotal(expenses) {
  let total = 0;
  _.forEach(expenses, expense => (total += expense.cost));
  return total;
}

/*
 * Select an expense
 */
function selectExpense(expense) {
  this.empBudgets = _.forEach(this.empBudgets, budget => {
    if (expense.key === budget.key) {
      return _.forEach(budget.expenses, budgetExpense => {
        if (expense === budgetExpense) {
          budgetExpense.selected = !budgetExpense.selected;
        }
      });
    }
  });

  this.empBudgets = _.forEach(this.empBudgets, budget => {
    if (expense.key === budget.key) {
      budget.checkBox = determineCheckBox(budget);
    }
  });
}

/*
 * Refresh expenses
 */
function refreshExpenses() {
  this.pendingExpenses = [];
  _.forEach(this.empBudgets, budget => {
    _.forEach(budget.expenses, budgetExpense => {
      if (!isReimbursed(budgetExpense.reimbursedDate)) {
        this.pendingExpenses.push(budgetExpense);
      }
    });
  });
  this.empBudgets = groupEmployeeExpenses(this.pendingExpenses);
  this.unCheckAllBoxes();
}

/*
 * Reimburse the selected list of expenses
 */
async function reimburseExpenses() {
  if (this.button_clicked) {
    let expensesToReimburse = [];
    this.button_clicked = false;
    this.reimbursing = true;

    // get selected expenses and set reimburse date
    this.empBudgets = _.forEach(this.empBudgets, async budget => {
      return await _.forEach(budget.expenses, async expense => {
        if (expense.selected) {
          expense.reimbursedDate = moment().format('YYYY-MM-DD');
          expensesToReimburse.push(submitExpenseObject(expense));
        }
      });
    });

    // reimburse expense on back end
    await this.asyncForEach(expensesToReimburse, async expense => {
      await api.updateItem(api.EXPENSES, expense.id, expense);
    });

    this.refreshExpenses();
    this.reimbursing = false;
  }
}

/*
 * Sets up an expense object to be submitted
 */
function submitExpenseObject(expense) {
  return {
    cost: expense.cost,
    description: expense.description,
    expenseTypeId: expense.expenseTypeId,
    id: expense.id,
    purchaseDate: expense.purchaseDate,
    reimbursedDate: expense.reimbursedDate,
    note: !expense.note ? null : expense.note,
    userId: expense.userId,
    receipt: expense.receipt,
    createdAt: expense.createdAt
  };
}

/*
 * Async function to loop an array
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/* computed */

/*
 * Filtered budgets based on employee and/or expense type
 */
function filteredItems() {
  return _.filter(this.empBudgets, budget => {
    if (!this.employee && !this.expenseType) {
      return true;
    } else if (!this.employee && this.expenseType) {
      return budget.expenseTypeId === this.expenseType;
    } else if (!this.expenseType && this.employee) {
      return budget.userId === this.employee;
    } else {
      return budget.userId === this.employee && budget.expenseTypeId === this.expenseType;
    }
  });
}

/*
 * Show the reimburse button if an expense is selected
 */
function showReimburseButton() {
  return this.mainCheckBox.all || this.mainCheckBox.indeterminate;
}

/*
 * State of datatable header check box based on selected expeneses
 */
function mainCheckBox() {
  let checkBox = {
    all: true,
    indeterminate: false
  };

  _.forEach(this.empBudgets, budget => {
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
}

/* LIFECYCLE HOOKS */

async function created() {
  window.EventBus.$on('selectExpense', this.selectExpense);
  window.EventBus.$on('confirm-reimburse', this.reimburseExpenses);
  window.EventBus.$on('canceled-reimburse', () => (this.button_clicked = false));
  let aggregatedData = await api.getAggregate();

  let allExpenses = createExpenses(aggregatedData);
  this.pendingExpenses = filterOutReimbursed(allExpenses);
  this.constructAutoComplete(this.pendingExpenses);
  this.empBudgets = groupEmployeeExpenses(this.pendingExpenses);
  this.unCheckAllBoxes();
  this.loading = false;
}

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
  data: () => ({
    loading: true,
    reimbursing: false,
    button_clicked: false,
    empBudgets: [],
    employees: [], //For autocomplete
    expenseTypes: [], //For autocomplete
    employee: null, //For autocomplete
    expenseType: null, //For autocomplete
    expanded: [],
    pendingExpenses: [],
    singleExpand: true,
    sortBy: 'employeeName',
    sortDesc: false,
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
    ]
  }),
  methods: {
    isReimbursed,
    filterOutReimbursed,
    groupEmployeeExpenses,
    constructAutoComplete,
    clickedRow,
    toggleAll,
    toggleGroup,
    matchingEmployeeAndExpenseType,
    checkAllBoxes,
    unCheckAllBoxes,
    getBudgetTotal,
    selectExpense,
    refreshExpenses,
    emitSelectionChange,
    submitExpenseObject,
    reimburseExpenses,
    asyncForEach
  },
  computed: {
    filteredItems,
    mainCheckBox,
    showReimburseButton
  },
  components: {
    ReimburseModal,
    UnrolledTableInfo
  },
  created
};
</script>
