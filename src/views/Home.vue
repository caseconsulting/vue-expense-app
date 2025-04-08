<template>
  <v-container fluid id="full-page">
    <span v-if="loading">
      <v-row>
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@2" />
        </v-col>
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@2" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@15" />
        </v-col>
        <v-col cols="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@15" />
        </v-col>
      </v-row>
    </span>
    <span v-else>
      <v-row class="pb-3">
        <!-- Title -->
        <v-col cols="12" md="6">
          <v-col cols="12" align="center" class="pa-2">
            <v-row>
              <v-col>
                <span class="text-h5" align="center" justify="center" id="home-greeting">
                  {{ welcomeText(employee) }}
                </span></v-col
              >
              <v-col> <v-btn color="#bc3825" @click="handleProfile()" theme="dark">View Profile</v-btn></v-col></v-row
            >
          </v-col>

          <v-col cols="12">
            <anniversary-card v-if="!loading" :employee="employee" :has-budgets="true" location="home" />
          </v-col>

          <ConfettiExplosion
            v-if="showConfetti(employee)"
            :particleCount="300"
            :particleSize="20"
            class="ml-12"
          ></ConfettiExplosion>
        </v-col>
        <v-col cols="12" md="6" class="mt-3 px-xl-4 px-lg-2 px-md-0">
          <leaderboard-podium />

          <ConfettiExplosion
            v-if="showConfetti(employee)"
            :particleCount="300"
            :particleSize="20"
            class="ml-12"
          ></ConfettiExplosion>
        </v-col>
      </v-row>
      <v-row class="pb-3">
        <v-col wrap cols="12" lg="6" class="pa-0 px-xl-4 px-lg-2 px-md-0">
          <!-- Timesheets -->
          <div class="pb-3">
            <time-data :employee="employee" cols="12" lg="6" />
          </div>
          <!-- Available Budgets -->
          <div>
            <available-budgets
              id="home-available-budgets"
              :employee="employee"
              :expenses="expenses"
              :expense-types="expenseTypes"
              :employee-data-loading="loadingBudgets"
              :fiscal-date-view="fiscalDateView"
              :accessible-budgets="accessibleBudgets"
            />
          </div>
        </v-col>
        <!-- Activity Feed -->
        <v-col cols="12" lg="6" class="pa-0 px-xl-4 px-lg-2 px-md-0 pt-3 pt-lg-0 pt-xl-0 pt-xxl-0">
          <activity-feed id="home-activity-feed" :events="events" :loading="loadingEvents" />
        </v-col>
      </v-row>
    </span>
  </v-container>
</template>

<script setup>
import { NEW_HIRE, OFF_TOPIC } from '@/utils/links/basecampLinks';
import api from '@/shared/api.js';
import ActivityFeed from '@/components/home/ActivityFeed.vue';
import AvailableBudgets from '@/components/shared/AvailableBudgets.vue';
import _flatten from 'lodash/flatten';
import _forEach from 'lodash/forEach';
import _truncate from 'lodash/truncate';
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import _find from 'lodash/find';
import _sortBy from 'lodash/sortBy';
import _compact from 'lodash/compact';
import { isEmpty, getCurrentBudgetYear } from '@/utils/utils';
import { updateStoreExpenseTypes, updateStoreBudgets } from '@/utils/storeUtils';
import TimeData from '@/components/shared/timesheets/TimeData';
import AnniversaryCard from '@/components/shared/AnniversaryCard';
import LeaderboardPodium from '@/components/shared/timesheets/LeaderboardPodium';
import ConfettiExplosion from 'vue-confetti-explosion';
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
import { ref, onBeforeMount, computed, watch, inject } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SET UP                      |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const router = useRouter();
const accessibleBudgets = ref(null);
const aggregatedAwards = ref([]);
const aggregatedExpenses = ref([]);
const aggregatedCerts = ref([]);
const employee = ref({}); // employee
const employees = ref([]);
const events = ref([]);
const expenses = ref(null);
const expenseTypes = ref(null);
const fiscalDateView = ref(''); // current budget year view by anniversary day
const hireDate = ref(''); // employee hire date
const loading = ref(true);
const loadingBudgets = ref(true);
const loadingEvents = ref(true);
const scheduleEntries = ref([]);
const textMaxLength = ref(110);
const emitter = inject('emitter');

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget information for employee. Creates event listeners.
 */
