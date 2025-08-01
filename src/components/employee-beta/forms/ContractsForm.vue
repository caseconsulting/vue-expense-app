<template>
  <div>
    <v-row v-for="(contract, index) in editedContracts" :key="index">
      <v-col>
        <v-row>
          <v-col :cols="isMobile() ? '10' : '6'">
            <v-select
              :key="reloadKey"
              v-model="contract.contractName"
              :rules="[...getRequiredRules(), getDuplicateContractAndPrimeRule(contract)]"
              :items="getContractsDropdownItems(contract)"
              @update:model-value="reloadKey++"
              label="Contract"
              data-vv-name="Contract"
              clearable
            >
            </v-select>
          </v-col>

          <!-- MOBILE delete contract -->
          <v-col v-if="isMobile()" cols="2" align="center" class="pl-0">
            <v-btn @click="deleteContract(index)" icon="" variant="text">
              <v-tooltip activator="parent" location="bottom">Delete Contract</v-tooltip>
              <v-icon class="case-gray pr-1">mdi-delete</v-icon>
            </v-btn>
          </v-col>
          <!-- END MOBILE delete contract -->

          <v-col :cols="isMobile() ? '12' : '5'">
            <v-select
              :key="reloadKey"
              v-model="contract.primeName"
              :rules="[...getRequiredRules(), getDuplicateContractAndPrimeRule(contract)]"
              :items="getPrimesDropdownItems(contract)"
              @update:model-value="reloadKey++"
              label="Prime"
              data-vv-name="Prime"
              clearable
            >
            </v-select>
          </v-col>

          <v-col v-if="!isMobile()" cols="1" align="center" class="pl-0">
            <v-btn @click="deleteContract(index)" icon="" variant="text">
              <v-tooltip activator="parent" location="bottom">Delete Contract</v-tooltip>
              <v-icon class="case-gray pr-1">mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="1"></v-col>
          <v-col>
            <v-row v-for="(project, projIndex) in contract.projects" :key="index + '-' + projIndex" class="groove">
              <v-col :cols="isMobile() ? '11' : '5'">
                <v-select
                  :key="reloadKey"
                  :id="'proj-' + projIndex + '-' + index"
                  v-model="project.projectName"
                  :items="getProjectsDropdownItems(contract)"
                  :rules="[...getRequiredRules(), getDuplicateProjectRule(contract)]"
                  :label="'Project ' + (projIndex + 1)"
                  @update:model-value="reloadKey++"
                  data-vv-name="Project"
                  clearable
                >
                </v-select>
              </v-col>

              <!-- DELETE PROJECTS MOBILE start -->
              <v-col v-if="isMobile() && contract.projects.length > 1" cols="1" align="center" class="mt-1">
                <v-btn variant="text" icon="" density="comfortable" @click="deleteProject(index, projIndex)">
                  <v-tooltip activator="parent" location="bottom">Delete Project</v-tooltip>
                  <v-icon class="case-gray">mdi-delete</v-icon>
                </v-btn>
              </v-col>
              <!-- DELETE PROJECTS MOBILE end -->

              <v-col :cols="isMobile() ? '12' : '3'">
                <date-picker
                  :id="'start-field-' + index + '-' + projIndex"
                  variant="filled"
                  v-model="project.startDate"
                  label="Start Date"
                  :max="project.endDate"
                  :rules="[...getRequiredRules(), ...getDateRules(), getDateBeforeRule(project.endDate)]"
                  clearable
                  autocomplete="off"
                ></date-picker>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '3'">
                <v-text-field
                  :id="'end-field-' + index + '-' + projIndex"
                  :model-value="format(project.endDate, null, 'MM/DD/YYYY')"
                  :label="project.presentDate ? 'Currently active' : 'End Date'"
                  :rules="[
                    ...getDateOptionalRules(),
                    getDateAfterRule(project.startDate),
                    getEndDatePresentRule(project)
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
                  <template v-if="!getEndDatePresentRule(project) !== true" v-slot:message>
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

              <v-col v-if="userIsAdminOrManager" :cols="isMobile() ? '12' : '4'">
                <v-combobox v-model="project.location" :items="getProjectLocations()" label="Location" clearable>
                  <template #append-inner>
                    <div>
                      <v-icon class="ml-1" color="grey-darken-1"> mdi-information </v-icon>
                      <v-tooltip activator="parent">Overrides employee location set on Contracts page</v-tooltip>
                    </div>
                  </template>
                </v-combobox>
              </v-col>

              <v-col v-if="userIsAdminOrManager" :cols="isMobile() ? '12' : '4'">
                <v-select
                  v-model="project.workType"
                  :items="['On-site', 'Hybrid', 'Remote']"
                  label="Work Type"
                  clearable
                >
                  <template #append-inner>
                    <div>
                      <v-icon class="ml-1" color="grey-darken-1"> mdi-information </v-icon>
                      <v-tooltip activator="parent">Overrides employee work type set on Contracts page</v-tooltip>
                    </div>
                  </template>
                </v-select>
              </v-col>

              <v-col v-if="userIsAdminOrManager" :cols="isMobile() ? '12' : '4'">
                <v-text-field
                  v-model="project.contractHours"
                  @update:model-value="contractHoursUpdater(project.contractHours, index, projIndex)"
                  label="Contract Hours"
                  clearable
                >
                  <template #append-inner>
                    <div>
                      <v-icon class="ml-1" color="grey-darken-1"> mdi-information </v-icon>
                      <v-tooltip activator="parent">Overrides contract year hours in timesheets widget</v-tooltip>
                    </div>
                  </template>
                </v-text-field>
              </v-col>

              <!-- DELETE PROJECTS normal -->
              <v-col v-if="!isMobile() && contract.projects.length > 1" cols="1" align="center">
                <v-btn variant="text" icon="" density="comfortable" @click="deleteProject(index, projIndex)">
                  <v-tooltip activator="parent" location="bottom">Delete Project {{ projIndex + 1 }}</v-tooltip>
                  <v-icon class="case-gray">mdi-delete</v-icon>
                </v-btn>
              </v-col>
              <!-- end DELETE PROJECTS normal -->
              <v-divider v-if="contract.projects.length > 1" :thickness="2"></v-divider>
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
  </div>
