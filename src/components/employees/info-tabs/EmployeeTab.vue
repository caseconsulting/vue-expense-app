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
    <div v-for="(contract, contractIndex) in getCurrentProjects" :key="contractIndex" class="px-4 left-border">
      <p><b>Contract: </b>{{ contract.contractName }}</p>
      <p><b>Prime: </b>{{ contract.primeName }}</p>
      <div v-for="(project, projIndex) in contract.projects" :key="projIndex" class="px-4">
        <p v-if="contract.projects.length > 1">
          <b>Project {{ projIndex + 1 }}: </b>{{ project.projectName }}
        </p>
        <p v-else><b>Project: </b>{{ project.projectName }}</p>
      </div>
    </div>
    <!-- Job Role -->
    <p v-if="!isEmpty(this.model.jobRole)"><b>Job Role:</b> {{ this.model.jobRole }}</p>
    <!-- AIN-->
    <p v-if="!isEmpty(this.model.agencyIdentificationNumber)">
      <b>Agency Identification Number:</b> {{ this.model.agencyIdentificationNumber }}
    </p>
    <!-- Employee Tags -->
    <p v-if="admin">
      <b>Employee Tags: </b>
      <span v-if="getEmployeeTags.length == 0">None</span>
      <span v-else v-for="tag in getEmployeeTags" :key="tag.id" class="ml-2 mr-1">
        <v-icon size="small" color="brown-lighten-1">mdi-tag</v-icon> {{ tag.tagName }}
      </span>
    </p>
    <!-- Employee Role -->
    <p v-if="admin"><b>Employee Role:</b> {{ startCase(this.model.employeeRole) }}</p>
    <!-- Hire Date -->
    <p v-if="admin || employee"><b> Hire Date:</b> {{ monthDayYearFormat(this.model.hireDate) }}</p>
    <!-- Departure Date -->
    <p v-if="!isEmpty(this.model.deptDate) && admin">
      <b>Departure Date:</b> {{ monthDayYearFormat(this.model.deptDate) }}
    </p>
    <!-- Status -->
    <p v-if="admin || employee"><b>Status:</b> {{ getWorkStatus(this.model.workStatus) }}</p>
    <!-- Last Login -->
    <p v-if="admin && !isEmpty(this.model.lastLogin)"><b>Last Logged In:</b> {{ this.model.lastLogin }}</p>
    <!-- EEO Compliance Reporting -->
    <div v-if="admin || employee">
      <v-divider></v-divider>
      <p class="mt-4">
        <b>EEO Compliance Reporting:</b>
        <span
          v-if="
            !this.model.eeoDeclineSelfIdentify &&
            !isEmpty(this.model.eeoGender) &&
            !isEmpty(this.model.eeoHispanicOrLatino) &&
            !isEmpty(this.model.eeoRaceOrEthnicity) &&
            !isEmpty(this.model.eeoJobCategory) &&
            !isEmpty(this.model.eeoHasDisability) &&
            !isEmpty(this.model.eeoIsProtectedVeteran)
          "
          class="float-right"
        >
          <a @click="emit('show-all', true)" class="font-weight-bold text-caption text-blue pr-3">Show All</a>
          <a @click="emit('show-all', false)" class="font-weight-bold text-caption text-blue">Hide All</a>
        </span>
      </p>

      <sensitive-data-field
        class="ml-2 mb-5"
        v-if="this.model.eeoDeclineSelfIdentify"
        label="Status"
        :value="`Declined to self-identify${declinedExtraText}.`"
      />
      <div
        v-else-if="
          !this.model.eeoDeclineSelfIdentify &&
          !isEmpty(this.model.eeoGender) &&
          !isEmpty(this.model.eeoHispanicOrLatino) &&
          !isEmpty(this.model.eeoRaceOrEthnicity) &&
          !isEmpty(this.model.eeoJobCategory) &&
          !isEmpty(this.model.eeoHasDisability) &&
          !isEmpty(this.model.eeoIsProtectedVeteran)
        "
        class="ml-2"
      >
        <sensitive-data-field class="mb-5" label="Gender" :value="this.model.eeoGender.text" />
        <sensitive-data-field
          class="mb-5"
          label="Hispanic or Latino"
          :value="this.model.eeoHispanicOrLatino.value ? 'Yes' : 'No'"
        />
        <sensitive-data-field class="mb-5" label="Race or Ethnicity" :value="this.model.eeoRaceOrEthnicity.text" />
        <sensitive-data-field class="mb-5" label="Job Category" :value="this.model.eeoJobCategory.text" />
        <sensitive-data-field class="mb-5" label="Disability" :value="this.model.eeoHasDisability ? 'Yes' : 'No'" />
        <sensitive-data-field
          class="mb-5"
          label="Protected Veteran"
          :value="this.model.eeoIsProtectedVeteran ? 'Yes' : 'No'"
        />
      </div>
      <div
        v-else-if="
          !isEmpty(this.model.eeoGender) ||
          !isEmpty(this.model.eeoHispanicOrLatino) ||
          !isEmpty(this.model.eeoRaceOrEthnicity) ||
          !isEmpty(this.model.eeoJobCategory) ||
          !isEmpty(this.model.eeoHasDisability) ||
          !isEmpty(this.model.eeoIsProtectedVeteran)
        "
        class="ml-2"
      >
        <p><b>Status: </b>Form is partially complete.</p>
      </div>
      <div v-else class="ml-2">
        <p><b>Status: </b>Form not yet completed.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import employeeUtils from '@/shared/employeeUtils';
