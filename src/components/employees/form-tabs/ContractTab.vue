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
        @change="
          editedContracts.push(0); // force re-render for the items prop
          editedContracts.pop(0);
        "
        label="Contract"
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
        @change="
          editedContracts.push(0); // force re-render for the items prop
          editedContracts.pop(0);
        "
        label="Prime"
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
          @change="
            editedContracts.push(0); // force re-render for the items prop
            editedContracts.pop(0);
          "
          data-vv-name="Project"
          clearable
        >
          <v-tooltip v-if="contract.projects.length > 1" bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="deleteProject(index, projIndex)"
                ><v-icon class="case-gray">delete</v-icon></v-btn
              >
            </template>
            <span>Delete Project</span>
          </v-tooltip>
        </v-select>
        <v-row>
          <v-col cols="12" sm="6" md="12" lg="6" class="pt-3">
            <!-- Start Date -->
            <v-menu
              v-model="project.showStartMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :id="'start-field-' + index + '-' + projIndex"
                  ref="formFields"
                  :value="format(project.startDate, null, 'MM/YYYY')"
                  label="Start Date"
                  hint="MM/YYYY format"
                  v-mask="'##/####'"
                  prepend-icon="event_available"
                  :rules="[...getRequiredRules(), ...getDateMonthYearRules(), dateOrderRule(index, projIndex)]"
                  v-bind="attrs"
                  v-on="on"
                  @blur="project.startDate = parseEventDate($event)"
                  clearable
                  @input="project.showStartMenu = false"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="project.startDate"
                :max="project.endDate"
                no-title
                @input="project.showStartMenu = false"
                type="month"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="6" md="12" lg="6" class="pt-3">
            <!-- End Date -->
            <v-menu
              v-model="project.showEndMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :id="'end-field-' + index + '-' + projIndex"
                  ref="formFields"
                  :disabled="project.presentDate"
                  :value="format(project.endDate, null, 'MM/YYYY')"
                  label="End Date"
                  prepend-icon="event_busy"
                  :rules="[
                    ...getDateMonthYearOptionalRules(),
                    dateOrderRule(index, projIndex),
                    endDatePresentRule(index, projIndex)
                  ]"
                  hint="MM/YYYY format"
                  v-mask="'##/####'"
                  v-bind="attrs"
                  v-on="on"
                  clearable
                  @click:clear="project.endDate = null"
                  @blur="project.endDate = parseEventDate($event)"
                  @input="project.showEndMenu = false"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="project.endDate"
                :min="project.startDate"
                no-title
                @input="project.showEndMenu = false"
                type="month"
              ></v-date-picker>
            </v-menu>
            <!-- End End Date -->
          </v-col>
          <v-col v-if="!isMobile"></v-col>
          <v-col>
            <v-layout justify-start class="pl-2">
              <v-checkbox
                class="ma-0 pa-0"
                v-model="project.presentDate"
                :label="`Present`"
                @click="project.endDate = null"
              ></v-checkbox>
            </v-layout>
          </v-col>
        </v-row>
      </div>
      <!-- End of project loop -->

      <div class="pb-4" align="center">
        <v-btn @click="addProject(index)" :id="'add-proj-' + index" elevation="2"
          ><v-icon class="pr-1">add</v-icon>Project</v-btn
        >
      </div>

      <div class="pb-4" align="center">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="deleteContract(index)" icon text
              ><v-icon class="case-gray pr-1">delete</v-icon></v-btn
            >
          </template>
          <span>Delete Contract</span>
        </v-tooltip>
      </div>
    </div>
    <!-- End Loop Contracts -->

    <!-- Button to Add Contracts -->
    <div class="pt-4" align="center">
      <v-btn @click="addContract()" elevation="2" id="addContractButton"
        ><v-icon class="pr-1">add</v-icon>Contract</v-btn
      >
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { mask } from 'vue-the-mask';
import { getDateMonthYearRules, getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { isEmpty, isMobile } from '@/utils/utils';
import { add, format, isAfter } from '@/shared/dateUtils';

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
      _.forEach(contract.projects, (proj) => [
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
    contractId: '',
    contractName: '',
    primeName: '',
    years: 0,
    current: false,
    projects: [
      {
        projectName: '',
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
    projectName: '',
    endDate: null,
    presentDate: false,
    startDate: null,
    showStartMenu: false,
    showEndMenu: false
  });
} // addProject

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
  } else if (contract.primeName && contract.projects.length == 1 && _.isEmpty(contract.projects[0].projectName)) {
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
  } else if (_.isEmpty(contract.primeName) && !_.isEmpty(contract.projects[0].projectName)) {
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
  } else if (contract.contractName && contract.projects.length == 1 && _.isEmpty(contract.projects[0].projectName)) {
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
  } else if (_.isEmpty(contract.contractName) && !_.isEmpty(contract.projects[0].projectName)) {
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
  } else if (contract.contractName && _.isEmpty(contract.primeName)) {
    // only contract name is filled out
    let matchedContracts = this.contracts.filter((c) => c.contractName === contract.contractName);
    return matchedContracts.map((c) => c.projects.map((p) => p.projectName)).flat();
  } else if (contract.primeName && _.isEmpty(contract.contractName)) {
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
  _.forEach(this.editedContracts[index].projects, (position) => {
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
  return this.format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} //parseEventDate

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });

  // fail safe if someone tries to force a contract that's present and has an end date
  _.forEach(this.editedContracts, (contract) => {
    _.forEach(contract.projects, (project) => {
      if (project.endDate && project.presentDate) {
        project.presentDate = false;
      }
    });
  });

  this.emitter.emit('doneValidating', 'contracts', this.editedContracts); // emit done validating and sends edited data back to parent
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
        let found = _.some(
          this.contracts,
          (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
        );
        let filteredContracts = _.filter(
          this.editedContracts,
          (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
        );
        return !found || filteredContracts.length === 1 || 'Duplicate contract and prime combination';
      },
      duplicateContractProjects: (project, conIndex) => {
        let filteredProjects = _.filter(
          this.editedContracts[conIndex].projects,
          (p) => p.projectName === project.projectName
        );
        return filteredProjects.length === 1 || 'Duplicate project within the same contract';
      },
      editedContracts: _.cloneDeep(this.model), // stores edited contracts info
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
    getContractsDropdownItems,
    getPrimesDropdownItems,
    getProjectsDropdownItems,
    deleteContract,
    deleteProject,
    format, // dateUtils
    getDateMonthYearRules,
    getDateMonthYearOptionalRules,
    getRequiredRules,
    hasEndDatesFilled,
    isAfter, // dateUtils
    isEmpty,
    parseEventDate,
    validateFields
  },
  props: ['contracts', 'model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>
