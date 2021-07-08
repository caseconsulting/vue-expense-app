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
        <h1>Budget Statistics for {{ employee.firstName }} {{ employee.lastName }}</h1>
      </v-row>
    </v-col>

    <!-- Anniversary Date -->
    <v-col cols="12" lg="4" v-if="!isMobile">
      <v-card class="mt-3" @click="changingBudgetView = !changingBudgetView" hover>
        <v-card-title>
          <!-- display the next anniversary date -->
          <div v-if="viewingCurrentBudgetYear">
            <h3 class="pt-4 font-16">Anniversary Date: {{ getAnniversary }}</h3>
            <div @mouseover="display = !display" @mouseleave="display = !display" class="pt-4 font-14">
              <div v-if="display">Days Until: {{ getDaysUntil }}</div>
              <div v-else>Seconds Until: {{ getSecondsUntil }}</div>
            </div>
          </div>
          <!-- Display the budget history year -->
          <div v-else>
            <h3 class="pt-4 font-16">
              Viewing budgets from {{ this.getFiscalYearView }} - {{ this.getFiscalYearView + 1 }}
            </h3>
            <div class="pt-4 font-14">[Inactive Budget]</div>
          </div>
          <v-spacer></v-spacer>
          <v-icon style="margin-right: 10px">history</v-icon>
        </v-card-title>
      </v-card>
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
          :employee="expenseTypeData"
          @rendered="displayChart = !displayChart"
        ></budget-table>
        <budget-chart v-if="!loading && !isMobile && !adminCall && displayChart" :employee="employee"></budget-chart>
      </div>
    </v-col>

    <!-- Expense Form-->
    <v-col v-if="employ == null && !isInactive && viewingCurrentBudgetYear" cols="12" lg="4">
      <div text-center>
        <expense-form :expense="expense" v-on:error="displayError"></expense-form>
      </div>
    </v-col>
    <budget-select-modal
      :toggleBudgetSelectModal="changingBudgetView"
      :budgetYears="this.budgetYears"
      :current="this.fiscalDateView"
      :hireDate="this.hireDate"
    ></budget-select-modal>
  </v-row>
</template>

<script>
import api from '@/shared/api.js';
import BudgetChart from '@/components/BudgetChart.vue';
import BudgetSelectModal from '@/components/modals/BudgetSelectModal.vue';
import BudgetTable from '@/components/BudgetTable.vue';
import ExpenseForm from '@/components/ExpenseForm.vue';
import MobileDetect from 'mobile-detect';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import pattern from 'patternomaly';
import _ from 'lodash';
import { asyncForEach, isInactive, isFullTime } from '@/utils/utils';

const IsoFormat = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and calculates employee budget data. Returns multiple lists, consisting of the budgets names, remaining budget,
 * reimbursed amount, pending amount, reimbursed overdraft amount, and pending overdraft amount.
 *
 * @return Object - budget data
 */
function budgets() {
  let budgetNames = []; // budget expense type names
  let budgetDifference = []; // remaining budget amounts
  let reimbursed = []; // reimbursed amounts
  let unreimbursed = []; // pending amounts
  let odReimbursed = []; // reimbursed overdraft amount
  let odUnreimbursed = []; // pending overdraft amount
  if (this.expenseTypeData !== undefined) {
    let expenseTypes = this.expenseTypeData;
    _.forEach(expenseTypes, (expenseType) => {
      if (this.selectedBudgets.includes(expenseType.expenseTypeName)) {
        budgetNames.push(expenseType.expenseTypeName);
        let budget = expenseType.budgetObject;
        if (budget) {
          // if a current budget exists for this expense type
          if (!expenseType.odFlag) {
            // if the expense type does not allow overdraft
            reimbursed.push(budget.reimbursedAmount);
            unreimbursed.push(budget.pendingAmount);
            let difference = Math.max(budget.amount - budget.reimbursedAmount - budget.pendingAmount, 0);
            budgetDifference.push(difference);
            odReimbursed.push(0);
            odUnreimbursed.push(0);
          } else {
            if (budget.amount - budget.reimbursedAmount < 0) {
              // if the reimbursed amount is more than the adjusted expense type budget
              let difference = 0;
              reimbursed.push(budget.amount);
              budgetDifference.push(difference);
              unreimbursed.push(0);
              odReimbursed.push(budget.reimbursedAmount - budget.amount);
              odUnreimbursed.push(budget.pendingAmount);
            } else if (budget.amount - budget.reimbursedAmount - budget.pendingAmount < 0) {
              // if the reimburse + pending amount is more than the adjusted expense type budget
              let difference = 0;
              budgetDifference.push(difference);
              reimbursed.push(budget.reimbursedAmount);
              odReimbursed.push(0);
              let temp = budget.amount - budget.reimbursedAmount;
              unreimbursed.push(temp);
              odUnreimbursed.push(budget.pendingAmount - temp);
            } else {
              reimbursed.push(budget.reimbursedAmount);
              unreimbursed.push(budget.pendingAmount);
              let difference = Math.max(budget.amount - budget.reimbursedAmount - budget.pendingAmount, 0);
              budgetDifference.push(difference);
              odReimbursed.push(0);
              odUnreimbursed.push(0);
            }
          }
        } else {
          // if a current budget does not exist for this expense type
          budgetDifference.push(budget.amount);
          reimbursed.push(0);
          unreimbursed.push(0);
          odReimbursed.push(0);
          odUnreimbursed.push(0);
        }
      }
    });
  }

  return {
    names: budgetNames,
    difference: budgetDifference,
    reimbursed: reimbursed,
    unreimbursed: unreimbursed,
    odReimbursed: odReimbursed,
    odUnreimbursed: odUnreimbursed
  };
} // budgets

