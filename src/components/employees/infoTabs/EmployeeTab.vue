<template>
  <div>
    <p>
      <b>Full Name:</b>
      {{ fullName }}
    </p>
    <p>
      <b>Employee Number:</b>
      {{ this.model.employeeNumber }}
    </p>
    <p>
      <b>Email:</b>
      {{ this.model.email }}
    </p>
    <p v-if="(admin || employee)">
      <b>Hire Date:</b>
      {{ this.model.hireDate | dateFormat }}
    </p>
    <p v-if="admin">
      <b>Employee Role:</b>
      {{ this.model.employeeRole | startCase }}
    </p>
    <p v-if="(admin || employee)">
      <b>Status:</b>
      {{ getWorkStatus(this.model.workStatus) }}
    </p>
    <p v-if="!isEmpty(this.model.deptDate) && admin">
      <b>Departure Date:</b>
      {{ this.model.deptDate | dateFormat }}
    </p>
  </div>
</template>
<script>
import employeeUtils from '@/shared/employeeUtils';
import moment from 'moment';
import _ from 'lodash';

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

export default {
  computed: {
    fullName
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
    startCase: (value) => {
      return _.startCase(value);
    }
  },
  methods: {
    getWorkStatus,
    isEmpty
  },
  props: ['admin', 'employee', 'model']
};
</script>
