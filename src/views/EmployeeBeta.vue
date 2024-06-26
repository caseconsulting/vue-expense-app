<template>
  <v-container>
    <v-row v-if="basicEmployeeDataLoading" class="pt-0">
      <employee-page-loader />
    </v-row>
    <div v-else>
      <employee-info :model="model"></employee-info>
      <hire-info-card :model="model"></hire-info-card>
      <certifications-card
        :model="model"
        :isAdmin="hasAdminPermissions()"
        :isUser="userIsEmployee()"
      ></certifications-card>
      <awards-card :model="model" :isAdmin="hasAdminPermissions()" :isUser="userIsEmployee()"></awards-card>
      <v-btn color="#bc3825" @click="goBackToAlphaProfile()" theme="dark" class="ma-2">Go to Alpha profile!</v-btn>
    </div>
  </v-container>
</template>

<script setup>
import {
  updateStoreContracts,
  updateStoreEmployees,
  updateStoreTags,
  // updateStoreExpenseTypes,
  updateStoreUser
} from '@/utils/storeUtils';
import {
  // getCurrentBudgetYear,
  // isEmpty,
  // isMobile,
  storeIsPopulated,
  userRoleIsAdmin,
  userRoleIsManager
} from '@/utils/utils.js';
import _ from 'lodash';
import { inject, onBeforeMount, onMounted, provide, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import AwardsCard from '../components/employee-beta/AwardsCard.vue';
import CertificationsCard from '../components/employee-beta/CertificationsCard.vue';
import EmployeeInfo from '../components/employee-beta/EmployeeInfo.vue';
import EmployeePageLoader from '../components/employees/EmployeePageLoader.vue';
import HireInfoCard from '../components/employee-beta/HireInfoCard.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const store = useStore();
const route = useRoute();
const router = useRouter();

const basicEmployeeDataLoading = ref(false);
const contracts = ref(null);
const displayTimeAndBalances = ref(false);
const loading = ref(false);

const isAdmin = ref(false);
provide('isAdmin', isAdmin);
const isUser = ref(false);
provide('isUser', isUser);

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
  lastName: '',
  middleName: '',
  nickname: '',
  noMiddleName: false,
  personalEmail: '',
  phoneNumber: '',
  prime: '',
  st: '',
  technologies: [],
  twitter: '',
  workStatus: 100
}); // selected employee
const user = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|
onBeforeMount(async () => {
  storeIsPopulated() ? await getProfileData() : (loading.value = true);
  if (!store.getters.employees) await updateStoreEmployees();
});

onMounted(() => {
  //TODO: add emitters with updating employee through the editing form
  emitter.on('update', (updatedEmployee) => {
    if (updatedEmployee) {
      model.value = updatedEmployee;
    }
  });
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
  displayTimeAndBalances.value = hasAdminPermissions();
  basicEmployeeDataLoading.value = false;
  isAdmin.value = hasAdminPermissions();
  isUser.value = userIsEmployee();
  if (model.value) {
    // await refreshExpenseData(true); //TODO:Implement Expenses and Quickbooks Time
  }
  loading.value = false;
} // getProfileData

/**
 * Routes user to their employee page
 */
function goBackToAlphaProfile() {
  router.push(`/employee/${store.getters.employeeNumber}`);
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
 * Check if the user the employee that is displayed. Returns true if the user is the employee displayed, otherwise returns false.
 *
 * @return boolean - user is the employee that is displayed
 */
function userIsEmployee() {
  return !_.isNil(model.value) && !_.isNil(user.value)
    ? user.value.employeeNumber === model.value.employeeNumber
    : false;
} // userIsEmployee

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Load the profile data if the page is refreshed.
 */
watch(
  () => storeIsPopulated(),
  async () => {
    if (storeIsPopulated()) await getProfileData();
  } // watchStoreisPopulated
);
</script>
