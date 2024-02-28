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
          <v-icon @click="changingBudgetView = !changingBudgetView" icon="mdi-history" />
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
import _ from 'lodash';
import api from '@/shared/api.js';
import { isMobile, getCurrentBudgetYear } from '@/utils/utils';
import {
  add,
  difference,
  format,
  getTodaysDate,
  isAfter,
  isBefore,
  isValid,
  setYear,
  DEFAULT_ISOFORMAT
} from '@/shared/dateUtils';

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
  if (isValid(this.hireDate, DEFAULT_ISOFORMAT)) {
    // if valid date
    let now = getTodaysDate();
    let curYear = now.split('-')[0];

    if (isAfter(now, this.hireDate)) {
      // employee's hire date is before today
      let anniversary = setYear(this.hireDate, curYear);
      // employee's hire date is before today
      if (isAfter(add(now, 1, 'days'), anniversary)) {
        // employee's anniversary date has already occured this year
        anniversary = add(anniversary, 1, 'years');
        return format(anniversary, null, 'LL');
      } else {
        // employee's anniversary date still has to happen between now and the end of year
        return format(anniversary, null, 'LL');
      }
    } else {
      // employee's hire date is in the future
      return format(add(this.hireDate, 1, 'years'), null, 'LL');
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
  let now = getTodaysDate();
  let curYear = now.split('-')[0];

  let anniversary = setYear(this.hireDate, curYear);

  if (isAfter(now, this.hireDate)) {
    // employee's hire date is before today
    if (isAfter(add(now, 1, 'days'), anniversary)) {
      // employee's anniversary date has already occured this year
      anniversary = add(anniversary, 1, 'years');
    }
  } else {
    // employee's hire date is in the future
    anniversary = add(this.hireDate, 1, 'years');
  }

  return difference(anniversary, now, 'days');
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
 * load the data and api call to get budgets
 */
async function loadData() {
  this.hireDate = format(this.employee.hireDate, null, DEFAULT_ISOFORMAT);
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
  await this.loadData();

  this.emitter.on('selected-budget-year', (date) => {
    if (date != this.fiscalDateView) {
      this.fiscalDateView = date;
    }
  });
} // created

/**
 * beforeUnmount lifecycle hook
 */
function beforeUnmount() {
  this.emitter.off('selected-budget-year');
} //beforeUnmount

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
      allUserBudgets: null, // all user budgets
      budgetYears: [], // list of options for chaning budget year view
      changingBudgetView: false, // change budget year view activator
      hireDate: '', // employee hire date
      fiscalDateView: '' // current budget year view by anniversary day
    };
  },
  created,
  beforeUnmount,
  methods: {
    add, // dateUtils
    difference, // dateUtils
    format, // dateUtils
    getCurrentBudgetYear,
    getTodaysDate, // dateUtils
    isAfter, // dateUtils
    isBefore, // dateUtils
    isValid, // dateUtils
    loadData,
    refreshBudgetYears,
    setYear // dateUtils
  },
  props: ['employee', 'hasBudgets', 'location']
};
</script>
