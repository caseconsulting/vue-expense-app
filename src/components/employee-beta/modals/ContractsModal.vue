<template>
  <base-info-modal title="All Contract Info">
    <div class="mt-3">
      <v-card-text class="text-align: center" v-if="isEmpty(contractsList)">
        <p>No available contract information</p>
      </v-card-text>

      <v-card-text v-else v-for="(contract, index) in contractsList" :key="contract.contractId + index" class="pt-0">
        <v-row>
          <v-col>
            <p><b>Contract: </b>{{ getContractName(contract) }}</p>
          </v-col>
          <v-col>
            <span
              v-if="
                contract.projects.some((p) => !p.endDate) ||
                contract.projects.some((p) => difference(p.endDate, getTodaysDate(), 'days') >= 0)
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
          <p class="ml-8 d-inline ma-0"><b>Project Name: </b> {{ getProjectNameFromId(project.projectId) }}</p>
          <p class="ml-8 project-text" align="right">
            ({{ getProjectStartDate(project) }} - {{ getProjectEndDate(project) }})
          </p>
        </div>
        <v-divider v-if="index != contractsList.length - 1" class="mt-4"></v-divider>
      </v-card-text>
    </div>
  </base-info-modal>
</template>

<script setup>
import BaseInfoModal from './BaseInfoModal.vue';
import { difference, getTodaysDate } from '@/shared/dateUtils';
import { monthDayYearFormat } from '../../../utils/utils';
import { isEmpty } from '@/utils/utils';

const props = defineProps(['contractsList', 'contracts', 'projectsList']);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
 * Finds the contract name from the employees contract id.
 *
 * @param contract - The employees contract object
 */
function getContractName(contract) {
  return props.contracts.find((c) => c.id === contract.contractId).contractName;
} // getContractName

/**
 * Finds the prime name from the employees contract id.
 *
 * @param contract - The employees contract object
 */
function getPrimeName(contract) {
  return props.contracts.find((c) => c.id === contract.contractId).primeName;
} // getPrimeName

/**
 * Project start date from project object
 *
 * @param project - project to find start date
 * @return the project start date
 */
function getProjectStartDate(project) {
  return monthDayYearFormat(project.startDate);
} //getProjectStartDate

/**
 * Project end date from project object
 *
 * @param project - project to find end date
 * @return the project end date
 */
function getProjectEndDate(project) {
  if (project.endDate === null || difference(project.endDate, getTodaysDate(), 'days') >= 0) {
    return 'Present';
  }
  return monthDayYearFormat(project.endDate);
} //getProjectEndDate

/**
 * Current project name from ID
 *
 * @param projectID - the current projects id number
 * @return the project name
 */
function getProjectNameFromId(projectId) {
  return props.projectsList.find((p) => p.id === projectId).projectName;
} //getProjectNameFromId

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

<style scoped>
.project-text {
  margin: 0;
  display: inline;
  color: #828282;
}
</style>
