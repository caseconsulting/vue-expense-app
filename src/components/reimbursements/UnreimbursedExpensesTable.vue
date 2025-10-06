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
                :custom-filter="employeeFilter"
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
              <tags-filter v-model="tagsInfo"></tags-filter>
            </v-col>
          </v-row>
        </v-card-title>

        <!-- START DATA TABLE -->
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :expanded="expanded"
          :loading="loading"
          :v-model="itemsPerPage"
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
          <!-- Budget Name slot -->
          <template v-slot:[`item.budgetName`]="{ item }">
            {{ item.budgetName }}
            {{
              item.expenses?.some((e) => e.category?.toLowerCase() === 'exchange for training hours')
                ? '(Exchange for Training Hours)'
                : ''
            }}</template
          >
          <!-- Show on feed item slot -->
          <template v-slot:[`item.showOnFeed`]="{ item }">
            <v-switch
              :model-value="item.showSwitch && item.selected"
              @click.stop
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
        :selectedReimbursements="getSelectedExpensesToReimburse()"
      ></reimburse-modal>
    </v-card>
  </div>
</template>

<script setup>
import ReimburseModal from '@/components/modals/ReimburseModal.vue';
import UnreimbursedExpensesExpandedTable from '@/components/reimbursements/UnreimbursedExpensesExpandedTable.vue';

import api from '@/shared/api.js';
import _filter from 'lodash/filter';
import _forEach from 'lodash/forEach';
import _some from 'lodash/some';
import _map from 'lodash/map';
import _uniqBy from 'lodash/uniqBy';
import _find from 'lodash/find';
import _merge from 'lodash/merge';
import _uniqWith from 'lodash/uniqWith';
import _get from 'lodash/get';
import _set from 'lodash/set';
import _findIndex from 'lodash/findIndex';
import _cloneDeep from 'lodash/cloneDeep';
import { asyncForEach, convertToMoneyString } from '@/utils/utils';
import { storeIsPopulated } from '@/utils/utils';
import { updateStoreEmployees, updateStoreTags } from '@/utils/storeUtils';
import { getTodaysDate } from '@/shared/dateUtils';
import { employeeFilter } from '@/shared/filterUtils';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
import employeeUtils from '@/shared/employeeUtils';
import { EXPENSE_STATES } from '@/shared/expenseUtils';
import TagsFilter from '@/components/shared/TagsFilter.vue';
import { ref, onBeforeMount, onBeforeUnmount, inject, watch, computed } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const emitter = inject('emitter');
const alerts = ref([]); // status alerts
const buttonClicked = ref(false); // reimburse button clicked
const empBudgets = ref([]); // grouped employee and expense types
const employee = ref(null); // employee autocomplete filter
const employees = ref([]); // employee autocomplete options
const expanded = ref([]); // datatable expanded
const expenseType = ref(null); // expense type autocomplete filter
const expenseTypes = ref([]); // expense type autocomplete options
const headers = ref([
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
]); // datatable headers
const isGeneratingGiftCard = ref(false);
const itemsPerPage = ref(-1); // data table elements per page
const loading = ref(true); // is loading
const pendingExpenses = ref([]); // pending expenses
const tagsInfo = ref({
  selected: [],
  flipped: []
});

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Sets the aggregated expeneses and datatable. Creates event listeners.
 */
onBeforeMount(async () => {
  emitter.on('selectExpense', selectExpense);
  emitter.on('toggleExpense', toggleShowOnFeed);
  emitter.on('confirm-reimburse', async () => await reimburseExpenses());
  emitter.on('cancel-reimburse', () => (buttonClicked.value = false));
  emitter.on('confirm-expenses-rejection', async ({ field, reason }) => await rejectExpenses(field, reason));
  emitter.on('reimburse-expenses', (isGeneratingAGiftCard) => {
    buttonClicked.value = true;
    isGeneratingGiftCard.value = isGeneratingAGiftCard;
  });

  let unreimbursedExpenses;
  [unreimbursedExpenses, expenseTypes.value] = await Promise.all([
    api.getUnreimbursedExpenses(),
    api.getItems(api.EXPENSE_TYPES),
    !store.getters.employees ? updateStoreEmployees() : '',
    !store.getters.tags ? updateStoreTags() : ''
  ]);
  loadExpensesData(unreimbursedExpenses);
}); // created

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('selectExpense');
  emitter.off('toggleExpense');
  emitter.off('confirm-reimburse');
  emitter.off('cancel-reimburse');
  emitter.off('confirm-expenses-rejection');
  emitter.off('reimburse-expenses');
}); //beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

