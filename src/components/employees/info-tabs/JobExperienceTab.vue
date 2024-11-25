<template>
  <div class="infoTab">
    <!-- IC Experience -->
    <p><b>Experience in IC: </b>{{ icExperience }}</p>
    <hr class="my-3" />

    <!-- Case Consulting -->
    <p><b>CASE Info</b></p>
    <p v-if="model.jobRole"><b>Position: </b>{{ model.jobRole }}</p>
    <p><b>Start Date: </b>{{ monthDayYearFormat(model.hireDate) }}</p>
    <p v-if="model.deptDate"><b>End Date: </b>{{ monthDayYearFormat(model.deptDate) }}</p>
    <hr />

    <div v-if="!isEmpty(model.companies)">
      <v-row class="d-flex align-center">
        <v-col>
          <h3 class="d-inline-block mr-10 mt-0 pt-0">Job History</h3>
        </v-col>
        <v-col>
          <v-combobox
            label="Filter by Company Name"
            v-model="filter"
            @update:model-value="updateCompanies()"
            single-line
            clearable
            variant="underlined"
            :items="companyNames"
            hide-details
            class="mb-6"
          ></v-combobox>
        </v-col>
      </v-row>
      <!-- Other Jobs -->
      <!-- Loop Jobs -->
      <div v-for="(company, index) in this.pageList" :key="company.companyName + index">
        <p class="mb-1"><b>Company: </b>{{ company.companyName }}</p>
        <div class="ml-4" v-if="company.positions.length > 1">
          <p class="my-0"><b>Positions: </b></p>
          <ul class="ml-6">
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
          <ul class="ml-6">
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
          @update:model-value="onPageChange"
        ></v-pagination>
      </div>
    </div>
    <div v-else>
      <p>No Job History Information</p>
    </div>
  </div>
</template>

<script>
import _mapValues from 'lodash/mapValues';
import _forEach from 'lodash/forEach';
import _floor from 'lodash/floor';
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import _cloneDeep from 'lodash/cloneDeep';
import { isEmpty, monthDayYearFormat, monthYearFormat } from '@/utils/utils';
import { difference, format, getTodaysDate, isBefore, maximum, minimum } from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!this.isEmpty(this.model.companies)) {
    this.pageList = this.filterCompanies.slice(0, 4);
  }
} // created

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
  // get values from input, convert to array, and then sort them
  let given_ranges = _mapValues(this.model.icTimeFrames, 'range');
  given_ranges = Object.values(given_ranges);
  const durations = given_ranges
    .sort((a, b) => {
      // array has text in format YYYY-MM, so reformat to YYYYMM
      // so that it can be sorted as a regular int
      format(a[0], 'YYYY-MM', 'YYYYMM') - format(b[0], 'YYYY-MM', 'YYYYMM');
    })
    .reverse();
  let ranges = [];
  let previousVal, firstStart, lastEnd;
  // combine any dates that overlap, keep separate ones that don't
  durations.forEach((d) => {
    previousVal = ranges[ranges.length - 1];
    if (ranges.length != 0 && isBefore(d[0], previousVal[1])) {
      // overlap combination
      firstStart = minimum([previousVal[0], d[0]]);
      lastEnd = maximum([previousVal[1], d[1]]);
      ranges[ranges.length - 1] = [firstStart, lastEnd];
    } else {
      // no overlap
      ranges.push(d);
    }
  });

  let totalDurationMonths = 0; // total months
  // loop each reach to get total duration in months
  _forEach(ranges, (range) => {
    let start = format(range[0], null, 'YYYY-MM');
    let end = range.length > 1 ? format(range[1], null, 'YYYY-MM') : getTodaysDate('YYYY-MM');
    let duration = difference(end, start, 'months') + 1; // calculate range duration
    totalDurationMonths += Math.max(duration, 0); // remove negative values
  });
  // set year output text
  let totalYearOutput = _floor(totalDurationMonths / 12);
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
 * The function updates the company that is shown to the user based on filters.
 *
 * @param query - the query used to decide which companies to show
 */
function updateCompanies(query) {
  if (query !== undefined && query !== null) {
    this.filterCompanies = _filter(this.model.companies, (company) => {
      if (query && company.companyName.toLowerCase().includes(query.toLowerCase())) {
        return true;
      }
    });
  } else {
    this.filterCompanies = _cloneDeep(this.model.companies);
  }
  this.page = 1;
  this.pageList = this.filterCompanies.slice(0, 4);
} // updateCompanies

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for filter - updateCompanies based on filter
 */
function watchFilter() {
  this.updateCompanies(this.filter);
} // watchFilter

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      companyNames: _map(this.model.companies, 'companyName'),
      filterCompanies: _cloneDeep(this.model.companies),
      filter: null,
      page: 1,
      pageList: []
    };
  },
  methods: {
    difference, // dateUtils
    format, // dateUtils
    getTodaysDate, // dateUtils
    isBefore, // dateUtils
    isEmpty,
    updateCompanies,
    maximum, // dateUtils
    minimum, // dateUtils
    monthDayYearFormat,
    monthYearFormat,
    onPageChange
  },
  computed: {
    icExperience
  },
  watch: {
    filter: watchFilter
  },
  props: ['model']
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
