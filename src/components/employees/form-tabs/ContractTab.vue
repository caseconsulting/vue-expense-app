<template>
  <div>
    <!-- Loop Contracts -->
    <div v-for="(contract, index) in editedContracts" class="gray-border ma-0 pt-3 pb-1 px-5" :key="index">
      <!-- Name of Contract -->
      <v-select
        ref="formFields"
        v-model="contract.contractName"
        :rules="[...getRequiredRules(), duplicateContractPrimeCombo(index)]"
        :items="getContractsDropdownItems(contract)"
        @update:model-value="
          editedContracts.push(0); // force re-render for the items prop
          editedContracts.pop(0);
        "
        label="Contract"
        variant="underlined"
        data-vv-name="Contract"
        clearable
      >
      </v-select>

      <!-- Name of Prime -->
      <v-select
        ref="formFields"
        v-model="contract.primeName"
        :rules="getRequiredRules()"
        :items="getPrimesDropdownItems(contract)"
        @update:model-value="
          editedContracts.push(0); // force re-render for the items prop
          editedContracts.pop(0);
        "
        label="Prime"
        variant="underlined"
        data-vv-name="Prime"
        clearable
      >
      </v-select>
      <!-- Start of project loop -->
      <div v-for="(project, projIndex) in contract.projects" class="pt-1 pb-2" :key="index + '-' + projIndex">
        <v-select
          ref="formFields"
          :id="'proj-' + projIndex + '-' + index"
          v-model="project.projectName"
          :items="getProjectsDropdownItems(contract)"
          :rules="[...getRequiredRules(), duplicateContractProjects(project, index)]"
          :label="'Project ' + (projIndex + 1)"
          variant="underlined"
          @update:model-value="
            editedContracts.push(0); // force re-render for the items prop
            editedContracts.pop(0);
          "
          data-vv-name="Project"
          clearable
        >
          <template v-if="contract.projects.length > 1" v-slot:append>
            <v-btn variant="text" icon="" density="comfortable" @click="deleteProject(index, projIndex)">
              <v-tooltip activator="parent" location="bottom">Delete Project</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-select>
        <v-row>
          <v-col cols="12" sm="6" md="12" lg="6" class="pt-3">
            <!-- Start Date -->
            <v-text-field
              :id="'start-field-' + index + '-' + projIndex"
              ref="formFields"
              :model-value="format(project.startDate, null, 'MM/DD/YYYY')"
              label="Start Date"
              hint="MM/DD/YYYY format"
              v-mask="'##/##/####'"
              variant="underlined"
              prepend-icon="mdi-calendar"
              :rules="[...getRequiredRules(), ...getDateRules(), dateOrderRule(index, projIndex)]"
              @update:focused="project.startDate = parseEventDate($event)"
              clearable
              @click:prepend="project.showStartMenu = true"
              @keypress="project.showStartMenu = false"
              autocomplete="off"
            >
              <v-menu
                activator="parent"
                v-model="project.showStartMenu"
                :close-on-content-click="false"
                location="start center"
              >
                <v-date-picker
                  v-model="project.startDate"
                  @update:model-value="project.showStartMenu = false"
                  :max="project.endDate"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="Start Date"
                ></v-date-picker>
              </v-menu>
            </v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="12" lg="6" class="pt-3 pb-0">
            <!-- End Date -->
            <v-text-field
              :id="'end-field-' + index + '-' + projIndex"
              ref="formFields"
              :model-value="format(project.endDate, null, 'MM/DD/YYYY')"
              :label="project.presentDate ? 'Currently active' : 'End Date'"
              variant="underlined"
              :rules="[
                ...getDateOptionalRules(),
                dateOrderRule(index, projIndex),
                endDatePresentRule(index, projIndex)
              ]"
              hint="MM/DD/YYYY format"
              prepend-icon="mdi-calendar"
              v-mask="'##/##/####'"
              clearable
              @click:clear="project.endDate = null"
              @update:focused="project.endDate = parseEventDate($event)"
              @click:prepend="project.showEndMenu = true"
              @keypress="project.showEndMenu = false"
              @update:model-value="project.endDate && project.endDate.length > 0 ? (project.presentDate = false) : ''"
              autocomplete="off"
            >
              <template v-if="endDatePresentRule(index, projIndex) !== true" v-slot:message>
                End Date is required (click <v-icon color="black" icon="mdi-check-circle-outline" /> to mark active)
              </template>
              <template v-slot:append-inner>
                <v-avatar
                  v-if="checkProjectStatus(project)"
                  @click.stop="project.presentDate = !project.presentDate"
                  class="pointer"
                  size="x-small"
                >
                  <span v-if="!project.presentDate">
                    <v-tooltip activator="parent">Click if active</v-tooltip>
                    <v-icon color="black"> mdi-check-circle-outline </v-icon>
                  </span>
                  <span v-else>
                    <v-tooltip activator="parent">Currently active</v-tooltip>
                    <v-icon color="black"> mdi-check-circle </v-icon>
                  </span>
                </v-avatar>
              </template>
              <v-menu
                activator="parent"
                v-model="project.showEndMenu"
                :close-on-content-click="false"
                location="start center"
              >
                <v-date-picker
                  v-model="project.endDate"
                  :min="project.startDate"
                  @update:model-value="project.showEndMenu = false"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="End Date"
                ></v-date-picker>
              </v-menu>
            </v-text-field>
            <!-- End End Date -->
          </v-col>
        </v-row>
      </div>
      <!-- End of project loop -->

      <div class="pb-4" align="center">
        <v-btn @click="addProject(index)" :id="'add-proj-' + index" elevation="2">
          <v-icon class="pr-1">mdi-plus</v-icon>
          Project
        </v-btn>
      </div>

      <div class="pb-4" align="center">
        <v-btn @click="deleteContract(index)" icon variant="text">
          <v-tooltip activator="parent" location="bottom">Delete Contract</v-tooltip>
          <v-icon class="case-gray pr-1">mdi-delete</v-icon>
        </v-btn>
      </div>
    </div>
    <!-- End Loop Contracts -->

    <!-- Button to Add Contracts -->
    <div class="pt-4" align="center">
      <v-btn @click="addContract()" elevation="2" id="addContractButton">
        <v-icon class="pr-1">mdi-plus</v-icon>
        Contract
      </v-btn>
    </div>
  </div>
