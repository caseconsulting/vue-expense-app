<template>
  <v-container>
    <v-row wrap class="pb-4">
      <!-- Title -->
      <v-flex lg6 md6 sm6>
        <v-row style="height: 100%;" align="center" justify="center">
          <h1>Hello, {{ employee.firstName }}!</h1>
        </v-row>
      </v-flex>
      <!-- Anniversary Date -->
      <v-flex lg4>
        <v-flex>
          <v-card>
            <v-card-title>
              <!-- display the next anniversary date -->
              <div v-if="viewingCurrentBudgetYear">
                <h3 class="pt-4 font-16">Anniversary Date: {{ getAnniversary }}</h3>
                <div @mouseover="display = !display" @mouseleave="display = !display" class="pt-4 font-14">
                  <div v-if="display">Days Until: {{ getDaysUntil }}</div>
                  <div v-else>Seconds Until: {{ getSecondsUntil }}</div>
                </div>
              </div>
              <v-spacer></v-spacer>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-flex>
    </v-row>
    <v-row wrap class="px-4">
      <v-col :cols="this.screenColOne">
        <v-row wrap>
          <!-- Monthly Changes (TSheets) -->
          <v-flex xs12 sm6 md6 lg6 class="pa-4">
            <v-flex v-if="loading" text-center>
              <v-progress-circular indeterminate size="64" color="#bc3825"></v-progress-circular>
            </v-flex>
            <v-flex v-else text-center class="pt-0">
              <monthly-charges :employee="this.employee"></monthly-charges>
            </v-flex>
          </v-flex>
          <!-- Total Balances -->
          <v-flex xs12 sm6 md6 lg6 class="pa-4">
            <v-flex v-if="loading" text-center>
              <v-progress-circular indeterminate size="64" color="#bc3825"></v-progress-circular>
            </v-flex>
            <v-flex v-else text-center class="pt-0">
              <balances :employee="this.employee"></balances>
            </v-flex>
          </v-flex>
        </v-row>
        <v-row wrap>
          <!-- Available Budgets -->
          <v-flex xs12 sm6 md6 lg6 float-left class="pa-4">
            <v-flex v-if="loading" text-center>
              <v-progress-circular indeterminate size="64" color="#bc3825"></v-progress-circular>
            </v-flex>
            <v-flex v-else text-center class="pt-0">
              <available-budgets :budgets="expenseTypeData" :loading="loadingBudgets"></available-budgets>
            </v-flex>
          </v-flex>
          <!-- Quick links -->
          <!-- <v-spacer></v-spacer> -->
          <v-flex xs12 sm6 md6 lg6 class="pa-4">
            <v-card align-content-space-around>
              <v-card-title class="header_style">
                <h4 class="white--text">Quick Links</h4>
                <div>
                  <v-btn
                    class="mx-auto white--text"
                    v-for="link in mediaLinks"
                    :key="link.name"
                    :href="link.link"
                    icon
                    target="_blank"
                  >
                    <icon :name="link.icon"></icon>
                  </v-btn>
                </div>
              </v-card-title>
              <v-list v-for="(link, index) in links" :key="link.name">
                <v-divider v-if="index != 0"></v-divider>
                <v-list-item :href="link.link" target="_blank">
                  <v-list-item-content>{{ link.name }}</v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-flex>
          <!-- <v-spacer></v-spacer> -->
        </v-row>
      </v-col>
      <!-- Activity Feed -->
      <v-col xs12 sm6 md6 lg6>
        <v-flex mt-0 class="pt-4">
          <activity-feed :events="events" :loading="loading"></activity-feed>
        </v-flex>
      </v-col>
      <!-- Twitter Feed -->
      <v-col xs12 sm6 md6 lg6>
        <v-flex mt-0 class="pt-4">
          <twitter-feed :tweets="tweets" :loading="loading"></twitter-feed>
        </v-flex>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/shared/api.js';
import AvailableBudgets from '../components/AvailableBudgets.vue';
import MonthlyCharges from '../components/MonthlyCharges.vue';
import Balances from '../components/Balances.vue';
// import MobileDetect from 'mobile-detect';
import moment from 'moment';
import ActivityFeed from '../components/ActivityFeed';
import TwitterFeed from '../components/TwitterFeed';
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
// function isMobile() {
//   let md = new MobileDetect(window.navigator.userAgent);
//   return md.os() === 'AndroidOS' || md.os() === 'iOS';
// isMobile

/**
 * Checks current breakpoint to set position of the columns for the homepage
 *
 * @return desired col width class
 */
