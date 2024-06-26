<template>
  <v-container fluid>
    <v-row>
      <!-- Status Alert -->
      <v-snackbar
        v-model="status.statusType"
        :color="status.color"
        :multi-line="true"
        location="top right"
        :timeout="5000"
        :vertical="true"
      >
        <v-card-text headline color="white">
          <span class="text-h6 font-weight-medium">{{ status.statusMessage }}</span>
        </v-card-text>
        <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
      </v-snackbar>

      <!-- Title -->
      <v-col cols="12" lg="8" class="d-flex justify-center align-center">
        <div v-if="!loading" :class="isMobile ? 'center' : ''">
          <h1 v-if="hasAccessToBudgets">My Budgets</h1>
          <h1 v-else>No Budgets Available for {{ employee.nickname || employee.firstName }} {{ employee.lastName }}</h1>
        </div>
        <v-skeleton-loader v-else-if="loading && !isMobile" type="text" width="90%" />
      </v-col>

      <!-- Anniversary Date -->
      <v-col cols="12" lg="4">
        <div v-if="!loading && !isMobile">
          <anniversary-card :employee="employee" emit-catcher="my-budgets" :has-budgets="hasAccessToBudgets" />
        </div>
        <div v-else-if="loading && !isMobile">
          <!-- This has to be in a v-col because of padding that comes from the anniversary card v-col. Without the v-col, the loader is off-->
          <v-skeleton-loader type="list-item" />
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Budget Cards -->
      <v-col cols="12" lg="8">
        <div v-if="loading">
          <v-row>
            <v-col v-for="index in 4" :key="index" cols="12" sm="6" lg="6">
              <v-skeleton-loader type="list-item@6" />
            </v-col>
          </v-row>
        </div>
        <div v-if="!loading" text-center class="pt-0 font-13">
          <budget-table
            :employee="employee"
            :accessible-budgets="accessibleBudgets"
            :expenses="expenses"
            :expense-types="expenseTypes"
            :fiscal-date-view="fiscalDateView"
          />
        </div>
      </v-col>
      <!-- Expense Form-->
      <v-col cols="12" lg="4">
        <div v-if="loading">
          <v-skeleton-loader type="list-item@12" />
        </div>
        <div v-else-if="!loading && viewingCurrentBudgetYear">
          <expense-form :expense="expense" />
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div v-if="loading">
          <v-skeleton-loader type="list-item@3" />
        </div>
        <div v-if="!isMobile && hasAccessToBudgets">
          <budget-chart
            :accessible-budgets="accessibleBudgets"
            :employee="employee"
            :expenses="expenses"
            :expense-types="expenseTypes"
            :fiscal-date-view="fiscalDateView"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/shared/api.js';
import BudgetChart from '@/components/charts/custom-charts/BudgetChart.vue';
import BudgetTable from '@/components/budgets/BudgetTable.vue';
import ExpenseForm from '@/components/expenses/ExpenseForm.vue';
import AnniversaryCard from '@/components/shared/AnniversaryCard.vue';
import { isMobile, getCurrentBudgetYear } from '@/utils/utils';
import { updateStoreBudgets, updateStoreEmployees, updateStoreExpenseTypes, updateStoreUser } from '@/utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the store is populated from initial page load.
 *
 * @returns boolean - True if the store is populated
 */
function storeIsPopulated() {
  return this.$store.getters.storeIsPopulated;
} // storeIsPopulated

/**
 * Viewing the current active budget year. Returns true if the
 * budget year being viwed is todays budget.
 *
 * @return boolean - viewing the current active year budget
 */
function viewingCurrentBudgetYear() {
  return this.fiscalDateView == this.getCurrentBudgetYear(this.hireDate);
} // viewingCurrentBudgetYear

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.status['statusType'] = undefined;
  this.status['statusMessage'] = '';
  this.status['color'] = '';
} // clearStatus

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err - String error message
 */
