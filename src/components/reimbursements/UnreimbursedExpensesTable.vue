<template>
  <div>
    <v-card class="mt-3">
      <v-container fluid>
        <!-- Table Header -->
        <v-card-title class="pb-0">
          <h3>Unreimbursed Expenses</h3>
          <v-spacer></v-spacer>

          <!-- Search Filters -->
          <v-autocomplete
            :items="employees"
            :filter="customFilter"
            v-model="employee"
            id="filterEmployee"
            class="mr-3"
            item-text="text"
            label="Filter by Employee"
            clearable
          ></v-autocomplete>
          <v-autocomplete
            :items="expenseTypes"
            v-model="expenseType"
            id="filterExpense"
            item-text="text"
            class="mr-3"
            label="Filter by Expense Type"
            clearable
          ></v-autocomplete>
        </v-card-title>
        <v-card-title v-if="userRoleIsAdmin() || userRoleIsManager()" class="pt-0">
          <v-autocomplete
            class="d-inline-block"
            clearable
            label="Filter by Tag (click to flip)"
            v-model="selectedTags"
            :items="tags"
            multiple
            variant="solo-filled"
            item-color="gray"
            item-text="tagName"
            item-value="id"
            return-object
          >
            <template v-slot:selection="data">
              <v-chip
                small
                close
                @click.stop
                @click="negateTag(data.item)"
                @click:close="removeTag(data.item)"
                :color="chipColor(data.item.id)"
              >
                {{ tagFlip.includes(data.item.id) ? 'NOT ' : '' }}
                {{ data.item.tagName }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-card-title>

        <!-- START DATA TABLE -->
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :custom-sort="customSort"
          :expanded.sync="expanded"
          :loading="loading"
          :items-per-page.sync="itemsPerPage"
          show-select
          item-key="key"
          class="text-center"
          @click:row="clickedRow"
        >
          <!-- Select item slot in data table -->
          <template v-slot:[`item.data-table-select`]="{ item }">
            <v-checkbox
              :input-value="item.checkBox.all"
              :indeterminate="item.checkBox.indeterminate"
              primary
              hide-details
              @click.stop="
                toggleGroup(item);
                determineShowOnFeed(item);
              "
              class="itemCheckbox ma-0"
            >
            </v-checkbox>
          </template>
          <!-- Employee Name slot -->
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
          <!-- Show on feed item slot -->
          <template v-slot:[`item.showOnFeed`]="{ item }">
            <v-switch
              :input-value="item.showSwitch && item.selected"
              @click.native.stop
              @change="toggleShowOnFeedGroup(item)"
              :disabled="!item.checkBox.all"
            ></v-switch>
          </template>
          <!-- Item cost slot -->
          <template v-slot:[`item.cost`]="{ item }">
            <p id="totalMoney-team" class="mb-0">{{ convertToMoneyString(getBudgetTotal(item.expenses)) }}</p>
          </template>
          <!-- Header select slot -->
          <template v-slot:[`header.data-table-select`]>
            <v-checkbox
              class="ma-0"
              :input-value="mainCheckBox.all"
              :indeterminate="mainCheckBox.indeterminate"
              primary
              hide-details
              @click.stop="toggleAll"
            >
            </v-checkbox>
          </template>
          <!-- Expanded slot -->
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="pa-0">
              <unreimbursed-expenses-expanded-table
                :expenses="item.expenses"
                @toggleExpense="toggleShowOnFeed"
                @selectExpense="selectExpense"
              ></unreimbursed-expenses-expanded-table>
            </td>
          </template>
        </v-data-table>
        <!-- END DATA TABLE -->

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
            <v-icon>mdi-currency-usd</v-icon>
          </v-btn>
        </v-fab-transition>
      </v-container>

      <!-- Reimburse Modal -->
      <reimburse-modal
        :toggleReimburseModal="buttonClicked"
        :selectedReimbursements="getSelectedExpensesToReimburse"
      ></reimburse-modal>
    </v-card>
  </div>
</template>

<script>
import ReimburseModal from '@/components/modals/ReimburseModal.vue';
import UnreimbursedExpensesExpandedTable from '@/components/reimbursements/UnreimbursedExpensesExpandedTable.vue';

import api from '@/shared/api.js';
import _ from 'lodash';
import {
  asyncForEach,
  isEmpty,
  convertToMoneyString,
  userRoleIsAdmin,
  userRoleIsManager,
  updateEmployeeLogin
} from '@/utils/utils';
import { storeIsPopulated } from '@/utils/utils';
import { updateStoreEmployees, updateStoreTags } from '@/utils/storeUtils';
import { getTodaysDate } from '@/shared/dateUtils';
import employeeUtils from '@/shared/employeeUtils';

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
  let data = this.empBudgets;
  data = _.filter(data, (budget) => {
    if (this.selectedTags.length == 0) return true;
    return this.selectedTagsHasEmployee(budget.employeeId);
  });
  data = _.filter(data, (budget) => {
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
 * Gets all selected expenses
 *
 * @return array - the filtered pending expenses that are just selected
 */
function getSelectedExpensesToReimburse() {
  return _.filter(this.pendingExpenses, (expense) => {
    if (expense.selected) {
      return true;
    }
  });
} // getSelectedExpensesToReimburse

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
 * Check all expenses and boxes.
 */
function checkAllBoxes() {
  _.forEach(this.filteredItems, (budget) => {
    budget.checkBox.all = true;
    budget.checkBox.indeterminate = false;
    return _.forEach(budget.expenses, (expense) => {
      this.emitSelectionChange(expense, true);
      expense.selected = true;
      this.determineShowOnFeed(expense);
    });
  });
} // checkAllBoxes

/**
 * Returns the color that at tag filter chip should be
 *
 * @param id ID of the tag item
 *
 */
function chipColor(id) {
  return this.tagFlip.includes(id) ? 'red' : 'gray';
} // chipColor

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
        value: data.employeeId,
        nickname: data.nickname,
        firstName: data.firstName,
        lastName: data.lastName
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
 * @return Array - List of aggregated expenses
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
    const employees = this.$store.getters.employees;
    let employee = _.find(employees, (emp) => emp.id === expense.employeeId);
    let expenseType = _.find(this.expenseTypes, (expenseType) => expenseType.id === expense.expenseTypeId);
    expense.budgetName = expenseType.budgetName;
    expense.employeeName = employeeUtils.firstAndLastName(employee);
    expense.firstName = employee.firstName;
    expense.middleName = employee.middleName;
    expense.lastName = employee.lastName;
    expense.campfire = expenseType.campfire;
    expense.nickname = employee.nickname;
    // high fives should have a dynamic description
    if (expense.budgetName == 'High Five') {
      // get high fiver
      const giver = _.find(employees, (e) => {
        return e.id === expense.employeeId;
      });
      // get the high fivee
      const recipient = _.find(employees, (e) => {
        return e.id === expense.recipient;
      });
      if (giver && recipient) {
        expense.description = `
      ${employeeUtils.nicknameAndLastName(giver)} gave
      ${employeeUtils.nicknameAndLastName(recipient)} a High Five`;
      }
    }
    return _.merge(expense, additionalAttributes);
  });
} // createExpenses

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item - the employee
 * @param queryText - the text used for checking for query in the name of the employee
 * @return boolean - true if the query is in the name with or without nickname
 */
