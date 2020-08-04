<template>
  <v-container fluid>
    <v-row class="pl-3">
      <v-btn to="/employees"><v-icon class="pr-1">arrow_back</v-icon>Back to Employees Page</v-btn>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" lg="5">
        <template>
          <available-budgets v-if="this.model.id" :employee="this.model"></available-budgets>
        </template>
        <!-- End saved info -->
      </v-col>
      <v-col cols="12" md="6" lg="7">
        <!-- Saved info -->
        <v-card>
          <v-card-title class="header_style" v-if="!editing">
            <h3>{{ this.model.firstName }} {{ this.model.lastName }}</h3>
            <v-spacer></v-spacer>
            <v-icon v-if="userIsAdmin() || userIsEmployee()" @click="editing = true" style="color: white;" align="right"
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
import { getRole } from '@/utils/auth';
import _ from 'lodash';

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
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0);
} // isEmpty

/**
 * Get employee data.
 */
async function getEmployee() {
  this.loading = true; // set loading status to true

  let employees = await api.getItems(api.EMPLOYEES);
  this.model = _.find(employees, (employee) => {
    return employee.employeeNumber == this.$route.params.id;
  });

  this.loading = false; // set loading status to false
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
  return getRole() === 'admin';
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
  await this.getEmployee();
  this.user = await api.getUser();
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
    EmployeeInfo
  },
  created,
  data() {
    return {
      currentTab: null,
      editing: false,
      filter: {
        active: ['full', 'part'] // default only shows full and part time employees
      }, // datatable filter
      loading: false, // loading status
      model: {
        id: null,
        firstName: '',
        middleName: '',
        lastName: '',
        email: '@consultwithcase.com',
        employeeRole: '',
        employeeNumber: null,
        hireDate: null,
        workStatus: 100,
        birthday: '',
        birthdayFeed: false,
        jobRole: '',
        prime: '',
        contract: '',
        github: '',
        twitter: '',
        city: '',
        st: '',
        country: '',
        deptDate: ''
      }, // selected employee
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
