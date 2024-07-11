<template>
  <v-container fluid class="pa-0">
    <v-row v-if="basicEmployeeDataLoading" class="pt-0">
      <employee-page-loader />
    </v-row>
    <div v-else>
      <v-row align="center" class="pt-3">
        <v-col class="pa-0 pl-4" cols="4">
          <v-btn id="backBtn" elevation="2" :size="isMobile() ? 'x-small' : 'default'" @click="router.back()">
            <v-icon size="large" class="pr-1"> mdi-arrow-left-thin </v-icon>
            Back
          </v-btn>
          <v-btn color="#bc3825" @click="goBackToAlphaProfile()" theme="dark" class="ma-2">Go to Alpha profile!</v-btn>
        </v-col>
        <v-col class="pa-0 d-flex justify-center" cols="4">
          <v-row no-gutters class="fit-content d-flex-inline align-center">
            <!-- if user is admin, show search button -->
            <v-col v-if="isAdmin" class="fit-content d-flex justify-end">
              <v-btn icon="" variant="text" @click="onSearchButton()">
                <v-icon size="32" color="black">mdi-magnify</v-icon>
              </v-btn>
            </v-col>
            <v-col class="text-no-wrap d-flex align-center">
              <!-- if user is not searching -->
              <div v-if="!inSearchMode">
                <!-- if user is viewing their own profile  -->
                <p
                  v-if="isUser"
                  class="text-h6 text-sm-h4 text-center mb-0"
                  style="font-family: 'Avenir', Helvetica, Arial, sans-serif"
                >
                  <b>{{ 'Hello, ' + model.firstName + '!' }}</b>
                </p>
                <p
                  v-else-if="isAdmin"
                  class="text-h6 text-sm-h4 text-center mb-0"
                  style="font-family: 'Avenir', Helvetica, Arial, sans-serif"
                >
                  <b>Search Employees</b>
                </p>
              </div>
              <!-- if user is admin and is searching -->
              <v-responsive v-else-if="isAdmin && inSearchMode" min-width="250px" class="d-flex align-center">
                <v-autocomplete
                  v-model="dropdownEmployee"
                  :items="employeeNames"
                  item-title="itemTitle"
                  :custom-filter="employeeFilter"
                  label="Search Employees"
                  density="comfortable"
                  hide-details
                  return-object
                  autofocus
                  @update:model-value="onSearchUpdate()"
                ></v-autocomplete>
              </v-responsive>
            </v-col>
          </v-row>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
      <v-row ref="">
        <!-- Timesheets and Budgets-->
        <v-col v-if="displayTimeAndBalances" cols="12" md="4" class="pt-0" height>
          <time-data :key="model" :employee="model" class="my-4" />
          <employee-budgets
            :refreshKey="refreshKey"
            class="mb-4"
            :employee="model"
            :expenses="expenses"
            :expense-types="expenseTypes"
            :accessible-budgets="accessibleBudgets"
            :employee-data-loading="loading"
            :fiscal-date-view="fiscalDateView"
          />
        </v-col>
        <v-col cols="12" :md="displayTimeAndBalances ? 7 : 12" class="pa-0">
          <employee-info v-model="model" :contracts="contracts" :loading="loading"></employee-info>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import api from '@/shared/api.js';
