<template>
  <v-container class="my-3">
    <span v-if="loadingEmployee">
      <v-row>
        <v-col cols="12" md="6" class="py-4 px-7">
          <v-skeleton-loader class="my-3" type="list-item@2"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" md="6" class="py-4 px-7">
          <v-skeleton-loader class="my-3" type="list-item@2"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" lg="6">
          <v-col class="px-4 py-2">
            <v-skeleton-loader class="my-3" type="card-heading, list-item@6"></v-skeleton-loader>
          </v-col>
          <v-col class="px-4 py-2">
            <v-skeleton-loader class="my-3" type="card-heading, list-item@6"></v-skeleton-loader>
          </v-col>
        </v-col>
        <v-col cols="12" lg="6">
          <v-col class="px-4 py-2">
            <v-skeleton-loader class="my-3" type="card-heading, list-item@14"></v-skeleton-loader>
          </v-col>
        </v-col>
      </v-row>
      <v-row>
        <v-col mt-0 class="py-4 px-7">
          <v-skeleton-loader class="my-3" type="card-heading, list-item@14"></v-skeleton-loader>
        </v-col>
      </v-row>
    </span>
    <span v-else>
      <v-row class="pb-4">
        <!-- Title -->
        <v-col cols="12" md="6">
          <v-row class="pt-5" align="center" justify="center">
            <h1 id="home-greeting">Hello, {{ employee.firstName }}!</h1>
          </v-row>
          <v-row class="pt-2" justify="center">
            <v-btn class="mb-10" @click="handleProfile()" color="#bc3825" dark>View Profile</v-btn>
          </v-row>
        </v-col>
        <!-- Anniversary Date -->

        <v-col cols="12" md="6" class="pa-4">
          <v-card>
            <v-card-title>
              <!-- display the next anniversary date -->
              <div id="home-anniversary">
                <h3 class="pt-4 font-16">Anniversary Date: {{ getAnniversary }}</h3>
                <div @mouseover="display = !display" @mouseleave="display = !display" class="pt-4 font-14">
                  <div v-if="display">Days Until: {{ getDaysUntil }}</div>
                  <div v-else>Seconds Until: {{ getSecondsUntil }}</div>
                </div>
              </div>
              <v-spacer></v-spacer>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col wrap cols="12" lg="6">
          <!-- QuickBooksTime -->
          <v-col class="pa-4">
            <v-col v-if="loadingEmployee" class="text-center">
              <v-progress-circular indeterminate size="64" color="#bc3825"></v-progress-circular>
            </v-col>
            <v-col v-else class="pt-0 text-center">
              <quick-books-time-data cols="12" lg="6"></quick-books-time-data>
            </v-col>
          </v-col>
          <!-- Available Budgets -->
          <div>
            <v-col class="pa-4">
              <v-col v-if="loadingEmployee" text-center>
                <v-progress-circular indeterminate size="64" color="#bc3825"></v-progress-circular>
              </v-col>
              <v-col v-else class="pt-0 text-center">
                <available-budgets
                  id="home-available-budgets"
                  :employee="this.employee"
                  :expenses="this.expenses"
                  :expenseTypes="this.expenseTypes"
                  :fiscalDateView="this.fiscalDateView"
                ></available-budgets>
              </v-col>
            </v-col>
          </div>
        </v-col>
        <!-- Activity Feed -->
        <v-col cols="12" lg="6">
          <v-col mt-0 class="pt-4">
            <activity-feed id="home-activity-feed" :events="events" :loading="loadingEvents"></activity-feed>
          </v-col>
        </v-col>
      </v-row>
      <v-row>
        <!-- Twitter Feed -->
        <v-col>
          <v-col mt-0 class="pt-4">
            <twitter-feed id="home-twitter-feed" :tweets="tweets" :loading="loadingTweets"></twitter-feed>
          </v-col>
        </v-col>
      </v-row>
    </span>
  </v-container>
