<template>
  <div>
    <p v-if="!isEmpty(this.model.prime)">
      <b>Prime:</b>
      {{ this.model.prime }}
    </p>
    <p v-if="!isEmpty(this.model.contract)">
      <b>Contract:</b>
      {{ this.model.contract }}
    </p>
    <p v-if="!isEmpty(this.model.jobRole)">
      <b>Job Role:</b>
      {{ this.model.jobRole }}
    </p>
    <p v-if="!isEmpty(this.model.github)">
      <b>Github: </b>
      <a :href="'https://github.com/' + this.model.github" target="_blank">{{ this.model.github }}</a>
    </p>
    <p v-if="!isEmpty(this.model.twitter)">
      <b>Twitter: </b>
      <a :href="'https://twitter.com/' + this.model.twitter" target="_blank">{{ this.model.twitter }}</a>
    </p>
    <p v-if="!isEmpty(this.model.birthday) && (admin || employee)">
      <b>Birthday:</b>
      {{ this.model.birthday | dateFormat }}
    </p>
    <p v-ielse>
      <b>Birthday:</b>
      {{ this.model.birthday | hideYearFormat }}
    </p>
    <p v-if="!isEmpty(this.model.birthdayFeed) && (admin || employee)">
      <b>Birthday on Feed:</b>
      {{ this.model.birthdayFeed | birthdayFeedResponse }}
    </p>
    <p
      v-if="!isEmpty(this.model.city) && !isEmpty(this.model.st) && !isEmpty(this.model.country) && (admin || employee)"
    >
      <b>Place of Birth:</b>
      {{ this.model.city }}, {{ this.model.st }}, {{ this.model.country }}
    </p>
    <p v-else-if="!isEmpty(this.model.city) && !isEmpty(this.model.st) && (admin || employee)">
      <b>Place of Birth:</b>
      {{ this.model.city }}, {{ this.model.st }}
    </p>
    <p v-else-if="!isEmpty(this.model.city) && !isEmpty(this.model.country) && (admin || employee)">
      <b>Place of Birth:</b>
      {{ this.model.city }}, {{ this.model.country }}
    </p>
    <p v-else-if="!isEmpty(this.model.country) && (admin || employee)">
      <b>Place of Birth:</b>
      {{ this.model.country }}
    </p>
  </div>
</template>
<script>
import moment from 'moment';
import _ from 'lodash';
/**
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0);
} // isEmpty

export default {
  filters: {
    birthdayFeedResponse: (value) => {
      if (value == true) {
        return 'Yes';
      } else {
        return 'No';
      }
    },
    // formats a date by month, day, year (e.g. Aug 18th, 2020)
    dateFormat: (value) => {
      if (!isEmpty(value)) {
        return moment(value).format('MMM Do, YYYY');
      } else {
        return '';
      }
    },
    // formats a date by month, day, year (e.g. Aug 18th)
    hideYearFormat: (value) => {
      if (!isEmpty(value)) {
        return moment(value).format('MMM Do');
      } else {
        return '';
      }
    }
  },
  methods: {
    isEmpty
  },
  props: ['admin', 'employee', 'model']
};
</script>
