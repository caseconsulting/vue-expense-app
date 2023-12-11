<template v-slot="{ active }">
  <div id="available-budgets">
    <v-card>
      <v-card-title class="d-flex align-center header_style">
        <router-link class="no-decoration" v-if="isUser" to="/myBudgets">
          <h3 id="link" class="text-white px-2">Available Budgets</h3>
        </router-link>
        <h3 v-else class="text-white px-2">Available Budgets</h3>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 text-black">
        <div v-if="this.loading || employeeDataLoading" class="pb-4">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <div v-else>
          <!-- If no avaible budgets -->
          <div v-if="budgets.length == 0">
            <v-row justify="center">
              <p>No available budgets</p>
            </v-row>
          </div>
          <div v-else>
            <!-- Loop all budgets -->
            <v-list-item
              v-for="budget in budgets"
              :key="budget.expenseTypeId"
              @click="selectBudget(budget)"
              class="px-1 py-2"
              density="compact"
            >
              <div class="d-flex justify-space-between">
                <span>{{ budget.expenseTypeName }}:</span>
                <v-spacer></v-spacer>
                <span>{{ convertToMoneyString(calcRemaining(budget)) }}</span>
              </div>
            </v-list-item>
            <div class="mt-2"></div>
            <!-- End Loop all budgets -->
            <div class="d-flex justify-center align-center">
              <router-link v-if="this.fiscalDateView" to="/myExpenses" class="no-decoration center">
                <button class="home_buttons" @click="selectReceipt = true">Create an Expense</button>
              </router-link>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <available-budget-summary :activator="showDialog" :selectedBudget="selectedBudget"></available-budget-summary>
  </div>
</template>

<script>
import _ from 'lodash';
import api from '@/shared/api.js';
import AvailableBudgetSummary from '@/components/shared/AvailableBudgetSummary.vue';
import { convertToMoneyString, getCurrentBudgetYear, isFullTime } from '@/utils/utils';
import { getTodaysDate, getYear, isBetween } from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |               LIFECYCLE HOOKS                    |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
async function created() {
  this.emitter.on('close-summary', () => {
    this.showDialog = false;
  });
  this.currentUser = this.$store.getters.user;
  if (this.accessibleBudgets) {
    await this.refreshEmployee();
  }
  this.loading = false;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Calculates how much of a budget is remaining. Returns the remaining amount if it exists. Returns zero if the budget
 * itself does not exist.
 *
 * @param budget - aggregate budget
 * @return int - remaining budget
 */
function calcRemaining(budget) {
  if (budget.budgetObject) {
    return Math.max(
      budget.budgetObject.amount - budget.budgetObject.pendingAmount - budget.budgetObject.reimbursedAmount,
      0
    );
  }
  return 0;
} // calcRemaining

/**
 * beforeUnmount lifecycle hook
 */
function beforeUnmount() {
  this.emitter.off('close-summary');
} //beforeUnmount

/**
 * Refresh and sets the aggregated budgets for the employee budget year view.
 */
async function refreshBudget() {
  let budgetsVar;
  let existingBudgets;

  if (this.fiscalDateView == this.getCurrentBudgetYear(this.hireDate)) {
    // viewing active budget year
    budgetsVar = this.accessibleBudgets;
  } else {
    // get existing budgets for the budget year being viewed
    existingBudgets = await api.getFiscalDateViewBudgets(this.employee.id, this.fiscalDateView);
    existingBudgets = _.filter(existingBudgets, (e) => !!e);
    budgetsVar = existingBudgets;
  }

  // remove inactive budgets
  budgetsVar = _.filter(budgetsVar, (b) => {
    let budget = b.budgetObject;
    return !_.some(
      this.expenseTypes,
      (e) =>
        e.id == b.expenseTypeId &&
        (e.isInactive ||
          !isBetween(
            this.getYear(this.fiscalDateView),
            getYear(budget.fiscalStartDate),
            getYear(budget.fiscalEndDate),
            'year',
            '[]'
          ))
    );
  });
  budgetsVar = _.sortBy(budgetsVar, (budget) => {
    return budget.expenseTypeName;
  }); // sort by expense type name

  // prohibit overdraft if employee is not full time
  _.forEach(budgetsVar, async (budget) => {
    if (!this.isFullTime(this.employee)) {
      budget.odFlag = false;
    }
    let bObj = budget.budgetObject;
    if (!isBetween(getTodaysDate(), bObj.fiscalStartDate, bObj.fiscalEndDate, 'day', '[]')) {
      budget.expenseTypeName += ' (inactive)';
    }
  });

  // filter out diplicate expense types
  budgetsVar = _.uniqBy(budgetsVar, 'expenseTypeId');

  // remove any budgets where budget amount is 0 and 0 total expenses
  this.budgets = _.filter(budgetsVar, (data) => {
    let budget = data.budgetObject;
    return budget.amount != 0 || budget.reimbursedAmount != 0 || budget.pendingAmount != 0;
  });
} // refreshBudget

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  this.date = this.fiscalDateView;
  this.hireDate = this.employee.hireDate;
  if (!this.date) {
    this.date = this.getCurrentBudgetYear(this.hireDate);
  }
  let [allUserBudgets] = await Promise.all([api.getEmployeeBudgets(this.employee.id), this.refreshBudget()]);
  this.allUserBudgets = allUserBudgets;
} // refreshEmployee

/**
 * Selects the budget for the dialog box.
 *
 * @param budget - budget
 */
function selectBudget(budget) {
  this.selectedBudget = budget;
  this.showDialog = true;
} // selectBudget

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * returns as true if the current signed in user has the same id as the employee prop
 *
 * @return boolean - current signed in user has the same id as the employee prop
 */
function isUser() {
  return this.employee && this.currentUser && this.employee.id == this.currentUser.id;
} // isUser

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * When the accessible budgets change refresh to employee to show changes.
 */
async function watchAccessibleBudgets() {
  await this.refreshEmployee();
} // watchAccessibleBudgets

/**
 * watcher for fiscalDateView - refresh budgets and draw graph
 */
async function watchFiscalDateView() {
  await this.refreshBudget();
} // watchFiscalDateView

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    AvailableBudgetSummary
  },
  created,
  beforeUnmount,
  data() {
    return {
      active: false,
      allUserBudgets: [],
      budgets: [],
      budgetYears: [],
      currentUser: null,
      date: '',
      hireDate: '',
      loading: true,
      newFile: undefined,
      selectedBudget: null,
      selectReceipt: false,
      showDialog: false
    };
  },
  computed: {
    isUser
  },
  methods: {
    calcRemaining,
    convertToMoneyString,
    getCurrentBudgetYear,
    getTodaysDate,
    getYear,
    isFullTime,
    refreshBudget,
    refreshEmployee,
    selectBudget
  },
  props: ['employee', 'expenseTypes', 'accessibleBudgets', 'fiscalDateView', 'employeeDataLoading'],
  watch: {
    accessibleBudgets: watchAccessibleBudgets,
    fiscalDateView: watchFiscalDateView
  }
};
</script>

<style scoped>
#link::after {
  content: '';
  display: block;
  width: 0;
  height: 1px;
  background: #fff;
  transition: width 0.3s ease-in;
}

#link:hover::after {
  width: 100%;
}
</style>