import _filter from 'lodash/filter';
import _includes from 'lodash/includes';
import _startCase from 'lodash/startCase';
import { isEmpty, monthDayYearFormat } from '@/utils/utils';
import SensitiveDataField from '../SensitiveDataField.vue';

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
 * Gets all of the current projects the user has.
 *
 * @return array - the contracts
 */
function getCurrentProjects() {
  let currentContracts = [];
  let contractProjects = [];
  // add all contract projects to an array
  this.contracts.forEach((c) => contractProjects.push(...c.projects));
  if (this.model.contracts) {
    this.model.contracts.forEach((contract) => {
      let currContract = {};
      currContract.projects = [];
      if (contract.projects) {
        contract.projects.forEach((project) => {
          if (currContract.projects.length === 0) {
            let c = this.contracts.find((c) => c.id === contract.contractId);
            currContract.contractName = c.contractName;
            currContract.primeName = c.primeName;
          }
          if (!project.endDate) {
            let proj = contractProjects.find((p) => p.id === project.projectId);
            currContract.projects.push(proj);
          }
        });
      }
      if (currContract.projects.length > 0) {
        currentContracts.push(currContract);
      }
    });
  }

  return currentContracts;
} // getCurrentProjects

function declinedExtraText() {
  if (!userRoleIsAdmin() && !userRoleIsManager()) return '';

  let eeoValues = [
    this.model.eeoGender,
    this.model.eeoHispanicOrLatino,
    this.model.eeoRaceOrEthnicity,
    this.model.eeoJobCategory,
    this.model.eeoHasDisability,
    this.model.eeoIsProtectedVeteran
  ];

  /**
   * Get the status of EEO. Check if all values are filled
   * with AND, check if any values are filled with OR. Yes
   * this function is overcomplicating things.
   *
   * @param values eeo values from model to check
   * @param method method to check with, OR or AND
   */
  function eeoStatus(values, method = 'OR') {
    // OR method
    if (method.toLocaleLowerCase() === 'or' || method === '||') {
      for (let v of values) if (v != null) return true;
      return false;
    }

    // AND method
    if (method.toLocaleLowerCase() === 'and' || method === '&&') {
      for (let v of values) if (v == null) return false;
      return true;
    }
  }

  // check if *all* items are complete
  let eeoCompleteStatus = eeoStatus(eeoValues, 'AND') ? 'complete' : 'incomplete';

  // check if *any* parts of form are complete, if not all are
  if (eeoCompleteStatus === 'incomplete' && eeoStatus(eeoValues, 'OR')) eeoCompleteStatus = 'partially complete';

  return `, form is ${eeoCompleteStatus}`;
}

/**
 * Gets all of an employee's tags they are included in.
 *
 * @return Array - The list of tags an employee is in
 */
function getEmployeeTags() {
  return _filter(this.$store.getters.tags, (tag) => _includes(tag.employees, this.model.id));
} // getEmployeeTags

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - The data to emit
 */
function emit(msg, data) {
  this.emitter.emit(msg, data);
} // emit

/**
 * Returns Full Time, Part Time, or Inactive based on the work status.
 *
 * @param workStatus - the workstatus number
 * @return string - readable work status of employee
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
 * startCase filter - uses lodash startCase as filter - capitalizes every word.
 *
 * @param value - value to capitalize
 * @return string - capitalized string
 */
function startCase(value) {
  return _startCase(value);
} // startCase

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    fullName,
    getCurrentProjects,
    getEmployeeTags,
    declinedExtraText
  },
  methods: {
    startCase,
    getWorkStatus,
    isEmpty,
    monthDayYearFormat,
    emit
  },
  props: ['admin', 'contracts', 'employee', 'model'],
  components: { SensitiveDataField }
};
</script>

<style scoped>
p {
  margin-bottom: 12px;
}

.left-border {
  border-left: 2px solid rgb(187, 187, 187);
}
</style>
