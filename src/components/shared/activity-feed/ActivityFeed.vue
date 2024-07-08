<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <div>
    <v-card class="overflow-y-hidden">
      <!-- Title -->
      <v-card-title class="d-flex align-center justify-space-between header_style">
        <h3>Activity Feed</h3>
        <div class="d-flex">
          <v-switch
            v-if="smAndUp"
            v-model="toggleUserActivities"
            label="Show User Activities"
            color="info"
            base-color="white"
            inset
            hide-details
            class="px-2"
          ></v-switch>
          <v-switch v-model="toggleEnable" label="Enable" color="info" base-color="white" inset hide-details></v-switch>
        </div>
      </v-card-title>
      <v-spacer></v-spacer>
      <v-expand-transition v-show="toggleEnable">
        <div v-if="loading" class="pa-8 pt-6">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <div v-else>
          <!-- Autocomplete filters -->
          <v-card-text class="mb-0 pb-0">
            <!-- Loading Bar -->
            <v-autocomplete
              v-model="activeFilters"
              :items="filters"
              multiple
              chips
              closable-chips
              hide-details
              variant="filled"
              density="compact"
              return-object
              item-title="type"
              item-value="type"
              v-model:search="searchString"
              @update:model-value="searchString = ''"
              class="elevate"
              append-icon=""
            >
              <template v-slot:chip="{ props, item }">
                <v-chip v-bind="props" class="pl-2">
                  <v-avatar :color="item.raw.color" size="23" class="mr-1">
                    <v-icon color="white" close>{{ item.raw.icon }}</v-icon>
                  </v-avatar>
                  <span class="text-black">
                    {{ item.raw.type }}
                  </span>
                </v-chip>
              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.type">
                  <template v-slot:prepend>
                    <v-avatar :color="item.raw.color" size="30" class="mr-1">
                      <v-icon color="white" close>{{ item.raw.icon }}</v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-card-text>
          <v-timeline side="end" density="compact" class="timeline ml-9">
            <!-- Timeline -->
            <v-timeline-item v-for="item in filterEvents" density="compact" :dot-color="item.color" :key="item.name">
              <!-- Expanded Event Description -->
              <v-tooltip
                v-if="item.truncatedText"
                activator="parent"
                location="top"
                max-width="400px"
                min-width="200px"
                :color="item.truncatedText ? 'grey-darken-3' : 'rgba(0, 0, 0, 0)'"
                open-delay="200"
              >
                <span class="activityFeedText">{{ item.text }}</span>
              </v-tooltip>
              <!-- Icon -->
              <template v-slot:icon v-if="item.icon">
                <v-btn variant="text" icon :href="getURL(item)" target="blank">
                  <v-tooltip
                    v-if="
                      item.newCampfire ||
                      item.congratulateCampfire ||
                      item.birthdayCampfire ||
                      item.campfire ||
                      item.eventScheduled ||
                      item.basecampLink
                    "
                    activator="parent"
                    location="bottom"
                  >
                    <span v-if="item.newCampfire">Welcome to team</span>
                    <span v-else-if="item.congratulateCampfire">Congratulate</span>
                    <span v-else-if="item.birthdayCampfire">Say happy birthday</span>
                    <span v-else-if="item.campfire">Comment in campfire</span>
                    <span v-else-if="item.eventScheduled">See event</span>
                    <span v-else-if="item.basecampLink">View in Basecamp</span>
                  </v-tooltip>
                  <v-icon class="text-white">{{ item.icon }}</v-icon>
                </v-btn>
              </template>
              <!-- End Icon -->

              <!-- Item Title: Date -->
              <h3>{{ item.date }}</h3>

              <div v-if="item.type === 'Anniversary'" class="px-4">
                <v-btn @click="openAnniversariesModal(item)" color="#bc3825" class="text-white" size="small"
                  >View {{ item.events.length }} {{ item.events.length > 1 ? 'Anniversaries' : 'Anniversary' }}</v-btn
                >
              </div>

              <div v-else>
                <!-- Event has a link -->
                <v-list-item
                  class="ma-auto pa-auto activityFeedText"
                  v-if="item.link"
                  :href="item.link"
                  target="_blank"
                  :density="true && 'compact'"
                >
                  <v-row dense>
                    <v-col cols="11">{{ item.truncatedText ? item.truncatedText : item.text }}&nbsp;</v-col>
                    <v-col cols="1">
                      <v-icon height="12" width="12" color="blue">open-in-new</v-icon>
                    </v-col>
                  </v-row>
                </v-list-item>
                <!-- Event does not have a link -->
                <div class="px-4 activityFeedText" v-else>
                  {{ item.truncatedText ? item.truncatedText : item.text }}
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </div>
      </v-expand-transition>
    </v-card>
    <v-dialog v-model="toggleAnniversariesModal" max-width="700" scrollable>
      <AnniversariesModal :item="item" />
    </v-dialog>
  </div>
</template>

