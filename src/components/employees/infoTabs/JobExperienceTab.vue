<template>
  <div class="infoTab">
    <!-- IC Experience -->
    <p><b>Experience in IC: </b>{{ icExperience }}</p>
    <hr class="my-3" />

    <!-- Case Consulting -->
    <p><b>Company: </b>Case Consulting</p>
    <p v-if="model.jobRole"><b>Position: </b>{{ model.jobRole }}</p>
    <p><b>Start Date: </b>{{ model.hireDate | monthDayYearFormat }}</p>
    <p v-if="model.deptDate"><b>End Date: </b>{{ model.deptDate | monthDayYearFormat }}</p>
    <hr v-if="model.companies && model.companies.length > 0" class="mb-3" />
<<<<<<< HEAD
    <br />
=======
>>>>>>> 2384-Adding-pages-for-infoTabs: Reverting changes due to a later commit changing the logic of the page

    <h3>Job History</h3>
    <v-combobox
      label="Filter by Company Name"
      v-model="filter"
      @input.native="updateCompanies()"
      :items="companyNames"
      :menu-props="{ top: true, offsetY: true }"
    ></v-combobox>
    <!-- Other Jobs -->
    <div v-if="!isEmpty(model.companies)">
      <!-- Loop Jobs -->
      <div v-for="(company, index) in model.companies" :key="company.companyName + index">
        <p><b>Company: </b>{{ company.companyName }}</p>
        <div v-for="(position, posIndex) in company.positions" :key="position.title + posIndex">
          <p v-if="company.positions.length > 1">
            <b>Position {{ posIndex + 1 }}: </b>{{ position.title }}
          </p>
          <p v-else><b>Position: </b>{{ position.title }}</p>
          <p><b>Start Date: </b>{{ position.startDate | monthDayYearFormat }}</p>
          <p v-if="position.endDate"><b>End Date: </b>{{ position.endDate | monthDayYearFormat }}</p>
          <hr v-if="posIndex < company.positions.length - 1" class="horizontalBar mb-3" />
        </div>
        <hr v-if="index < model.companies.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Jobs -->
    </div>
  </div>
</template>

<script>
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import _ from 'lodash';
import { isEmpty, monthDayYearFormat } from '@/utils/utils';
<<<<<<< HEAD

=======
>>>>>>> 2384-Adding-pages-for-infoTabs: Reverting changes due to a later commit changing the logic of the page
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
<<<<<<< HEAD

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
  }
}

export default {
  data() {
    return {
      companyNames: _.map(this.model.companies, 'companyName'),
      filterCompanies: _.cloneDeep(this.model.companies),
      filter: ''
    };
  },
  methods: {
    isEmpty,
    updateCompanies
  },
  computed: {
    icExperience
  },
  watch: {
    filter: function () {
      this.updateCompanies(this.filter);
    }
  },
  filters: {
    monthDayYearFormat
=======
export default {
  computed: {
    icExperience
  },
  filters: {
    monthDayYearFormat
  },
  methods: {
    isEmpty
>>>>>>> 2384-Adding-pages-for-infoTabs: Reverting changes due to a later commit changing the logic of the page
  },
  props: ['model']
};
</script>

<style scoped>
.horizontalBar {
  border-top: 1px dashed;
}
</style>
