<template>
  <v-container fluid>
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
          <v-skeleton-loader type="card-heading, list-item@5"></v-skeleton-loader>
        </v-col>
        <v-col cols="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="card-heading, list-item@5"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" class="pb-3 px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="card-heading, list-item@14"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col mt-0 class="pa-0 px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="card-heading, list-item@14"></v-skeleton-loader>
        </v-col>
      </v-row>
    </span>
    <span v-else>
      <v-row class="pb-3">
        <!-- Title -->
        <v-col cols="12" md="6">
          <h1 align="center" justify="center" id="home-greeting">Hello, {{ getEmployeePreferredName(employee) }}!</h1>
          <div class="text-center">
            <v-btn @click="handleProfile()" color="#bc3825" dark>View Profile</v-btn>
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
          <div class="pb-3 text-center">
            <quick-books-time-data cols="12" lg="6"></quick-books-time-data>
          </div>
          <!-- Available Budgets -->
          <div class="text-center">
            <available-budgets
              v-if="accessibleBudgets"
              id="home-available-budgets"
              :employee="employee"
              :expenses="expenses"
              :expenseTypes="expenseTypes"
              :fiscalDateView="fiscalDateView"
              :accessibleBudgets="accessibleBudgets"
            ></available-budgets>
          </div>
        </v-col>
        <!-- Activity Feed -->
        <v-col cols="12" lg="6" class="pa-0 px-xl-4 px-lg-2 px-md-0">
          <activity-feed id="home-activity-feed" :events="events" :loading="loadingEvents"></activity-feed>
        </v-col>
      </v-row>
      <v-row>
        <!-- Twitter Feed -->
        <v-col mt-0 class="pa-0 px-xl-4 px-lg-2 px-md-0">
          <twitter-feed id="home-twitter-feed" :tweets="tweets" :loading="loadingTweets"></twitter-feed>
        </v-col>
      </v-row>
    </span>
  </v-container>
</template>