function screenColOne() {
  switch (this.$vuetify.breakpoint.name) {
    case 'xs':
      return '12';
    case 'sm':
      return '12';
    case 'md':
      return '8';
    case 'lg':
      return '8';
    case 'xl':
      return '8';
  }
}
/**
 * Checks current breakpoint to set position of the columns for the activityFeed
 *
 * @return desired col width class
 */
function screenColTwo() {
  switch (this.$vuetify.breakpoint.name) {
    case 'xs':
      return '12';
    case 'sm':
      return '12';
    case 'md':
      return '4';
    case 'lg':
      return '4';
    case 'xl':
      return '4';
  }
}
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
 * Create the events to populate the activity feed
 */
async function createEvents() {
  this.employees = await api.getItems(api.EMPLOYEES);
  this.aggregatedExpenses = await api.getAllAggregateExpenses();
  this.scheduleEntries = _.flatten(await api.getFeedEvents());
  //generate anniversaries
  let anniversaries = _.map(this.employees, (a) => {
    let hireDate = moment(a.hireDate, 'YYYY-MM-DD');
    let event = {};
    if (a.workStatus != 0 && hireDate.isValid()) {
      let now = moment();
      //set what we want to see in the Date
      if (now.isAfter(hireDate, 'day')) {
        //hire date is before today
        let anniversary = moment([now.year(), hireDate.month(), hireDate.date()]); //set anniversary to hiredate but this year
        let diff = now.startOf('day').diff(anniversary.startOf('day'), 'day'); //difference between today and anniversary
        event.date = getEventDateMessage(anniversary);
        if (diff < 0 && diff < -6) {
          anniversary.subtract(1, 'years');
          event.date = anniversary.format('ll');
        }
        if (anniversary.isSame(hireDate, 'day')) {
          event.text = a.firstName + ' has joined the Case Consulting team!'; //new hire message
          event.icon = 'user-plus';
        } else {
          if (anniversary.diff(hireDate, 'year') == 1) {
            event.text = a.firstName + ' is celebrating 1 year at Case Consulting!';
          } else {
            event.text =
              a.firstName + ' is celebrating ' + anniversary.diff(hireDate, 'year') + ' years at Case Consulting!';
          }
          event.icon = 'glass-cheers';
        }
        event.daysFromToday = now.startOf('day').diff(anniversary.startOf('day'), 'days');
        return event;
      } else {
        return null; //dont show anything for people hired in the future
      }
    } else {
      return null;
    }
  });
  // generate birthdays
  let birthdays = _.map(this.employees, (b) => {
    if (b.birthdayFeed) {
      let event = {};
      let now = moment();
      let birthday = moment(b.birthday, 'YYYY-MM-DD');
      birthday = moment([now.year(), birthday.month(), birthday.date()]); // Gets birthday date this year
      let diff = now.startOf('day').diff(birthday.startOf('day'), 'day');
      // Get event date text
      event.date = getEventDateMessage(birthday);
      if (diff < 0 && diff < -6) {
        birthday.subtract(1, 'years');
        event.date = birthday.format('ll');
      }
      // Sets event text
      if (diff == 0) {
        event.text = 'Happy Birthday ' + b.firstName + ' ' + b.lastName + '!';
      } else {
        event.text = b.firstName + ' ' + b.lastName + "'s" + ' birthday!';
      }
      event.icon = 'birthday-cake';
      event.daysFromToday = now.startOf('day').diff(birthday.startOf('day'), 'days');
      return event;
    }
    return null;
  });
  // generate expenses
  let expenses = _.map(this.aggregatedExpenses, (a) => {
    if (a.showOnFeed != ' ' || a.budgetName == 'High Five' || a.budgetName == 'Training') {
      //expense has showOnFeed property
      if (a.showOnFeed || a.budgetName == 'High Five' || a.budgetName == 'Training') {
        //value of showOnFeed is true
        if (a.reimbursedDate === ' ') {
          return null;
        }
        let now = moment();
        let reimbursedDate = moment(a.reimbursedDate, 'YYYY-MM-DD');
        let event = {};
        event.date = getEventDateMessage(reimbursedDate);

        event.text = `${a.firstName} used their ${a.budgetName} budget on ${a.description}`;
        event.icon = 'dollar-sign';
        event.daysFromToday = now.startOf('day').diff(reimbursedDate.startOf('day'), 'days');
        if (a.budgetName == 'High Five') {
          event.text = `${a.firstName} gave ${a.description} a High Five`;
        }
        return event;
      } else {
        return null;
      }
    } else {
      //not a technology budget
      return null;
    }
  });
  //generate schedules
  let schedules = _.map(this.scheduleEntries, (a) => {
    let now = moment();
    let startDate = moment(a.starts_at, 'YYYY-MM-DD');
    let event = {};
    event.date = getEventDateMessage(startDate);

    event.text = `${a.title} starts today!`; // --event name-- starts today!
    event.icon = 'calendar-alt';
    event.daysFromToday = now.startOf('day').diff(startDate.startOf('day'), 'days');
    event.link = a.app_url;
    return event;
  });
  let mergedEventsList = [...anniversaries, ...birthdays, ...expenses, ...schedules]; // merges lists
  this.events = _.sortBy(_.compact(mergedEventsList), 'daysFromToday');
}

