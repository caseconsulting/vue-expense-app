<template>
  <div class="infoTab">
    <!-- Employee has Contracts -->
    <div v-if="!isEmpty(this.filteredList)">
      <!-- Loop Contracts -->
      <div v-for="(contract, index) in this.filteredList" :key="contract.contractId + index">
        <p><b>Contract: </b>{{ getContractName(contract) }}</p>
        <p><b>Prime: </b>{{ getPrimeName(contract) }}</p>
        <p><b>Time on Contract: </b>{{ getContractLengthInYears(contract) }}</p>
        <div v-if="!isEmpty(contract.projects)">
          <div v-for="(project, projIndex) in contract.projects" :key="index + ' ' + projIndex" class="pb-1 px-4">
            <p v-if="contract.projects.length > 1">
              <v-row>
                <v-col>
                  <b>Project {{ projIndex + 1 }}: </b>{{ getProjectName(project) }}
                </v-col>
                <v-col>
                  <span v-if="!project.endDate">
                    <v-tooltip activator="parent" location="right">Current Project</v-tooltip>
                    <v-icon>mdi-check</v-icon>
                  </span>
                </v-col>
              </v-row>
            </p>
            <p v-else>
              <v-row>
                <v-col> <b>Project: </b>{{ getProjectName(project) }} </v-col>
                <v-col>
                  <span v-if="!project.endDate">
                    <v-tooltip activator="parent" location="right">Current Project</v-tooltip>
                    <v-icon>mdi-check</v-icon>
                  </span>
                </v-col>
              </v-row>
            </p>
            <p>
              <v-row>
                <v-col class="pt-0"> <b>Start Date: </b>{{ monthDayYearFormat(project.startDate) }} </v-col>
              </v-row>
            </p>
            <div v-if="project.endDate">
              <p><b>End Date: </b>{{ monthDayYearFormat(project.endDate) }}</p>
            </div>
            <p><b>Time on Project: </b>{{ getProjectLengthInYearsReadable(project) }}</p>
            <hr v-if="projIndex < contract.projects.length - 1" class="horizontalBar mb-3" />
          </div>
        </div>
        <hr v-if="index < filteredList.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Contracts -->
    </div>
    <!-- Employee does not have Contracts -->
    <p v-else>No Contracts Information</p>
    <!-- Pagination -->
    <div v-if="!isEmpty(this.model.contracts) && Math.ceil(this.model.contracts.length / 5) != 1" class="text-center">
      <v-pagination
        v-model="page"
        :length="Math.ceil(model.contracts.length / 5)"
        :total-visible="8"
        @update:model-value="onPageChange"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { isEmpty, monthDayYearFormat } from '@/utils/utils';
import { difference, getTodaysDate } from '@/shared/dateUtils';
import _sortBy from 'lodash/sortBy';
import _orderBy from 'lodash/orderBy';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!this.isEmpty(this.model.contracts)) {
    this.filteredList = this.model.contracts.slice(0, 5);
  }
  // sort the filtered list by start date, ascending
  this.filteredList = _sortBy(this.filteredList, (o) => this.getContractEarliestDate(o));
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * When the page is changed, grab the corresponding entries based on the page
 * number.
 */
function onPageChange() {
  var startIndex = 5 * (this.page - 1); //each page contains 5 contract entries
  var endIndex = startIndex + 5;
  this.filteredList = this.model.contracts.slice(startIndex, endIndex);
} // onPageChange

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
      total += this.getProjectLengthInYears(project);
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
  return _orderBy(contract.projects, ['startDate'])[0].startDate;
} // getContractEarliestDate

/**
 * Finds the contract name from the employees contract id.
 *
 * @param contract - The employees contract object
 */
function getContractName(contract) {
  return this.contracts.find((c) => c.id === contract.contractId).contractName;
} // getContractName

/**
 * Finds the prime name from the employees contract id.
 *
 * @param contract - The employees contract object
 */
function getPrimeName(contract) {
  return this.contracts.find((c) => c.id === contract.contractId).primeName;
} // getPrimeName

/**
 * Finds the project name from the employees project id.
 *
 * @param contract - The employees contract object
 */
function getProjectName(project) {
  return this.contractProjects.find((p) => p.id === project.projectId).projectName;
} // getProjectName

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
 * return a readable project length instead of some other format.
 *
 * @param project - the project
 * @return string - a readable format of the project length
 */
function getProjectLengthInYearsReadable(project) {
  let length = getProjectLengthInYears(project);
  return dateReadable(length);
} // getProjectLengthInYearsReadable

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

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      contractProjects: this.contracts.map((c) => c.projects).flat(),
      filteredList: [],
      page: 1
    };
  },
  methods: {
    difference, // dateUtils
    getContractEarliestDate,
    getContractLengthInYears,
    getContractName,
    getPrimeName,
    getProjectName,
    getProjectLengthInYears,
    getProjectLengthInYearsReadable,
    getTodaysDate, // dateUtils
    dateReadable,
    isEmpty,
    onPageChange,
    monthDayYearFormat
  },
  props: ['contracts', 'model']
};
</script>

<style scoped>
p {
  margin-bottom: 12px;
}

.horizontalBar {
  border-top: 1px dashed;
}
</style>
