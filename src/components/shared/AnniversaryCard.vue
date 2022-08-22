<template>
  <div>
    <!-- Anniversary Date -->
    <v-card>
      <v-row no-gutters class="pa-4">
        <v-col class="col-10">
          <v-card-title class="pa-0">
            <!-- display the next anniversary date -->
            <div v-if="viewingCurrentBudgetYear || location == 'home'">
              <p class="font-16 font-weight-bold">Anniversary Date: {{ getAnniversary }}</p>
              <div class="font-14">
                <div>Days Until: {{ getDaysUntil }}</div>
              </div>
            </div>
            <!-- Display the budget history year -->
            <div v-else>
              <p class="font-16 font-weight-bold">
                Viewing inactive budgets from {{ getFiscalYearView }} - {{ getFiscalYearView + 1 }}
              </p>
            </div>
          </v-card-title>
        </v-col>
        <v-col class="col-2 text-right" v-if="location != 'home'">
          <v-icon @click="changingBudgetView = !changingBudgetView">history</v-icon>
        </v-col>
      </v-row>
    </v-card>
    <budget-select-modal
      v-if="location != 'home'"
      :toggleBudgetSelectModal="changingBudgetView"
      :budgetYears="budgetYears"
      :current="fiscalDateView"
      :hireDate="hireDate"
      :hasBudgets="hasBudgets"
    ></budget-select-modal>
  </div>
</template>

<script>
import BudgetSelectModal from '@/components/modals/BudgetSelectModal.vue';
import { isMobile, getCurrentBudgetYear } from '@/utils/utils';
import _ from 'lodash';
import api from '@/shared/api.js';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
const IsoFormat = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Viewing the current active budget year. Returns true if the budget year being viwed is todays budget.
 *
 * @return boolean - viewing the current active year budget
 */
function viewingCurrentBudgetYear() {
  return this.fiscalDateView == this.getCurrentBudgetYear(this.hireDate);
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
 *
 * @return number - returns the number of days until next anniversary
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
 * load the data and api call to get budgets
 */
async function loadData() {
  this.hireDate = this.employee.hireDate;
  this.fiscalDateView = this.getCurrentBudgetYear(this.hireDate);
  this.allUserBudgets = await api.getEmployeeBudgets(this.employee.id);
  this.refreshBudgetYears();
} // loadData

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
  let [currYear] = this.getCurrentBudgetYear(this.hireDate).split('-');
  budgetYears.push(parseInt(currYear));
  // remove duplicate years and filter to include only active and previous years
  budgetYears = _.filter(_.uniqBy(budgetYears), (year) => {
    return parseInt(year) <= parseInt(currYear);
  });
  this.budgetYears = _.reverse(_.sortBy(budgetYears)); // sort budgets from current to past
} // refreshBudgetYears

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
async function created() {
  this.addOneSecondToActualTimeEverySecond();
  await this.loadData();

  window.EventBus.$on('selected-budget-year', (data) => {
    if (data.format(IsoFormat) != this.fiscalDateView) {
      this.fiscalDateView = data.format(IsoFormat);
    }
  });
} // created

/**
 * beforeDestroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('selected-budget-year');
} //beforeDestroy

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
    getFiscalYearView
  },
  data() {
    return {
      actualTime: moment().format('X'), // current time (unix ms timestamp)
      allUserBudgets: null, // all user budgets
      budgetYears: [], // list of options for chaning budget year view
      changingBudgetView: false, // change budget year view activator
      hireDate: '', // employee hire date
      fiscalDateView: '' // current budget year view by anniversary day
    };
  },
  created,
  beforeDestroy,
  methods: {
    addOneSecondToActualTimeEverySecond,
    getCurrentBudgetYear,
    loadData,
    refreshBudgetYears
  },
  props: ['employee', 'hasBudgets', 'location']
};
</script>