function customFilter(item, queryText) {
  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;

  return queryContainsNickName || queryContainsFirstName;
} // customFilter

/**
 * Custom sorter for each column in the table.
 *
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
      items.sort((a, b) => (this.getBudgetTotal(a.expenses) > this.getBudgetTotal(b.expenses) ? 1 : -1));
    } else {
      items.sort((a, b) => (this.getBudgetTotal(b.expenses) > this.getBudgetTotal(a.expenses) ? 1 : -1));
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
      return this.matchingEmployeeAndExpenseType(expense, item);
    }));
  });

  data = _.uniqWith(data, (el1, el2) => el1.key === el2.key);

  return data;
} // groupEmployeeExpenses

/**
 * Return true if two items have the same employeeId and expenseTypeId and not reimbursed.
 *
 * @param expense - first expense to compare
 * @param item - other expense to compare
 * @return boolean - item not reimbursed and employee and expense type match
 */
function matchingEmployeeAndExpenseType(expense, item) {
  return expense.employeeId === item.employeeId && expense.expenseTypeId === item.expenseTypeId;
} // matchingEmployeeAndExpenseType

/**
 * negates a tag
 */
function negateTag(item) {
  // try to find the id in the tagFlip array, if it is there then remove it else add it
  const index = this.tagFlip.indexOf(item.id);
  if (index >= 0) {
    this.tagFlip.splice(index, 1);
  } else {
    this.tagFlip.push(item.id);
  }
} // negateTag