</template>

<script>
import _forEach from 'lodash/forEach';
import _isEmpty from 'lodash/isEmpty';
import _isArray from 'lodash/isArray';
import _some from 'lodash/some';
import _filter from 'lodash/filter';
import _cloneDeep from 'lodash/cloneDeep';
import { mask } from 'vue-the-mask';
import { getDateRules, getDateOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { asyncForEach, isEmpty, isMobile, userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { add, format, isAfter, isBefore, getTodaysDate } from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  this.emitter.emit('created', 'contracts'); // emit contracts tab was created
  this.employees = this.$store.getters.employees; // get all employees
  this.editedContracts.forEach((contract) => {
    contract.contractName = this.contracts.find((c) => c.id === contract.contractId).contractName;
    contract.primeName = this.contracts.find((c) => c.id === contract.contractId).primeName;
    if (!contract.projects) {
      contract.projects = [
        {
          projectId: '',
          projectName: '',
          endDate: null,
          presentDate: false,
          startDate: null,
          showStartMenu: false,
          showEndMenu: false
        }
      ];
    } else {
      _forEach(contract.projects, (proj) => [
        (proj.projectName = this.contractProjects.find((p) => p.id === proj.projectId).projectName)
      ]);
    }
  });
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds a Contract.
 */
function addContract() {
  if (!this.editedContracts) this.editedContracts = [];
  this.editedContracts.push({
    contractId: null,
    contractName: null,
    primeName: null,
    years: 0,
    current: false,
    projects: [
      {
        projectName: null,
        endDate: null,
        presentDate: false,
        startDate: null,
        showStartMenu: false,
        showEndMenu: false
      }
    ]
  });
} // addContract

/**
 * Adds a project to a given contract.
 *
 * @param contractIndex The index of the contract
 */
function addProject(contractIndex) {
  this.editedContracts[contractIndex].projects.push({
    projectName: null,
    endDate: null,
    presentDate: false,
    startDate: null,
    showStartMenu: false,
    showEndMenu: false
  });
} // addProject

/**
 * Checks if a position is active or not.
 *
 * @param position - the job position
 */
function checkProjectStatus(project) {
  if (!project.endDate) {
    return true;
  } else {
    project.presentDate = false;
    return false;
  }
} // checkProjectStatus

/**
 * Deletes a Contract.
 *
 * @param index - array index of contract to delete
 */
function deleteContract(index) {
  this.editedContracts.splice(index, 1);
} // deleteContract

/**
 * Deletes a project.
 *
 * @param contractIndex - The index of the contract
 * @param projectIndex - The index of the project
 */
function deleteProject(contractIndex, projectIndex) {
  if (this.editedContracts[contractIndex].projects.length === 1) {
    this.editedContracts[contractIndex].projects.splice(contractIndex, 1);
  } else {
    this.editedContracts[contractIndex].projects.splice(projectIndex, 1);
  }
} // deleteProject

/**
 * Gets contract names available based on if primes or projects are entered.
 *
 * @param contract - A user's contract data
 * @return Array - An array of contract names
 */
function getContractsDropdownItems(contract) {
  if (!contract) {
    return [];
  } else if (contract.primeName && contract.projects.length == 1 && _isEmpty(contract.projects[0].projectName)) {
    // only prime name is filled out
    let matchedContracts = this.contracts.filter((c) => c.primeName === contract.primeName);
    return matchedContracts.map((c) => c.contractName);
  } else if (contract.primeName) {
    // prime name and project names are filled out
    let project = contract.projects[0];
    let matchedContracts = this.contracts.filter(
      (c) => c.primeName === contract.primeName && c.projects.some((p) => p.projectName === project.projectName)
    );
    return matchedContracts.map((c) => c.contractName);
  } else if (_isEmpty(contract.primeName) && !_isEmpty(contract.projects[0].projectName)) {
    // only project names are filled out
    let project = contract.projects[0];
    let matchedContracts = this.contracts.filter((c) => c.projects.some((p) => p.projectName === project.projectName));
    return matchedContracts.map((c) => c.contractName);
  } else {
    // prime and projects fields are empty
    return this.contracts.map((c) => c.contractName);
  }
} // getContractsDropdownItems

/**
 * Gets prime names available based on if contract names or projects are entered.
 *
 * @param contract - A user's contract data
 * @return Array - An array of prime names
 */
function getPrimesDropdownItems(contract) {
  if (!contract) {
    return [];
  } else if (contract.contractName && contract.projects.length == 1 && _isEmpty(contract.projects[0].projectName)) {
    // only contract name is filled out
    let matchedContracts = this.contracts.filter((c) => c.contractName === contract.contractName);
    return matchedContracts.map((c) => c.primeName);
  } else if (contract.contractName) {
    // contract name and project names are filled out
    let project = contract.projects[0];
    let matchedContracts = this.contracts.filter(
      (c) => c.contractName === contract.contractName && c.projects.some((p) => p.projectName === project.projectName)
    );
    return matchedContracts.map((c) => c.primeName);
  } else if (_isEmpty(contract.contractName) && !_isEmpty(contract.projects[0].projectName)) {
    // only project names are filled out
    let project = contract.projects[0];
    let matchedContracts = this.contracts.filter((c) => c.projects.some((p) => p.projectName === project.projectName));
    return matchedContracts.map((c) => c.primeName);
  } else {
    // prime and projects fields are empty
    return this.contracts.map((c) => c.primeName);
  }
} // getPrimesDropdownItems

/**
 * Gets project names available based on if contract names or prime names are entered.
 *
 * @param contract - A user's contract data
 * @return Array - An array of project names
 */
function getProjectsDropdownItems(contract) {
  if (!contract) {
    return [];
  } else if (contract.contractName && contract.primeName) {
    // both field filled out
    let matchedContracts = this.contracts.filter(
      (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
    );
    return matchedContracts.map((c) => c.projects.map((p) => p.projectName)).flat();
  } else if (contract.contractName && _isEmpty(contract.primeName)) {
    // only contract name is filled out
    let matchedContracts = this.contracts.filter((c) => c.contractName === contract.contractName);
    return matchedContracts.map((c) => c.projects.map((p) => p.projectName)).flat();
  } else if (contract.primeName && _isEmpty(contract.contractName)) {
    // only prime name is filled out
    let matchedContracts = this.contracts.filter((c) => c.primeName === contract.primeName);
    return matchedContracts.map((c) => c.projects.map((p) => p.projectName)).flat();
  } else {
    // prime and projects fields are empty
    return this.contractProjects.map((p) => p.projectName);
  }
} // getProjectsDropdownItems

/**
 * Checks if the current contract has any projects without an end date.
 *
 * @param index The index of the contract in this.editedContracts
 * @return boolean - whether or not the projects for that contract have all their end dates filled
 */
function hasEndDatesFilled(index) {
  let hasEndDatesFilled = true;
  _forEach(this.editedContracts[index].projects, (position) => {
    hasEndDatesFilled &= !!position.endDate;
  });

  return hasEndDatesFilled;
} // hasEndDatesFilled

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return this.format(event.target.value, null, 'YYYY-MM-DD');
} // parseEventDate

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
async function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) errorCount++;
  });

  // fail safe if someone tries to force a contract that's present and has an end date
  _forEach(this.editedContracts, (contract) => {
    _forEach(contract.projects, (project) => {
      if (project.endDate && project.presentDate) {
        project.presentDate = false;
      }
    });
  });

  this.emitter.emit('doneValidating', { tab: 'contracts', data: this.editedContracts }); // emit done validating and sends edited data back to parent
  this.emitter.emit('contractsStatus', errorCount); // emit error status
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields.
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    isMobile
  },
  created,
  data() {
    return {
      contractProjects: this.contracts.map((c) => c.projects).flat(),
      dateOrderRule: (compIndex, projIndex) => {
        if (this.editedContracts) {
          let project = this.editedContracts[compIndex].projects[projIndex];
          return !this.isEmpty(project.endDate) && project.startDate
            ? isAfter(add(project.endDate, 1, 'd'), project.startDate) || 'End date must be at or after start date'
            : true;
        } else {
          return true;
        }
      },
      duplicateContractPrimeCombo: (conIndex) => {
        let contract = this.editedContracts[conIndex];
        let found = _some(
          this.contracts,
          (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
        );
        let filteredContracts = _filter(
          this.editedContracts,
          (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
        );
        return !found || filteredContracts.length === 1 || 'Duplicate contract and prime combination';
      },
      duplicateContractProjects: (project, conIndex) => {
        let filteredProjects = _filter(
          this.editedContracts[conIndex].projects,
          (p) => p.projectName === project.projectName
        );
        return filteredProjects.length === 1 || 'Duplicate project within the same contract';
      },
      editedContracts: _cloneDeep(this.model), // stores edited contracts info
      endDatePresentRule: (compIndex, projIndex) => {
        if (this.editedContracts !== undefined) {
          let position = this.editedContracts[compIndex].projects[projIndex];
          if (!position.presentDate && this.isEmpty(position.endDate)) {
            return 'End Date is required';
          } else {
            return true;
          }
        } else {
          return false;
        }
      },
      experienceRequired: [
        (v) => !this.isEmpty(v) || 'This field is required',
        (v) => v >= 0 || 'Value cannot be negative',
        (v) => v < 100 || 'Value must be less than 100'
      ], // rules for years of experience
      primesDropDown: [] // autocomplete contract prime options
    };
  },
  directives: { mask },
  methods: {
    add, // dateUtils
    addContract,
    addProject,
    checkProjectStatus,
    getContractsDropdownItems,
    getPrimesDropdownItems,
    getProjectsDropdownItems,
    deleteContract,
    deleteProject,
    format, // dateUtils
    getDateRules,
    getDateOptionalRules,
    getRequiredRules,
    getTodaysDate, // dateUtils
    hasEndDatesFilled,
    isAfter, // dateUtils
    isBefore, // dateUtils
    isEmpty,
    parseEventDate,
    userRoleIsAdmin,
    userRoleIsManager,
    validateFields
  },
  props: ['contracts', 'model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>
