<template>
  <v-container fluid>
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      location="top right"
      :timeout="5000"
      :vertical="true"
    >
      <v-card-text color="white">
        <span class="text-h6 font-weight-medium">{{ status.statusMessage }}</span>
      </v-card-text>
      <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
    </v-snackbar>
    <span v-if="loading">
      <v-row>
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0 d-flex justify-center align-center">
          <v-skeleton-loader type="text" width="80%"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@2"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@5"></v-skeleton-loader>
        </v-col>
        <v-col cols="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@5"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" class="pb-3 px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@14"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col mt-0 class="pa-0 px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@14"></v-skeleton-loader>
        </v-col>
      </v-row>
    </span>
    <span v-else>
      <v-row class="pb-3">
        <!-- Title -->
        <v-col cols="12" md="6">
          <h1 align="center" justify="center" id="home-greeting">Hello, {{ getEmployeePreferredName(employee) }}!</h1>
          <div class="text-center">
            <v-btn @click="handleProfile()" color="#bc3825" theme="dark">View Profile</v-btn>
          </div>
        </v-col>

        <!-- Anniversary Date -->
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0">
          <anniversary-card v-if="!loading" :employee="employee" :hasBudgets="true" location="home"></anniversary-card>
        </v-col>
      </v-row>
      <v-row class="pb-3">
        <v-col wrap cols="12" lg="6" class="pa-0 px-xl-4 px-lg-2 px-md-0">
          <!-- QuickBooksTime -->
          <div class="pb-3">
            <!-- <quick-books-time-data :employee="employee" cols="12" lg="6"></quick-books-time-data> -->
          </div>
          <!-- Available Budgets -->
          <div>
            <available-budgets
              id="home-available-budgets"
              :employee="employee"
              :expenses="expenses"
              :expenseTypes="expenseTypes"
              :employeeDataLoading="loadingBudgets"
              :fiscalDateView="fiscalDateView"
              :accessibleBudgets="accessibleBudgets"
            ></available-budgets>
          </div>
        </v-col>
        <!-- Activity Feed -->
        <v-col cols="12" lg="6" class="pa-0 px-xl-4 px-lg-2 px-md-0 pt-3 pt-lg-0 pt-xl-0 pt-xxl-0">
          <activity-feed id="home-activity-feed" :events="events" :loading="loadingEvents"></activity-feed>
        </v-col>
      </v-row>
    </span>
  </v-container>
</template>

<script>
import api from '@/shared/api.js';
import ActivityFeed from '@/components/home/ActivityFeed.vue';
import AvailableBudgets from '@/components/shared/AvailableBudgets.vue';
import _ from 'lodash';
import { isEmpty, isMobile, getCurrentBudgetYear } from '@/utils/utils';
import { updateStoreExpenseTypes, updateStoreBudgets } from '@/utils/storeUtils';
// import QuickBooksTimeData from '@/components/shared/quickbooks/QuickBooksTimeData';
import AnniversaryCard from '@/components/shared/AnniversaryCard';
import {
  format,
  getTodaysDate,
  isSameOrAfter,
  isValid,
  startOf,
  subtract,
  difference,
  isSame,
  isBefore,
  isAfter,
  getYear,
  setYear,
  endOf,
  DEFAULT_ISOFORMAT
} from '../shared/dateUtils';

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

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets an employees anniversary. If an employee's anniversary date is more than 2 months in the future,
 * their previous anniversary date will be used for the activity feed.
 *
 * @param date String - the hire date
 * @return String - The employee's anniversary date that is useful for the activity feed
 */
function getAnniversary(date) {
  let endMonth = format(endOf(getTodaysDate(), 'months'), null, DEFAULT_ISOFORMAT);
  let anniversary = setYear(date, getYear(endMonth));
  let diff = difference(endMonth, anniversary, 'months');
  if (diff <= -2) {
    // anniversary is 2 or more months away
    anniversary = setYear(anniversary, getYear(endMonth) - 1);
  } else if (diff >= 11) {
    // anniversary is in one month or less
    anniversary = setYear(anniversary, getYear(endMonth) + 1);
  }
  return anniversary;
} // getAnniversary