</template>

<script>
import api from '@/shared/api.js';
import ActivityFeed from '@/components/ActivityFeed';
import AvailableBudgets from '@/components/AvailableBudgets.vue';
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');
import TwitterFeed from '@/components/TwitterFeed';
import _ from 'lodash';
import { isEmpty, getCurrentBudgetYear } from '@/utils/utils';
import QuickBooksTimeData from '../components/QuickBooksTimeData.vue';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

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
 * @return int - returns the difference between now and the anniversary in days
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
 * @return int - returns the difference between now and the anniversary in seconds
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
  this.aggregatedExpenses = eventData.expenses;
  this.scheduleEntries = _.flatten(eventData.schedules);

  //we want to use their nicknames if they have one
  this.employees.forEach((employee) => {
    employee.firstName = employee.nickname ? employee.nickname : employee.firstName;
  });

  //generate anniversaries
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
          event.icon = 'user-plus';
          event.type = 'New Hire';
          event.newCampfire = 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726';
        } else {
          if (anniversary.diff(hireDate, 'year') == 1) {
            event.text = a.firstName + ' ' + a.lastName + ' is celebrating 1 year at Case Consulting!';
          } else {
            event.text =
              a.firstName +
              ' ' +
              a.lastName +
              ' is celebrating ' +
              anniversary.diff(hireDate, 'year') +
              ' years at Case Consulting!';
          }
          event.icon = 'glass-cheers';
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
        event.text = 'Happy Birthday ' + b.firstName + ' ' + b.lastName + '!';
      } else {
        event.text = b.firstName + ' ' + b.lastName + "'s" + ' birthday!';
      }
      event.icon = 'birthday-cake';
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
      event.text = `${a.firstName} ${a.lastName} used their ${a.budgetName} budget on ${a.description}`;
      event.daysFromToday = now.startOf('day').diff(reimbursedDate.startOf('day'), 'days');
      if (a.recipient) {
        event.congratulateCampfire = a.campfire;
        event.icon = 'thumbs-up';
        event.type = 'Congratulate';
        event.color = 'purple';
      } else {
        event.campfire = a.campfire;
        event.icon = 'dollar-sign';
        event.type = 'Expense';
        event.color = 'green';
      }
      if (!this.isEmpty(a.recipient)) {
        event.text = `${a.description}: ${a.note}`;
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

  //generate schedules
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
      event.text = `${a.title} starts today until ${endDate.format('LL')}!`;
    }
    event.icon = 'calendar-alt';
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

  let mergedEventsList = [...anniversaries, ...birthdays, ...expenses, ...schedules]; // merges lists
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
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  this.loadingEmployee = true; // set loading status to true
  this.employee = this.$store.getters.user;
  this.hireDate = this.employee.hireDate;
  this.fiscalDateView = this.getCurrentBudgetYear(this.hireDate);
  this.allUserBudgets = await api.getEmployeeBudgets(this.employee.id); // set all employee budgets
  this.expenses = await api.getAllAggregateExpenses();
  this.expenseTypes = this.$store.getters.expenseTypes;
  this.loadingEmployee = false; // set loading status to false
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
  await this.refreshEmployee();
  await this.createEvents();
  this.addOneSecondToActualTimeEverySecond();
  await this.getTweets();
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
    TwitterFeed,
    QuickBooksTimeData
  },
  computed: {
    getAnniversary,
    getDaysUntil,
    getSecondsUntil
  },
  created,
  data() {
    return {
      actualTime: moment().format('X'),
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
      loadingEmployee: true,
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
    addOneSecondToActualTimeEverySecond,
    createEvents,
    getCurrentBudgetYear,
    getEventDateMessage,
    getTweets,
    isEmpty,
    refreshEmployee,
    handleProfile
  }
};
</script>

<style scoped>
.links {
  padding-bottom: 16px;
  text-align: center;
}
</style>