/**
 * Refresh expenses.
 */
function refreshExpenses() {
  this.pendingExpenses = [];
  _.forEach(this.empBudgets, (budget) => {
    _.forEach(budget.expenses, (budgetExpense) => {
      if (!budgetExpense.reimbursedDate) {
        this.pendingExpenses.push(budgetExpense);
      }
    });
  });
  this.empBudgets = this.groupEmployeeExpenses(this.pendingExpenses);
  this.unCheckAllBoxes();
} // refreshExpenses

/**
 * Removes an item from the tag filters's active filters
 *
 * @param item - The filter to remove
 */
function removeTag(item) {
  const selIndex = this.selectedTags.findIndex((t) => t.id === item.id);
  if (selIndex >= 0) {
    this.selectedTags.splice(selIndex, 1);
  }
} // removeTag

/**
 * Reimburse the selected list of expenses.
 */
async function reimburseExpenses() {
  // reimburse button is clicked
  let expensesToReimburse = [];
  //this.buttonClicked = false;
  this.reimbursing = true; // set reimbursing status to true

  // get selected expenses and set reimburse date
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    return _.forEach(budget.expenses, (expense) => {
      if (expense.selected) {
        //to remove the expense type data in the ExpenseTypeTotal modal
        window.EventBus.$emit('expenseChange', expense);
        window.EventBus.$emit('expenseClicked', undefined);
        expense.reimbursedDate = getTodaysDate();
        expense.reimbursementWasSeen = false;
        expensesToReimburse.push(this.removeAggregateExpenseData(expense));
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
      this.empBudgets[groupIndex].expenses[expenseIndex].selected = false;
    } else {
      // successfully reimbursed expense
      msg = 'Successfully reimbursed expense';
      this.alerts.push({ status: 'success', message: msg, color: 'green' });
      let self = this;
      setTimeout(function () {
        self.alerts.shift();
      }, 10000);
    }
    window.EventBus.$emit('reimburseAlert', this.alerts);
  });

  this.refreshExpenses();
  this.reimbursing = false; // set reimbursing status to false
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
            budget.showSwitch = this.determineShowSwitch(budget);
          } else {
            budgetExpense.showOnFeed = expense.showOnFeed;
            budget.showSwitch = this.determineShowSwitch(budget);
          }
        }
      });
    }
  });

  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (expense.key === budget.key) {
      budget.checkBox = this.determineCheckBox(budget);
    }
  });
} // selectExpense

/**
 * helper function: return true if any selected tag has employee listed under it.
 *
 * @param e - the employee
 * @return true if the employee has a tag selected in filters
 */
function selectedTagsHasEmployee(eId) {
  let inTag, tagFlipped;
  for (let i = 0; i < this.selectedTags.length; i++) {
    inTag = this.selectedTags[i].employees.includes(eId);
    tagFlipped = this.tagFlip.includes(this.selectedTags[i].id);
    if (inTag != tagFlipped) {
      return true;
    }
  }
  return false;
} // selectedTagsHasEmployee

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
      budget.showSwitch = this.determineShowSwitch(budget);
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
      budget.showSwitch = this.determineShowSwitch(budget);
    }
  });
} // determineShowOnFeed

/**
 * Loads and organizes all data relevant to the data table.
 */
function loadExpensesData(unreimbursedExpenses) {
  this.pendingExpenses = this.createExpenses(unreimbursedExpenses);
  this.constructAutoComplete(this.pendingExpenses);
  this.empBudgets = this.groupEmployeeExpenses(this.pendingExpenses);
  this.unCheckAllBoxes();
  this.resetShowOnFeedToggles();
  this.loading = false;
} // loadExpensesData

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
 * Resets show on feed toggles when page is created
 */
function resetShowOnFeedToggles() {
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    budget.showSwitch = false;
  });
} // resetShowOnFeedToggles

/**
 * Toggle all expenses selected.
 */
function toggleAll() {
  if (!this.mainCheckBox.all && !this.mainCheckBox.indeterminate) {
    // check all boxes
    this.checkAllBoxes();
  } else if (this.mainCheckBox.all && !this.mainCheckBox.indeterminate) {
    // clear all checkboxes
    this.unCheckAllBoxes();
  } else if (!this.mainCheckBox.all && this.mainCheckBox.indeterminate) {
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
      if (this.determineCheckBox(budget).all) {
        // unselect all expenses
        return _.forEach(budget.expenses, (expense) => {
          this.emitSelectionChange(expense, false);
          expense.selected = false;
        });
      } else {
        // select all expenses
        return _.forEach(budget.expenses, (expense) => {
          this.emitSelectionChange(expense, true);
          expense.selected = true;
        });
      }
    }
  });

  // set the group check box
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    if (value === budget) {
      budget.checkBox = this.determineCheckBox(budget);
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
      budget.showSwitch = this.determineShowSwitch(budget);
    }
  });
} // toggleShowOnFeedGroup