import {
  updateStoreBudgets,
  updateStoreContracts,
  updateStoreEmployees,
  updateStoreExpenseTypes,
  updateStoreTags,
  updateStoreUser
} from '@/utils/storeUtils';
import { getCurrentBudgetYear, isMobile, storeIsPopulated, userRoleIsAdmin, userRoleIsManager } from '@/utils/utils.js';
import _ from 'lodash';
import { computed, inject, onBeforeMount, onBeforeUnmount, onMounted, provide, readonly, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import EmployeeBudgets from '@/components/employee-beta/EmployeeBudgets.vue';
import EmployeeInfo from '@/components/employee-beta/EmployeeInfo.vue';
import EmployeePageLoader from '@/components/employees/EmployeePageLoader.vue';
import TimeData from '@/components/shared/timesheets/TimeData.vue';
import { employeeFilter } from '@/shared/filterUtils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const store = useStore();
const route = useRoute();
const router = useRouter();

//provide roles
const isAdmin = ref(false);
provide('isAdmin', isAdmin);
const isUser = ref(false);
provide('isUser', isUser);

const accessibleBudgets = ref(null);
const basicEmployeeDataLoading = ref(true);
const contracts = ref(null);
const displayTimeAndBalances = ref(false);
const expenses = ref(null);
const expenseTypes = ref(null);
const fiscalDateView = ref('');
const loading = ref(true);
const model = ref({
  awards: [],
  birthday: '',
  birthdayFeed: false,
  certifications: [],
  city: '',
  contract: '',
  country: '',
  currentCity: '',
  currentState: '',
  currentStreet: '',
  currentStreet2: '',
  currentZIP: '',
  degrees: [],
  deptDate: '',
  email: '@consultwithcase.com',
  employeeNumber: null,
  employeeRole: '',
  firstName: '',
  fiscalDateView: '',
  github: '',
  hireDate: null,
  id: null,
  jobRole: '',
  languages: [],
  lastName: '',
  linkedIn: '',
  middleName: '',
  nickname: '',
  noMiddleName: false,
  personalEmail: '',
  phoneNumber: '',
  prime: '',
  resumeUpdated: null,
  st: '',
  technologies: [],
  twitter: '',
  workStatus: 100
}); // selected employee
const refreshKey = readonly({
  model,
  expenses,
  expenseTypes,
  accessibleBudgets
});
const user = ref(null);
const inSearchMode = ref(false);
const dropdownEmployee = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(async () => {
  if (storeIsPopulated) {
    await getProfileData();
  } else {
    loading.value = true;
  }
  if (!store.getters.employees) await updateStoreEmployees();
});

onMounted(() => {
  // register events
  //TODO: add emitters with updating employee through the editing form
  emitter.on('update', (updatedEmployee) => {
    if (updatedEmployee) {
      model.value = updatedEmployee;
    }
  });
});

onBeforeUnmount(() => {
  emitter.off('update');
});

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

computed(storeIsPopulated);

/**
 * List of all employees with an item title for the autocomplete
 */
const employeeNames = computed(() => {
  let employees = _.filter(store.getters.employees, (e) => e.workStatus > 0);
  return _.map(employees, (e) => {
    return {
      ...e,
      itemTitle: `${e.lastName}, ${e.nickname || e.firstName}`
    };
  });
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the user has access to any budgets
 */
async function checkForBudgetAccess() {
  if (userIsEmployee()) {
    if (!store.getters.budgets) {
      await updateStoreBudgets();
    }
    accessibleBudgets.value = store.getters.budgets;
  } else if (hasAdminPermissions()) {
    accessibleBudgets.value = await api.getAllActiveEmployeeBudgets(model.value.id);
  }
} // checkForBudgetAccess

/**
 * Get employee data.
 */
async function getProfileData() {
  loading.value = true;
  basicEmployeeDataLoading.value = true;
  await Promise.all([
    !store.getters.employees ? updateStoreEmployees() : '',
    !store.getters.user ? updateStoreUser() : '',
    !store.getters.contracts ? updateStoreContracts() : '',
    hasAdminPermissions() && !store.getters.tags ? updateStoreTags() : ''
  ]);
  if (store.getters.user.employeeNumber == route.params.id) {
    // user looking at their own profile
    model.value = store.getters.user;
  } else {
    // user looking at another employees profile
    let employees = store.getters.employees;
    model.value = _.find(employees, (employee) => {
      return employee.employeeNumber == route.params.id;
    });
  }
  user.value = store.getters.user;
  contracts.value = store.getters.contracts;
  displayTimeAndBalances.value = userRoleIsAdmin() || userIsEmployee();
  isAdmin.value = hasAdminPermissions();
  isUser.value = userIsEmployee();
  basicEmployeeDataLoading.value = false;
  if (model.value) {
    await refreshExpenseData(true); //TODO: Implement Expenses
  }
  loading.value = false;
} // getProfileData

/**
 * Routes user to their employee page
 */
function goBackToAlphaProfile() {
  router.push(`/employee/${route.params.id}`);
} // handleProfile

/**
 * checks to see if the user has admin permissions
 *
 * @return boolean - whether the user is an admin or manager
 */
function hasAdminPermissions() {
  return userRoleIsAdmin() || userRoleIsManager();
} // hasAdminPermissions

/**
 * Refreshes expense data based on the model, including: accessibleBudgets, expenses, expenseTypes, and fiscalDateView
 */
async function refreshExpenseData(full = false) {
  // these are aggregated so it probably doesn't need to be updated
  if (full) {
    [expenses.value] = await Promise.all([
      hasAdminPermissions() || userIsEmployee() ? api.getAllAggregateExpenses() : '', // only load if needed
      !store.getters.expenseTypes ? updateStoreExpenseTypes() : ''
    ]);
    expenseTypes.value = store.getters.expenseTypes;
  }
  await checkForBudgetAccess();
  fiscalDateView.value = getCurrentBudgetYear(model.value.hireDate);
} // refreshExpenseData

/**
 * Check if the user the employee that is displayed. Returns true if the user is the employee displayed, otherwise returns false.
 *
 * @return boolean - user is the employee that is displayed
 */
function userIsEmployee() {
  return !_.isNil(model.value) && !_.isNil(user.value)
    ? user.value.employeeNumber === model.value.employeeNumber
    : false;
} // userIsEmployee

/**
 * Toggles search mode when the search button is clicked
 */
function onSearchButton() {
  inSearchMode.value = !inSearchMode.value;
}

/**
 * Run when the employee search field is updated
 */
function onSearchUpdate() {
  if (dropdownEmployee.value) router.push(`${dropdownEmployee.value.employeeNumber}`);
}

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Load the profile data if the page is refreshed.
 */
watch(
  storeIsPopulated,
  async () => {
    if (storeIsPopulated) {
      console.log('watch store');
      await getProfileData();
    }
  } // watchStoreisPopulated
);
</script>