<script setup>
import _ from 'lodash';
import api from '@/shared/api.js';
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
} from '@/shared/dateUtils';
import { isEmpty } from '@/utils/utils';
import AnniversariesModal from './AnniversariesModal.vue';
import { computed, inject, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useDisplay } from 'vuetify';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|
const TEXTMAXLENGTH = 110;

const { smAndUp } = useDisplay();
const emitter = inject('emitter');
const store = useStore();
const props = defineProps({
  employee: {
    type: Object,
    required: true
  }
});
const toggleActivitiesFeedStorage = JSON.parse(localStorage.toggleActivitiesFeed ?? '{}'); // retrieve key from localStorage as object

const activeFilters = ref([]);
const events = ref([]);
const employeeEvents = ref([]);
const filters = ref([]);
const item = ref(null);
const loading = ref(true);
const searchString = ref('');
const toggleAnniversariesModal = ref(false);
const toggleEnable = ref(JSON.parse(toggleActivitiesFeedStorage?.enable ?? 'true'));
const toggleUserActivities = ref(JSON.parse(toggleActivitiesFeedStorage?.userActivities ?? 'false'));

emitter.on('close-anniversaries-modal', () => {
  toggleAnniversariesModal.value = false;
});

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(async () => {
  if (store.getters.storeIsPopulated) {
    await createEvents();
  }
});

onBeforeUnmount(() => {
  localStorage.toggleActivitiesFeed = JSON.stringify({
    enable: toggleEnable.value,
    userActivities: toggleUserActivities.value
  });
});

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
computed(store.getters.storeIsPopulated);

/**
 * Used to remove events that the user has filtered out,
 * then the remaining events will be displayed in the
 * activity feed.
 *
 * @return array - filtered events array
 */
const filterEvents = computed(() => {
  if (toggleUserActivities.value) {
    return _.filter(employeeEvents.value, (event) => activeFilters.value.some((f) => f.type === event.type));
  }
  return _.filter(events.value, (event) => activeFilters.value.some((f) => f.type === event.type));
}); // filterEvents

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Create the events to populate the activity feed
 */
