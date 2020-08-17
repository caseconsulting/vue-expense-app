<template>
  <div class="clearanceTab">
    <div v-if="!isEmpty(model.clearances)">
      <!-- Loop Clearances -->
      <div v-for="(clearance, index) in model.clearances" :key="index">
        <!-- Type -->
        <p><b>Type: </b>{{ clearance.type }}</p>

        <!-- Submission, Granted, Expiration Date -->
        <p v-if="clearance.submissionDate"><b>Submission Date: </b>{{ clearance.submissionDate | dateFormat }}</p>
        <p v-if="clearance.grantedDate"><b>Granted Date: </b>{{ clearance.grantedDate | dateFormat }}</p>
        <p v-if="clearance.expirationDate"><b>Expiration Date: </b>{{ clearance.expirationDate | dateFormat }}</p>

        <!-- Poly Dates -->
        <p v-if="clearance.polyDates.length > 0" class="mb-2"><b>Poly Dates: </b></p>
        <ul v-if="clearance.polyDates.length > 0" class="mb-4">
          <li v-for="(polyDate, pIndex) in clearance.polyDates" :key="pIndex">{{ polyDate | dateFormat }}</li>
        </ul>

        <!-- Adjudication Dates -->
        <p v-if="clearance.adjudicationDates.length > 0" class="mb-2"><b>Adjudication Dates: </b></p>
        <ul v-if="clearance.adjudicationDates.length > 0" class="mb-4">
          <li v-for="(adjudicationDate, aIndex) in clearance.adjudicationDates" :key="aIndex">
            {{ adjudicationDate | dateFormat }}
          </li>
        </ul>

        <!-- BI Dates -->
        <p v-if="clearance.biDates.length > 0" class="mb-2"><b>BI Dates: </b></p>
        <ul v-if="clearance.biDates.length > 0" class="mb-4">
          <li v-for="(biDates, biIndex) in clearance.biDates" :key="biIndex">
            <div v-if="biDates.range.length > 1">
              {{ biDates.range[0] | dateFormat }} - {{ biDates.range[1] | dateFormat }}
            </div>
            <div v-else>On-going ({{ biDates.range[0] | dateFormat }})</div>
          </li>
        </ul>
        <hr v-if="index < model.clearances.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Clearances -->
    </div>
    <p v-else>No Clearance Information</p>
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