onBeforeMount(async () => {
  if (store.getters.storeIsPopulated) {
    loading.value = false;
    await loadHomePageData();
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

computed(store.getters.storeIsPopulated);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|
function welcomeText(employee) {
  let greeting = 'Hello';
  if (isBirthday(employee)) {
    greeting = 'Happy Birthday';
  } else if (isAnniversary(employee)) {
    greeting = 'Happy Anniversary';
  }
  return `${greeting}, ${getEmployeePreferredName(employee)}!`;
}

function showConfetti(employee) {
  return isAnniversary(employee) || isBirthday(employee);
}

function isBirthday(employee) {
  if (employee.birthday === undefined) {
    return false; // no birthday is entered
  }
  let today = getTodaysDate();
  let bday = employee.birthday;
  bday = setYear(bday, getYear(today));
  return bday === today;
}

function isAnniversary(employee) {
  hireDate.value = employee.hireDate;
  let anniversary = getAnniversary(hireDate.value);
  let today = getTodaysDate();
  return anniversary === today;
}
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
  loadingEvents.value = true;
  if (store.getters.events) {
    events.value = store.getters.events;
    loadingEvents.value = false;
    return; //exit function
  }
  let eventData = await api.getAllEvents();
  employees.value = eventData.employees;
  scheduleEntries.value = _flatten(eventData.schedules);
  aggregatedExpenses.value = eventData.expenses;
  aggregatedAwards.value = getEmployeeAwards();
  aggregatedCerts.value = getEmployeeCerts();

  //we want to use their nicknames if they have one
  _forEach(employees.value, (employee) => {
    employee.firstName = getEmployeePreferredName(employee);
  });

  let monthsBack = 5;
  // created empty two-dimensional array
  let anniversaries = [...Array(monthsBack)].map(() => Array(monthsBack));
  let newHires = [];
  _forEach(employees.value, (a) => {
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
          event.date = getEventDateMessage(anniversary);
          if (isSame(anniversary, hireDate, 'day')) {
            event.text = a.firstName + ' ' + a.lastName + ' has joined the CASE team!'; //new hire message
            event.icon = 'mdi-account-plus';
            event.type = 'New Hire';
            event.newCampfire = NEW_HIRE;
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
            event.congratulateCampfire = OFF_TOPIC;
          }
          event.daysFromToday = difference(startOf(todaysDate, 'day'), startOf(anniversary, 'day'), 'day');
          event.color = '#bc3825';
          if (textMaxLength.value < event.text.length) {
            event.truncatedText = _truncate(event.text, { length: textMaxLength.value });
          }
          if (event.type === 'New Hire') {
            event.color = '#415364';
            newHires.push(event);
          } else {
            if (anniversaries[monthDiff].events) {
              anniversaries[monthDiff].events.push(event);
            } else {
              anniversaries[monthDiff].date = `Anniversaries in ${format(anniversary, DEFAULT_ISOFORMAT, 'MMM YYYY')}`;
              anniversaries[monthDiff].type = 'Anniversary';
              anniversaries[monthDiff].icon = 'mdi-party-popper';
              anniversaries[monthDiff].congratulateCampfire = OFF_TOPIC;
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
  anniversaries = _filter(anniversaries, (a) => a.date);

  const now = getTodaysDate();

  // generate birthdays
  let birthdays = _map(employees.value, (b) => {
    if (b.birthdayFeed && !isEmpty(b.birthday) && b.workStatus != 0) {
      let event = {};
      let cutOff = startOf(subtract(now, 6, 'months'), 'day');
      let birthday = format(b.birthday, 'MM-DD', 'MM-DD');
      birthday = setYear(birthday, getYear(now), 'MM-DD');
      let diff = difference(startOf(now, 'day'), startOf(birthday, 'day'), 'day');
      // Get event date text
      event.date = getEventDateMessage(birthday);
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
      event.birthdayCampfire = OFF_TOPIC;
      if (textMaxLength.value < event.text.length) {
        event.truncatedText = _truncate(event.text, { length: textMaxLength.value });
      }
      return event;
    }
    return null;
  });

  // generate expenses
  let expenses = _map(aggregatedExpenses.value, (a) => {
    if (!isEmpty(a.showOnFeed) && a.showOnFeed) {
      //value of showOnFeed is true
      let reimbursedDate = format(a.reimbursedDate, 'YYYY-MM-DD', 'YYYY-MM-DD');
      let event = {};
      event.date = getEventDateMessage(reimbursedDate);
      if (!isEmpty(a.url)) {
        event.link = a.url;
      }
      event.text = `${getEmployeePreferredName(a)} ${a.lastName} used their ${a.budgetName} budget on ${a.description}`;
      event.daysFromToday = difference(startOf(now, 'day'), startOf(reimbursedDate, 'day'), 'day');
      if (a.budgetName === 'High Five') {
        event.congratulateCampfile = a.campfire;
        event.icon = 'mdi-hands-pray';
        event.type = 'High Five';
        event.color = '#167c80'; // like a dark teal kinda color
        const recipient = _find(employees.value, (e) => {
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
      if (textMaxLength.value < event.text.length) {
        event.truncatedText = _truncate(event.text, { length: textMaxLength.value });
      }
      return event;
    } else {
      //not a technology budget
      return null;
    }
  });

  // generate schedules
  let schedules = _map(scheduleEntries.value, (a) => {
    let cutOff = startOf(subtract(now, 6, 'months'), 'day');

    let startDate = a.starts_at;
    let endDate = a.ends_at;
    let event = {};
    event.date = getEventDateMessage(startDate);
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
    if (textMaxLength.value < event.text.length) {
      event.truncatedText = _truncate(event.text, { length: textMaxLength.value });
    }
    return event;
  });

  // generate awards
  let awards = _map(aggregatedAwards.value, (a) => {
    // get award information
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
      congratulateCampfire: OFF_TOPIC
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
  let certs = _map(aggregatedCerts.value, (c) => {
    // get cert information
    const dateSubmitted = c.dateSubmitted || c.dateReceived;
    let cert = {
      icon: 'mdi-certificate',
      color: 'blue lighten-1',
      type: 'Certification',
      daysFromToday: difference(startOf(now, 'day'), startOf(dateSubmitted, 'day'), 'day'),
      text: `${getEmployeePreferredName(c.employee)} ${c.employee.lastName} was certified "${c.name}"`,
      congratulateCampfire: OFF_TOPIC
    };
    // date formatting
    cert.date = format(dateSubmitted, null, 'MMM YYYY'); // default
    const withinSixDays = isAfter(dateSubmitted, subtract(now, 6, 'days')) && isBefore(dateSubmitted, now);
    if (withinSixDays) cert.date = getEventDateMessage(dateSubmitted);
    // return cert only if we want to display it (ie, if received <6 months ago)
    const wantToDisplay = isAfter(c.dateReceived, subtract(now, 6, 'months'));
    return wantToDisplay ? cert : null;
  });

  let announcements = _map(eventData.announcements, (announcement) => {
    const date = startOf(announcement.createdAt, 'day');
    return {
      type: 'Announcement',
      icon: 'mdi-bullhorn',
      color: 'purple',
      text: `${announcement.author}: ${announcement.title}`,
      date: getEventDateMessage(date),
      daysFromToday: difference(now, date, 'day'),
      basecampLink: announcement.url,
      link: announcement.url
    };
  });

  let mergedEventsList = [
    ...anniversaries,
    ...newHires,
    ...birthdays,
    ...expenses,
    ...schedules,
    ...awards,
    ...certs,
    ...announcements
  ]; // merges lists
  events.value = _sortBy(_compact(mergedEventsList), 'daysFromToday'); //sorts by days from today
  store.dispatch('setEvents', { events: events.value });
  loadingEvents.value = false;
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
  _forEach(employees.value, (e) => {
    if (e.awards) {
      // add their name to the award
      namedAwards = [];
      _forEach(e.awards, (a) => {
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
  _forEach(employees.value, (e) => {
    if (e.certifications) {
      // add their name to the cert
      _forEach(e.certifications, (c) => {
        c.employee = e;
      });

      // add the named awards to the return list
      certs = [...certs, ...e.certifications];
    }
  });

  // :)
  return certs;
} // getEmployeeCerts

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
  router.push(`/employee/${store.getters.employeeNumber}`);
} // handleProfile

/**
 * Loads all of the home page data concurrently upon entering the page.
 */
async function loadHomePageData() {
  await Promise.all([refreshEmployee(), createEvents()]);
  emitter.emit('auto-save-pto-planner');
} // loadHomePageData

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  loadingBudgets.value = true;
  employee.value = store.getters.user;
  hireDate.value = employee.value.hireDate;
  fiscalDateView.value = getCurrentBudgetYear(hireDate.value);
  await Promise.all([
    !store.getters.expenseTypes ? updateStoreExpenseTypes() : '',
    !store.getters.budgets ? updateStoreBudgets() : ''
  ]);
  expenseTypes.value = store.getters.expenseTypes;
  accessibleBudgets.value = store.getters.budgets;
  loadingBudgets.value = false;
} // refreshEmployee

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * A watcher for when the vuex store is populated with necessary data.
 */
async function watchStoreIsPopulated() {
  if (store.getters.storeIsPopulated) {
    loading.value = false;
    await loadHomePageData();
  }
} // watchStoreIsPopulated

watch(
  () => store.getters.storeIsPopulated,
  () => watchStoreIsPopulated()
);
</script>