/**
 * Uncheck all expenses and boxes
 */
function unCheckAllBoxes() {
  _.forEach(this.filteredItems, (budget) => {
    budget.checkBox.all = false;
    budget.checkBox.indeterminate = false;
    return _.forEach(budget.expenses, (expense) => {
      this.emitSelectionChange(expense, false);
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
  window.EventBus.$on('toggleExpense', this.toggleShowOnFeed);

  //window.EventBus.$on('canceled-reimburse', () => (this.buttonClicked = false));
  window.EventBus.$on('confirm-reimburse', async () => await this.reimburseExpenses());
  let unreimbursedExpenses;
  [unreimbursedExpenses, this.expenseTypes] = await Promise.all([
    api.getUnreimbursedExpenses(),
    api.getItems(api.EXPENSE_TYPES),
    !this.$store.getters.employees ? this.updateStoreEmployees() : '',
    !this.$store.getters.tags ? this.updateStoreTags() : ''
  ]);
  this.loadExpensesData(unreimbursedExpenses);
  if (this.$store.getters.loginTime) {
    // updates and audits employee login for admins
    await this.updateEmployeeLogin(this.$store.getters.user);
  }
  this.tags = this.$store.getters.tags; // get the tags
} // created

/**
 * beforeDestroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('selectExpense');
  window.EventBus.$off('toggleExpense');
  window.EventBus.$off('confirm-reimburse');
} //beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for employee
 */
function watchEmployee() {
  //unchecks all checkboxes when filter changes
  this.unCheckAllBoxes();
} // watchEmployee

/**
 * watcher for expenseType
 */
function watchExpenseType() {
  //unchecks all checkboxes when filter changes
  this.unCheckAllBoxes();
} // watchExpenseType

/**
 * wacher for selectedTags
 */
function watchSelectedTags() {
  let negatedTagRemoved = true;
  // use normal for loop to have the index
  for (let i = 0; i < this.tagFlip.length; i++) {
    // try to find the current tag in the selectedTags
    _.forEach(this.selectedTags, (t) => {
      if (t.id === this.tagFlip[i]) negatedTagRemoved = false;
    });
    // if it isn't there, remove it from tagFlip too
    if (negatedTagRemoved) {
      this.tagFlip.splice(i, 1);
    }
  }
} // watchSelectedTags

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  beforeDestroy,
  components: {
    ReimburseModal,
    UnreimbursedExpensesExpandedTable
  },
  computed: {
    filteredItems,
    getSelectedExpensesToReimburse,
    mainCheckBox,
    showReimburseButton,
    storeIsPopulated
  },
  data: () => ({
    aggregatedData: [],
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
    }, // reimburse
    selectedTags: [],
    tags: [],
    tagFlip: []
  }),
  methods: {
    asyncForEach,
    checkAllBoxes,
    chipColor,
    clickedRow,
    constructAutoComplete,
    convertToMoneyString,
    createExpenses,
    customFilter,
    customSort,
    determineCheckBox,
    determineShowOnFeed,
    determineShowSwitch,
    emitSelectionChange,
    getBudgetTotal,
    groupEmployeeExpenses,
    isEmpty,
    loadExpensesData,
    negateTag,
    matchingEmployeeAndExpenseType,
    removeTag,
    refreshExpenses,
    reimburseExpenses,
    resetShowOnFeedToggles,
    selectExpense,
    removeAggregateExpenseData,
    getTodaysDate,
    selectedTagsHasEmployee,
    toggleAll,
    toggleGroup,
    toggleShowOnFeedGroup,
    toggleShowOnFeed,
    unCheckAllBoxes,
    updateEmployeeLogin,
    updateStoreEmployees,
    updateStoreTags,
    userRoleIsAdmin,
    userRoleIsManager
  },
  watch: {
    employee: watchEmployee,
    expenseType: watchExpenseType,
    selectedTags: watchSelectedTags
  }
};
</script>
