<template>
  <v-container fluid id="full-page">
    <span v-if="loading">
      <v-row>
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0 d-flex justify-center align-center">
          <v-skeleton-loader type="text" width="80%" />
        </v-col>
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@2" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@5" />
        </v-col>
        <v-col cols="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@5" />
        </v-col>
        <v-col cols="12" class="pb-3 px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@14" />
        </v-col>
      </v-row>
      <v-row>
        <v-col mt-0 class="pa-0 px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@14" />
        </v-col>
      </v-row>
    </span>
    <span v-else>
      <v-row class="pb-3">
        <!-- Title -->
        <v-col cols="12" md="6">
          <h1 v-if="isBirthday(employee)" align="center" justify="center" id="home-greeting">
            Happy Birthday, {{ getEmployeePreferredName(employee) }}!
          </h1>
          <h1 v-else-if="isAnniversary(employee)" align="center" justify="center" id="home-greeting">
            Happy Anniversary, {{ getEmployeePreferredName(employee) }}!
          </h1>
          <h1 v-else align="center" justify="center" id="home-greeting">
            Hello, {{ getEmployeePreferredName(employee) }}!
          </h1>
          <div class="text-center">
            <v-btn color="#bc3825" @click="handleProfile()" theme="dark">View Profile</v-btn>
          </div>
        </v-col>

        <!-- Anniversary Date -->
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0">
          <anniversary-card v-if="!loading" :employee="employee" :has-budgets="true" location="home" />
          <ConfettiExplosion
            v-if="isBirthday(employee) || isAnniversary(employee)"
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
          <activity-feed id="home-activity-feed" :employee="employee" />
        </v-col>
      </v-row>
    </span>
  </v-container>
</template>

<script setup>
import ActivityFeed from '@/components/shared/activity-feed/ActivityFeed.vue';
import AvailableBudgets from '@/components/shared/AvailableBudgets.vue';
import { getCurrentBudgetYear } from '@/utils/utils';
import { updateStoreExpenseTypes, updateStoreBudgets } from '@/utils/storeUtils';
import TimeData from '@/components/shared/timesheets/TimeData';
import AnniversaryCard from '@/components/shared/AnniversaryCard';
import ConfettiExplosion from 'vue-confetti-explosion';
import { format, getTodaysDate, difference, getYear, setYear, endOf, DEFAULT_ISOFORMAT } from '../shared/dateUtils';
import { ref, onBeforeMount, computed, watch } from 'vue';
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
const employee = ref({}); // employee
const expenses = ref(null);
const expenseTypes = ref(null);
const fiscalDateView = ref(''); // current budget year view by anniversary day
const hireDate = ref(''); // employee hire date
const loading = ref(true);
const loadingBudgets = ref(true);

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
    await loadHomePageData();
    loading.value = false;
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
  await refreshEmployee();
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
    await loadHomePageData();
    loading.value = false;
  }
} // watchStoreIsPopulated

watch(
  () => store.getters.storeIsPopulated,
  () => watchStoreIsPopulated()
);
</script>