/**
 * Create the events to populate the activity feed
 */
async function createEvents() {
  this.loadingEvents = true;
  if (this.$store.getters.events) {
    this.events = this.$store.getters.events;
    this.loadingEvents = false;
    return; //exit function
  }
  let eventData = await api.getAllEvents();
  this.employees = eventData.employees;
  this.scheduleEntries = _.flatten(eventData.schedules);
  this.aggregatedExpenses = eventData.expenses;
  this.aggregatedAwards = this.getEmployeeAwards();
  this.aggregatedCerts = this.getEmployeeCerts();

  //we want to use their nicknames if they have one
  this.employees.forEach((employee) => {
    employee.firstName = getEmployeePreferredName(employee);
  });

  let monthsBack = 5;
  // created empty two-dimensional array
  let anniversaries = [...Array(monthsBack)].map(() => Array(monthsBack));
  let newHires = [];
  _.forEach(this.employees, (a) => {
    let hireDate = format(a.hireDate, null, 'YYYY-MM-DD');
    let todaysDate = getTodaysDate();
    let event = {};
    if (a.workStatus != 0 && isValid(hireDate, 'YYYY-MM-DD')) {
      //set what we want to see in the Date
      if (isSameOrAfter(todaysDate, hireDate, 'day')) {
        //hire date is before today
        let anniversary = getAnniversary(hireDate);
        let endOfMonth = format(endOf(getTodaysDate(), 'months'), null, DEFAULT_ISOFORMAT);
        let monthDiff = Math.floor(difference(endOfMonth, anniversary, 'months')) + 1;
        if (monthDiff >= 0 && monthDiff < monthsBack) {
          event.date = this.getEventDateMessage(anniversary);
          if (isSame(anniversary, hireDate, 'day')) {
            event.text = a.firstName + ' ' + a.lastName + ' has joined the CASE team!'; //new hire message
            event.icon = 'mdi-account-plus';
            event.type = 'New Hire';
            event.newCampfire = 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726';
          } else {
            event.date = format(anniversary, null, 'll');
            if (difference(anniversary, hireDate, 'year') == 1) {
              event.text = a.firstName + ' ' + a.lastName + ' is celebrating 1 year at CASE!';
            } else {
              event.text =
                getEmployeePreferredName(a) +
                ' ' +
                a.lastName +
                ' is celebrating ' +
                difference(anniversary, hireDate, 'year') +
                ' years at CASE!';
            }
            event.anniversary = anniversary;
            event.icon = 'mdi-party-popper';
            event.type = 'Anniversary';
            event.congratulateCampfire = 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726';
          }
          event.daysFromToday = difference(startOf(todaysDate, 'day'), startOf(anniversary, 'day'), 'day');
          event.color = '#bc3825';
          if (this.textMaxLength < event.text.length) {
            event.truncatedText = _.truncate(event.text, { length: this.textMaxLength });
          }
          if (event.type === 'New Hire') {
            event.color = this.caseGray;
            newHires.push(event);
          } else {
            if (anniversaries[monthDiff].events) {
              anniversaries[monthDiff].events.push(event);
            } else {
              anniversaries[monthDiff].date = `Anniversaries in ${format(anniversary, DEFAULT_ISOFORMAT, 'MMM YYYY')}`;
              anniversaries[monthDiff].type = 'Anniversary';
              anniversaries[monthDiff].icon = 'mdi-party-popper';
              anniversaries[monthDiff].congratulateCampfire =
                'https://3.basecamp.com/3097063/buckets/171415/chats/29039726';
              anniversaries[monthDiff].color = '#bc3825';
              anniversaries[monthDiff].events = [event];
              anniversaries[monthDiff].daysFromToday = difference(
                startOf(todaysDate, 'day'),
                startOf(anniversary, 'month'),
                'day'
              );
            }
          }
        }
      }
    }
  });
  // filter out empty arrays
  anniversaries = _.filter(anniversaries, (a) => a.date);

  // generate birthdays
  let birthdays = _.map(this.employees, (b) => {
    if (b.birthdayFeed && !this.isEmpty(b.birthday) && b.workStatus != 0) {
      let event = {};
      let now = getTodaysDate();
      let cutOff = startOf(subtract(now, 6, 'months'), 'day');
      let birthday = format(b.birthday, 'MM-DD', 'MM-DD');
      birthday = setYear(birthday, getYear(now), 'MM-DD');
      let diff = difference(startOf(now, 'day'), startOf(birthday, 'day'), 'day');
      // Get event date text
      event.date = this.getEventDateMessage(birthday);
      if (diff < -6) {
        birthday = subtract(birthday, 1, 'years');
        event.date = format(birthday, null, 'MMM D, YYYY');
      }
      if (isAfter(cutOff, startOf(birthday, 'day'))) {
        return null;
      }
      // Sets event text
      if (diff == 0) {
        event.text = 'Happy Birthday ' + getEmployeePreferredName(b) + ' ' + b.lastName + '!';
      } else {
        event.text = getEmployeePreferredName(b) + ' ' + b.lastName + "'s" + ' birthday!';
      }
      event.icon = 'mdi-cake-variant';
      event.type = 'Birthday';
      event.color = 'orange darken-3';
      event.daysFromToday = difference(startOf(now, 'day'), startOf(birthday, 'day'), 'day');
      event.birthdayCampfire = 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726';
      if (this.textMaxLength < event.text.length) {
        event.truncatedText = _.truncate(event.text, { length: this.textMaxLength });
      }
      return event;
    }
    return null;
  });

  // generate expenses
  let expenses = _.map(this.aggregatedExpenses, (a) => {
    if (!this.isEmpty(a.showOnFeed) && a.showOnFeed) {
      //value of showOnFeed is true
      let now = getTodaysDate();
      let reimbursedDate = format(a.reimbursedDate, 'YYYY-MM-DD', 'YYYY-MM-DD');
      let event = {};
      event.date = this.getEventDateMessage(reimbursedDate);
      if (!this.isEmpty(a.url)) {
        event.link = a.url;
      }
      event.text = `${getEmployeePreferredName(a)} ${a.lastName} used their ${a.budgetName} budget on ${a.description}`;
      event.daysFromToday = difference(startOf(now, 'day'), startOf(reimbursedDate, 'day'), 'day');
      if (a.budgetName === 'High Five') {
        event.congratulateCampfile = a.campfire;
        event.icon = 'mdi-hands-pray';
        event.type = 'High Five';
        event.color = '#167c80'; // like a dark teal kinda color
        const recipient = _.find(this.employees, (e) => {
          return e.id === a.recipient;
        });
        if (recipient) {
          event.text = `${getEmployeePreferredName(a)} ${a.lastName} gave ${getEmployeePreferredName(recipient)} ${
            recipient.lastName
          } a High Five: ${a.note}`;
        } else {
          event.text = `${a.description}: ${a.note}`;
        }
      } else if (a.recipient) {
        event.congratulateCampfire = a.campfire;
        event.icon = 'mdi-thumbs-up';
        event.type = 'Congratulate';
        event.color = 'purple';
      } else if (a.budgetName === 'Training') {
        event.campfire = a.campfire;
        event.icon = 'mdi-dumbbell';
        event.type = 'Training';
        event.color = 'brown';
      } else {
        event.campfire = a.campfire;
        event.icon = 'mdi-currency-usd';
        event.type = 'Expense';
        event.color = 'green';
      }
      if (this.textMaxLength < event.text.length) {
        event.truncatedText = _.truncate(event.text, { length: this.textMaxLength });
      }
      return event;
    } else {
      //not a technology budget
      return null;
    }
  });

  // generate schedules
  let schedules = _.map(this.scheduleEntries, (a) => {
    let now = getTodaysDate();
    let cutOff = startOf(subtract(now, 6, 'months'), 'day');

    let startDate = a.starts_at;
    let endDate = a.ends_at;
    let event = {};
    event.date = this.getEventDateMessage(startDate);
    if (isAfter(cutOff, startOf(startDate, 'day'))) {
      return null;
    }
    if (isSame(startOf(startDate, 'day'), startOf(endDate, 'day'), 'day')) {
      event.text = `${a.title}`;
    } else if (isBefore(startOf(startDate, 'day'), startOf(now, 'day'), 'day')) {
      event.text = `${a.title} went until ${format(endDate, null, 'LL')}!`;
    } else {
      event.text = `${a.title} goes until ${format(endDate, null, 'LL')}!`;
    }
    event.icon = 'mdi-calendar';
    event.type = 'Event';
    event.daysFromToday = difference(startOf(now, 'day'), startOf(startDate, 'day'), 'day');
    if (event.daysFromToday < -6) {
      return null;
    }
    event.link = a.app_url;
    event.eventScheduled = a.app_url;
    event.color = 'blue darken-3';
    if (this.textMaxLength < event.text.length) {
      event.truncatedText = _.truncate(event.text, { length: this.textMaxLength });
    }
    return event;
  });

  // generate awards
  let awards = _.map(this.aggregatedAwards, (a) => {
    // get award information
    let now = getTodaysDate();
    const dateSubmitted = a.dateSubmitted || a.dateReceived;
    let award = {
      icon: 'mdi-fire',
      color: '#f9c64e',
      type: 'Award',
      daysFromToday: difference(startOf(now, 'day'), startOf(dateSubmitted, 'day'), 'day'),
      text: `${getEmployeePreferredName(a.employee)} ${a.employee.lastName} was awarded "${a.name}" in ${format(
        a.dateReceived,
        null,
        'MMMM'
      )}`,
      congratulateCampfire: 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726'
    };
    // date formatting
    award.date = format(dateSubmitted, null, 'MMM YYYY'); // default
    const withinSixDays = isAfter(dateSubmitted, subtract(now, 6, 'days')) && isBefore(dateSubmitted, now);
    if (withinSixDays) award.date = getEventDateMessage(dateSubmitted);
    // return award only if we want to display it (ie, if awarded <6 months ago)
    const wantToDisplay = isAfter(a.dateReceived, subtract(now, 6, 'months'));
    return wantToDisplay ? award : null;
  });

  // generate certs
  let certs = _.map(this.aggregatedCerts, (c) => {
    // get cert information
    let now = getTodaysDate();
    const dateSubmitted = c.dateSubmitted || c.dateReceived;
    let cert = {
      icon: 'mdi-certificate',
      color: 'blue lighten-1',
      type: 'Certification',
      daysFromToday: difference(startOf(now, 'day'), startOf(dateSubmitted, 'day'), 'day'),
      text: `${getEmployeePreferredName(c.employee)} ${c.employee.lastName} was certified "${c.name}"`,
      congratulateCampfire: 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726'
    };
    // date formatting
    cert.date = format(dateSubmitted, null, 'MMM YYYY'); // default
    const withinSixDays = isAfter(dateSubmitted, subtract(now, 6, 'days')) && isBefore(dateSubmitted, now);
    if (withinSixDays) cert.date = getEventDateMessage(dateSubmitted);
    // return cert only if we want to display it (ie, if received <6 months ago)
    const wantToDisplay = isAfter(c.dateReceived, subtract(now, 6, 'months'));
    return wantToDisplay ? cert : null;
  });

  let mergedEventsList = [...anniversaries, ...newHires, ...birthdays, ...expenses, ...schedules, ...awards, ...certs]; // merges lists
  this.events = _.sortBy(_.compact(mergedEventsList), 'daysFromToday'); //sorts by days from today
  this.$store.dispatch('setEvents', { events: this.events });
  this.loadingEvents = false;
} //createEvents

