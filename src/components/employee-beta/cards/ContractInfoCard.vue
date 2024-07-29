<template>
  <v-card title="Current Contract Info" elevation="4">
    <v-card-text class="pb-0" v-if="!isEmpty(contractsList)">
      <div v-if="!noneActive">
        <p><b>Contract: </b>{{ getContractNameFromId(currentContractId) }}</p>
        <p class="ml-4">Start Date: {{ getContractStartDate(currentContractId) }}</p>
        <p><b>Prime: </b>{{ getPrimeNameFromId(currentContractId) }}</p>
        <p v-for="(project, index) in currentProjects" :key="project.projectId + index" class="ml-4">
          Project: {{ getProjectNameFromId(project.projectId) }}
        </p>
      </div>
      <div v-else style="font-size: 15px; text-align: center" class="mt-3">
        <p>No current contracts</p>
      </div>
    </v-card-text>
    <v-card-text style="text-align: center" v-else> No Contract Information </v-card-text>
    <v-card-actions>
      <v-btn block @click="open">Click to see more</v-btn>
    </v-card-actions>
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:default>
        <v-card title="All Contract Information">
          <v-card-text v-if="isEmpty(contractsList)">
            <p>No available contract information</p>
          </v-card-text>

          <v-card-text
            v-else
            v-for="(contract, index) in contractsList"
            :key="contract.contractId + index"
            class="pt-0"
          >
            <v-row>
              <v-col>
                <p><b>Contract: </b>{{ getContractName(contract) }}</p>
              </v-col>
              <v-col>
                <span
                  v-if="
                    contract.projects.some((p) => !p.endDate) ||
                    contract.projects.some((p) => difference(p.endDate, getTodaysDate(), 'days') > 0)
                  "
                >
                  <v-tooltip activator="parent" location="right">Current Contract</v-tooltip>
                  <v-icon>mdi-check</v-icon>
                </span>
              </v-col>
            </v-row>
            <p class="ml-4"><b>Prime: </b>{{ getPrimeName(contract) }}</p>
            <p class="ml-4"><b>Time on Contract: </b>{{ getContractLengthInMonths(contract) }}</p>
            <div v-for="(project, index) in contract.projects" :key="project.projectId + index">
              <p class="ml-8" style="margin: 0; display: inline">
                <b>Project Name: </b> {{ getProjectNameFromId(project.projectId) }}
              </p>
              <p class="ml-8" style="margin: 0; display: inline; color: #828282" align="right">
                ({{ getProjectStartDate(project) }} - {{ getProjectEndDate(project) }})
              </p>
            </div>
            <v-divider v-if="index != contractsList.length - 1" class="mt-4"></v-divider>
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
import { monthDayYearFormat } from '../../../utils/utils';

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
 * Converts the contracts' projects' dates to number of months on the contract.
 *
 * @param contract the contract to get the info from
 * @return number - number of months on the contract
 */
function getContractLengthInMonths(contract) {
  let totalMonths = 0;
  let totalDays = 0;
  if (contract.projects) {
    contract.projects.forEach((project) => {
      totalMonths += getProjectLength(project, 'month');
      totalDays += getProjectLength(project, 'day');
    });
  }
  return totalMonths <= 1 ? totalDays + ' days' : dateReadable(totalMonths);
} // getContractLengthInYears

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
        difference(props.model.contracts[c].projects[p].endDate, getTodaysDate(), 'days') > 0
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
  return projectsList.value.find((p) => p.id === projectId).projectName;
}

/**
 * Project start date from project object
 *
 * @param project - project to find start date
 * @return the project start date
 */
function getProjectStartDate(project) {
  return monthDayYearFormat(project.startDate);
}

/**
 * Project end date from project object
 *
 * @param project - project to find end date
 * @return the project end date
 */
function getProjectEndDate(project) {
  if (project.endDate === null) {
    return 'Present';
  }
  return monthDayYearFormat(project.endDate);
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
 * Converts the intervals to length of time in months.
 *
 * @param project - the project to convert
 * @param duration - string of duration, 'day' or 'month'
 * @return number - time in months
 */
function getProjectLength(project, duration) {
  let length;
  if (project.endDate && 0 > difference(project.endDate, getTodaysDate(), 'days')) {
    length = difference(project.endDate, project.startDate, duration);
  } else {
    length = difference(getTodaysDate(), project.startDate, duration);
  }
  return length;
}
</script>