/**
 * Format and set data options for budget chart.
 *
 * @return Object - budget chart data
 */
function drawGraph() {
  let budgets = this.budgets;
  let data = {
    labels: budgets.names,
    datasets: [
      {
        type: 'bar',
        label: 'Reimbursed',
        backgroundColor: '#2195f3',
        data: budgets.reimbursed
      },
      {
        type: 'bar',
        label: 'Pending',
        backgroundColor: '#ff6666',
        data: budgets.unreimbursed
      },
      {
        type: 'bar',
        label: 'Remaining Budget',
        backgroundColor: '#e1e7f2',
        fill: false,
        data: budgets.difference
      },
      {
        type: 'bar',
        label: 'Overdraft Reimbursed',
        backgroundColor: pattern.draw('diagonal', '#88beef'),
        data: budgets.odReimbursed
      },
      {
        type: 'bar',
        label: 'Overdraft Pending',
        backgroundColor: pattern.draw('diagonal', 'pink'),
        data: budgets.odUnreimbursed
      }
    ]
  };

  let options = {
    scales: {
      yAxes: [
        {
          stacked: true,
          ticks: {
            beginAtZero: true,
            callback: function (value) {
              return value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              });
            }
          }
        }
      ],
      xAxes: [
        {
          stacked: true,
          // categoryPercentage: 0.5, //Not supported by chartjs 3.x
          // barPercentage: 1, //Not supported by chartjs 3.x
          ticks: {
            autoSkip: false
          }
        }
      ]
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem) {
          return (
            '$' +
            Number(tooltipItem.yLabel)
              // toFixed sets the number of decimal points to show
              .toFixed(2)
              .replace(/./g, function (c, i, a) {
                return i > 0 && c !== '.' && (a.length - i) % 3 === 0 ? ',' + c : c;
              })
          );
        }
      }
    },
    legend: {
      display: true
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return {
    dataSet: data,
    optionSet: options
  };
} // drawGraph

/**
 * Get the next anniversary date for the employee based on their hire date.
 *
 * @return String - next employee anniversary date (day of year, month, day, year)
 */
function getAnniversary() {
  const [year, month, day] = this.hireDate.split('-'); // split anniversary year, month, and day
  if (moment(`${month}/${day}/${year}`, 'MM/DD/YYYY', true).isValid()) {
    // if valid date
    let now = moment();
    let hireDate = moment(this.hireDate, 'YYYY-MM-DD');

    if (now.isAfter(hireDate)) {
      // employee's hire date is before today
      let anniversary = moment([now.year(), hireDate.month(), hireDate.date()]);
      // employee's hire date is before today
      if (now.isSameOrAfter(anniversary)) {
        // employee's anniversary date has already occured this year
        anniversary.add(1, 'years');
        return anniversary.format('ddd. MMM D, YYYY');
      } else {
        // employee's anniversary date still has to happen between now and the end of year
        return anniversary.format('ddd. MMM D, YYYY');
      }
    } else {
      // employee's hire date is in the future
      return hireDate.add(1, 'years').format('ddd. MMM D, YYYY');
    }
  } else {
    // TODO: Return something for invalid date
    return 'Ooops no anniversary, when did you start working here again? ';
  }
} // getAnniversary

/**
 * Get the days until the employee's next anniversary date.
 */
function getDaysUntil() {
  let now = moment();

  let hireDate = moment(this.hireDate, 'YYYY-MM-DD');
  let anniversary = moment([now.year(), hireDate.month(), hireDate.date()]);

  if (now.isAfter(hireDate)) {
    // employee's hire date is before today
    if (now.isSameOrAfter(anniversary)) {
      // employee's anniversary date has already occured this year
      anniversary.add(1, 'years');
    }
  } else {
    // employee's hire date is in the future
    anniversary = hireDate.add(1, 'years');
  }

  return anniversary.diff(now, 'days') + 1;
} // getDaysUntil

