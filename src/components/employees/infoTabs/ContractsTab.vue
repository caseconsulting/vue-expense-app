<template>
  <div class="infoTab">
    <!-- Employee has Contracts -->
    <div v-if="!isEmpty(this.filteredList)">
      <!-- Loop Contracts -->
      <div v-for="(contract, index) in this.filteredList" :key="contract.name + index">
        <p><b>Contract: </b>{{ contract.name }}</p>
        <p><b>Primes: </b>{{ contract.primes.join(', ') }}</p>
        <p><b>Time on Contract: </b>{{ getContractLengthInYears(contract) }}</p>
        <div v-if="!isEmpty(contract.projects)">
          <div v-for="(project, projIndex) in contract.projects" :key="index + ' ' + projIndex" class="pb-1 px-4">
            <p v-if="contract.projects.length > 1">
              <v-row>
                <v-col>
                  <b>Project {{ projIndex + 1 }}: </b>{{ project.name }}
                </v-col>
                <v-col>
                  <v-tooltip v-if="!project.endDate" right>
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on">check</v-icon>
                    </template>
                    <span>Current Project</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </p>
            <p v-else>
              <v-row>
                <v-col> <b>Project: </b>{{ project.name }} </v-col>
                <v-col>
                  <v-tooltip v-if="!project.endDate" right>
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on">check</v-icon>
                    </template>
                    <span>Current Project</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </p>
            <p><b>Start Date: </b>{{ project.startDate | monthYearFormat }}</p>
            <div v-if="project.endDate">
              <p><b>End Date: </b>{{ project.endDate | monthYearFormat }}</p>
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
        @input="onPageChange"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { isEmpty, monthYearFormat } from '@/utils/utils';
import moment from 'moment-timezone';
import _ from 'lodash';

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
  this.filteredList = _.sortBy(this.filteredList, (o) => this.getContractEarliestDate(o));
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
 * Converts the contracts' projects' dates to number of years on the contract
 *
 * @param contract the contract to get the info from
 * @return number - number of years on the contract
 */
function getContractLengthInYears(contract) {
  let total = moment.duration();
  if (contract.projects) {
    contract.projects.forEach((project) => {
      total.add(moment.duration(this.getProjectLengthInYears(project)));
    });
  }
  return dateReadable(total);
} // getContractLengthInYears

/**
 * Gets the earliest date of a contract by looking at its projects
 *
 * @return the earliest date
 */
function getContractEarliestDate(contract) {
  return _.orderBy(contract.projects, ['startDate'])[0].startDate;
}

/**
 * returns a readable format of the date/time
 *
 * @param time - the date/time
 */
function dateReadable(time) {
  let read = '';
  let comma = false;
  if (time.years() > 0) {
    comma = true;
    read += time.years();
    if (time.years() === 1) {
      read += ' year';
    } else {
      read += ' years';
    }
  }

  if (time.months() > 0) {
    // add comma if needed
    if (comma) {
      read += ', ';
    }
    read += time.months();
    if (time.months() === 1) {
      read += ' month';
    } else {
      read += ' months';
    }
  }

  return read;
} // dateReadable

/**
 * return a readable project length instead of some other format
 *
 * @param project - the project
 */
function getProjectLengthInYearsReadable(project) {
  let length = getProjectLengthInYears(project);
  return dateReadable(length);
} // getProjectLengthInYearsReadable

/**
 * Converts the intervals to length of time in years
 *
 * @param project the project to convert
 * @return number - time in years
 */
function getProjectLengthInYears(project) {
  let startMoment = moment(project.startDate);
  let endMoment = moment(project.endDate);
  let length;
  if (project.endDate) {
    length = moment.duration(endMoment.diff(startMoment));
  } else {
    length = moment.duration(moment().diff(startMoment));
  }
  return length.add(1, 'month'); // add one month to include end month in calculation.
}

// |--------------------------------------------------|
// |                                                  |
// |                     FILTERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * filter that checks if value exists for current
 *
 * @param value - value to check
 * @return - either 'yes' if it exists or 'no' otherwise
 */
function current(value) {
  return value ? 'Yes' : 'No';
} // current

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      filteredList: [],
      page: 1
    };
  },
  filters: {
    current,
    monthYearFormat
  },
  methods: {
    getContractEarliestDate,
    getContractLengthInYears,
    getProjectLengthInYears,
    getProjectLengthInYearsReadable,
    dateReadable,
    isEmpty,
    onPageChange
  },
  props: ['model']
};
</script>

<style scoped>
.horizontalBar {
  border-top: 1px dashed;
}
</style>
