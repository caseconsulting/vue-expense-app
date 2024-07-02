<template>
  <v-card title="Current Contract Information" elevation="4">
    <v-card-text v-if="!isEmpty(contractsList)">
      <div v-if="!noneActive">
        <p><b>Contract: </b>{{ getContractNameFromId(currentContractId) }}</p>
        <p><b>Prime: </b>{{ getPrimeNameFromId(currentContractId) }}</p>
        <p>Project: {{ getProjectNameFromId(currentProjectId) }}</p>
      </div>
      <div v-else style="font-size: 15px; text-align: center" class="mt-3">
        <p><b>No contracts are currently active, to view past assignments click below.</b></p>
      </div>
    </v-card-text>
    <v-card-text v-else> No contracts to be displayed </v-card-text>
    <v-card-actions v-if="!isEmpty(contractsList) && (noneActive || model.contracts.length > 1)">
      <v-btn block @click="open">Click to see more</v-btn>
    </v-card-actions>
    <v-dialog v-model="dialog">
      <template v-slot:default>
        <v-card title="All Contract Information">
          <v-card-text v-for="(contract, index) in contractsList" :key="contract.contractId + index">
            <p><b>Contract: </b>{{ getContractName(contract) }}</p>
            <p><b>Prime: </b>{{ getPrimeName(contract) }}</p>
            <p><b>Time on Contract: </b>{{ getContractLengthInYears(contract) }}</p>
          </v-card-text>
        </v-card>
      </template>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue';
import { difference, getTodaysDate } from '@/shared/dateUtils';
import _ from 'lodash';
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['contracts', 'model']);

const contractsList = ref([]);
const currentContractId = ref('');
const currentProjectId = ref('');
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
    // sort the filtered list by start date, ascending
    contractsList.value = _.sortBy(contractsList.value, (o) => getContractEarliestDate(o));
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
 * Converts the contracts' projects' dates to number of years on the contract.
 *
 * @param contract the contract to get the info from
 * @return number - number of years on the contract
 */
function getContractLengthInYears(contract) {
  let total = 0;
  if (contract.projects) {
    contract.projects.forEach((project) => {
      total += getProjectLengthInYears(project);
    });
  }
  return dateReadable(total);
} // getContractLengthInYears

/**
 * Gets the earliest date of a contract by looking at its projects.
 *
 * @param contract - The contract's earliest project date
 * @return the earliest date
 */
function getContractEarliestDate(contract) {
  return _.orderBy(contract.projects, ['startDate'])[0].startDate;
} // getContractEarliestDate

/**
 * Finds the contract name from the employees contract id.
 *
 * @param contract - The employees contract object
 */
function getContractName(contract) {
  return props.contracts.find((c) => c.id === contract.contractId).contractName;
} // getContractName

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
 * Finds the name of the project that is currently active.
 */
function getCurrentAssignment() {
  for (let c in props.model.contracts) {
    for (let p in props.model.contracts[c].projects) {
      if (!props.model.contracts[c].projects[p].endDate) {
        currentProjectId.value = props.model.contracts[c].projects[p].projectId;
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
 * Finds the prime name from the employees contract id.
 *
 * @param contract - The employees contract object
 */
function getPrimeName(contract) {
  return props.contracts.find((c) => c.id === contract.contractId).primeName;
} // getPrimeName

/**
 * Current prime name from ID
 *
 * @param contractID - the current contracts id number
 * @return the contract name
 */
function getPrimeNameFromId(contractId) {
  return props.contracts.find((c) => c.id === contractId).primeName;
}

/**
 * Current project name from ID
 *
 * @param projectID - the current projects id number
 * @return the project name
 */
function getProjectNameFromId(projectId) {
  let temp = projectsList.value.find((p) => p.id === projectId).projectName;
  return temp;
}

/**
 * returns a readable format of the date/time.
 *
 * @param time - the date/time
 * @return string - A readable format of the time
 */
function dateReadable(time) {
  time = Math.round(time);
  let read = '';
  let comma = false;
  let years = Math.floor(time / 12);
  let months = time % 12;
  if (years > 0) {
    comma = true;
    read += years;
    if (years === 1) {
      read += ' year';
    } else {
      read += ' years';
    }
  }

  if (months > 0) {
    // add comma if needed
    if (comma) {
      read += ', ';
    }
    read += months;
    if (months === 1) {
      read += ' month';
    } else {
      read += ' months';
    }
  } else {
    if (years === 0) {
      read += '0 months';
    }
  }

  return read;
} // dateReadable

/**
 * Converts the intervals to length of time in years.
 *
 * @param project the project to convert
 * @return number - time in years
 */
function getProjectLengthInYears(project) {
  let length;
  if (project.endDate) {
    length = difference(project.endDate, project.startDate, 'month');
  } else {
    length = difference(getTodaysDate(), project.startDate, 'month');
  }
  return length;
}
</script>
