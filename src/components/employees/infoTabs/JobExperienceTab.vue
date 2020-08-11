<template>
  <div class="infoTab">
    <p><b>Company: </b>Case Consulting</p>
    <p v-if="model.jobRole"><b>Position: </b>{{ model.jobRole }}</p>
    <p><b>Start Date: </b>{{ model.hireDate | dateFormat }}</p>
    <p v-if="model.deptDate"><b>End Date: </b>{{ model.deptDate | dateFormat }}</p>
    <v-divider v-if="model.jobs.length > 0" class="pb-3" />

    <div v-if="!isEmpty(model.jobs)">
      <div v-for="(job, index) in model.jobs" :key="job.company + index">
        <p><b>Company: </b>{{ job.company }}</p>
        <p><b>Position: </b>{{ job.position }}</p>
        <p><b>Start Date: </b>{{ job.startDate | dateFormat }}</p>
        <p v-if="job.endDate"><b>End Date: </b>{{ job.endDate | dateFormat }}</p>
        <v-divider v-if="index < model.jobs.length - 1" class="pb-3" />
      </div>
    </div>
    <p v-else>No Job information</p>
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
