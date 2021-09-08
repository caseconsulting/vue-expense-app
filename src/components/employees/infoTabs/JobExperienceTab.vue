<template>
  <div class="infoTab">
    <!-- IC Experience -->
    <p><b>Experience in IC: </b>{{ icExperience }}</p>
    <hr class="my-3" />

    <!-- Case Consulting -->
    <p><b>Case Consulting Info</b></p>
    <p v-if="model.jobRole"><b>Position: </b>{{ model.jobRole }}</p>
    <p><b>Start Date: </b>{{ monthDayYearFormat(model.hireDate) }}</p>
    <p v-if="model.deptDate"><b>End Date: </b>{{ monthDayYearFormat(model.deptDate) }}</p>
    <hr class="mb-3" />

    <div v-if="!isEmpty(model.companies)">
      <h3>Job History</h3>
      <v-combobox
        label="Filter by Company Name"
        v-model="filter"
        @input.native="updateCompanies()"
        :items="companyNames"
        :menu-props="{ top: true, offsetY: true }"
      ></v-combobox>
      <!-- Other Jobs -->
      <!-- Loop Jobs -->
      <div v-for="(company, index) in this.pageList" :key="company.companyName + index">
        <p class="mb-1"><b>Company: </b>{{ company.companyName }}</p>
        <div class="ml-4" v-if="company.positions.length > 1">
          <p class="my-0"><b>Positions: </b></p>
          <ul>
            <li v-for="(position, posIndex) in company.positions" :key="position.title + posIndex">
              {{ position.title }}
              <ul>
                <li>Start Date: {{ monthYearFormat(position.startDate) }}</li>
                <li v-if="position.endDate">End Date: {{ monthYearFormat(position.endDate) }}</li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="ml-4" v-else>
          <p class="my-0"><b>Position:</b> {{ company.positions[0].title }}</p>
          <ul>
            <li>Start Date: {{ monthYearFormat(company.positions[0].startDate) }}</li>
            <li v-if="company.positions[0].endDate">End Date: {{ monthYearFormat(company.positions[0].endDate) }}</li>
          </ul>
        </div>
        <hr v-if="index < pageList.length - 1" class="my-3" />
      </div>
      <!-- End Loop Jobs -->
      <!-- Pagination -->
      <div v-if="!isEmpty(this.model.companies) && Math.ceil(filterCompanies.length / 4) != 1" class="text-center">
        <v-pagination
          v-model="page"
          :length="Math.ceil(filterCompanies.length / 4)"
          :total-visible="8"
          @input="onPageChange"
        ></v-pagination>
      </div>
    </div>
    <div v-else>
      <p>No Job History Information</p>
    </div>
  </div>
</template>

<script>
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import _ from 'lodash';
import { isEmpty, monthDayYearFormat, monthYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!isEmpty(this.model.companies)) {
    this.pageList = this.filterCompanies.slice(0, 4);
  }
}

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|
/**
 * Calculate and return text for Experience in IC duration.
 *
 * @return String - Experience in IC duration
 */
function icExperience() {
  let ranges = _.mapValues(this.model.icTimeFrames, 'range');
  let totalDurationMonths = 0; // total months
  // loop each reach to get total duration in months
  _.forEach(ranges, (range) => {
    let start = moment(range[0], 'YYYY-MM');
    let end;
    if (range.length > 1) {
      // end date
      end = moment(range[1], 'YYYY-MM');
    } else {
      // present
      end = moment();
    }
    let duration = end.diff(start, 'months') + 1; // calculate range duration
    totalDurationMonths += Math.max(duration, 0); // remove negative values
  });
  // set year output text
  let totalYearOutput = _.floor(totalDurationMonths / 12);
  if (totalYearOutput < 1) {
    totalYearOutput = '';
  } else if (totalYearOutput == 1) {
    totalYearOutput += ' Year';
  } else {
    totalYearOutput += ' Years';
  }
  // set month output text
  let totalMonthOutput = totalDurationMonths % 12;
  if (totalMonthOutput < 1) {
    totalMonthOutput = totalYearOutput.length > 0 ? '' : 'None';
  } else if (totalMonthOutput == 1) {
    totalMonthOutput = totalYearOutput.length > 0 ? ` and ${totalMonthOutput} Month` : `${totalMonthOutput} Month`;
  } else {
    totalMonthOutput = totalYearOutput.length > 0 ? ` and ${totalMonthOutput} Months` : `${totalMonthOutput} Months`;
  }
  return `${totalYearOutput}${totalMonthOutput}`;
} // icExperience

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
  var startIndex = 4 * (this.page - 1); //each page contains 4 job entries
  var endIndex = startIndex + 4;
  this.pageList = this.filterCompanies.slice(startIndex, endIndex);
} //onPageChange

/**
 * The function updates the company that is shown to the user based on filters
 */
function updateCompanies(query) {
  if (query === undefined) {
    query = event.target.value;
  }
  if (query !== undefined) {
    this.filterCompanies = _.filter(this.model.companies, (company) => {
      if (company.companyName.toLowerCase().includes(query.toLowerCase())) {
        return true;
      }
    });
    this.page = 1;
    this.pageList = this.filterCompanies.slice(0, 4);
  }
}
export default {
  created,
  data() {
    return {
      companyNames: _.map(this.model.companies, 'companyName'),
      filterCompanies: _.cloneDeep(this.model.companies),
      filter: '',
      page: 1,
      pageList: []
    };
  },
  methods: {
    isEmpty,
    updateCompanies,
    monthDayYearFormat,
    monthYearFormat,
    onPageChange
  },
  computed: {
    icExperience
  },
  watch: {
    filter: function () {
      this.updateCompanies(this.filter);
    }
  },
  props: ['model']
};
</script>

<style scoped>
.horizontalBar {
  border-top: 1px dashed;
}
</style>
