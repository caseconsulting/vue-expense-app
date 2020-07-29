<template>
  <v-card-text class="px-7 pt-5 pb-1 black--text">
    <div class="savedInfo">
      <p v-if="userIsAdmin()">
        <b>Status: </b>
        {{ getWorkStatus(this.model.workStatus) }}
      </p>
      <p v-if="!isEmpty(this.model.prime)"><b>Prime: </b> {{ this.model.prime }}</p>
      <p v-if="!isEmpty(this.model.contract)"><b>Contract: </b>{{ this.model.contract }}</p>
      <p v-if="!isEmpty(this.model.jobRole)"><b>Job Role: </b>{{ this.model.jobRole }}</p>
      <p v-if="!isEmpty(this.model.github)">
        <b>Github: </b><a :href="'https://github.com/' + this.model.github" target="_blank">{{ this.model.github }}</a>
      </p>
      <p v-if="!isEmpty(this.model.twitter)">
        <b>Twitter: </b>
        <a :href="'https://twitter.com/' + this.model.twitter" target="_blank">{{ this.model.twitter }}</a>
      </p>
      <p v-if="userIsAdmin() && !isEmpty(this.model.birthday)">
        <b>Birthday: </b>{{ this.model.birthday | dateFormat }}
      </p>
      <p v-if="userIsAdmin() && !isEmpty(this.model.birthdayFeed)">
        <b>Birthday on Feed: </b>{{ this.model.birthdayFeed | birthdayFeedResponse }}
      </p>
      <p v-if="userIsAdmin() && !isEmpty(this.model.city) && !isEmpty(this.model.st) && !isEmpty(this.model.country)">
        <b>Place of Birth: </b>{{ this.model.city }}, {{ this.model.st }}, {{ this.model.country }}
      </p>
      <p v-else-if="userIsAdmin() && !isEmpty(this.model.city) && !isEmpty(this.model.st)">
        <b>Place of Birth: </b>{{ this.model.city }}, {{ this.model.st }}
      </p>
      <p v-else-if="userIsAdmin() && !isEmpty(this.model.city) && !isEmpty(this.model.country)">
        <b>Place of Birth: </b>{{ this.model.city }}, {{ this.model.country }}
      </p>
      <p v-else-if="userIsAdmin() && !isEmpty(this.model.country)"><b>Place of Birth: </b>{{ this.model.country }}</p>
      <p v-if="userIsAdmin() && !isEmpty(this.model.deptDate)">
        <b>Departure Date: </b>{{ this.model.deptDate | dateFormat }}
      </p>
    </div>
  </v-card-text>
</template>

<script>
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

import { getRole } from '@/utils/auth';
import _ from 'lodash';
import moment from 'moment';

export default {
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
        return 'Yes';
      } else {
        return 'No';
      }
    }
  },
  methods: {
    getWorkStatus,
    isEmpty,
    userIsAdmin
  },
  props: ['model', 'editing']
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