/**
 * get's the date message of the event
 *
 * @param date - the date of the event
 * @return string - string denoting the date of when the event is coming
 */
function getEventDateMessage(date) {
  let now = getTodaysDate();
  let diff = difference(startOf(now, 'day'), startOf(date, 'day'), 'day');
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
    return format(date, null, 'll');
  }
} // getEventDateMessage

/**
 * Gets all awards across all Employees, adding the employee name
 * to the object for later use
 *
 * @return all awards
 */
function getEmployeeAwards() {
  let awards = []; // will be returned
  let namedAwards = []; // temp variable for adding employee name

  // for each employee, get their awards
  this.employees.forEach((e) => {
    if (e.awards) {
      // add their name to the award
      namedAwards = [];
      e.awards.forEach((a) => {
        a.employee = e;
        namedAwards.push(a);
      });

      // add the named awards to the return list
      awards = [...awards, ...e.awards];
    }
  });

  // :)
  return awards;
}

/**
 * Get certs across all employees. This really could be added to awards
 * for efficiency if we are looking to speed things up.
 */
function getEmployeeCerts() {
  let certs = []; // will be returned

  // for each employee, get their certs
  this.employees.forEach((e) => {
    if (e.certifications) {
      // add their name to the cert
      e.certifications.forEach((c) => {
        c.employee = e;
      });

      // add the named awards to the return list
      certs = [...certs, ...e.certifications];
    }
  });

  // :)
  return certs;
}

