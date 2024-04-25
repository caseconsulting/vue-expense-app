<template>
  <div>
    <v-card class="mt-3">
      <v-container fluid class="px-0 px-md-4">
        <!-- Table Header -->
        <v-card-title class="pb-0">
          <h3>Unreimbursed Expenses</h3>
          <v-spacer></v-spacer>

          <v-row>
            <v-col cols="6" md="4" lg="4" xl="4" xxl="4">
              <!-- Search Filters -->
              <v-autocomplete
                :items="employees"
                :customFilter="customFilter"
                v-model="employee"
                id="filterEmployee"
                class="mr-3"
                item-title="text"
                label="Filter by Employee"
                variant="underlined"
                hide-details
                clearable
              ></v-autocomplete>
            </v-col>
            <v-col cols="6" md="4" lg="4" xl="4" xxl="4">
              <v-autocomplete
                :items="expenseTypes"
                v-model="expenseType"
                id="filterExpense"
                item-title="text"
                item-value="value"
                class="mr-3"
                label="Filter by Expense Type"
                variant="underlined"
                hide-details
                clearable
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="4" lg="4" xl="4" xxl="4">
              <v-autocomplete
                clearable
                label="Filter by Tag (click to flip)"
                v-model="selectedTags"
                :items="tags"
                multiple
                variant="underlined"
                item-title="tagName"
                item-value="id"
                return-object
              >
                <template v-slot:selection="{ item }">
                  <v-chip
                    size="small"
                    closable
                    @click.stop
                    @click="negateTag(item.raw)"
                    @click:close="removeTag(item.raw)"
                    :color="chipColor(item.raw.id)"
                  >
                    {{ tagFlip.includes(item.raw.id) ? 'NOT ' : '' }}
                    {{ item.raw.tagName }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-card-title>

        <!-- START DATA TABLE -->
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :expanded="expanded"
          :loading="loading"
          :items-per-page.sync="itemsPerPage"
          show-select
          expand-on-click
          class="text-center"
        >
          <!-- Header select slot -->
          <template v-slot:[`header.data-table-select`]>
            <v-checkbox
              class="ma-0"
              :model-value="mainCheckBox.all"
              :indeterminate="mainCheckBox.indeterminate"
              :color="caseGray"
              hide-details
              @click="toggleAll"
            >
            </v-checkbox>
          </template>
          <!-- Select item slot in data table -->
          <template v-slot:[`item.data-table-select`]="{ item }">
            <v-checkbox
              :model-value="item.checkBox.all"
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
          <template v-slot:[`item.employeeName`]="{ item }">
            <v-badge
              v-if="item.expenses.length > 1"
              :content="item.expenses.length"
              location="left"
              inline
              color="grey"
            ></v-badge>
            {{ item.employeeName }}</template
          >
          <!-- Employee Name slot -->
          <template v-slot:[`item.budgetName`]="{ item }">
            {{ item.budgetName }}
            {{
              item.expenses?.some((e) => e.category === 'Exchange for training hours')
                ? '(Exchange for training hours)'
                : ''
            }}</template
          >
          <!-- Show on feed item slot -->
          <template v-slot:[`item.showOnFeed`]="{ item }">
            <v-switch
              :model-value="item.showSwitch && item.selected"
              @click.native.stop
              @update:model-value="toggleShowOnFeedGroup(item)"
              :disabled="!item.checkBox.all"
              :color="caseGray"
              class="d-inline-block"
              hide-details
            ></v-switch>
          </template>
          <!-- Item cost slot -->
          <template v-slot:[`item.cost`]="{ item }">
            <p id="totalMoney-team" class="mb-0">{{ convertToMoneyString(getBudgetTotal(item.expenses)) }}</p>
          </template>
          <!-- Expanded slot -->
          <template v-slot:expanded-row="{ columns, item }">
            <td :colspan="columns.length" class="pa-0">
              <unreimbursed-expenses-expanded-table
                :expenses="item.expenses"
                @toggleExpense="toggleShowOnFeed"
                @selectExpense="selectExpense"
              ></unreimbursed-expenses-expanded-table>
            </td>
          </template>
        </v-data-table>
        <!-- END DATA TABLE -->
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
import { asyncForEach, isEmpty, convertToMoneyString, userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
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
  console.log(data);
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
  this.employees = _.uniqBy(this.employees, (e) => e.value);
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
  this.expenseTypes = _.uniqBy(this.expenseTypes, (e) => e.value);
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
        expense.description = `${employeeUtils.nicknameAndLastName(giver)} gave ${employeeUtils.nicknameAndLastName(
          recipient
        )} a High Five`;
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
function customFilter(_, queryText, item) {
  item = item.raw;
  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;

  return queryContainsNickName || queryContainsFirstName;
} // customFilter

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
    this.emitter.emit('expenseChange', expense);
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
  this.loading = true;
  // reimburse button is clicked
  this.buttonClicked = false;
  let expensesToReimburse = [];

  // get selected expenses and set reimburse date
  this.empBudgets = _.forEach(this.empBudgets, (budget) => {
    return _.forEach(budget.expenses, (expense) => {
      if (expense.selected) {
        //to remove the expense type data in the ExpenseTypeTotal modal
        this.emitter.emit('expenseChange', expense);
        this.emitter.emit('expenseClicked', undefined);
        expense.reimbursedDate = getTodaysDate();
        expense.reimbursementWasSeen = false;
        expensesToReimburse.push(this.removeAggregateExpenseData(expense));
      }
    });
  });

  // reimburse expense on back end
  await this.asyncForEach(expensesToReimburse, async (expense) => {
    let expenseType = _.find(this.expenseTypes, (et) => et.value === expense.expenseTypeId);
    let isHighFive = !!expenseType && expenseType.text === 'High Five';
    let reimbursedExpense;
    if (isHighFive && this.isGeneratingGiftCard) {
      reimbursedExpense = await api.processHighFive(expense);
    } else {
      reimbursedExpense = await api.updateItem(api.EXPENSES, expense);
    }
    let msg;
    if (!reimbursedExpense.id) {
      // failed to reimburse expense
      msg = reimbursedExpense.response.data.message;
      this.alerts.push({ status: 'error', message: msg, color: 'red' });
      let self = this;
      setTimeout(function () {
        self.alerts.shift();
      }, 20000);

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
      if (isHighFive && this.isGeneratingGiftCard) {
        msg += `, generated gift card, ${
          reimbursedExpense.emailSent
            ? 'and emailed recipient gift card information.'
            : 'but FAILED to email recipient gift card information'
        }`;
      }
      this.alerts.push({ status: 'success', message: msg, color: 'green' });
      let self = this;
      setTimeout(function () {
        self.alerts.shift();
      }, 15000);
    }
    this.emitter.emit('reimburseAlert', this.alerts);
  });

  this.refreshExpenses();
  this.emitter.emit('finished-reimbursing');
  this.loading = false; // set reimbursing status to false
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
    this.mainCheckBox.all = false;
    this.unCheckAllBoxes();
  } else if (!this.mainCheckBox.all && this.mainCheckBox.indeterminate) {
    this.checkAllBoxes();
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
  this.emitter.on('selectExpense', this.selectExpense);
  this.emitter.on('toggleExpense', this.toggleShowOnFeed);
  this.emitter.on('confirm-reimburse', async () => await this.reimburseExpenses());
  this.emitter.on('cancel-reimburse', () => (this.buttonClicked = false));
  this.emitter.on('reimburse-expenses', (isGeneratingGiftCard) => {
    this.buttonClicked = true;
    this.isGeneratingGiftCard = isGeneratingGiftCard;
  });

  let unreimbursedExpenses;
  [unreimbursedExpenses, this.expenseTypes] = await Promise.all([
    api.getUnreimbursedExpenses(),
    api.getItems(api.EXPENSE_TYPES),
    !this.$store.getters.employees ? this.updateStoreEmployees() : '',
    !this.$store.getters.tags ? this.updateStoreTags() : ''
  ]);
  this.tags = this.$store.getters.tags; // get the tags
  this.loadExpensesData(unreimbursedExpenses);
} // created

/**
 * beforeUnmount lifecycle hook
 */
function beforeUnmount() {
  this.emitter.off('selectExpense');
  this.emitter.off('toggleExpense');
  this.emitter.off('confirm-reimburse');
  this.emitter.off('cancel-reimburse');
  this.emitter.off('reimburse-expenses');
} //beforeUnmount

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
  beforeUnmount,
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
        title: 'Employee',
        key: 'employeeName',
        align: 'center'
      },
      {
        title: 'Expense Type',
        key: 'budgetName',
        align: 'center'
      },
      {
        title: 'Total',
        key: 'cost',
        align: 'center'
      },
      {
        title: 'Show on Feed',
        key: 'showOnFeed',
        align: 'center',
        width: '10%',
        sortable: false
      }
    ], // datatable headers
    isGeneratingGiftCard: false,
    itemsPerPage: -1, // data table elements per page
    loading: true, // is loading
    pendingExpenses: [], // pending expenses
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
    constructAutoComplete,
    convertToMoneyString,
    createExpenses,
    customFilter,
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

<style>
.v-data-table-header__content {
  font-size: 13px;
  font-weight: bold;
}
</style>