/**
 * get's the date message of the event
 *
 * @param date - the date of the event
 */
function getEventDateMessage(date) {
  let now = moment();
  let diff = now.startOf('day').diff(date.startOf('day'), 'day');
  if (diff == 0) {
    return 'Today'; //set date message as today if no difference in date
  } else if (diff == 1) {
    return 'Yesterday'; //if it was one day removed message is yesterday
  } else if (diff <= 6 && diff > 1) {
    return diff + ' days ago'; //if it is otherwise less than 7 days ago create message
  } else if (diff == -1) {
    return 'Tomorrow';
  } else if (diff < 0 && diff >= -6) {
    return 'Coming up in ' + Math.abs(diff) + ' days'; //if its in the "future" and within 6 days say its coming up
  } else {
    return date.format('ll');
  }
}

/**
 * Calls the API to get tweets from the Twitter account.
 */
async function getTweets() {
  this.tweets = await api.getCaseTimeline();
  console.log(this.tweets);
}

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
  this.loadingBudgets = true;
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
  this.loadingBudgets = false;
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
  this.ptoBalances = await api.getPTOBalances(this.employee.employeeNumber); // call api
  this.ptoBalances = this.ptoBalances.results.users[this.employee.employeeNumber]; // get to balances
}

// refreshEmployee

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

function getAnniversaryEvents() {
  // stub
}

function getBirthdayEvents() {
  // stub
}

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
  this.loading = true;
  this.createEvents();
  this.loading = false;
  this.refreshEmployee();
  this.addOneSecondToActualTimeEverySecond();
  this.getTweets();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    ActivityFeed,
    AvailableBudgets,
    MonthlyCharges,
    Balances,
    TwitterFeed
  },
  computed: {
    budgets,
    getAnniversary,
    getDaysUntil,
    getFiscalYearView,
    getSecondsUntil,
    //    isMobile,
    screenColOne,
    screenColTwo,
    viewingCurrentBudgetYear
  },
  created,
  data() {
    return {
      aggregatedExpenses: [],
      allUserBudgets: null, // all user budgets
      budgetYears: [], // list of options for chaning budget year view
      changingBudgetView: false, // change budget year view activator
      display: true, // show seconds till anniversary activator
      employee: {}, // employee
      employees: [],
      events: [],
      expenseTypeData: [], // aggregated budgets for expense types
      fiscalDateView: '', // current budget year view by anniversary day
      hireDate: '', // employee hire date
      loading: false, // loading status
      loadingBudgets: false, //prop for available budgets
      ptoBalances: [],
      scheduleEntries: [],
      seconds: 0, // seconds until next anniversary date
      tweets: [],
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }, // snackbar action status
      links: [
        { name: 'Basecamp', link: 'https://3.basecamp.com/3097063' },
        { name: '401k', link: 'https://3.basecamp.com/3097063/buckets/179119/vaults/29920981' },
        { name: 'Health Insurance', link: 'https://3.basecamp.com/3097063/buckets/179119/vaults/29920949' },
        { name: 'TSheets', link: 'https://caseconsulting.tsheets.com/' },
        { name: 'ADP', link: 'https://www.adp.com/' }
      ],
      mediaLinks: [
        { name: 'github', link: 'https://github.com/caseconsulting', icon: 'brands/github' },
        { name: 'linkedIn', link: 'https://linkedin.com/company/case-consulting-inc', icon: 'brands/linkedin' },
        { name: 'youtube', link: 'https://www.youtube.com/channel/UC_oJY4OrOpLNrIBAN7Y-9fA', icon: 'brands/youtube' },
        { name: 'twitter', link: 'https://twitter.com/consultwithcase?lang=en', icon: 'brands/twitter' },
        { name: 'Facebook', link: 'https://www.facebook.com/ConsultwithCase/', icon: 'brands/facebook' }
      ]
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
    createEvents,
    displayError,
    getAnniversaryEvents,
    getBirthdayEvents,
    getCurrentBudgetYear,
    getTweets,
    isFullTime,
    refreshBudget,
    refreshBudgetYears,
    refreshEmployee,
    showSuccessfulSubmit,
    updateData
  }
};
</script>
<style>
.links {
  padding-bottom: 16px;
  text-align: center;
}
</style>
