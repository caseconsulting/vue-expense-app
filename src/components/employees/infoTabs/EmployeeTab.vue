<template>
  <div>
    <p><b>Full Name:</b> {{ fullName }}</p>
    <p><b>Employee Number:</b> {{ this.model.employeeNumber }}</p>
    <p><b>Email:</b> {{ this.model.email }}</p>
    <p v-if="(admin || employee)"><b> Hire Date:</b>{{ this.model.hireDate | monthDayYearFormat }}</p>
    <p v-if="admin"><b>Employee Role:</b> {{ this.model.employeeRole | startCase }}</p>
    <p v-if="(admin || employee)"><b>Status:</b> {{ getWorkStatus(this.model.workStatus) }}</p>
    <p v-if="!isEmpty(this.model.deptDate) && admin">
      <b>Departure Date:</b> {{ this.model.deptDate | monthDayYearFormat }}
    </p>
  </div>
</template>

<script>
import employeeUtils from '@/shared/employeeUtils';
import _ from 'lodash';
import { isEmpty, monthDayYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Get the current employee's full name.
 *
 * @return String - Employee's full name
 */
function fullName() {
  return employeeUtils.fullName(this.model);
} // fullName

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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

export default {
  computed: {
    fullName
  },
  filters: {
    monthDayYearFormat,
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
