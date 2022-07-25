<template>
  <v-row>
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      :right="true"
      :timeout="5000"
      :top="true"
      :vertical="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" text @click="clearStatus">Close</v-btn>
    </v-snackbar>

    <!-- Title -->
    <v-col v-if="!loading && !isMobile" cols="12" lg="8">
      <v-row class="mt-3" align="center" justify="center" v-if="hasAccessToBudgets">
        <h1>Budget Statistics for {{ employee.firstName }} {{ employee.lastName }}</h1>
      </v-row>
      <v-row class="mt-3" align="center" justify="center" v-else>
        <h1>No Budgets Available for {{ employee.firstName }} {{ employee.lastName }}</h1>
      </v-row>
    </v-col>

    <!-- Anniversary Date -->
    <v-col cols="12" lg="4" v-if="!isMobile">
      <anniversary-card v-if="!loading" :employee="employee" :hasBudgets="hasAccessToBudgets"></anniversary-card>
    </v-col>

    <!-- Expense Data -->
    <v-col cols="12" lg="8">
      <v-container v-if="loading">
        <v-row>
          <v-col v-for="index in 4" :key="index" cols="12" sm="6" lg="6">
            <v-skeleton-loader class="my-3" type="card-heading, list-item@6"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-skeleton-loader class="my-3" type="card-heading, list-item@6"></v-skeleton-loader>
      </v-container>
      <div v-if="!loading" text-center class="pt-0 font-13">
        <!-- The @rendered event is to ensure that budget chart renders after the table -->
        <budget-table
          class="my-3"
          :employee="employee"
          :accessibleBudgets="accessibleBudgets"
          :expenses="expenses"
          :expenseTypes="expenseTypes"
          :fiscalDateView="fiscalDateView"
        ></budget-table>
        <budget-chart
          v-if="!isMobile && hasAccessToBudgets"
          :accessibleBudgets="accessibleBudgets"
          :employee="employee"
          :expenses="expenses"
          :expenseTypes="expenseTypes"
          :fiscalDateView="fiscalDateView"
        ></budget-chart>
      </div>
    </v-col>

    <!-- Expense Form-->
    <v-col v-if="viewingCurrentBudgetYear" cols="12" lg="4">
      <div text-center>
        <expense-form :expense="expense" v-on:error="displayError"></expense-form>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import api from '@/shared/api.js';
import BudgetChart from '@/components/BudgetChart.vue';
import BudgetTable from '@/components/BudgetTable.vue';
import ExpenseForm from '@/components/ExpenseForm.vue';
import AnniversaryCard from '@/components/AnniversaryCard.vue';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import { isMobile, getCurrentBudgetYear } from '@/utils/utils';
import { updateStoreBudgets, updateStoreEmployees, updateStoreExpenseTypes, updateStoreUser } from '@/utils/storeUtils';

const IsoFormat = 'YYYY-MM-DD';

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
 * Viewing the current active budget year. Returns true if the budget year being viwed is todays budget.
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
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
} // clearStatus

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err - String error message
 */
function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
} // displayError

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  this.employee = this.$store.getters.user;
  [this.expenses] = await Promise.all([
    api.getAllEmployeeExpenses(this.employee.id),
    !this.$store.getters.budgets ? this.updateStoreBudgets() : '',
    !this.$store.getters.expenseTypes ? this.updateStoreExpenseTypes() : '',
    this.employee.employeeRole === 'admin' && !this.$store.getters.employees ? this.updateStoreEmployees() : ''
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
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully submitted!');
  this.$set(this.status, 'color', 'green');
} // showSuccessfulSubmit

/**
 * Updates the budget data and display a successful submit.
 */
async function updateData() {
  this.displayChart = false;
  await this.refreshEmployee();
  this.showSuccessfulSubmit();
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

  window.EventBus.$on('updateData', async () => {
    await this.updateData();
  });

  window.EventBus.$on('selected-budget-year', (data) => {
    if (data.format(IsoFormat) != this.fiscalDateView) {
      this.fiscalDateView = data.format(IsoFormat);
    }
  });

  window.EventBus.$on('confirmSubmit', async () => {
    // expense submitted, refresh budgets for page
  });
} // created

/**
 * beforeDestroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('updateData');
  window.EventBus.$off('selected-budget-year');
} //beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher of employ - refresh employee
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
  computed: {
    isMobile,
    storeIsPopulated,
    viewingCurrentBudgetYear
  },
  created,
  beforeDestroy,
  data() {
    return {
      displayChart: false,
      employee: null, // employee
      accessibleBudgets: null,
      expense: {
        id: '',
        purchaseDate: null,
        reimbursedDate: null,
        note: null,
        url: null,
        createdAt: null,
        receipt: null,
        cost: '',
        description: '',
        employeeId: '',
        expenseTypeId: '',
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
  },
  props: {
    employ: {
      default: null
    } // employee (admin employee view)
  },
  watch: {
    employ: watchEmploy,
    async storeIsPopulated() {
      if (this.$store.getters.storeIsPopulated) {
        await this.refreshEmployee();
      }
    }
  }
};
</script>
