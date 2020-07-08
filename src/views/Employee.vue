<template>
  <v-layout row wrap>
    <v-flex lg8 lg12 md12 sm12>
      <!-- Expanded slot in datatable -->
      <template>
        <v-card>
          <!-- <v-card-text>
            <div class="expandedInfo" v-if="isDisplayData(item)">
              <p>No additional data</p>
            </div>
            <div class="expandedInfo" v-else>
              <p v-if="userIsAdmin()">
                <b>Status: </b>
                {{ getWorkStatus(item.workStatus) }}
              </p>
              <p v-if="!isEmpty(item.prime)"><b>Prime: </b> {{ item.prime }}</p>
              <p v-if="!isEmpty(item.contract)"><b>Contract: </b>{{ item.contract }}</p>
              <p v-if="!isEmpty(item.jobRole)"><b>Job Role: </b>{{ item.jobRole }}</p>
              <p v-if="!isEmpty(item.github)">
                <b>Github: </b
                ><a :href="'https://github.com/' + item.github" target="_blank">{{ item.github }}</a>
              </p>
              <p v-if="!isEmpty(item.twitter)">
                <b>Twitter: </b>
                <a :href="'https://twitter.com/' + item.twitter" target="_blank">{{ item.twitter }}</a>
              </p>
              <p v-if="userIsAdmin() && !isEmpty(item.birthday)">
                <b>Birthday: </b>{{ item.birthday | dateFormat }}
              </p>
              <p v-if="userIsAdmin() && !isEmpty(item.birthdayFeed)">
                <b>Birthday on feed: </b>{{ item.birthdayFeed | birthdayFeedResponse }}
              </p>
              <p v-if="userIsAdmin() && !isEmpty(item.city) && !isEmpty(item.st) && !isEmpty(item.country)">
                <b>Place of Birth: </b>{{ item.city }}, {{ item.st }}, {{ item.country }}
              </p>
              <p v-else-if="userIsAdmin() && !isEmpty(item.city) && !isEmpty(item.st)">
                <b>Place of Birth: </b>{{ item.city }}, {{ item.st }}
              </p>
              <p v-else-if="userIsAdmin() && !isEmpty(item.city) && !isEmpty(item.country)">
                <b>Place of Birth: </b>{{ item.city }}, {{ item.country }}
              </p>
              <p v-else-if="userIsAdmin() && !isEmpty(item.country)">
                <b>Place of Birth: </b>{{ item.country }}
              </p>
              <p v-if="userIsAdmin() && !isEmpty(item.deptDate)">
                <b>Departure Date: </b>{{ item.deptDate | dateFormat }}
              </p>
            </div>
          </v-card-text> -->
        </v-card>
        <available-budgets v-if="this.model.id" :employee="this.model"></available-budgets>
      </template>
      <!-- End expanded slot in datatable -->
    </v-flex>
    <v-flex>
      <v-card>
        <!-- Employee Details Form -->
        <!-- <v-card-text>
          <employee-details-form :adminCall="true" :employ="this.model"></employee-details-form>
        </v-card-text> -->
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import api from '@/shared/api.js';
import AvailableBudgets from '@/components/AvailableBudgets.vue';
// import EmployeeDetailsForm from '@/components/EmployeeDetailsForm.vue';
import { getRole } from '@/utils/auth';
import moment from 'moment';

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
 * Checks if a value is empty. Returns true if the value is null or a single character space String.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return value == null || value === ' ' || value === '';
} // isEmpty

/**
 * Get employee data.
 */
async function getEmployee() {
  this.loading = true; // set loading status to true

  //THIS IS A TEMP PIECE OF CODE, just for testing/dev purposes
  //this will be replaced w/ getting the specific employee's id once hooked up to employees list
  this.model = await api.getUser();

  //this next line is closer to what the actual code will look like:
  // this.model = await api.getItem(api.EMPLOYEES, this.$route.params.id); // get employee

  this.loading = false; // set loading status to false
} // refreshEmployees

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
    AvailableBudgets
    // EmployeeDetailsForm,
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