/**
 * Returns the name of an employee based on their preference
 *
 * @input e employee object
 * @return e's preferred name
 */
function getEmployeePreferredName(e) {
  return e.nickname || e.firstName;
}

/**
 * Routes user to their employee page
 */
function handleProfile() {
  this.$router.push(`/employee/${this.$store.getters.employeeNumber}`);
} // handleProfile

/**
 * Loads all of the home page data concurrently upon entering the page.
 */
async function loadHomePageData() {
  await Promise.all([this.refreshEmployee(), this.createEvents()]);
} // loadHomePageData

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  this.loadingBudgets = true;
  this.employee = this.$store.getters.user;
  this.hireDate = this.employee.hireDate;
  this.fiscalDateView = this.getCurrentBudgetYear(this.hireDate);
  await Promise.all([
    !this.$store.getters.expenseTypes ? this.updateStoreExpenseTypes() : '',
    !this.$store.getters.budgets ? this.updateStoreBudgets() : ''
  ]);
  this.expenseTypes = this.$store.getters.expenseTypes;
  this.accessibleBudgets = this.$store.getters.budgets;
  this.loadingBudgets = false;
} // refreshEmployee

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.status['statusType'] = undefined;
  this.status['statusMessage'] = '';
  this.status['color'] = '';
} // clearStatus

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget information for employee. Creates event listeners.
 */
