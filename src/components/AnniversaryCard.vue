<template>
  <v-row>
    <!-- Anniversary Date -->
    <v-col cols="12" lg="12" v-if="!isMobile">
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
import BudgetSelectModal from '@/components/modals/BudgetSelectModal.vue';
import MobileDetect from 'mobile-detect';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import _ from 'lodash';
import { isFullTime } from '@/utils/utils';

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
 * Get the year for the employee budget year view.
 *
 * @return Int - year for budget year view
 */
function getFiscalYearView() {
  let [year] = this.fiscalDateView.split('-');
  return parseInt(year);
} // getFiscalYearView

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

async function loadData() {
  this.hireDate = this.employee.hireDate;
  this.fiscalDateView = this.getCurrentBudgetYear();
  this.refreshBudget(); // refresh employee budgets
  this.allUserBudgets = await api.getEmployeeBudgets(this.employee.id); // set all employee budgets
}

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|
function created() {
  this.addOneSecondToActualTimeEverySecond();
  this.loadData();
}
// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    BudgetSelectModal
  },
  computed: {
    isMobile,
    viewingCurrentBudgetYear,
    getAnniversary,
    getDaysUntil,
    getSecondsUntil,
    getFiscalYearView
  },
  data() {
    return {
      actualTime: moment().format('X'), // current time (unix ms timestamp)
      allUserBudgets: null, // all user budgets
      budgetYears: [], // list of options for chaning budget year view
      changingBudgetView: false, // change budget year view activator
      display: true, // show seconds till anniversary activator
      hireDate: '', // employee hire date
      seconds: 0, // seconds until next anniversary date
      fiscalDateView: '' // current budget year view by anniversary day
    };
  },
  created,
  methods: {
    addOneSecondToActualTimeEverySecond,
    getCurrentBudgetYear,
    refreshBudgetYears,
    refreshBudget,
    loadData
  },
  props: ['employee']
};
</script>
