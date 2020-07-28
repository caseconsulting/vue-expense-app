<template v-slot="{ active }">
  <div id="available-budgets">
    <v-card>
      <v-card-title class="header_style">
        <router-link to="/myBudgets" style="text-decoration: none;">
          <h3 id="link" class="white--text px-2">
            Available Budgets
          </h3>
        </router-link>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <div v-if="this.loading" class="pb-4">
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
              class="px-1"
              :dense="true"
              >{{ budget.expenseTypeName }}:
              <v-spacer></v-spacer>
              <p v-if="noRemaining(budget)">{{ calcRemaining(budget) | moneyValue }}</p>
              <p v-else>{{ calcRemaining(budget) | moneyValue }}</p>
            </v-list-item>
            <div style="height: 20px;"></div>
            <!-- End Loop all budgets -->
            <router-link v-if="this.fiscalDateView" to="/myExpenses" style="text-decoration: none;">
              <button class="home_buttons">Create an Expense</button>
            </router-link>
            <v-file-input
              style="padding-top: 0px; padding-bottom: 0px;"
              label="Create an Expense from Receipt"
              s
              @change="reroute()"
              :dense="true"
              :single-line="true"
            ></v-file-input>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <available-budget-summary :activator="showDialog" :selectedBudget="selectedBudget"></available-budget-summary>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import AvailableBudgetSummary from '@/components/AvailableBudgetSummary.vue';
import _ from 'lodash';
import moment from 'moment-timezone';
import router from '../router.js';
const IsoFormat = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function reroute() {
  router.push({ path: '/myExpenses' });
}

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

async function created() {
  window.EventBus.$on('close-summary', () => {
    this.showDialog = false;
  });
  await this.refreshEmployee();
  this.loading = false;
} // created

/**
 * Gets the current active anniversary budget year starting date in isoformat.
 *
 * @return String - current active anniversary budget date (YYYY-MM-DD)
 */
function getCurrentBudgetYear() {
  let currentBudgetYear = moment(this.hireDate, IsoFormat);
  if (moment().isAfter(currentBudgetYear)) {
    currentBudgetYear.year(moment().year());
    if (moment().isBefore(currentBudgetYear)) {
      currentBudgetYear = currentBudgetYear.subtract(1, 'years');
    }
  }
  return currentBudgetYear.format(IsoFormat);
} // getCurrentBudgetYear

/**
 * Determines if a budget has no remaining budget. Returns true if the budget is zero or negative. False otherwise.
 *
 * @param budget - budget to check
 * @return boolean - budget has no remaining budget
 */
function noRemaining(budget) {
  return this.calcRemaining(budget) <= 0 && !budget.odFlag;
} // noRemaining

/**
 * Refresh and sets the aggregated budgets for the employee budget year view.
 */
async function refreshBudget() {
  let budgetsVar;

  if (this.date == this.getCurrentBudgetYear()) {
    // viewing active budget year
    budgetsVar = await api.getAllActiveEmployeeBudgets(this.employee.id);
  }

  // get existing budgets for the budget year being viewed
  let existingBudgets = await api.getFiscalDateViewBudgets(this.employee.id, this.date);

  // append inactive tag to end of budget expense type name
  // the existing budget duplicates will later be removed (order in array comes after active budgets)
  _.forEach(existingBudgets, (budget) => {
    budget.expenseTypeName += ' (Inactive)';
  });

  budgetsVar = _.union(budgetsVar, existingBudgets); // combine existing and active budgets
  budgetsVar = _.uniqBy(budgetsVar, 'expenseTypeId'); // remove duplicate expense types
  budgetsVar = _.sortBy(budgetsVar, (budget) => {
    return budget.expenseTypeName;
  }); // sort by expense type name

  // remove any budgets where budget amount is 0 and 0 total expenses
  this.budgets = _.filter(budgetsVar, (data) => {
    let budget = data.budgetObject;
    return budget.amount != 0 || budget.reimbursedAmount != 0 || budget.pendingAmount != 0;
  });

  this.refreshBudgetYears(); // refresh the budget year view options
} // refreshBudget

/**
 * Refresh and sets the budget year view options for the employee.
 */
function refreshBudgetYears() {
  let budgetYears = [];

  // push all employee budget years
  let budgetDates = _.uniqBy(_.map(this.allUserBudgets, 'fiscalStartDate'));
  budgetDates.forEach((date) => {
    const [year] = date.split('-');
    budgetYears.push(parseInt(year));
  });

  // push active budget year
  let [currYear] = this.getCurrentBudgetYear().split('-');
  budgetYears.push(parseInt(currYear));

  // remove duplicate years and filter to include only active and previous years
  budgetYears = _.filter(_.uniqBy(budgetYears), (year) => {
    return parseInt(year) <= parseInt(currYear);
  });

  this.budgetYears = _.reverse(_.sortBy(budgetYears)); // sort budgets from current to past
} // refreshBudgetYears

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  this.date = this.fiscalDateView;
  this.hireDate = this.employee.hireDate;
  if (!this.date) {
    this.date = this.getCurrentBudgetYear();
  }
  await this.refreshBudget(); // refresh employee budgets
  this.allUserBudgets = await api.getEmployeeBudgets(this.employee.id); // set all employee budgets
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
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    AvailableBudgetSummary
  },
  created,
  data() {
    return {
      active: false,
      allUserBudgets: [],
      budgets: [],
      budgetYears: [],
      date: '',
      hireDate: '',
      loading: true,
      selectedBudget: null,
      showDialog: false
    };
  },
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
    calcRemaining,
    getCurrentBudgetYear,
    noRemaining,
    refreshBudget,
    refreshBudgetYears,
    refreshEmployee,
    reroute,
    selectBudget
  },
  props: ['employee', 'fiscalDateView']
};
</script>
<style>
#link:hover {
  font-size: 20px;
}
</style>
