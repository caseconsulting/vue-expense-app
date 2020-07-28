<template>
  <v-row>
    <v-col cols="12" md="6" lg="5">
      <!-- Expanded slot in datatable -->
      <template>
        <v-card>
          <v-card-text>
            <div class="expandedInfo">
              <p v-if="userIsAdmin()">
                <b>Status: </b>
                {{ getWorkStatus(this.model.workStatus) }}
              </p>
              <p v-if="!isEmpty(this.model.prime)"><b>Prime: </b> {{ this.model.prime }}</p>
              <p v-if="!isEmpty(this.model.contract)"><b>Contract: </b>{{ this.model.contract }}</p>
              <p v-if="!isEmpty(this.model.jobRole)"><b>Job Role: </b>{{ this.model.jobRole }}</p>
              <p v-if="!isEmpty(this.model.github)">
                <b>Github: </b
                ><a :href="'https://github.com/' + this.model.github" target="_blank">{{ this.model.github }}</a>
              </p>
              <p v-if="!isEmpty(this.model.twitter)">
                <b>Twitter: </b>
                <a :href="'https://twitter.com/' + this.model.twitter" target="_blank">{{ this.model.twitter }}</a>
              </p>
              <p v-if="userIsAdmin() && !isEmpty(this.model.birthday)">
                <b>Birthday: </b>{{ this.model.birthday | dateFormat }}
              </p>
              <p v-if="userIsAdmin() && !isEmpty(this.model.birthdayFeed)">
                <b>Birthday on feed: </b>{{ this.model.birthdayFeed | birthdayFeedResponse }}
              </p>
              <p
                v-if="
                  userIsAdmin() && !isEmpty(this.model.city) && !isEmpty(this.model.st) && !isEmpty(this.model.country)
                "
              >
                <b>Place of Birth: </b>{{ this.model.city }}, {{ this.model.st }}, {{ this.model.country }}
              </p>
              <p v-else-if="userIsAdmin() && !isEmpty(this.model.city) && !isEmpty(this.model.st)">
                <b>Place of Birth: </b>{{ this.model.city }}, {{ this.model.st }}
              </p>
              <p v-else-if="userIsAdmin() && !isEmpty(this.model.city) && !isEmpty(this.model.country)">
                <b>Place of Birth: </b>{{ this.model.city }}, {{ this.model.country }}
              </p>
              <p v-else-if="userIsAdmin() && !isEmpty(this.model.country)">
                <b>Place of Birth: </b>{{ this.model.country }}
              </p>
              <p v-if="userIsAdmin() && !isEmpty(this.model.deptDate)">
                <b>Departure Date: </b>{{ this.model.deptDate | dateFormat }}
              </p>
            </div>
          </v-card-text>
        </v-card>
        <available-budgets v-if="this.model.id" :employee="this.model"></available-budgets>
      </template>
      <!-- End expanded slot in datatable -->
    </v-col>
    <v-col cols="12" md="6" lg="7">
      <v-card>
        <!-- Employee Details Form -->
        <v-card-text>
          <employee-details-form :employee="this.model"></employee-details-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import api from '@/shared/api.js';
import AvailableBudgets from '@/components/AvailableBudgets.vue';
import EmployeeDetailsForm from '@/components/EmployeeDetailsForm.vue';
import { getRole } from '@/utils/auth';
import moment from 'moment';
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

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Adjust datatable header for user view. Creates event listeners.
 */
async function created() {
  await this.getEmployee();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    AvailableBudgets,
    EmployeeDetailsForm
  },
  created,
  data() {
    return {
      employeeInfo: {
        primes: [],
        contracts: []
      },
      expanded: [], // datatable expanded
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
      } // snackbar action status
    };
  },
  filters: {
    // formats a date by month, day, year (e.g. Aug 18th, 2020)
    dateFormat: (value) => {
      if (!isEmpty(value)) {
        return moment(value).format('MMM Do, YYYY');
      } else {
        return '';
      }
    },
    birthdayFeedResponse: (value) => {
      if (value == true) {
        return 'yes';
      } else {
        return 'no';
      }
    }
  },
  methods: {
    isDisplayData,
    isEmpty,
    getEmployee,
    getWorkStatus,
    userIsAdmin
  }
};
</script>

<style>
.expandedInfo {
  border: 1px solid black;
  font-size: 14px;
  padding: 20px;
}

.expandedInfo a {
  font-size: 14px;
  color: blue;
}

.expandedInfo a:hover {
  color: #0cf;
}
</style>