</template>

<script setup>
import DatePicker from '@/components/shared/DatePicker.vue';
import { usePrepareSubmit } from '@/composables/editTabCommunication';
import { format } from '@/shared/dateUtils';
import {
  getDateAfterRule,
  getDateBeforeRule,
  getDateOptionalRules,
  getDateRules,
  getDuplicateContractAndPrimeRule,
  getDuplicateProjectRule,
  getRequiredRules
} from '@/shared/validationUtils';
import { isEmpty, isMobile } from '@/utils/utils';
import { getProjectLocations } from '@/shared/contractUtils';
import _cloneDeep from 'lodash/cloneDeep';
import _find from 'lodash/find';
import _map from 'lodash/map';
import { computed, onBeforeMount, ref } from 'vue';
import { mask } from 'vue-the-mask';
import { useStore } from 'vuex';
import { updateStoreContracts } from '../../../utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const vMask = mask; // custom directive

// passes in all slot props as a single object
const { slotProps } = defineProps(['slotProps']);
const editedEmployee = ref(slotProps.editedEmployee);

const contracts = ref(store.getters.contracts || []);
const editedContracts = ref([]); // stores edited contracts info
const reloadKey = ref(0); // value used to trigger component re-render
const contractProjects = ref([]);

usePrepareSubmit('contracts', prepareSubmit);
initialize();

