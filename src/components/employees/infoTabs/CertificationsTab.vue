<template>
  <div class="infoTab">
    <div v-if="!isEmpty(model.certifications)">
      <div v-for="(certification, index) in model.certifications" :key="certification.name">
        <p><b>Certification: </b>{{ certification.name }}</p>
        <p><b>Date Received: </b>{{ certification.dateReceived | dateFormat }}</p>
        <p v-if="certification.expirationDate">
          <b>Expiration Date: </b>{{ certification.expirationDate | dateFormat }}
        </p>
        <hr v-if="index < model.certifications.length - 1" class="mb-3" />
      </div>
    </div>
    <p v-else>No Certification information</p>
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
