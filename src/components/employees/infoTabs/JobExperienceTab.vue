<template>
  <div class="infoTab">
    <!-- IC Experience -->
    <p><b>Experience in IC: </b>{{ icExperience }}</p>
    <hr class="my-3" />

    <!-- Case Consulting -->
    <p><b>Company: </b>Case Consulting</p>
    <p v-if="model.jobRole"><b>Position: </b>{{ model.jobRole }}</p>
    <p><b>Start Date: </b>{{ model.hireDate | dateFormat }}</p>
    <p v-if="model.deptDate"><b>End Date: </b>{{ model.deptDate | dateFormat }}</p>
    <hr v-if="model.jobs && model.jobs.length > 0" class="mb-3" />

    <!-- Other Jobs -->
    <div v-if="!isEmpty(model.jobs)">
      <div v-for="(job, index) in model.jobs" :key="job.company + index">
        <p><b>Company: </b>{{ job.company }}</p>
        <p><b>Position: </b>{{ job.position }}</p>
        <p><b>Start Date: </b>{{ job.startDate | dateFormat }}</p>
        <p v-if="job.endDate"><b>End Date: </b>{{ job.endDate | dateFormat }}</p>
        <hr v-if="index < model.jobs.length - 1" class="mb-3" />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Calculate and return text for Experience in IC duration.
 *
 * @return String - Experience in IC duration
 */
function icExperience() {
  let ranges = _.mapValues(this.model.icTimeFrames, 'range');
  let totalDurationMonths = 0; // total months

  // loop each reach to get total duration in months
  _.forEach(ranges, (range) => {
    let start = moment(range[0], 'YYYY-MM');
    let end;
    if (range.length > 1) {
      // end date
      end = moment(range[1], 'YYYY-MM');
    } else {
      // present
      end = moment();
    }
    let duration = end.diff(start, 'months') + 1; // calculate range duration
    totalDurationMonths += Math.max(duration, 0); // remove negative values
  });

  // set year output text
  let totalYearOutput = _.floor(totalDurationMonths / 12);
  if (totalYearOutput < 1) {
    totalYearOutput = '';
  } else if (totalYearOutput == 1) {
    totalYearOutput += ' Year';
  } else {
    totalYearOutput += ' Years';
  }

  // set month output text
  let totalMonthOutput = totalDurationMonths % 12;
  if (totalMonthOutput < 1) {
    totalMonthOutput = totalYearOutput.length > 0 ? '' : 'None';
  } else if (totalMonthOutput == 1) {
    totalMonthOutput = totalYearOutput.length > 0 ? ` and ${totalMonthOutput} Month` : `${totalMonthOutput} Month`;
  } else {
    totalMonthOutput = totalYearOutput.length > 0 ? ` and ${totalMonthOutput} Months` : `${totalMonthOutput} Months`;
  }

  return `${totalYearOutput}${totalMonthOutput}`;
} // icExperience

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
  computed: {
    icExperience
  },
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