onBeforeMount(async () => {
  !store.getters.contracts ? await updateStoreContracts() : '';
  contracts.value = store.getters.contracts;
  contractProjects.value = store.getters.contracts?.map((c) => c.projects).flat();
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const userIsAdminOrManager = computed(() => {
  const role = store.getters.user.employeeRole;
  return role === 'admin' || role === 'manager';
});

// |--------------------------------------------------|
// |                                                  |
// |                    METHODS                       |
// |                                                  |
// |--------------------------------------------------|

async function prepareSubmit() {
  if (!slotProps.stopPrepare) {
    await slotProps.validate();

    // delete keys that aren't stored in database
    editedEmployee.value.contracts = _map(editedContracts.value, (contract) => {
      let newContract = _cloneDeep(contract);
      if (newContract.contractName || newContract.primeName) {
        newContract.contractId = _find(
          contracts.value,
          (c) => c.contractName === newContract.contractName && c.primeName === newContract.primeName
        ).id;
      }
      delete newContract.contractName;
      delete newContract.primeName;

      // get all the projects on the selected contract
      let newContractAllProjects = store.getters.contracts.find((c) => {
        return c.id === newContract.contractId;
      }).projects;

      newContract.projects = _map(newContract.projects, (project) => {
        if (project.projectName) {
          project.projectId = _find(newContractAllProjects, (p) => p.projectName === project.projectName).id;
        }
        delete project.projectName;
        delete project.showStartMenu;
        delete project.showEndMenu;
        return project;
      });
      return newContract;
    });
  }
}

function initialize() {
  // getting contract, prime, and project names and stores them with their respective object
  editedContracts.value = _map(editedEmployee.value.contracts, (employeeContract) => {
    const contractObj = _find(contracts.value, (c) => c.id === employeeContract.contractId);

    if (!contractObj) {
      console.warn(`Could not find contract with id: ${employeeContract.contractId}`);
      return employeeContract;
    }

    // add contractName and primeName properties
    employeeContract.contractName = contractObj.contractName;
    employeeContract.primeName = contractObj.primeName;

    // modify projects property to include projectName
    employeeContract.projects = _map(employeeContract.projects, (employeeProject) => {
      const projectObj = _find(contractObj.projects, (p) => p.id === employeeProject.projectId);

      if (!projectObj) {
        console.warn(
          `Could not find project with id: ${employeeProject.projectId} within contract: ${contractObj.contractName}`
        );
        return employeeProject;
      }

      employeeProject.projectName = projectObj.projectName;
      return employeeProject;
    });

    return employeeContract;
  });
}

/**
 * Rule that specifies that the end date is present if contract is not currently active
 * @param project The project object
 */
function getEndDatePresentRule(project) {
  return () => {
    if (editedContracts.value) {
      if (!project.presentDate && isEmpty(project.endDate)) return 'End Date is required';
      else return true;
    } else return false;
  };
}

/**
 * Adds a Contract.
 */
function addContract() {
  if (!editedContracts.value) editedContracts.value = [];
  editedContracts.value.push({
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
  let toReturn = null;
  if (!contract) {
    toReturn = [];
  } else if (contract.primeName && contract.projects.length == 1 && isEmpty(contract.projects[0].projectName)) {
    // only prime name is filled out
    let matchedContracts = contracts.value.filter((c) => c.primeName === contract.primeName);
    toReturn = matchedContracts.map((c) => c.contractName);
  } else if (contract.primeName) {
    // prime name and project names are filled out
    let project = contract.projects[0];
    let matchedContracts = contracts.value.filter(
      (c) => c.primeName === contract.primeName && c.projects.some((p) => p.projectName === project.projectName)
    );
    toReturn = matchedContracts.map((c) => c.contractName);
  } else if (isEmpty(contract.primeName) && !isEmpty(contract.projects[0].projectName)) {
    // only project names are filled out
    let project = contract.projects[0];
    let matchedContracts = contracts.value.filter((c) => c.projects.some((p) => p.projectName === project.projectName));
    toReturn = matchedContracts.map((c) => c.contractName);
  } else {
    // prime and projects fields are empty
    toReturn = contracts.value.map((c) => c.contractName);
  }
  return Array.from(new Set(toReturn));
} // getContractsDropdownItems

/**
 * Gets prime names available based on if contract names or projects are entered.
 *
 * @param contract - A user's contract data
 * @return Array - An array of prime names
 */
function getPrimesDropdownItems(contract) {
  let toReturn = null;
  if (!contract) {
    toReturn = [];
  } else if (contract.contractName && contract.projects.length == 1 && isEmpty(contract.projects[0].projectName)) {
    // only contract name is filled out
    let matchedContracts = contracts.value.filter((c) => c.contractName === contract.contractName);
    toReturn = matchedContracts.map((c) => c.primeName);
  } else if (contract.contractName) {
    // contract name and project names are filled out
    let project = contract.projects[0];
    let matchedContracts = contracts.value.filter(
      (c) => c.contractName === contract.contractName && c.projects.some((p) => p.projectName === project.projectName)
    );
    toReturn = matchedContracts.map((c) => c.primeName);
  } else if (isEmpty(contract.contractName) && !isEmpty(contract.projects[0].projectName)) {
    // only project names are filled out
    let project = contract.projects[0];
    let matchedContracts = contracts.value.filter((c) => c.projects.some((p) => p.projectName === project.projectName));
    toReturn = matchedContracts.map((c) => c.primeName);
  } else {
    // prime and projects fields are empty
    toReturn = contracts.value.map((c) => c.primeName);
  }
  return Array.from(new Set(toReturn));
} // getPrimesDropdownItems

/**
 * Gets project names available based on if contract names or prime names are entered.
 *
 * @param contract - A user's contract data
 * @return Array - An array of project names
 */
function getProjectsDropdownItems(contract) {
  let toReturn = null;
  if (!contract) {
    toReturn = [];
  } else if (contract.contractName && contract.primeName) {
    // both field filled out
    let matchedContracts = contracts.value.filter(
      (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
    );
    toReturn = matchedContracts.map((c) => c.projects.map((p) => p.projectName)).flat();
  } else if (contract.contractName && isEmpty(contract.primeName)) {
    // only contract name is filled out
    let matchedContracts = contracts.value.filter((c) => c.contractName === contract.contractName);
    toReturn = matchedContracts.map((c) => c.projects.map((p) => p.projectName)).flat();
  } else if (contract.primeName && isEmpty(contract.contractName)) {
    // only prime name is filled out
    let matchedContracts = contracts.value.filter((c) => c.primeName === contract.primeName);
    toReturn = matchedContracts.map((c) => c.projects.map((p) => p.projectName)).flat();
  } else {
    // prime and projects fields are empty
    toReturn = contractProjects.value.map((p) => p.projectName);
  }
  return Array.from(new Set(toReturn));
} // getProjectsDropdownItems

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate(event) {
  return format(event.target, null, 'YYYY-MM-DD');
} // parseEventDate

/**
 * Handle specific case of contractHours being an empty string on a contract,
 * which crashes the timesheets widget.
 *
 * @param value of the contractHours
 * @param contractIndex index of the contract being edited
 * @param projectIndex index of the project being edited
 */
function contractHoursUpdater(value, contractIndex, projectIndex) {
  if (value === '') editedContracts.value[contractIndex].projects[projectIndex].contractHours = undefined;
}
</script>
