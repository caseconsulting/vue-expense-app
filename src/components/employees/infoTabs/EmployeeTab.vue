<template>
  <div>
    <!-- Full Name -->
    <p id="full-name"><b>Full Name:</b> {{ fullName }}</p>
    <!-- Nickname -->
    <p v-if="!isEmpty(this.model.nickname)"><b>Nickname:</b> {{ this.model.nickname }}</p>
    <!-- Employee Number -->
    <p><b>Employee Number:</b> {{ this.model.employeeNumber }}</p>
    <!-- Email -->
    <p><b>Email:</b> {{ this.model.email }}</p>
    <!-- Current Projects -->
    <p><b>Current Projects: </b> {{ getCurrentProjects.length === 0 ? 'None' : '' }}</p>
    <!-- Loop for Current Projects -->
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
    <!-- Job Role -->
    <p v-if="!isEmpty(this.model.jobRole)"><b>Job Role:</b> {{ this.model.jobRole }}</p>
    <!-- Employee Role -->
    <p v-if="admin"><b>Employee Role:</b> {{ this.model.employeeRole | startCase }}</p>
    <!-- Hire Date -->
    <p v-if="admin || employee"><b> Hire Date:</b> {{ monthDayYearFormat(this.model.hireDate) }}</p>
    <!-- Departure Date -->
    <p v-if="!isEmpty(this.model.deptDate) && admin">
      <b>Departure Date:</b> {{ monthDayYearFormat(this.model.deptDate) }}
    </p>
    <!-- Status -->
    <p v-if="admin || employee"><b>Status:</b> {{ getWorkStatus(this.model.workStatus) }}</p>
    <!-- Mifi Status -->
    <p v-if="this.model.employeeRole !== 'intern' && this.model.workStatus !== 0">
      <b>Mifi Status:</b>
      {{ !isEmpty(this.model.mifiStatus) ? (this.model.mifiStatus === true ? 'Yes' : 'No') : 'Yes' }}
    </p>
    <!-- Last Login -->
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

// |--------------------------------------------------|
// |                                                  |
// |                     FILTERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * startCase filter - uses lodash startCase as filter
 */
function startCase(value) {
  return _.startCase(value);
} // startCase

export default {
  computed: {
    fullName,
    getCurrentProjects
  },
  filters: {
    startCase
  },
  methods: {
    getWorkStatus,
    isEmpty,
    monthDayYearFormat
  },
  props: ['admin', 'employee', 'model']
};
</script>
