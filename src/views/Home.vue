<template>
  <v-layout row wrap justify-center>
    <!-- Title -->
    <v-flex v-if="!isMobile" lg8 md12 sm12>
      <v-row style="height: 100%;" align="center" justify="center">
        <h1>Hello, {{ employee.firstName }}!</h1>
      </v-row>
    </v-flex>
    <!-- Anniversary Date -->
    <v-flex lg4 v-if="!isMobile">
      <v-flex>
        <v-card @click="changingBudgetView = true" hover>
          <v-card-title>
            <!-- display the next anniversary date -->
            <div v-if="viewingCurrentBudgetYear">
              <h3 class="pt-16">Anniversary Date: {{ getAnniversary }}</h3>
              <div @mouseover="display = !display" @mouseleave="display = !display" class="pt-14">
                <div v-if="display">Days Until: {{ getDaysUntil }}</div>
                <div v-else>Seconds Until: {{ getSecondsUntil }}</div>
              </div>
            </div>
            <!-- Display the budget history year -->
            <div v-else>
              <h3 class="pt-16">
                Viewing budgets from {{ this.getFiscalYearView }} - {{ this.getFiscalYearView + 1 }}
              </h3>
              <div class="pt-14">[Inactive Budget]</div>
            </div>
            <v-spacer></v-spacer>
            <v-icon style="margin-right: 10px;">
              history
            </v-icon>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-flex>
    <budget-select-modal
      :activate="changingBudgetView"
      :budgetYears="this.budgetYears"
      :current="this.fiscalDateView"
      :hireDate="this.hireDate"
    ></budget-select-modal>
    <!-- Available Budgets -->
    <v-flex xs12 sm6 md6 lg6 float-left>
      <v-flex v-if="loading" text-center>
        <v-progress-circular indeterminate size="64" color="#bc3825"></v-progress-circular>
      </v-flex>

      <v-flex v-else text-center class="pt-0">
        <available-budgets v-if="!loading" :budgets="expenseTypeData"></available-budgets>
      </v-flex>
    </v-flex>
  </v-layout>
</template>

<script>
import api from '@/shared/api.js';
import AvailableBudgets from '../components/AvailableBudgets.vue';
import BudgetSelectModal from '../components/BudgetSelectModal.vue';
import MobileDetect from 'mobile-detect';
import moment from 'moment';
import _ from 'lodash';

const IsoFormat = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and calculates employee budget data. Returns multiple lists, consisting of the budgets names, remaining budget,
 * pending amount, and pending overdraft amount.
 *
 * @return Object - budget data
 */
function budgets() {
  let budgetNames = []; // budget expense type names
  let budgetDifference = []; // remaining budget amounts
  if (this.expenseTypeData !== undefined) {
    let expenseTypes = this.expenseTypeData;
    _.forEach(expenseTypes, (expenseType) => {
      budgetNames.push(expenseType.expenseTypeName);
    });
  }

  return {
    names: budgetNames,
    difference: budgetDifference
  };
} // budgets

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
 * Async function to loop an array.
 *
 * @param array - Array of elements to iterate over
 * @param callback - callback function
 */
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
} // asyncForEach

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
 * Checks if an employee is full time. Returns true if the employee is full time with a work status of 100, otherwise
 * returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is full time
 */
function isFullTime(employee) {
  return employee.workStatus == 100;
} // isFullTime

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

  // budgetsVar = _.union(budgetsVar, existingBudgets); // combine existing and active budgets
  budgetsVar = _.uniqBy(budgetsVar, 'expenseTypeId'); // remove duplicate expense types
  budgetsVar = _.sortBy(budgetsVar, (budget) => {
    return budget.expenseTypeName;
  }); // sort by expense type name

  // prohibit overdraft if employee is not full time
  _.forEach(budgetsVar, async (budget) => {
    if (!isFullTime(this.employee)) {
      budget.odFlag = false;
    }
  });

  // remove any budgets where budget amount is 0 and 0 total expenses
  this.expenseTypeData = _.filter(budgetsVar, (data) => {
    let budget = data.budgetObject;
    return budget.amount != 0 || budget.pendingAmount != 0;
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
 *  Set budget information for employee. Creates event listeners.
 */
async function created() {
  window.EventBus.$on('cancel-budget-year', () => {
    this.changingBudgetView = false;
  });
  window.EventBus.$on('selected-budget-year', (data) => {
    if (data.format(IsoFormat) != this.fiscalDateView) {
      this.fiscalDateView = data.format(IsoFormat);
      this.refreshBudget();
    }
    this.changingBudgetView = false;
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
    AvailableBudgets,
    BudgetSelectModal
  },
  computed: {
    budgets,
    getAnniversary,
    getDaysUntil,
    getFiscalYearView,
    getSecondsUntil,
    isMobile,
    viewingCurrentBudgetYear
  },
  created,
  data() {
    return {
      allUserBudgets: null, // all user budgets
      budgetYears: [], // list of options for chaning budget year view
      changingBudgetView: false, // change budget year view activator
      display: true, // show seconds till anniversary activator
      employee: {}, // employee
      expenseTypeData: [], // aggregated budgets for expense types
      fiscalDateView: '', // current budget year view by anniversary day
      hireDate: '', // employee hire date
      loading: false, // loading status
      seconds: 0, // seconds until next anniversary date
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      } // snackbar action status
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
  }
};
</script>