<script>
import api from '@/shared/api.js';
import ActivityFeed from '@/components/home/ActivityFeed.vue';
import AvailableBudgets from '@/components/shared/AvailableBudgets.vue';
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');
import TwitterFeed from '@/components/home/TwitterFeed.vue';
import _ from 'lodash';
import { isEmpty, isMobile, getCurrentBudgetYear, updateEmployeeLogin } from '@/utils/utils';
import { updateStoreExpenseTypes, updateStoreBudgets } from '@/utils/storeUtils';
import QuickBooksTimeData from '@/components/shared/quickbooks/QuickBooksTimeData';
import AnniversaryCard from '@/components/shared/AnniversaryCard';

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

  // generate anniversaries
  let anniversaries = _.map(this.employees, (a) => {
    let hireDate = moment(a.hireDate, 'YYYY-MM-DD');
    let event = {};
    if (a.workStatus != 0 && hireDate.isValid()) {
      let now = moment();
      let cutOff = moment().subtract(6, 'months').startOf('day'); //can't use now because itll change now
      //set what we want to see in the Date
      if (now.isSameOrAfter(hireDate, 'day')) {
        //hire date is before today
        let anniversary = moment([now.year(), hireDate.month(), hireDate.date()]); //set anniversary to hiredate but this year
        let diff = now.startOf('day').diff(anniversary.startOf('day'), 'day'); //difference between today and anniversary
        event.date = this.getEventDateMessage(anniversary);
        if (diff < -6) {
          anniversary.subtract(1, 'years');
          event.date = anniversary.format('ll');
        }
        if (cutOff.isAfter(anniversary.startOf('day'))) {
          return null;
        }
        if (anniversary.isSame(hireDate, 'day')) {
          event.text = a.firstName + ' ' + a.lastName + ' has joined the Case Consulting team!'; //new hire message
          event.icon = 'mdi-account-plus';
          event.type = 'New Hire';
          event.newCampfire = 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726';
        } else {
          if (anniversary.diff(hireDate, 'year') == 1) {
            event.text = a.firstName + ' ' + a.lastName + ' is celebrating 1 year at Case Consulting!';
          } else {
            event.text =
              getEmployeePreferredName(a) +
              ' ' +
              a.lastName +
              ' is celebrating ' +
              anniversary.diff(hireDate, 'year') +
              ' years at Case Consulting!';
          }
          event.icon = 'mdi-party-popper';
          event.type = 'Anniversary';
          event.congratulateCampfire = 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726';
        }
        event.daysFromToday = now.startOf('day').diff(anniversary.startOf('day'), 'days');
        event.color = '#bc3825';
        if (this.textMaxLength < event.text.length) {
          event.truncatedText = _.truncate(event.text, { length: this.textMaxLength });
        }
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
    if (b.birthdayFeed && !this.isEmpty(b.birthday) && b.workStatus != 0) {
      let event = {};
      let now = moment();
      let cutOff = moment().subtract(6, 'months').startOf('day');
      let birthday = moment(b.birthday, 'YYYY-MM-DD');
      birthday = moment([now.year(), birthday.month(), birthday.date()]); // Gets birthday date this year

      let diff = now.startOf('day').diff(birthday.startOf('day'), 'day');
      // Get event date text
      event.date = this.getEventDateMessage(birthday);
      if (diff < -6) {
        birthday.subtract(1, 'years');
        event.date = birthday.format('ll');
      }
      if (cutOff.isAfter(birthday.startOf('day'))) {
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
      event.color = 'orange';
      event.daysFromToday = now.startOf('day').diff(birthday.startOf('day'), 'days');
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
      let now = moment();
      let reimbursedDate = moment(a.reimbursedDate, 'YYYY-MM-DD');
      let event = {};
      event.date = this.getEventDateMessage(reimbursedDate);
      if (!this.isEmpty(a.url)) {
        event.link = a.url;
      }
      event.text = `${getEmployeePreferredName(a)} ${a.lastName} used their ${a.budgetName} budget on ${a.description}`;
      event.daysFromToday = now.startOf('day').diff(reimbursedDate.startOf('day'), 'days');
      if (a.budgetName === 'High Five') {
        event.congratulateCampfile = a.campfire;
        event.icon = 'mdi-hands-pray';
        event.type = 'High Five';
        event.color = '#167c80'; // like a dark teal kinda color
        const recipient = _.find(this.employees, (e) => {
          return e.id === a.recipient;
        });
        event.text = `${getEmployeePreferredName(a)} ${a.lastName} gave ${getEmployeePreferredName(recipient)} ${
          recipient.lastName
        } a High Five: ${a.note}`;
      } else if (a.recipient) {
        event.congratulateCampfire = a.campfire;
        event.icon = 'mdi-thumbs-up';
        event.type = 'Congratulate';
        event.color = 'purple';
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
    let now = moment();
    let cutOff = moment().subtract(6, 'months').startOf('day');
    let startDate = moment(a.starts_at);
    let endDate = moment(a.ends_at);
    let event = {};
    event.date = this.getEventDateMessage(startDate);
    if (cutOff.isAfter(startDate.startOf('day'))) {
      return null;
    }
    if (startDate.startOf('day').isSame(endDate.startOf('day'), 'days')) {
      event.text = `${a.title}`;
    } else {
      event.text = `${a.title} goes until ${endDate.format('LL')}!`;
    }
    event.icon = 'mdi-calendar';
    event.type = 'Event';
    event.daysFromToday = now.startOf('day').diff(startDate.startOf('day'), 'days');
    if (event.daysFromToday < -6) {
      return null;
    }
    event.link = a.app_url;
    event.eventScheduled = a.app_url;
    event.color = '#1a73e8';
    if (this.textMaxLength < event.text.length) {
      event.truncatedText = _.truncate(event.text, { length: this.textMaxLength });
    }
    return event;
  });

  // generate awards
  let awards = _.map(this.aggregatedAwards, (a) => {
    // get award information
    const dateSubmitted = moment(a.dateSubmitted || a.dateReceived);
    let award = {
      icon: 'mdi-fire',
      color: '#f9c64e',
      type: 'Award',
      daysFromToday: moment().startOf('day').diff(dateSubmitted.startOf('day'), 'days'),
      text: `${getEmployeePreferredName(a.employee)} ${a.employee.lastName} was awarded "${a.name}" in ${moment(
        a.dateReceived
      ).format('MMMM')}`,
      congratulateCampfire: 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726'
    };
    // date formatting
    award.date = dateSubmitted.format('MMM YYYY'); // default
    const withinSixDays = dateSubmitted.isAfter(moment().subtract(6, 'days')) && dateSubmitted.isBefore(moment());
    if (withinSixDays) award.date = getEventDateMessage(dateSubmitted);
    // return award only if we want to display it (ie, if awarded <6 months ago)
    const wantToDisplay = moment(a.dateReceived).isAfter(moment().subtract(6, 'months'));
    return wantToDisplay ? award : null;
  });

  // generate certs
  let certs = _.map(this.aggregatedCerts, (c) => {
    // get cert information
    const dateSubmitted = moment(c.dateSubmitted || c.dateReceived);
    let cert = {
      icon: 'mdi-certificate',
      color: '#3C7DD0',
      type: 'Certification',
      daysFromToday: moment().startOf('day').diff(dateSubmitted.startOf('day'), 'days'),
      text: `${getEmployeePreferredName(c.employee)} ${c.employee.lastName} was certified "${c.name}"`,
      congratulateCampfire: 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726'
    };
    // date formatting
    cert.date = dateSubmitted.format('MMM YYYY'); // default
    const withinSixDays = dateSubmitted.isAfter(moment().subtract(6, 'days')) && dateSubmitted.isBefore(moment());
    if (withinSixDays) cert.date = getEventDateMessage(dateSubmitted);
    // return cert only if we want to display it (ie, if received <6 months ago)
    const wantToDisplay = moment(c.dateReceived).isAfter(moment().subtract(6, 'months'));
    return wantToDisplay ? cert : null;
  });

  let mergedEventsList = [...anniversaries, ...birthdays, ...expenses, ...schedules, ...awards, ...certs]; // merges lists
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
 * Calls the API to get tweets from the Twitter account.
 */
async function getTweets() {
  this.loadingTweets = true;
  this.tweets = await api.getCaseTimeline();
  this.loadingTweets = false;
} // getTweets

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
  await Promise.all([
    this.refreshEmployee(),
    this.createEvents(),
    this.getTweets(),
    this.$store.getters.loginTime ? this.updateEmployeeLogin(this.$store.getters.user) : ''
  ]);
} // loadHomePageData

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  this.employee = this.$store.getters.user;
  this.hireDate = this.employee.hireDate;
  this.fiscalDateView = this.getCurrentBudgetYear(this.hireDate);
  [this.expenses] = await Promise.all([
    api.getAllAggregateExpenses(),
    !this.$store.getters.expenseTypes ? this.updateStoreExpenseTypes() : '',
    !this.$store.getters.budgets ? this.updateStoreBudgets() : ''
  ]);
  this.expenseTypes = this.$store.getters.expenseTypes;
  this.accessibleBudgets = this.$store.getters.budgets;
} // refreshEmployee

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget information for employee. Creates event listeners.
 */
async function created() {
  if (this.$store.getters.storeIsPopulated) {
    this.loading = false;
    await this.loadHomePageData();
  }
} // created

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
    this.loading = false; // get rid of skeleton loaders (will still be loading for individual components)
    this.loadHomePageData();
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
    TwitterFeed,
    QuickBooksTimeData,
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
      loadingEvents: true,
      loadingTweets: true,
      scheduleEntries: [],
      seconds: 0, // seconds until next anniversary date
      textMaxLength: 110,
      tweets: [],
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }
    };
  },
  methods: {
    createEvents,
    getCurrentBudgetYear,
    getEmployeeAwards,
    getEmployeeCerts,
    getEmployeePreferredName,
    getEventDateMessage,
    getTweets,
    isEmpty,
    isMobile,
    loadHomePageData,
    refreshEmployee,
    handleProfile,
    updateEmployeeLogin,
    updateStoreExpenseTypes,
    updateStoreBudgets
  },
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  }
};
</script>
