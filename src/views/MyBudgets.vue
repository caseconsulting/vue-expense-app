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
    <v-col v-if="!isMobile" cols="12" lg="8">
      <v-row class="mt-3" style="height: 100%" align="center" justify="center">
        <h1 v-if="!loading && hasAccessToBudgets">
          Budget Statistics for {{ employee.firstName }} {{ employee.lastName }}
        </h1>
        <h1 v-else>No Budgets Available for {{ employee.firstName }} {{ employee.lastName }}</h1>
      </v-row>
    </v-col>

    <!-- Anniversary Date -->
    <v-col cols="12" lg="4" v-if="!isMobile">
      <anniversary-card
        v-if="!loading"
        :employee="employee"
        :hasAccessToBudgets="hasAccessToBudgets"
      ></anniversary-card>
    </v-col>

    <!-- Expense Data -->
    <v-col cols="12" lg="8">
      <v-container v-if="!displayChart">
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
          v-if="!loading"
          class="my-3"
          :employee="employee"
          :fiscalDateView="fiscalDateView"
          @rendered="displayChart = !displayChart"
        ></budget-table>
        <budget-chart
          v-if="!loading && !isMobile && !adminCall && displayChart && hasAccessToBudgets"
          :employee="employee"
          :fiscalDateView="fiscalDateView"
        ></budget-chart>
      </div>
    </v-col>

    <!-- Expense Form-->
    <v-col v-if="employ == null && !isInactive && viewingCurrentBudgetYear" cols="12" lg="4">
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
import MobileDetect from 'mobile-detect';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import { asyncForEach, isInactive, isFullTime } from '@/utils/utils';

const IsoFormat = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the current device used is mobile. Return true if it is mobile. Returns false if it is not mobile.
 *
 * @return boolean - if the device is mobile
 */
function isMobile() {
  let md = new MobileDetect(window.navigator.userAgent);
  return md.os() === 'AndroidOS' || md.os() === 'iOS';
} // isMobile

/**
 * Viewing the current active budget year. Returns true if the budget year being viwed is todays budget.
 *
 * @return boolean - viewing the current active year budget
 */
function viewingCurrentBudgetYear() {
  return this.fiscalDateView == this.getCurrentBudgetYear();
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
async function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
} // displayError

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
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  this.loading = true; // set loading status to true
  this.displayChart = false;
  if (this.employ == null) {
    // set the employee to the selected employee if viewing from an admin view
    this.employee = await api.getUser();
  } else {
    // set the employee to the current user if viewing from a user view
    this.employee = this.employ;
  }

  let accessibleBudgets = await api.getAllActiveEmployeeBudgets(this.employee.id);
  if (accessibleBudgets.length == 0) {
    // does not have access to any budgets
    this.hasAccessToBudgets = false; // disable budget chart
  }
  this.hireDate = this.employee.hireDate;
  this.fiscalDateView = this.getCurrentBudgetYear();
  this.loading = false; // set loading status to false
} // refreshEmployee

/**
 * Set and display a successful submit status in the snackbar.
 */
async function showSuccessfulSubmit() {
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully submitted!');
  this.$set(this.status, 'color', 'green');
} // showSuccessfulSubmit

/**
 * Updates the budget data and display a successful submit.
 */
async function updateData() {
  this.refreshEmployee();
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
  window.EventBus.$on('updateData', this.updateData);

  window.EventBus.$on('selected-budget-year', (data) => {
    if (data.format(IsoFormat) != this.fiscalDateView) {
      this.fiscalDateView = data.format(IsoFormat);
    }
  });
  this.refreshEmployee();
} // created

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
    isInactive,
    isMobile,
    viewingCurrentBudgetYear
  },
  created,
  data() {
    return {
      displayChart: false,
      employee: null, // employee
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
      fiscalDateView: '', // current budget year view by anniversary day
      hasAccessToBudgets: true, // user has access to one or more budgets
      hireDate: '', // employee hire date
      loading: false, // loading status
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      } // snackbar action status
    };
  },
  methods: {
    asyncForEach,
    clearStatus,
    displayError,
    getCurrentBudgetYear,
    isFullTime,
    refreshEmployee,
    showSuccessfulSubmit,
    updateData
  },
  props: {
    adminCall: {
      default: null
    }, // admin employee view
    employ: {
      default: null
    } // employee (admin employee view)
  },
  watch: {
    employ: function () {
      this.refreshEmployee();
    }
  }
};
</script>
