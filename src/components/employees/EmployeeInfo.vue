<template>
  <v-card-text class="px-7 pt-5 pb-1 black--text">
    <div class="savedInfo">
      <v-tabs center-active show-arrows class="pb-4">
        <v-tab href="#employee">Employee</v-tab>
        <v-tab href="#personal">Personal</v-tab>
        <v-tab href="#degrees">Degrees</v-tab>
        <v-tab href="#jobExperience">Job Experience</v-tab>
        <v-tab href="#certifications">Certifications</v-tab>
        <v-tab href="#awards">Awards</v-tab>
        <v-tab href="#technologies">Technologies</v-tab>
        <v-tab href="#customerOrgExp">Customer Org</v-tab>
        <v-tab-item id="employee">
          <p><b>Full Name: </b>{{ fullName }}</p>
          <p><b>Employee Number: </b>{{ this.model.employeeNumber }}</p>
          <p><b>Email: </b>{{ this.model.email }}</p>
          <p v-if="(userIsAdmin() || userIsEmployee())"><b>Hire Date: </b>{{ this.model.hireDate | dateFormat }}</p>
          <p v-if="userIsAdmin()">
            <b>Employee Role: </b>
            {{ this.model.employeeRole | startCase }}
          </p>
          <p v-if="(userIsAdmin() || userIsEmployee())">
            <b>Status: </b>
            {{ getWorkStatus(this.model.workStatus) }}
          </p>
          <p v-if="!isEmpty(this.model.deptDate) && userIsAdmin()">
            <b>Departure Date: </b>{{ this.model.deptDate | dateFormat }}
          </p>
        </v-tab-item>
        <v-tab-item id="personal">
          <p v-if="!isEmpty(this.model.prime)"><b>Prime: </b> {{ this.model.prime }}</p>
          <p v-if="!isEmpty(this.model.contract)"><b>Contract: </b>{{ this.model.contract }}</p>
          <p v-if="!isEmpty(this.model.jobRole)"><b>Job Role: </b>{{ this.model.jobRole }}</p>
          <p v-if="!isEmpty(this.model.github)">
            <b>Github: </b>
            <a :href="'https://github.com/' + this.model.github" target="_blank">{{ this.model.github }}</a>
          </p>
          <p v-if="!isEmpty(this.model.twitter)">
            <b>Twitter: </b>
            <a :href="'https://twitter.com/' + this.model.twitter" target="_blank">{{ this.model.twitter }}</a>
          </p>
          <p v-if="!isEmpty(this.model.birthday) && (userIsAdmin() || userIsEmployee())">
            <b>Birthday: </b>{{ this.model.birthday | dateFormat }}
          </p>
          <p v-else-if="!isEmpty(this.model.birthday) && this.model.birthdayFeed">
            <b>Birthday: </b>{{ this.model.birthday | dateMMDD }}
          </p>
          <p v-if="!isEmpty(this.model.birthdayFeed) && (userIsAdmin() || userIsEmployee())">
            <b>Birthday on Feed: </b>{{ this.model.birthdayFeed | birthdayFeedResponse }}
          </p>
          <p
            v-if="
              !isEmpty(this.model.city) &&
              !isEmpty(this.model.st) &&
              !isEmpty(this.model.country) &&
              (userIsAdmin() || userIsEmployee())
            "
          >
            <b>Place of Birth: </b>{{ this.model.city }}, {{ this.model.st }}, {{ this.model.country }}
          </p>
          <p v-else-if="!isEmpty(this.model.city) && !isEmpty(this.model.st) && (userIsAdmin() || userIsEmployee())">
            <b>Place of Birth: </b>{{ this.model.city }}, {{ this.model.st }}
          </p>
          <p
            v-else-if="!isEmpty(this.model.city) && !isEmpty(this.model.country) && (userIsAdmin() || userIsEmployee())"
          >
            <b>Place of Birth: </b>{{ this.model.city }}, {{ this.model.country }}
          </p>
          <p v-else-if="!isEmpty(this.model.country) && (userIsAdmin() || userIsEmployee())">
            <b>Place of Birth: </b>
            {{ this.model.country }}
          </p>
        </v-tab-item>
      </v-tabs>
    </div>
  </v-card-text>
</template>

<script>
import employeeUtils from '@/shared/employeeUtils';
import api from '@/shared/api';
import { getRole } from '@/utils/auth';
import _ from 'lodash';
import moment from 'moment';

function fullName() {
  return employeeUtils.fullName(this.model);
} // fullName

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
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0);
} // isEmpty

/**
 * Check if the user is an admin. Returns true if the user is an admin, otherwise returns false.
 *
 * @return boolean - user is an admin
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

/*
 * Get the user.
 */
async function created() {
  this.user = await api.getUser();
} // created

export default {
  computed: {
    fullName
  },
  created,
  data() {
    return {
      user: null
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
    dateMMDD: (value) => {
      return !isEmpty(value) ? moment(value).format('MMMM Do') : 'N/A';
    },
    birthdayFeedResponse: (value) => {
      if (value == true) {
        return 'Yes';
      } else {
        return 'No';
      }
    },
    startCase: (value) => {
      return _.startCase(value);
    }
  },
  methods: {
    getWorkStatus,
    isEmpty,
    userIsAdmin,
    userIsEmployee
  },
  props: ['model']
};
</script>

<style>
.savedInfo a {
  font-size: 14px;
  color: blue;
}

.savedInfo a:hover {
  color: #0cf;
}
</style>
