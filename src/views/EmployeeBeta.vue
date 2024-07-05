<template>
  <v-container fluid>
    <v-row v-if="basicEmployeeDataLoading" class="pt-0">
      <employee-page-loader />
    </v-row>
    <div v-else>
      <v-row>
        <v-col>
          <v-btn id="backBtn" elevation="2" :size="isMobile() ? 'x-small' : 'default'" @click="router.back()">
            <v-icon size="large" class="pr-1"> mdi-arrow-left-thin </v-icon>
            Back
          </v-btn>
          <v-btn color="#bc3825" @click="goBackToAlphaProfile()" theme="dark" class="ma-2">Go to Alpha profile!</v-btn>
        </v-col>
        <v-col align-self="center" class="d-flex justify-center">
          <h1>{{ 'Hello, ' + model.firstName + '!' }}</h1>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
      <v-container id="employee-container">
        <base-card title="Employee" elevation="5">
          <template #title>
            <div class="d-flex justify-lg-space-between align-center">
              <h3 class="text-white">{{ employeeTitle }}</h3>
            </div>
          </template>
          <template #actions>
            <resume-card v-model="model" :editing="editing" :loading="loading"></resume-card>
          </template>
          <v-row justify="center">
            <v-col style="max-width: 650px">
              <div class="d-flex flex-column justify-center align-center">
                <employee-info :model="model"></employee-info>
                <!-- hire and contract info -->
                <v-row class="ma-2">
                  <v-col class="pa-3" style="max-width: fit-content">
                    <contract-info-card :contracts="contracts" :model="model"></contract-info-card>
                  </v-col>
                  <v-col class="pa-3" style="max-width: fit-content">
                    <hire-info-card :model="model"></hire-info-card>
                  </v-col>
                </v-row>
              </div>
            </v-col>
            <v-col>
              <v-card class="ma-2">
                <v-card-title>
                  <v-row>
                    <v-col cols="12" align="center">
                      <v-menu v-if="useDropDown">
                        <template v-slot:activator="{ props }">
                          <v-btn variant="text" size="large" class="text-subtitle-1 font-weight-bold" v-bind="props"
                            >{{ infoTab || 'Select Info' }} <v-icon size="large">mdi-chevron-down</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item @click="selectDropDown('Personal')">Personal</v-list-item>
                          <v-list-item @click="selectDropDown('Certifications & Awards')"
                            >Certifications & Awards</v-list-item
                          >
                          <v-list-item @click="selectDropDown('Tech, Skills, & Languages')"
                            >Tech, Skills, & Languages</v-list-item
                          >
                          <v-list-item @click="selectDropDown('Job Experience')">Job Experience</v-list-item>
                          <v-list-item @click="selectDropDown('Education')">Education</v-list-item>
                        </v-list>
                      </v-menu>
                      <v-tabs
                        v-else
                        v-model="infoTab"
                        center-active
                        show-arrows
                        align-tabs="center"
                        color="blue"
                        class="mx-4"
                      >
                        <v-tab value="Personal">Personal</v-tab>
                        <v-tab value="Certifications & Awards">Certifications & Awards</v-tab>
                        <v-tab value="Tech, Skills, & Languages">Tech, Skills, & Languages</v-tab>
                        <v-tab value="Job Experience">Job Experience</v-tab>
                        <v-tab value="Education">Education</v-tab>
                      </v-tabs>
                      <v-divider></v-divider>
                    </v-col>
                  </v-row>
                </v-card-title>
                <v-card-text>
                  <v-tabs-window v-model="infoTab">
                    <v-tabs-window-item value="Personal">
                      <!-- personal info -->
                      <v-row class="my-2">
                        <v-col>
                          <personal-info-card style="padding-bottom: 10px" :model="model"></personal-info-card>
                        </v-col>
                        <v-col>
                          <other-info-card style="padding-bottom: 10px" :model="model"></other-info-card>
                        </v-col>
                        <v-col v-if="isUser || isAdmin">
                          <clearance-card style="padding-bottom: 10px" :model="model"></clearance-card>
                        </v-col>
                      </v-row>
                    </v-tabs-window-item>
                    <v-tabs-window-item value="Certifications & Awards">
                      <!-- certifications and awards -->
                      <v-row class="my-2">
                        <v-col>
                          <certifications-card :model="model"></certifications-card>
                        </v-col>
                        <v-col>
                          <awards-card :model="model"></awards-card>
                        </v-col>
                      </v-row>
                    </v-tabs-window-item>
                    <v-tabs-window-item value="Tech, Skills, & Languages">
                      <!-- tech, skills, languages -->
                      <v-row class="my-2">
                        <v-col>
                          <technologies-card :model="model"></technologies-card>
                        </v-col>
                        <v-col>
                          <languages-card :model="model"></languages-card>
                        </v-col>
                      </v-row>
                    </v-tabs-window-item>
                    <v-tabs-window-item value="Job Experience">
                      <v-row class="my-2">
                        <!-- case info -->
                        <v-col>
                          <case-experience-info-card :model="model"></case-experience-info-card>
                        </v-col>
                        <!-- past experience -->
                        <v-col>
                          <past-job-experience-info-card
                            :model="model"
                            :isAdmin="hasAdminPermissions()"
                            :isUser="userIsEmployee()"
                          ></past-job-experience-info-card>
                        </v-col>
                      </v-row>
                    </v-tabs-window-item>
                    <v-tabs-window-item value="Education">
                      <!-- education and past experience -->
                      <v-row class="my-2">
                        <v-col>
                          <education-info-card
                            :model="model"
                            :isAdmin="hasAdminPermissions()"
                            :isUser="userIsEmployee()"
                          ></education-info-card>
                        </v-col>
                      </v-row>
                    </v-tabs-window-item>
                  </v-tabs-window>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <employee-form v-model="editing" :employee="model" :contracts="contracts"></employee-form>
        </base-card>
      </v-container>
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
  isMobile,
  storeIsPopulated,
  userRoleIsAdmin,
  userRoleIsManager
} from '@/utils/utils.js';
import _ from 'lodash';
import { computed, inject, onBeforeMount, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useDisplay } from 'vuetify';
import AwardsCard from '@/components/employee-beta/cards/AwardsCard.vue';
import BaseCard from '@/components/employee-beta/cards/BaseCard.vue';
import CaseExperienceInfoCard from '@/components/employee-beta/cards/CaseExperienceInfoCard.vue';
import CertificationsCard from '@/components/employee-beta/cards/CertificationsCard.vue';
import EmployeeInfo from '@/components/employee-beta/EmployeeInfo.vue';
import HireInfoCard from '@/components/employee-beta/cards/HireInfoCard.vue';
import LanguagesCard from '@/components/employee-beta/cards/LanguagesCard.vue';
import TechnologiesCard from '@/components/employee-beta/cards/TechnologiesCard.vue';
import PastJobExperienceInfoCard from '@/components/employee-beta/cards/PastJobExperienceInfoCard.vue';
import EmployeePageLoader from '@/components/employees/EmployeePageLoader.vue';
import ContractInfoCard from '@/components/employee-beta/cards/ContractInfoCard.vue';
import EducationInfoCard from '@/components/employee-beta/cards/EducationInfoCard.vue';
import EmployeeForm from '@/components/employee-beta/forms/EmployeeForm.vue';
import PersonalInfoCard from '@/components/employee-beta/cards/personal/PersonalInfoCard.vue';
import OtherInfoCard from '@/components/employee-beta/cards/personal/OtherInfoCard.vue';
import ClearanceCard from '@/components/employee-beta/cards/personal/ClearanceCard.vue';
import ResumeCard from '@/components/employee-beta/ResumeCard.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const store = useStore();
const route = useRoute();
const router = useRouter();
const display = useDisplay();

//provide roles
const isAdmin = ref(false);
provide('isAdmin', isAdmin);
const isUser = ref(false);
provide('isUser', isUser);

const basicEmployeeDataLoading = ref(false);
const contracts = ref(null);
const displayTimeAndBalances = ref(false);
const editing = ref(false);
const loading = ref(true);
const infoTab = ref(null); //currently active tab

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

/**
 * computed title for employee header
 *
 * @return {string} employee name or My Profile if current user
 */
const employeeTitle = computed(() => {
  return isUser.value ? 'My Profile' : model.value.nickname || model.value.firstName + "'s Profile";
});

/**
 * computed boolean to decide whether or not to use dropdown.
 *
 * @return boolean - returns true for small screens
 */
const useDropDown = computed(() => {
  switch (display.name.value) {
    case 'xs':
      return true;
    default:
      return false;
  }
}); // useDropDown

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
 * This is used to select the correct tab on mobile devices.
 */
function selectDropDown(name) {
  infoTab.value = name;
} // selectDropDown

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
