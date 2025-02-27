<template>
  <div v-if="model == null && !loading" class="text-center">
    <h1>Invalid Employee!</h1>
    <v-container class="invalid-results-gif">
      <v-img
        src="https://media.giphy.com/media/fnuSiwXMTV3zmYDf6k/giphy.gif"
        alt="GIF of Kazoo Kid saying 'Wait a minute, who are you?'"
        aspect-ratio="4/3"
      ></v-img>
    </v-container>
  </div>
  <v-container v-else fluid class="pa-0">
    <v-row v-if="basicEmployeeDataLoading" class="pt-0">
      <employee-page-loader />
    </v-row>
    <div v-else>
      <v-row align="center" class="pt-3" :justify="displayTimeAndBalances ? 'start' : 'center'">
        <v-col class="pa-0 pl-4" :cols="displayTimeAndBalances && !isMobile() ? 3 : 12">
          <v-btn id="backBtn" elevation="2" :size="isMobile() ? 'small' : 'default'" @click="router.back()">
            <v-icon size="large" class="pr-1"> mdi-arrow-left-thin </v-icon>
            Back
          </v-btn>
          <v-btn
            if="alphaBtn"
            rounded="xl"
            color="#bc3825"
            :size="isMobile() ? 'small' : 'default'"
            @click="goBackToAlphaProfile()"
            theme="dark"
            class="ma-2"
          >
            old view
          </v-btn>
        </v-col>

        <v-col
          :class="!isMobile() ? 'ml-4 pa-0 d-flex justify-center' : ''"
          :align="isMobile() ? 'center' : ''"
          :cols="isMobile() ? 12 : 6"
        >
          <v-row no-gutters class="fit-content d-flex-inline align-center">
            <v-col :cols="isMobile() ? 9 : ''" class="text-no-wrap d-flex align-center">
              <!-- if user is admin, show search button -->
              <v-btn icon="" variant="text" @click="onSearchButton()">
                <v-icon v-if="!inSearchMode" size="32" color="black">mdi-magnify</v-icon>
                <v-icon v-else size="32" color="black">mdi-magnify-remove-outline</v-icon>
              </v-btn>
              <!-- if user is not searching -->
              <v-scroll-y-transition mode="out-in" @after-enter="openMenu = true">
                <div v-if="!inSearchMode">
                  <!-- if user is viewing their own profile  -->
                  <p
                    v-if="isUser"
                    :class="!isMobile() ? 'text-h6 text-sm-h4 text-center mb-0' : 'text-center mb-0'"
                    style="font-family: 'Avenir', Helvetica, Arial, sans-serif; font-size: 30px"
                  >
                    <b>{{ 'Hello, ' + model.firstName + '!' }}</b>
                  </p>
                  <p
                    v-else
                    :class="!isMobile() ? 'text-h6 text-sm-h4 text-center mb-0' : 'text-center mb-0'"
                    style="font-family: 'Avenir', Helvetica, Arial, sans-serif; font-size: 30px"
                  >
                    <b>Search Employees</b>
                  </p>
                </div>
                <!-- if user is searching -->
                <v-responsive min-width="250px" class="d-flex align-center" v-else-if="inSearchMode">
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
                    clearable
                    :menu="openMenu"
                    @blur="openMenu = false"
                    @update:model-value="onSearchUpdate()"
                  ></v-autocomplete>
                </v-responsive>
              </v-scroll-y-transition>
            </v-col>

            <!-- Navigation Buttons for normal view (not in mobile)-->
            <v-col v-if="!isMobile()" class="pl-6">
              <v-btn v-if="isAdmin" :disabled="loading" icon variant="text" @click="navEmployee(-1)">
                <v-tooltip activator="parent" location="top"> Previous employee </v-tooltip>
                <v-icon size="50px"> mdi-arrow-left-thin </v-icon>
              </v-btn>
              <v-btn v-if="isAdmin" :disabled="loading" icon variant="text" class="mr-3" @click="navEmployee(1)">
                <v-tooltip activator="parent" location="top"> Next employee </v-tooltip>
                <v-icon size="50px"> mdi-arrow-right-thin </v-icon>
              </v-btn>
            </v-col>
            <!-- End navigation buttons for normal view -->
          </v-row>
        </v-col>
      </v-row>

      <v-row class="pa-0 ma-0" justify="center">
        <!-- Timesheets and Budgets-->
        <v-col v-if="displayTimeAndBalances" cols="12" lg="4" class="pt-0" height>
          <time-data :key="model" :employee="model" class="my-4" />
          <employee-budgets
            :employee="model"
            :expenses="expenses"
            :expense-types="expenseTypes"
            :accessible-budgets="accessibleBudgets"
            :employee-data-loading="loading"
            :fiscal-date-view="fiscalDateView"
            :refreshKey="refreshKey"
            class="mb-4"
          />
        </v-col>
        <v-col cols="12" :lg="displayTimeAndBalances ? 8 : 11" class="pa-0">
          <employee-info
            v-model="model"
            :contracts="contracts"
            :loading="loading"
            :refreshKey="refreshKey"
          ></employee-info>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import EmployeeBudgets from '@/components/employee-beta/EmployeeBudgets.vue';
