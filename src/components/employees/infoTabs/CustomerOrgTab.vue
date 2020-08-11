<template>
  <div class="infoTab">
    <div v-if="!isEmpty(model.customerOrgExp)">
      <div v-for="(exp, index) in model.customerOrgExp" :key="exp.name">
        <p><b>Customer Organization Experience: </b>{{ exp.name }}</p>
        <p><b>Date Received: </b>{{ exp.dateReceived | dateFormat }}</p>
        <p v-if="exp.expirationDate"><b>Expiration Date: </b>{{ exp.expirationDate | dateFormat }}</p>
        <v-divider v-if="index < model.customerOrgExp.length - 1" class="pb-3" />
      </div>
    </div>
    <p v-else>No Customer Organization Experience Information</p>
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
  props: ['admin', 'employee', 'model']
};
</script>
<style>
.infoTab {
  color: #38424d;
}
</style>
