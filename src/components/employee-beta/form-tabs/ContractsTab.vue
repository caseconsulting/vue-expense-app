<template>
  <v-container>
    <v-row v-for="(contract, index) in editedContracts" :key="index">
      <v-col>
        <v-row>
          <v-col>
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
              data-vv-name="Contract"
              clearable
            >
            </v-select>
          </v-col>
          <v-col>
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
              data-vv-name="Prime"
              clearable
            >
            </v-select>
          </v-col>

          <v-col cols="1" align="center">
            <v-btn @click="deleteContract(index)" icon variant="text">
              <v-tooltip activator="parent" location="bottom">Delete Contract</v-tooltip>
              <v-icon class="case-gray pr-1">mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-row v-for="(project, projIndex) in contract.projects" :key="index + '-' + projIndex">
          <v-col>
            <v-row>
              <!-- indent -->
              <v-col cols="1"></v-col>
              <v-col class="groove">
                <v-select
                  ref="formFields"
                  :id="'proj-' + projIndex + '-' + index"
                  v-model="project.projectName"
                  :items="getProjectsDropdownItems(contract)"
                  :rules="[...getRequiredRules(), duplicateContractProjects(project, index)]"
                  :label="'Project ' + (projIndex + 1)"
                  @update:model-value="
                    editedContracts.push(0); // force re-render for the items prop
                    editedContracts.pop(0);
                  "
                  data-vv-name="Project"
                  clearable
                >
                </v-select>
              </v-col>

              <v-col v-if="contract.projects.length > 1" cols="1" align="center">
                <v-btn variant="text" icon="" density="comfortable" @click="deleteProject(index, projIndex)">
                  <v-tooltip activator="parent" location="bottom">Delete Project</v-tooltip>
                  <v-icon class="case-gray">mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="1"></v-col>
              <v-col class="groove">
                <v-text-field
                  :id="'start-field-' + index + '-' + projIndex"
                  ref="formFields"
                  :model-value="format(project.startDate, null, 'MM/DD/YYYY')"
                  label="Start Date"
                  hint="MM/DD/YYYY format"
                  v-mask="'##/##/####'"
                  prepend-inner-icon="mdi-calendar"
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

              <v-col>
                <v-text-field
                  :id="'end-field-' + index + '-' + projIndex"
                  ref="formFields"
                  :model-value="format(project.endDate, null, 'MM/DD/YYYY')"
                  :label="project.presentDate ? 'Currently active' : 'End Date'"
                  :rules="[
                    ...getDateOptionalRules(),
                    dateOrderRule(index, projIndex),
                    endDatePresentRule(index, projIndex)
                  ]"
                  hint="MM/DD/YYYY format"
                  prepend-inner-icon="mdi-calendar"
                  v-mask="'##/##/####'"
                  clearable
                  @click:clear="project.endDate = null"
                  @update:focused="project.endDate = parseEventDate($event)"
                  @click:prepend="project.showEndMenu = true"
                  @keypress="project.showEndMenu = false"
                  @update:model-value="
                    project.endDate && project.endDate.length > 0 ? (project.presentDate = false) : ''
                  "
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
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-row>
          <v-col align="center">
            <v-btn @click="addProject(index)" :id="'add-proj-' + index" elevation="2">
              <v-icon class="pr-1">mdi-plus</v-icon>
              Project
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
      <v-divider :thickness="4" class="border-opacity-25"></v-divider>
    </v-row>
    <v-row>
      <v-col align="center">
        <v-btn @click="addContract()" id="addContractButton">
          <v-icon class="pr-1">mdi-plus</v-icon>
          Contract
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { inject, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import _ from 'lodash';
import { ref } from 'vue';
import { getDateOptionalRules, getDateRules, getRequiredRules } from '../../../shared/validationUtils';
import { add, format, isAfter } from '../../../shared/dateUtils';
import { mask } from 'vue-the-mask';
import { isEmpty } from '../../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const props = defineProps(['contracts', 'model', 'validating']);
const store = useStore();
const vMask = mask; // custom directive

const contractProjects = ref(props.contracts.map((c) => c.projects).flat());
const editedContracts = ref(_.cloneDeep(props.model)); // stores edited contracts info
const employees = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                       RULES                      |
// |                                                  |
// |--------------------------------------------------|

const dateOrderRule = (compIndex, projIndex) => {
  if (editedContracts.value) {
    let project = editedContracts.value[compIndex].projects[projIndex];
    return !isEmpty(project.endDate) && project.startDate
      ? isAfter(add(project.endDate, 1, 'd'), project.startDate) || 'End date must be at or after start date'
      : true;
  } else {
    return true;
  }
};

const duplicateContractPrimeCombo = (conIndex) => {
  let contract = editedContracts.value[conIndex];
  let found = _.some(
    props.contracts,
    (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
  );
  let filteredContracts = _.filter(
    editedContracts.value,
    (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
  );
  return !found || filteredContracts.length === 1 || 'Duplicate contract and prime combination';
};

const duplicateContractProjects = (project, conIndex) => {
  let filteredProjects = _.filter(
    editedContracts.value[conIndex].projects,
    (p) => p.projectName === project.projectName
  );
  return filteredProjects.length === 1 || 'Duplicate project within same contract';
};

const endDatePresentRule = (compIndex, projIndex) => {
  if (editedContracts.value !== undefined) {
    let position = editedContracts.value[compIndex].projects[projIndex];
    if (!position.presentDate && isEmpty(position.endDate)) {
      return 'End Date is required';
    } else {
      return true;
    }
  } else {
    return false;
  }
};

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
onBeforeMount(async () => {
  emitter.emit('created', 'contracts'); // emit contracts tab was created
  employees.value = store.getters.employees; // get all employees
  editedContracts.value.forEach((contract) => {
    contract.contractName = props.contracts.find((c) => c.id === contract.contractId).contractName;
    contract.primeName = props.contracts.find((c) => c.id === contract.contractId).primeName;
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
        (proj.projectName = contractProjects.value.find((p) => p.id === proj.projectId).projectName)
      ]);
    }
  });
}); // onBeforeMount