import EmployeeInfo from '@/components/employee-beta/EmployeeInfo.vue';
import EmployeePageLoader from '@/components/employees/EmployeePageLoader.vue';
import TimeData from '@/components/shared/timesheets/TimeData.vue';
import api from '@/shared/api.js';
import { employeeFilter } from '@/shared/filterUtils';
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
import { useDisplaySuccess } from '../components/shared/StatusSnackbar.vue';
import { Employee } from '../shared/models/employeeTypes';

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

/** @type {import('vue').Ref<Employee>} */
const model = ref(null); // selected employee

const accessibleBudgets = ref(null);
const basicEmployeeDataLoading = ref(true);
const contracts = ref(null);
const displayTimeAndBalances = ref(false);
const expenses = ref(null);
const expenseTypes = ref(null);
const fiscalDateView = ref('');
const loading = ref(true);
const openMenu = ref(false);
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
  }
  if (!store.getters.employees) await updateStoreEmployees();
});

onMounted(() => {
  // register events
  //TODO: add emitters with updating employee through the editing form
  emitter.on('update', (updatedEmployee) => {
    if (updatedEmployee) {
      let shouldUpdateHistory = updatedEmployee.employeeNumber !== model.value.employeeNumber;
      model.value = new Employee(updatedEmployee);
      if (shouldUpdateHistory) history.pushState({}, null, model.value.employeeNumber);
      useDisplaySuccess('Employee successfully updated!');
    }
  });
  emitter.on('selected-budget-year', (date) => {
    if (date != fiscalDateView.value) {
      fiscalDateView.value = date;
    }
  });
});

onBeforeUnmount(() => {
  emitter.off('update');
  emitter.off('selected-budget-year');
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
    model.value = new Employee(store.getters.user);
  } else {
    // user looking at another employees profile
    let employees = store.getters.employees;
    let found = _.find(employees, (employee) => {
      return employee.employeeNumber == route.params.id;
    });
    model.value = found ? new Employee(found) : undefined;
  }
  user.value = store.getters.user;
  contracts.value = store.getters.contracts;
  displayTimeAndBalances.value = userRoleIsAdmin() || userIsEmployee();
  isAdmin.value = hasAdminPermissions();
  isUser.value = userIsEmployee();
  basicEmployeeDataLoading.value = false;
  if (model.value) {
    refreshExpenseData(true);
  }
  loading.value = false;
} // getProfileData

/**
 * Routes user to their employee page
 */
function goBackToAlphaProfile() {
  router.push(`/employee-old/${route.params.id}`);
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
  fiscalDateView.value = getCurrentBudgetYear(model.value.hireDate);
  await checkForBudgetAccess();
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
  openMenu.value = false;
}

/**
 * Run when the employee search field is updated
 */
async function onSearchUpdate() {
  if (dropdownEmployee.value) {
    await router.push({ path: `/employee/${dropdownEmployee.value.employeeNumber}`, hash: route.hash });
  }
}
/**
 * Navigates to an employee
 * future: support custom loops
 *
 * @input num - amount of employees to move fowards (may be negative for backwards)
 */
async function navEmployee(num) {
  // set vars
  let loop, pos, res;
  let currId = model.value.employeeNumber;

  // create 'loop' of employees in order of their employee number
  loop = store.getters.employees || (await updateStoreEmployees());
  loop = loop.filter((e) => e.workStatus !== 0);
  loop = _.sortBy(loop, ['employeeNumber']);

  // get the employee we're currently at and grab the employee `num` after in
  // the loop (this can be negative to go backwards, and can be more than 1)
  pos = _.findIndex(loop, (e) => e.employeeNumber == currId);
  res = (pos + num) % loop.length;
  if (res < 0) res = loop.length - 1;
  dropdownEmployee.value = _.cloneDeep(loop[res]);
  dropdownEmployee.value.itemTitle = `${dropdownEmployee.value.lastName}, ${dropdownEmployee.value.nickname || dropdownEmployee.value.firstName}`; //add the itemTitle for the searchbar

  // budget information needs to be reloaded specifically as it does not update
  // when the model does
  await refreshExpenseData();

  onSearchUpdate();
} // navEmployee

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
    if (storeIsPopulated && !basicEmployeeDataLoading.value) {
      await getProfileData();
    }
  } // watchStoreisPopulated
);

/**
 * Load profile data if routed to different employee
 */
watch(
  () => route.params.id,
  async () => {
    await getProfileData();
  }
);
</script>

<style scoped>
.invalid-results-gif {
  max-width: 80%;
}
</style>
