<template>
  <div>
    <base-card title="Current Contract Info">
      <v-card-text class="pb-0 pt-3" v-if="!isEmpty(contractsList)">
        <div v-if="!noneActive">
          <p><b>Contract: </b>{{ getContractNameFromId(currentContractId) }}</p>
          <p class="ml-4">Start Date: {{ getContractStartDate(currentContractId) }}</p>
          <p><b>Prime: </b>{{ getPrimeNameFromId(currentContractId) }}</p>
          <p v-for="(project, index) in currentProjects" :key="project.projectId + index" class="ml-4">
            Project: {{ getProjectNameFromId(project.projectId) }}
          </p>
        </div>
        <div v-else class="text-align: center">
          <p>No active contracts</p>
        </div>
      </v-card-text>
      <v-card-text class="mt-6 text-align: center" v-else> No contract Information </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn variant="flat" color="#F3F3F3" @click="open">View All {{ contractsList.length }} Contracts</v-btn>
      </v-card-actions>
    </base-card>
    <contracts-modal
      v-model="dialog"
      :contracts="contracts"
      :projectsList="projectsList"
      :contractsList="contractsList"
    ></contracts-modal>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue';
import { difference, getTodaysDate } from '@/shared/dateUtils';
import _ from 'lodash';
import { isEmpty } from '@/utils/utils';
import { monthDayYearFormat } from '../../../utils/utils';
import ContractsModal from '@/components/employee-beta/modals/ContractsModal.vue';
import BaseCard from '@/components/employee-beta/cards/BaseCard.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['contracts', 'model']);

const contractsList = ref([]);
const currentContractId = ref('');
const currentProjects = ref([]);
const dialog = ref(false);
const noneActive = ref(false);
const projectsList = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
onBeforeMount(() => {
  if (!isEmpty(props.model.contracts)) {
    contractsList.value = props.model.contracts.slice(0, 10);
    projectsList.value = props.contracts.map((c) => c.projects).flat();
    getCurrentAssignment();
    // sort the filtered list by start date, descending (current contract on top)
    contractsList.value = _.reverse(_.sortBy(contractsList.value, (o) => getContractEarliestDate(o)));
    contractsList.value.forEach((contract) => {
      contract.projects = _.reverse(_.orderBy(contract.projects, ['popStartDate'])); //Sorts each contract's projects from most recent to oldest
    });
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Opens the dialog
 */
function open() {
  dialog.value = true;
}

/**
 * Gets the earliest date of a contract by looking at its projects.
 *
 * @param contract - The contract's earliest project date
 * @return the earliest date
 */
function getContractEarliestDate(contract) {
  return _.orderBy(contract.projects, ['popStartDate'])[0].startDate;
} // getContractEarliestDate

/**
 * Gets the start date of the employee's contract as MMM DD, YYYY format
 * @param contractId - id of contract
 */
function getContractStartDate(contractId) {
  return monthDayYearFormat(getContractEarliestDate(getContractObjectFromId(contractId)));
}

/**
 * Current contract name from ID
 *
 * @param contractID - the current contracts id number
 * @return the contract name
 */
function getContractNameFromId(contractId) {
  return props.contracts.find((c) => c.id === contractId).contractName;
}

/**
 * Current contract name from ID
 *
 * @param contractID - the current contracts id number
 * @return the contract name
 */
function getContractObjectFromId(contractId) {
  return props.model.contracts.find((c) => c.contractId === contractId);
}

/**
 * Finds the name of the project that is currently active.
 */
function getCurrentAssignment() {
  for (let c in props.model.contracts) {
    for (let p in props.model.contracts[c].projects) {
      if (
        !props.model.contracts[c].projects[p].endDate ||
        difference(props.model.contracts[c].projects[p].endDate, getTodaysDate(), 'days') >= 0
      ) {
        currentProjects.value = _.reverse(_.orderBy(props.model.contracts[c].projects, ['popStartDate'])); //Sorts the projects from most recent to oldest
        currentContractId.value = props.model.contracts[c].contractId;
        return;
      }
    }
  }
  if (!currentContractId.value) {
    noneActive.value = true;
  }
} // getCurrentProject

/**
 * Current prime name from ID
 *
 * @param contractID - the current contracts id number
 * @return the contract name
 */
function getPrimeNameFromId(contractId) {
  return props.contracts.find((c) => c.id === contractId).primeName;
} //getPrimeNameFromId

/**
 * Current project name from ID
 *
 * @param projectID - the current projects id number
 * @return the project name
 */
function getProjectNameFromId(projectId) {
  return projectsList.value.find((p) => p.id === projectId).projectName;
} //getProjectNameFromId
</script>
