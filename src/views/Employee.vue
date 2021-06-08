<template>
  <v-container class="my-3" fluid>
    <v-row class="pl-3">
      <v-btn elevation="2" to="/employees"><v-icon class="pr-1">arrow_back</v-icon>Back to Employees Page</v-btn>
    </v-row>
    <v-row v-if="loading" class="my-10" justify="center">
      <v-progress-circular :size="70" :width="7" color="#bc3825" indeterminate></v-progress-circular>
    </v-row>
    <v-row v-else>
      <!-- QuickBooks Time and Budgets-->
      <v-col v-if="displayQuickBooksTimeAndBalances" cols="12" md="6" lg="5">
        <quick-books-time-data :employee="this.model" class="mb-6"></quick-books-time-data>
        <available-budgets v-if="this.model.id" :employee="this.model"></available-budgets>
      </v-col>

      <!-- Employee Form -->
      <v-col cols="12" :md="displayQuickBooksTimeAndBalances ? 6 : 12" :lg="displayQuickBooksTimeAndBalances ? 7 : 12">
        <v-card class="mt-3">
          <v-card-title class="header_style" v-if="!editing">
            <h3>{{ this.model.firstName }} {{ this.model.lastName }}</h3>
            <v-spacer></v-spacer>
            <v-icon
              v-if="displayQuickBooksTimeAndBalances && this.currentTab"
              @click="editing = true"
              style="color: white"
              align="right"
              >edit</v-icon
            >
          </v-card-title>
          <employee-info :model="this.model" :currentTab="this.currentTab" v-if="!editing"></employee-info>
        </v-card>
        <!-- Edit Info (Form) -->
        <employee-form :employee="this.model" :currentTab="this.currentTab" v-if="editing"></employee-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '@/shared/api.js';
import AvailableBudgets from '@/components/AvailableBudgets.vue';
import EmployeeForm from '@/components/employees/EmployeeForm.vue';
import EmployeeInfo from '@/components/employees/EmployeeInfo.vue';
import QuickBooksTimeData from '@/components/QuickBooksTimeData.vue';
import { getRole } from '@/utils/auth';
import _ from 'lodash';
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if there is data about an employee to display. Returns true if the user is an admin or if there is data
 * on the employee's prime, contract, job role, github, or twitter, otherwise returns false.
 *
 * @item item - employee to check
 * @return boolean - employee has data to display
 */
function isDisplayData(item) {
  let valid =
    !this.userIsAdmin() &&
    this.isEmpty(item.prime) &&
    this.isEmpty(item.contract) &&
    this.isEmpty(item.jobRole) &&
    this.isEmpty(item.github) &&
    this.isEmpty(item.twitter);
  return valid;
} // isDisplayData

/**
 * Get employee data.
 */
async function getEmployee() {
  let employees = await api.getItems(api.EMPLOYEES);
  this.model = _.find(employees, (employee) => {
    return employee.employeeNumber == this.$route.params.id;
  });
} // getEmployee

/**
 * Returns Full Time, Part Time, or Inactive based on the work status
 */
function getWorkStatus(workStatus) {
  if (workStatus == 100) {
    return 'Full Time';
  } else if (workStatus == 0) {
    return 'Inactive';
  } else if (workStatus > 0 && workStatus < 100) {
    return `Part Time (${workStatus}%)`;
  } else {
    return 'Invalid Status';
  }
} // getWorkStatus

/**
 * Checks to see if the user is an admin. Returns true if the user's role is an admin, otherwise returns false.
 */
function userIsAdmin() {
  return this.role === 'admin';
} // userIsAdmin

/**
 * Check if the user the employee displayed. Returns true if the user is the employee displayed, otherwise returns false.
 *
 * @return boolean - user is the employee displayed
 */
function userIsEmployee() {
  return !_.isNil(this.model) && !_.isNil(this.user) ? this.user.employeeNumber === this.model.employeeNumber : false;
} // userIsEmployee

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Adjust datatable header for user view.
 */
async function created() {
  this.loading = true;
  await this.getEmployee();
  this.user = await api.getUser();
  this.role = getRole();
  this.displayQuickBooksTimeAndBalances = this.userIsAdmin() || this.userIsEmployee();
  this.loading = false;
} // created

/**
 * Mount event listeners.
 */
async function mounted() {
  window.EventBus.$on('cancel-form', () => {
    this.editing = false;
  });

  window.EventBus.$on('update', (updatedEmployee) => {
    this.model = updatedEmployee;
  });

  window.EventBus.$on('tabChange', (tab) => {
    this.currentTab = tab;
  });
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    AvailableBudgets,
    EmployeeForm,
    EmployeeInfo,
    QuickBooksTimeData
  },
  created,
  data() {
    return {
      currentTab: null,
      displayQuickBooksTimeAndBalances: true,
      editing: false,
      filter: {
        active: ['full', 'part'] // default only shows full and part time employees
      }, // datatable filter
      loading: false, // loading status
      model: {
        awards: [],
        birthday: '',
        birthdayFeed: false,
        certifications: [],
        city: '',
        contract: '',
        country: '',
        degrees: [],
        deptDate: '',
        email: '@consultwithcase.com',
        employeeNumber: null,
        employeeRole: '',
        firstName: '',
        github: '',
        hireDate: null,
        id: null,
        jobRole: '',
        lastName: '',
        middleName: '',
        nickname: '',
        prime: '',
        st: '',
        technologies: [],
        twitter: '',
        workStatus: 100
      }, // selected employee
      role: null, // user role
      search: '', // query text for datatable search field
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }, // snackbar action status
      user: null
    };
  },
  methods: {
    isDisplayData,
    isEmpty,
    getEmployee,
    getWorkStatus,
    userIsAdmin,
    userIsEmployee
  },
  mounted
};
</script>