computed(storeIsPopulated);

/**
 * Filter budgets based on employee and/or expense type. Returns budget if the employee and expense type match.
 *
 * @return Array - filtered budgets
 */
const filteredItems = computed(() => {
  let data = empBudgets.value;
  data = _filter(data, (budget) => {
    if (tagsInfo.value.selected.length == 0) return true;
    return selectedTagsHasEmployee(budget.employeeId, tagsInfo.value);
  });
  data = _filter(data, (budget) => {
    if (!employee.value && !expenseType.value) {
      return true;
    } else if (!employee.value && expenseType.value) {
      return budget.expenseTypeId === expenseType.value;
    } else if (!expenseType.value && employee.value) {
      return budget.employeeId === employee.value;
    } else {
      return budget.employeeId === employee.value && budget.expenseTypeId === expenseType.value;
    }
  });
  data.sort((a, b) => (a.lastName < b.lastName ? 1 : -1));
  return data;
}); // filteredItems

/**
 * Gets all selected expenses
 *
 * @return array - the filtered pending expenses that are just selected
 */
function getSelectedExpensesToReimburse() {
  return _filter(pendingExpenses.value, (expense) => {
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
const mainCheckBox = computed(() => {
  let checkBox = {
    all: true,
    indeterminate: false
  };

  _forEach(empBudgets.value, (budget) => {
    if (_some(budget.expenses, { selected: false })) {
      checkBox.all = false;
    }
    if (_some(budget.expenses, { selected: true })) {
      checkBox.indeterminate = true;
    }
  });

  if (checkBox.all) {
    checkBox.indeterminate = false;
  }
  return checkBox;
}); // mainCheckBox

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Check all expenses and boxes.
 */
function checkAllBoxes() {
  _forEach(filteredItems.value, (budget) => {
    budget.checkBox.all = true;
    budget.checkBox.indeterminate = false;
    return _forEach(budget.expenses, (expense) => {
      emitSelectionChange(expense, true);
      expense.selected = true;
      determineShowOnFeed(expense);
    });
  });
} // checkAllBoxes

/**
 * Constructs the auto complete lists for the employee and expense type filter.
 *
 * @param aggregatedData - expenses data
 */
function constructAutoComplete(aggregatedData) {
  // set employees
  employees.value = _map(aggregatedData, (data) => {
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
  employees.value = _uniqBy(employees.value, (e) => e.value);
  // set expense types
  expenseTypes.value = _map(aggregatedData, (data) => {
    if (data && data.budgetName && data.expenseTypeId) {
      return {
        text: data.budgetName,
        value: data.expenseTypeId
      };
    }
  }).filter((data) => {
    return data != null;
  });
  expenseTypes.value = _uniqBy(expenseTypes.value, (e) => e.value);
} // constructAutoComplete

/**
 *  Maps dataset to expenses.
 *
 * @param aggregatedData - data
 * @return Array - List of aggregated expenses
 */
function createExpenses(aggregatedData) {
  return _map(aggregatedData, (expense) => {
    let additionalAttributes = {
      checkBox: {
        all: false,
        indeterminate: false
      },
      selected: false,
      showSwitch: false,
      failed: false
    };
    const employees = store.getters.employees;
    let employee = _find(employees, (emp) => emp.id === expense.employeeId);
    let expenseType = _find(expenseTypes.value, (expenseType) => expenseType.id === expense.expenseTypeId);
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
      const giver = _find(employees, (e) => {
        return e.id === expense.employeeId;
      });
      // get the high fivee
      const recipient = _find(employees, (e) => {
        return e.id === expense.recipient;
      });
      if (giver && recipient) {
        expense.description = `${employeeUtils.nicknameAndLastName(giver)} gave ${employeeUtils.nicknameAndLastName(
          recipient
        )} a High Five`;
      }
    }
    return _merge(expense, additionalAttributes);
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
  _forEach(budget.expenses, (expense) => {
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

  _forEach(budget.expenses, (expense) => {
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
    emitter.emit('expenseChange', expense);
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
  _forEach(expenses, (expense) => (total += expense.cost));
  return total;
} // getBudgetTotal

/**
 * Group expenses with the same employee name and expense type.
 *
 * @param expenses - list of expenses
 * @return Array - list of grouped expenses
 */
function groupEmployeeExpenses(expenses) {
  let data = _forEach(expenses, (expense) => {
    expense.key = `${expense.employeeId}${expense.expenseTypeId}`;
  });

  // Create a list of expenses under each group
  data = _forEach(data, (item) => {
    return (item.expenses = _filter(expenses, (expense) => {
      return matchingEmployeeAndExpenseType(expense, item);
    }));
  });

  data = _uniqWith(data, (el1, el2) => el1.key === el2.key);

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
 * Refresh expenses.
 */
function refreshExpenses() {
  pendingExpenses.value = [];
  _forEach(empBudgets.value, (budget) => {
    _forEach(budget.expenses, (budgetExpense) => {
      if (!budgetExpense.reimbursedDate) {
        pendingExpenses.value.push(budgetExpense);
      }
    });
  });
  pendingExpenses.value = getNonRejectedExpenses(pendingExpenses.value);
  empBudgets.value = groupEmployeeExpenses(pendingExpenses.value);
  unCheckAllBoxes();
} // refreshExpenses

/**
 * Rejects selected expenses with a reasoning provided. Soft rejected expenses will not be shown on the
 * Reimbursments page until the user has resubmitted an expense. Hard rejected expenses will never show
 * on the Reimbursements page again.
 *
 * @param {String} field - The reject property in the expense
 * @param {String} reason - The reasoning for expense rejection
 */
async function rejectExpenses(field, reason) {
  loading.value = true;
  let selectedExpenses = _filter(pendingExpenses.value, (e) => e.selected);
  await asyncForEach(selectedExpenses, async (expense) => {
    // to remove the expense type data in the ExpenseTypeTotal modal
    emitter.emit('expenseChange', expense);
    emitter.emit('expenseClicked', undefined);
    // set reasoning in rejection object
    let reasons = _get(expense, field + '.reasons');
    reasons = [...(reasons || []), reason];
    let hard = field.includes('hard'); // eg "rejections.hardRejections"
    _set(expense, field + '.reasons', reasons);
    _set(expense, field + '.revised', false);
    _set(expense, 'state', hard ? EXPENSE_STATES.REJECTED : EXPENSE_STATES.RETURNED);
    let baseExpense = removeAggregateExpenseData(expense);
    let rejectedExpense = await api.updateItem(api.EXPENSES, baseExpense);
    if (!rejectedExpense.id) {
      // failed to reject expense
      let msg = rejectedExpense?.response?.data?.message || 'Failed to reject expense';
      alerts.value.push({ status: 'error', message: msg, color: 'red' });
    } else {
      // successfully rejected expense
      let msg = 'Successfully rejected expense';
      alerts.value.push({ status: 'success', message: msg, color: 'green' });
    }
    setTimeout(() => alerts.value.shift(), 10000);
    emitter.emit('reimburseAlert', alerts.value);
  });
  refreshExpenses();
  loading.value = false;
} // rejectExpenses

/**
 * Reimburse the selected list of expenses.
 */
async function reimburseExpenses() {
  loading.value = true;
  // reimburse button is clicked
  buttonClicked.value = false;
  let expensesToReimburse = [];

  // get selected expenses and set reimburse date
  empBudgets.value = _forEach(empBudgets.value, (budget) => {
    return _forEach(budget.expenses, (expense) => {
      if (expense.selected) {
        //to remove the expense type data in the ExpenseTypeTotal modal
        emitter.emit('expenseChange', expense);
        emitter.emit('expenseClicked', undefined);
        expense.reimbursedDate = getTodaysDate();
        expense.reimbursementWasSeen = false;
        expense.state = EXPENSE_STATES.REIMBURSED;
        expensesToReimburse.push(removeAggregateExpenseData(expense));
      }
    });
  });

  // reimburse expense on back end
  await asyncForEach(expensesToReimburse, async (expense) => {
    let expenseType = _find(expenseTypes.value, (et) => et.value === expense.expenseTypeId);
    let isHighFive = !!expenseType && expenseType.text === 'High Five';
    let reimbursedExpense;
    if (isHighFive && isGeneratingGiftCard.value) {
      reimbursedExpense = await api.processHighFive(expense);
    } else {
      reimbursedExpense = await api.updateItem(api.EXPENSES, expense);
    }
    let msg;
    if (!reimbursedExpense.id) {
      // failed to reimburse expense
      msg = reimbursedExpense.response.data.message;
      alerts.value.push({ status: 'error', message: msg, color: 'red' });
      setTimeout(() => alerts.value.shift(), 20000);

      // revert reimburse date change
      let groupIndex = _findIndex(empBudgets.value, {
        employeeId: expense.employeeId,
        expenseTypeId: expense.expenseTypeId
      });
      let expenseIndex = _findIndex(empBudgets.value[groupIndex].expenses, { id: expense.id });
      empBudgets.value[groupIndex].expenses[expenseIndex].reimbursedDate = null;
      empBudgets.value[groupIndex].expenses[expenseIndex].failed = true;
      empBudgets.value[groupIndex].expenses[expenseIndex].selected = false;
    } else {
      // successfully reimbursed expense
      msg = 'Successfully reimbursed expense';
      if (isHighFive && isGeneratingGiftCard.value) {
        msg += `, generated gift card, ${
          reimbursedExpense.emailSent
            ? 'and emailed recipient gift card information.'
            : 'but FAILED to email recipient gift card information'
        }`;
      }
      alerts.value.push({ status: 'success', message: msg, color: 'green' });
      setTimeout(() => alerts.value.shift(), 15000);
    }
    emitter.emit('reimburseAlert', alerts.value);
  });

  refreshExpenses();
  loading.value = false; // set reimbursing status to false
} // reimburseExpenses

/**
 * Select an expense and change check box status.
 *
 * @param expense - expense selected
 */
function selectExpense(expense) {
  empBudgets.value = _forEach(empBudgets.value, (budget) => {
    if (expense.key === budget.key) {
      return _forEach(budget.expenses, (budgetExpense) => {
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

  empBudgets.value = _forEach(empBudgets.value, (budget) => {
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
  empBudgets.value = _forEach(empBudgets.value, (budget) => {
    if (expense.key === budget.key) {
      return _forEach(budget.expenses, (budgetExpense) => {
        if (expense === budgetExpense) {
          budgetExpense.showOnFeed = !budgetExpense.showOnFeed;
        }
      });
    }
  });

  empBudgets.value = _forEach(empBudgets.value, (budget) => {
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
  empBudgets.value = _forEach(empBudgets.value, (budget) => {
    if (expense.key === budget.key) {
      budget.showSwitch = determineShowSwitch(budget);
    }
  });
} // determineShowOnFeed

/**
 * Gets unreimbursed expenses that have not been rejected, or expenses that have been rejected and revised.
 *
 * @param unreimbursedExpenses Array - The array of unreimbursed expenses
 * @returns Array - The array of unreimbursed, non-rejected expenses
 */
function getNonRejectedExpenses(unreimbursedExpenses) {
  return _filter(unreimbursedExpenses, (expense) => {
    let rejections = expense.rejections;
    return !(
      rejections?.hardRejections?.reasons?.length > 0 ||
      (rejections?.softRejections?.reasons?.length > 0 && !rejections?.softRejections?.revised)
    );
  });
} // getNonRejectedExpenses

/**
 * Loads and organizes all data relevant to the data table.
 */
function loadExpensesData(unreimbursedExpenses) {
  pendingExpenses.value = getNonRejectedExpenses(unreimbursedExpenses);
  pendingExpenses.value = createExpenses(pendingExpenses.value);
  constructAutoComplete(pendingExpenses.value);
  empBudgets.value = groupEmployeeExpenses(pendingExpenses.value);
  unCheckAllBoxes();
  resetShowOnFeedToggles();
  loading.value = false;
} // loadExpensesData

/**
 * Remove additional attributes from the aggregate expense.
 *
 * @param expense - expense data to remove aggregate data from
 * @return Object - simplified expense object
 */
function removeAggregateExpenseData(expense) {
  let localExpense = _cloneDeep(expense);
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
  empBudgets.value = _forEach(empBudgets.value, (budget) => {
    budget.showSwitch = false;
  });
} // resetShowOnFeedToggles

/**
 * Toggle all expenses selected.
 */
function toggleAll() {
  if (!mainCheckBox.value.all && !mainCheckBox.value.indeterminate) {
    // check all boxes
    checkAllBoxes();
  } else if (mainCheckBox.value.all && !mainCheckBox.value.indeterminate) {
    // clear all checkboxes
    mainCheckBox.value.all = false;
    unCheckAllBoxes();
  } else if (!mainCheckBox.value.all && mainCheckBox.value.indeterminate) {
    checkAllBoxes();
  }
} // toggleAll

/**
 * Toggle expenses in a group selected.
 *
 * @param value - expense group selected
 */
function toggleGroup(value) {
  // updated group expenses selected
  empBudgets.value = _forEach(empBudgets.value, (budget) => {
    if (value === budget) {
      // matching budget
      if (determineCheckBox(budget).all) {
        // unselect all expenses
        return _forEach(budget.expenses, (expense) => {
          emitSelectionChange(expense, false);
          expense.selected = false;
        });
      } else {
        // select all expenses
        return _forEach(budget.expenses, (expense) => {
          emitSelectionChange(expense, true);
          expense.selected = true;
        });
      }
    }
  });

  // set the group check box
  empBudgets.value = _forEach(empBudgets.value, (budget) => {
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
  empBudgets.value = _forEach(empBudgets.value, (budget) => {
    if (value === budget) {
      let check = true;
      for (let i = 0; i < budget.expenses.length; i++) {
        if (!budget.expenses[i].showOnFeed) {
          check = false;
        }
      }
      _forEach(budget.expenses, (expense) => {
        expense.showOnFeed = !check;
      });
    }
  });

  // set the group check box
  empBudgets.value = _forEach(empBudgets.value, (budget) => {
    if (value === budget) {
      budget.showSwitch = determineShowSwitch(budget);
    }
  });
} // toggleShowOnFeedGroup

/**
 * Uncheck all expenses and boxes
 */
function unCheckAllBoxes() {
  _forEach(filteredItems.value, (budget) => {
    budget.checkBox.all = false;
    budget.checkBox.indeterminate = false;
    return _forEach(budget.expenses, (expense) => {
      emitSelectionChange(expense, false);
      expense.selected = false;
    });
  });
} // unCheckAllBoxes

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(employee, () => watchEmployee());

/**
 * watcher for employee
 */
function watchEmployee() {
  //unchecks all checkboxes when filter changes
  unCheckAllBoxes();
} // watchEmployee

watch(expenseType, () => watchExpenseType());

/**
 * watcher for expenseType
 */
function watchExpenseType() {
  //unchecks all checkboxes when filter changes
  unCheckAllBoxes();
} // watchExpenseType
</script>

<style>
.v-data-table-header__content {
  font-size: 13px;
  font-weight: bold;
}
</style>