function displayError(err) {
  this.status['statusType'] = 'ERROR';
  this.status['statusMessage'] = err;
  this.status['color'] = 'red';
} // displayError

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  this.loading = true;
  this.employee = this.$store.getters.user;
  [this.expenses] = await Promise.all([
    api.getAllEmployeeExpenses(this.employee.id),
    !this.$store.getters.budgets ? this.updateStoreBudgets() : '',
    !this.$store.getters.expenseTypes ? this.updateStoreExpenseTypes() : '',
    !this.$store.getters.employees ? this.updateStoreEmployees() : ''
  ]);
  this.accessibleBudgets = this.$store.getters.budgets;
  this.expenseTypes = this.$store.getters.expenseTypes;

  this.hireDate = this.employee.hireDate;
  this.fiscalDateView = this.getCurrentBudgetYear(this.hireDate);

  // does not have access to any budgets disable budget chart
  this.accessibleBudgets.length > 0 ? (this.hasAccessToBudgets = true) : '';
  this.loading = false;
} // refreshEmployee

/**
 * Set and display a successful submit status in the snackbar.
 */
function showSuccessfulSubmit() {
  this.status['statusType'] = 'SUCCESS';
  this.status['statusMessage'] = 'Item was successfully submitted!';
  this.status['color'] = 'green';
} // showSuccessfulSubmit

/**
 * Updates the budget data and display a successful submit.
 */
async function updateData() {
  this.displayChart = false;
  await this.refreshEmployee();
  if (this.status['statusType'] !== 'ERROR') {
    this.showSuccessfulSubmit();
  }
} // updateData

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget charts and information for employee. Creates event listeners.
 */
async function created() {
  if (this.$store.getters.storeIsPopulated) {
    await this.refreshEmployee();
  }

  this.emitter.on('error', (msg) => {
    this.displayError(msg);
  });

  this.emitter.on('updateData', async () => {
    await this.updateData();
  });

  this.emitter.on('change-budget-year-my-budgets', (date) => {
    if (date != this.fiscalDateView) {
      this.fiscalDateView = date;
    }
  });
} // created

/**
 * beforeUnmount lifecycle hook.
 */
function beforeUnmount() {
  this.emitter.off('updateData');
  this.emitter.off('change-budget-year-my-budgets');
  this.emitter.off('error');
} // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher of employ - refresh employee.
 */
async function watchEmploy() {
  await this.refreshEmployee();
} // watchEmploy

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    BudgetChart,
    BudgetTable,
    ExpenseForm,
    AnniversaryCard
  },
  props: {
    employ: {
      default: null
    } // employee (admin employee view)
  },
  data() {
    return {
      displayChart: false,
      employee: null, // employee
      accessibleBudgets: null,
      expense: {
        id: null,
        purchaseDate: null,
        reimbursedDate: null,
        note: null,
        url: null,
        createdAt: null,
        receipt: null,
        cost: null,
        description: null,
        employeeId: null,
        expenseTypeId: null,
        category: null,
        showOnFeed: false,
        employeeName: null,
        budgetName: null
      }, // blank expense for the expense form
      expenses: null,
      expenseTypes: null,
      fiscalDateView: '', // current budget year view by anniversary day
      hasAccessToBudgets: false, // user has access to one or more budgets
      hireDate: '', // employee hire date
      loading: true, // loading status
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      } // snackbar action status
    };
  },
  computed: {
    isMobile,
    storeIsPopulated,
    viewingCurrentBudgetYear
  },
  watch: {
    employ: watchEmploy,
    async storeIsPopulated() {
      if (this.$store.getters.storeIsPopulated) {
        await this.refreshEmployee();
      }
    }
  },
  created,
  beforeUnmount,
  methods: {
    clearStatus,
    displayError,
    getCurrentBudgetYear,
    refreshEmployee,
    showSuccessfulSubmit,
    updateData,
    updateStoreBudgets,
    updateStoreEmployees,
    updateStoreExpenseTypes,
    updateStoreUser
  }
};
</script>
