<template>
  <div class="infoTab">
    <div v-if="!isEmpty(model.awards)">
      <div v-for="(award, index) in model.awards" :key="award.name">
        <p><b>Award: </b>{{ award.name }}</p>
        <p><b>Date Received: </b>{{ award.dateReceived | dateFormat }}</p>
        <hr v-if="index < model.awards.length - 1" class="mb-3" />
      </div>
    </div>
    <p v-else>No Award Information</p>
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
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0) || (_.isArray(value) && _.isEmpty(value));
} // isEmpty

export default {
  filters: {
    // formats a date by month, day, year (e.g. Aug 18th, 2020)
    dateFormat: (value) => {
      if (!isEmpty(value)) {
        return moment(value).format('MMM Do, YYYY');
      } else {
        return '';
      }
    }
  },
  methods: {
    isEmpty
  },
  props: ['model']
};
</script>
<style>
.infoTab {
  color: #38424d;
}
</style>