// |--------------------------------------------------|
// |                                                  |
// |                    METHODS                       |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds a Contract.
 */
function addContract() {
  if (!editedContracts.value) editedContracts.value = [];
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
  editedContracts.value[contractIndex].projects.push({
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
  editedContracts.value.splice(index, 1);
} // deleteContract

/**
 * Deletes a project.
 *
 * @param contractIndex - The index of the contract
 * @param projectIndex - The index of the project
 */
function deleteProject(contractIndex, projectIndex) {
  if (editedContracts.value[contractIndex].projects.length === 1) {
    editedContracts.value[contractIndex].projects.splice(contractIndex, 1);
  } else {
    editedContracts.value[contractIndex].projects.splice(projectIndex, 1);
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
    let matchedContracts = props.contracts.filter((c) => c.primeName === contract.primeName);
    return matchedContracts.map((c) => c.contractName);
  } else if (contract.primeName) {
    // prime name and project names are filled out
    let project = contract.projects[0];
    let matchedContracts = props.contracts.filter(
      (c) => c.primeName === contract.primeName && c.projects.some((p) => p.projectName === project.projectName)
    );
    return matchedContracts.map((c) => c.contractName);
  } else if (_.isEmpty(contract.primeName) && !_.isEmpty(contract.projects[0].projectName)) {
    // only project names are filled out
    let project = contract.projects[0];
    let matchedContracts = props.contracts.filter((c) => c.projects.some((p) => p.projectName === project.projectName));
    return matchedContracts.map((c) => c.contractName);
  } else {
    // prime and projects fields are empty
    return props.contracts.map((c) => c.contractName);
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
    let matchedContracts = props.contracts.filter((c) => c.contractName === contract.contractName);
    return matchedContracts.map((c) => c.primeName);
  } else if (contract.contractName) {
    // contract name and project names are filled out
    let project = contract.projects[0];
    let matchedContracts = props.contracts.filter(
      (c) => c.contractName === contract.contractName && c.projects.some((p) => p.projectName === project.projectName)
    );
    return matchedContracts.map((c) => c.primeName);
  } else if (_.isEmpty(contract.contractName) && !_.isEmpty(contract.projects[0].projectName)) {
    // only project names are filled out
    let project = contract.projects[0];
    let matchedContracts = props.contracts.filter((c) => c.projects.some((p) => p.projectName === project.projectName));
    return matchedContracts.map((c) => c.primeName);
  } else {
    // prime and projects fields are empty
    return props.contracts.map((c) => c.primeName);
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
    let matchedContracts = props.contracts.filter(
      (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
    );
    return matchedContracts.map((c) => c.projects.map((p) => p.projectName)).flat();
  } else if (contract.contractName && _.isEmpty(contract.primeName)) {
    // only contract name is filled out
    let matchedContracts = props.contracts.filter((c) => c.contractName === contract.contractName);
    return matchedContracts.map((c) => c.projects.map((p) => p.projectName)).flat();
  } else if (contract.primeName && _.isEmpty(contract.contractName)) {
    // only prime name is filled out
    let matchedContracts = props.contracts.filter((c) => c.primeName === contract.primeName);
    return matchedContracts.map((c) => c.projects.map((p) => p.projectName)).flat();
  } else {
    // prime and projects fields are empty
    return this.contractProjects.map((p) => p.projectName);
  }
} // getProjectsDropdownItems

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return format(event.target.value, null, 'YYYY-MM-DD');
} // parseEventDate
</script>
