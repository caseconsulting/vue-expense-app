<template>
  <v-row>
    <!-- Anniversary Date -->
    <v-col cols="12" lg="12">
      <v-card class="mt-3" @click="changingBudgetView = !changingBudgetView" hover>
        <v-card-title class="mx-1">
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
            <h3 class="pt-4 font-16">Viewing budgets from {{ getFiscalYearView }} - {{ getFiscalYearView + 1 }}</h3>
            <div class="pt-4 font-14">[Inactive Budget]</div>
          </div>
          <v-spacer></v-spacer>
          <v-icon>history</v-icon>
        </v-card-title>
      </v-card>
    </v-col>
    <budget-select-modal
      :toggleBudgetSelectModal="changingBudgetView"
      :budgetYears="budgetYears"
      :current="fiscalDateView"
      :hireDate="hireDate"
      :hasBudgets="hasBudgets"
    ></budget-select-modal>
  </v-row>
</template>

<script>
import BudgetSelectModal from '@/components/modals/BudgetSelectModal.vue';
import { isMobile } from '@/utils/utils';
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
 * Get the seconds until the employee's next anniversary date.
 *
 * @return number - return number of seconds until next anniversary
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
 * load the data and api call to get budgets
 */
async function loadData() {
  this.hireDate = this.employee.hireDate;
  this.fiscalDateView = this.getCurrentBudgetYear();
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
  let [currYear] = this.getCurrentBudgetYear().split('-');
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
  beforeDestroy,
  methods: {
    addOneSecondToActualTimeEverySecond,
    getCurrentBudgetYear,
    loadData,
    refreshBudgetYears
  },
  props: ['employee', 'hasBudgets']
};
</script>
