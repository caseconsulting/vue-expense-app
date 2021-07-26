<template>
  <div>
    <p id="full-name"><b>Full Name:</b> {{ fullName }}</p>
    <p v-if="!isEmpty(this.model.nickname)"><b>Nickname:</b> {{ this.model.nickname }}</p>
    <p><b>Employee Number:</b> {{ this.model.employeeNumber }}</p>
    <p><b>Email:</b> {{ this.model.email }}</p>
    <p><b>Current Projects: </b> {{ getCurrentProjects.length === 0 ? 'None' : '' }}</p>
    <div v-for="(contract, contractIndex) in getCurrentProjects" :key="contractIndex" class="pb-1 px-4">
      <p><b>Contract: </b>{{ contract.name }}</p>
      <p><b>Prime: </b>{{ contract.prime }}</p>
      <div v-for="(project, projIndex) in contract.projects" :key="projIndex" class="px-4">
        <p v-if="contract.projects.length > 1">
          <b>Project {{ projIndex + 1 }}: </b>{{ project.name }}
        </p>
        <p v-else><b>Project: </b>{{ project.name }}</p>
      </div>
    </div>
    <p v-if="!isEmpty(this.model.jobRole)"><b>Job Role:</b> {{ this.model.jobRole }}</p>
    <p v-if="admin"><b>Employee Role:</b> {{ this.model.employeeRole | startCase }}</p>
    <p v-if="admin || employee"><b> Hire Date:</b> {{ this.model.hireDate | monthDayYearFormat }}</p>
    <p v-if="admin || employee"><b>Status:</b> {{ getWorkStatus(this.model.workStatus) }}</p>
    <p v-if="!isEmpty(this.model.deptDate) && admin">
      <b>Departure Date:</b> {{ this.model.deptDate | monthDayYearFormat }}
    </p>
    <p v-if="admin || employee">
      <b>Mifi Opted In:</b> {{ !isEmpty(this.model.mifiStatus) && this.model.mifiStatus === true ? 'Yes' : 'No' }}
    </p>
    <p v-if="admin && !isEmpty(this.model.lastLogin)"><b>Last Logged In:</b> {{ this.model.lastLogin }}</p>
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

/**
 * Gets all of the current projects the user has
 */
function getCurrentProjects() {
  let contracts = [];
  if (this.model.contracts) {
    this.model.contracts.forEach((contract) => {
      let currContract = {};
      currContract.projects = [];
      if (contract.projects) {
        contract.projects.forEach((project) => {
          if (currContract.projects.length === 0) {
            currContract.name = contract.name;
            currContract.prime = contract.prime;
          }
          if (!project.endDate) {
            currContract.projects.push(project);
          }
        });
      }
      if (currContract.projects.length > 0) {
        contracts.push(currContract);
      }
    });
  }

  return contracts;
}
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
    fullName,
    getCurrentProjects
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