async function createEvents() {
  if (!toggleEnable.value) {
    return;
  }
  loading.value = true;
  if (store.getters.events) {
    events.value = store.getters.events;
    // add all event types to filters and set activeFilters to all types by default
    filters.value = activeFilters.value = _.uniqBy(events.value, 'type');
    // filter events only containing the current employee
    employeeEvents.value = _.filter(events.value, (event) =>
      event.employees?.includes(getEmployeePreferredName(props.employee))
    );
    loading.value = false;
    return; //exit function
  }
  const eventData = await api.getAllEvents();
  const employees = eventData.employees;
  const scheduleEntries = _.flatten(eventData.schedules);
  const aggregatedExpenses = eventData.expenses;
  const aggregatedAwards = getEmployeeAwards(employees);
  const aggregatedCerts = getEmployeeCerts(employees);

  //we want to use their nicknames if they have one
  employees.forEach((employee) => {
    employee.firstName = getEmployeePreferredName(employee);
  });

  let monthsBack = 5;
  // created empty two-dimensional array
  let anniversaries = [...Array(monthsBack)].map(() => Array(monthsBack));
  let newHires = [];
  _.forEach(employees, (a) => {
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
            event.employees = [getEmployeePreferredName(a)];
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
            event.employees = [getEmployeePreferredName(a)];
            event.anniversary = anniversary;
            event.icon = 'mdi-party-popper';
            event.type = 'Anniversary';
            event.congratulateCampfire = 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726';
          }
          event.daysFromToday = difference(startOf(todaysDate, 'day'), startOf(anniversary, 'day'), 'day');
          event.color = '#bc3825';
          if (TEXTMAXLENGTH < event.text.length) {
            event.truncatedText = _.truncate(event.text, { length: TEXTMAXLENGTH });
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
  let birthdays = _.map(employees, (b) => {
    if (b.birthdayFeed && !isEmpty(b.birthday) && b.workStatus != 0) {
      let event = {};
      let now = getTodaysDate();
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
      event.employees = [getEmployeePreferredName(b)];
      event.icon = 'mdi-cake-variant';
      event.type = 'Birthday';
      event.color = 'orange darken-3';
      event.daysFromToday = difference(startOf(now, 'day'), startOf(birthday, 'day'), 'day');
      event.birthdayCampfire = 'https://3.basecamp.com/3097063/buckets/171415/chats/29039726';
      if (TEXTMAXLENGTH < event.text.length) {
        event.truncatedText = _.truncate(event.text, { length: TEXTMAXLENGTH });
      }
      return event;
    }
    return null;
  });

  // generate expenses
  let expenses = _.map(aggregatedExpenses, (a) => {
    if (!isEmpty(a.showOnFeed) && a.showOnFeed) {
      //value of showOnFeed is true
      let now = getTodaysDate();
      let reimbursedDate = format(a.reimbursedDate, 'YYYY-MM-DD', 'YYYY-MM-DD');
      let event = {};
      event.date = getEventDateMessage(reimbursedDate);
      if (!isEmpty(a.url)) {
        event.link = a.url;
      }
      event.text = `${getEmployeePreferredName(a)} ${a.lastName} used their ${a.budgetName} budget on ${a.description}`;
      event.employees = [getEmployeePreferredName(a)];
      event.daysFromToday = difference(startOf(now, 'day'), startOf(reimbursedDate, 'day'), 'day');
      if (a.budgetName === 'High Five') {
        event.congratulateCampfile = a.campfire;
        event.icon = 'mdi-hands-pray';
        event.type = 'High Five';
        event.color = '#167c80'; // like a dark teal kinda color
        const recipient = _.find(employees, (e) => {
          return e.id === a.recipient;
        });
        if (recipient) {
          event.text = `${getEmployeePreferredName(a)} ${a.lastName} gave ${getEmployeePreferredName(recipient)} ${
            recipient.lastName
          } a High Five: ${a.note}`;
          event.employees = [getEmployeePreferredName(a), getEmployeePreferredName(recipient)];
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
      if (TEXTMAXLENGTH < event.text.length) {
        event.truncatedText = _.truncate(event.text, { length: TEXTMAXLENGTH });
      }
      return event;
    } else {
      //not a technology budget
      return null;
    }
  });

  // generate schedules
  let schedules = _.map(scheduleEntries, (a) => {
    let now = getTodaysDate();
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
    if (TEXTMAXLENGTH < event.text.length) {
      event.truncatedText = _.truncate(event.text, { length: TEXTMAXLENGTH });
    }
    return event;
  });

  // generate awards
  let awards = _.map(aggregatedAwards, (a) => {
    // get award information
    let now = getTodaysDate();
    const dateSubmitted = a.dateSubmitted || a.dateReceived;
    let award = {
      icon: 'mdi-fire',
      color: '#f9c64e',
      type: 'Award',
      daysFromToday: difference(startOf(now, 'day'), startOf(dateSubmitted, 'day'), 'day'),
      employees: [getEmployeePreferredName(a.employee)],
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
  let certs = _.map(aggregatedCerts, (c) => {
    // get cert information
    let now = getTodaysDate();
    const dateSubmitted = c.dateSubmitted || c.dateReceived;
    let cert = {
      icon: 'mdi-certificate',
      color: 'blue lighten-1',
      type: 'Certification',
      daysFromToday: difference(startOf(now, 'day'), startOf(dateSubmitted, 'day'), 'day'),
      employees: [getEmployeePreferredName(c.employee)],
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
  events.value = _.sortBy(_.compact(mergedEventsList), 'daysFromToday'); //sorts by days from today
  store.dispatch('setEvents', { events: events.value });
  // add all event types to filters and set activeFilters to all types by default
  filters.value = activeFilters.value = _.uniqBy(events.value, 'type');
  // filter events only containing the current employee
  employeeEvents.value = _.filter(events.value, (event) =>
    event.employees?.includes(getEmployeePreferredName(props.employee))
  );
  loading.value = false;
} //createEvents

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
 * @param employees - list of employees
 * @return all awards
 */
function getEmployeeAwards(employees) {
  let awards = []; // will be returned
  let namedAwards = []; // temp variable for adding employee name

  // for each employee, get their awards
  employees.forEach((e) => {
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
 *  * @param employees - list of employees
 */
function getEmployeeCerts(employees) {
  let certs = []; // will be returned

  // for each employee, get their certs
  employees.forEach((e) => {
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
 * Gets the URL to basecamp for an activity feed event.
 *
 * @param item - activity feed event
 * @return String - basecamp url
 */
function getURL(item) {
  if (!_.isNil(item.newCampfire)) {
    return item.newCampfire;
  } else if (!_.isNil(item.congratulateCampfire)) {
    return item.congratulateCampfire;
  } else if (!_.isNil(item.birthdayCampfire)) {
    return item.birthdayCampfire;
  } else if (!_.isNil(item.campfire)) {
    return item.campfire;
  } else if (!_.isNil(item.eventScheduled)) {
    return item.eventScheduled;
  } else if (!_.isNil(item.basecampLink)) return item.basecampLink;
} // getURL

/**
 * Opens the modal for employees with anniversaries in a certain month.
 *
 * @param item Object - The month's anniversaries
 */
function openAnniversariesModal(anniversaries) {
  toggleAnniversariesModal.value = true;
  anniversaries.events.sort((a, b) => new Date(a.anniversary) - new Date(b.anniversary));
  item.value = anniversaries;
} // openAnniversariesModal

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * A watcher for when the vuex store is populated with necessary data.
 */
watch(
  () => store.getters.storeIsPopulated,
  async () => {
    if (store.getters.storeIsPopulated) {
      await createEvents();
    }
  }
);

/**
 * A watcher for when the activties feed is enabled but data is not loaded
 */
watch(toggleEnable, async () => {
  if (loading.value) {
    await createEvents();
  }
});
</script>

<style lang="scss" scoped>
.activityFeedText {
  font-weight: normal;
}

.timeline {
  height: 100vh !important;
  max-height: 100vh !important;
  overflow-y: scroll;
}

.v-tooltip__content.menuable__content__active {
  opacity: 1 !important;
}
</style>
