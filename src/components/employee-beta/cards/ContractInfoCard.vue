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
import { ref, computed } from 'vue';
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

const dialog = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

const contractsList = computed(() => {
  if (!isEmpty(props.model.contracts)) {
    return _.reverse(_.sortBy(props.model.contracts, (o) => getContractEarliestDate(o)));
  }
  return [];
});

const projectsList = computed(() => {
  if (!isEmpty(contractsList)) {
    return props.contracts.map((c) => c.projects).flat();
  }
  return [];
});

const noneActive = computed(() => {
  if (!currentContractId.value) {
    return true;
  }
  return false;
});

const currentContractId = computed(() => {
  for (let c in props.model.contracts) {
    for (let p in props.model.contracts[c].projects) {
      if (
        !props.model.contracts[c].projects[p].endDate ||
        difference(props.model.contracts[c].projects[p].endDate, getTodaysDate(), 'days') >= 0
      ) {
        return props.model.contracts[c].contractId;
      }
    }
  }
  return '';
});

const currentProjects = computed(() => {
  for (let c in props.model.contracts) {
    for (let p in props.model.contracts[c].projects) {
      if (
        !props.model.contracts[c].projects[p].endDate ||
        difference(props.model.contracts[c].projects[p].endDate, getTodaysDate(), 'days') >= 0
      ) {
        return _.reverse(_.orderBy(props.model.contracts[c].projects, ['popStartDate'])); //Sorts the projects from most recent to oldest
      }
    }
  }
  return [];
});

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