/**
 * Get the year for the employee budget year view.
 *
 * @return Int - year for budget year view
 */
function getFiscalYearView() {
  let [year] = this.fiscalDateView.split('-');
  return parseInt(year);
} // getFiscalYearView

/**
 * Get the seconds until the employee's next anniversary date.
 */
function getSecondsUntil() {
  if (this.actualTime) {
    // the actual time exists
    let now = moment();
    let year = now.year();
    let hireDate = moment(this.hireDate, 'YYYY-MM-DD');
    let anniversary = moment([year, hireDate.month(), hireDate.date()]);

    if (now.isAfter(hireDate)) {
      // employee's hire date is before today
      if (now.isSameOrAfter(anniversary)) {
        // employee's anniversary date has already occured this year
        anniversary.add(1, 'years');
      }
    } else {
      // employee's hire date is in the future
      anniversary = hireDate.add(1, 'years');
    }
    return anniversary.diff(now, 'seconds');
  }
} // getSecondsUntil

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
 * Increment the actual time by a second.
 */
function addOneSecondToActualTimeEverySecond() {
  var component = this;
  component.actualTime = moment().format('X');
  setTimeout(function () {
    component.addOneSecondToActualTimeEverySecond();
  }, 1000);
} // addOneSecondToActualTimeEverySecond

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
 * Refresh and sets the aggregated budgets for the employee budget year view.
 */
async function refreshBudget() {
  this.loading = true; // set loading status to true
  let budgetsVar;

  if (this.fiscalDateView == this.getCurrentBudgetYear()) {
    // viewing active budget year
    budgetsVar = await api.getAllActiveEmployeeBudgets(this.employee.id);
  }

  // get existing budgets for the budget year being viewed
  let existingBudgets = await api.getFiscalDateViewBudgets(this.employee.id, this.fiscalDateView);
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
  this.selectedBudgets = budgetsVar.map((a) => a.expenseTypeName);
  this.allBudgetNames = budgetsVar.map((a) => a.expenseTypeName);
  // prohibit overdraft if employee is not full time
  _.forEach(budgetsVar, async (budget) => {
    if (!isFullTime(this.employee)) {
      budget.odFlag = false;
    }
  });

  // remove any budgets where budget amount is 0 and 0 total expenses
  this.expenseTypeData = _.filter(budgetsVar, (data) => {
    let budget = data.budgetObject;
    return budget.amount != 0 || budget.reimbursedAmount != 0 || budget.pendingAmount != 0;
  });

  this.refreshBudgetYears(); // refresh the budget year view options
  this.loading = false; // set loading status to false
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
  this.loading = true; // set loading status to true
  if (this.employ == null) {
    // set the employee to the selected employee if viewing from an admin view
    this.employee = await api.getUser();
  } else {
    // set the employee to the current user if viewing from a user view
    this.employee = this.employ;
  }
  this.hireDate = this.employee.hireDate;
  this.fiscalDateView = this.getCurrentBudgetYear();
  this.refreshBudget(); // refresh employee budgets
  this.allUserBudgets = await api.getEmployeeBudgets(this.employee.id); // set all employee budgets
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
  this.refreshBudget();
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
  window.EventBus.$on('refreshChart', this.updateData);

  window.EventBus.$on('selected-budget-year', (data) => {
    if (data.format(IsoFormat) != this.fiscalDateView) {
      this.fiscalDateView = data.format(IsoFormat);
      this.refreshBudget();
    }
  });
  this.refreshEmployee();
  this.addOneSecondToActualTimeEverySecond();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    BudgetChart,
    BudgetSelectModal,
    BudgetTable,
    ExpenseForm
  },
  computed: {
    budgets,
    drawGraph,
    getAnniversary,
    getDaysUntil,
    getFiscalYearView,
    getSecondsUntil,
    isInactive,
    isMobile,
    viewingCurrentBudgetYear
  },
  created,
  data() {
    return {
      actualTime: moment().format('X'), // current time (unix ms timestamp)
      allBudgetNames: [],
      allUserBudgets: null, // all user budgets
      budgetYears: [], // list of options for chaning budget year view
      changingBudgetView: false, // change budget year view activator
      display: true, // show seconds till anniversary activator
      displayChart: false,
      employee: {}, // employee
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
      }, // expense for the expense form
      expenseTypeData: [], // aggregated budgets for expense types
      fiscalDateView: '', // current budget year view by anniversary day
      hireDate: '', // employee hire date
      loading: false, // loading status
      searchString: '',
      seconds: 0, // seconds until next anniversary date
      selectedBudgets: [],
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      } // snackbar action status
    };
  },
  methods: {
    addOneSecondToActualTimeEverySecond,
    asyncForEach,
    clearStatus,
    displayError,
    getCurrentBudgetYear,
    isFullTime,
    refreshBudget,
    refreshBudgetYears,
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