async function created() {
  this.emitter.on('status-alert', (status) => {
    this.status = status;
  });
  if (this.$store.getters.storeIsPopulated) {
    this.loading = false;
    await this.loadHomePageData();
  }
} // created

/**
 * Before destroy lifecycle hook. Destroys listeners.
 */
function beforeUnmount() {
  this.emitter.off('status-alert');
} // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * A watcher for when the vuex store is populated with necessary data.
 */
async function watchStoreIsPopulated() {
  if (this.$store.getters.storeIsPopulated) {
    this.loading = false;
    await this.loadHomePageData();
  }
} // watchStoreIsPopulated

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    ActivityFeed,
    AvailableBudgets,
    // QuickBooksTimeData,
    AnniversaryCard
  },
  computed: {
    storeIsPopulated
  },
  created,
  data() {
    return {
      accessibleBudgets: null,
      aggregatedAwards: [],
      aggregatedExpenses: [],
      allUserBudgets: null, // all user budgets
      budgetYears: [], // list of options for chaning budget year view
      display: true, // show seconds till anniversary activator
      employee: {}, // employee
      employees: [],
      events: [],
      expenses: null,
      expenseTypeData: [], // aggregated budgets for expense types
      expenseTypes: null,
      fiscalDateView: '', // current budget year view by anniversary day
      hireDate: '', // employee hire date
      loading: true,
      loadingBudgets: true,
      loadingEvents: true,
      scheduleEntries: [],
      seconds: 0, // seconds until next anniversary date
      textMaxLength: 110,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }
    };
  },
  methods: {
    beforeUnmount,
    clearStatus,
    createEvents,
    getAnniversary,
    getCurrentBudgetYear,
    getEmployeeAwards,
    getEmployeeCerts,
    getEmployeePreferredName,
    getEventDateMessage,
    isEmpty,
    isMobile,
    loadHomePageData,
    refreshEmployee,
    handleProfile,
    updateStoreExpenseTypes,
    updateStoreBudgets
  },
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  }
};
</script>
