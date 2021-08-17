<template>
  <div class="infoTab">
    <!-- Employee has Contracts -->
    <div v-if="!isEmpty(this.filteredList)">
      <!-- Loop Contracts -->
      <div v-for="(contract, index) in this.filteredList" :key="contract.name + index">
        <p><b>Contract: </b>{{ contract.name }}</p>
        <p><b>Prime: </b>{{ contract.prime }}</p>
        <p><b>Time on Contract (in Years): </b>{{ getContractLengthInYears(contract) }}</p>
        <div v-if="!isEmpty(contract.projects)">
          <div v-for="(project, projIndex) in contract.projects" :key="index + ' ' + projIndex" class="pb-1 px-4">
            <p v-if="contract.projects.length > 1">
              <b>Project {{ projIndex + 1 }}: </b>{{ project.name }}
            </p>
            <p v-else><b>Project: </b>{{ project.name }}</p>
            <p><b>Time on Project (in Years): </b>{{ getProjectLengthInYears(project) }}</p>
            <p><b>Start Date: </b>{{ monthDayYearFormat(project.startDate) }}</p>
            <div v-if="project.endDate">
              <p><b>End Date: </b>{{ monthDayYearFormat(project.endDate) }}</p>
              <p><b>Current: </b>No</p>
            </div>
            <div v-else>
              <p><b>Current: </b>Yes</p>
            </div>
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
import { isEmpty, monthDayYearFormat } from '@/utils/utils';
import moment from 'moment-timezone';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!isEmpty(this.model.contracts)) {
    this.filteredList = this.model.contracts.slice(0, 5);
  }
}

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
}

/**
 * Converts the contracts' projects' dates to number of years on the contract
 *
 * @param contract the contract to get the info from
 */
function getContractLengthInYears(contract) {
  let total = 0;
  if (contract.projects) {
    contract.projects.forEach((project) => (total += Number(getProjectLengthInYears(project))));
  }
  return total.toFixed(3);
}
/**
 * Converts the intervals to length of time in years
 *
 * @param project the project to convert
 */
function getProjectLengthInYears(project) {
  let startMoment = moment(project.startDate);
  let endMoment = moment(project.endDate);
  let length;
  if (project.endDate) {
    length = moment.duration(endMoment.diff(startMoment)).asYears().toFixed(3);
  } else {
    length = moment.duration(moment().diff(startMoment)).asYears().toFixed(3);
  }
  return length < 0 ? '0.000' : length;
}

export default {
  created,
  data() {
    return {
      filteredList: [],
      page: 1
    };
  },
  filters: {
    current: (value) => {
      return value ? 'Yes' : 'No';
    }
  },
  methods: {
    getContractLengthInYears,
    getProjectLengthInYears,
    isEmpty,
    monthDayYearFormat,
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
