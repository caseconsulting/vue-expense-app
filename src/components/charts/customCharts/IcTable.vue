<template>
  <div>
    <v-data-table
      v-if="dataReceived"
      :headers="headers"
      :items="tableContents"
      class="elevation-1"
      hide-default-footer
      hide-default-header
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Community Statistics</v-toolbar-title>
        </v-toolbar>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import _ from 'lodash';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import { storeIsPopulated } from '@/utils/utils.js';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
function mounted() {
  if (this.storeIsPopulated) this.fillData();
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the IC data, and sets the chart formatting and data options
 */
function fillData() {
  let ICData = {};
  let totalYears = 0;

  // access store
  this.employees = this.$store.getters.employees;
  // filter out inactive employees (including info) and intern
  let interns = this.employees.filter(
    (emp) => emp.workStatus != 0 && (emp.jobRole ? emp.jobRole.toLowerCase() == 'intern' : false)
  );

  this.employees = this.employees.filter(
    (emp) => emp.workStatus != 0 && (emp.jobRole ? emp.jobRole.toLowerCase() != 'intern' : true)
  );

  this.employees.forEach((emp) => {
    if (emp.icTimeFrames) {
      // get values from input, convert to array, and then sort them
      let given_ranges = _.mapValues(emp.icTimeFrames, 'range');
      given_ranges = Object.values(given_ranges);
      const durations = given_ranges
        .sort((a, b) => {
          // array has text in format YYYY-MM, so convert that to a moment and reformat to YYYYMM
          // so that it can be sorted as a regular int
          moment(a[0], 'YYYY-MM').format('YYYYMM') - moment(b[0], 'YYYY-MM').format('YYYYMM');
        })
        .reverse();
      let ranges = [];
      let previousVal, firstStart, lastEnd;
      // combine any dates that overlap, keep separate ones that don't
      durations.forEach((d) => {
        previousVal = ranges[ranges.length - 1];
        if (ranges.length != 0 && moment(d[0]).isBefore(moment(previousVal[1]))) {
          // overlap combination
          firstStart = moment.min(moment(previousVal[0]), moment(d[0]));
          lastEnd = moment.max(moment(previousVal[1]), moment(d[1]));
          ranges[ranges.length - 1] = [firstStart, lastEnd];
        } else {
          // no overlap
          ranges.push(d);
        }
      });
      let totalDurationMonths = 0; // total months
      // loop each reach to get total duration in months
      _.forEach(ranges, (range) => {
        let start = moment(range[0], 'YYYY-MM');
        let end = range.length > 1 ? moment(range[1], 'YYYY-MM') : moment();
        let duration = end.diff(start, 'months') + 1; // calculate range duration
        totalDurationMonths += Math.max(duration, 0); // remove negative values
      });
      const totalDurationYears = totalDurationMonths / 12;
      const name = `${emp.nickname || emp.firstName} ${emp.lastName}`;
      ICData[name] = totalDurationYears.toFixed(2);
      totalYears += totalDurationYears;
      console.log(ICData);
    }
  });

  let averageYoE = totalYears / this.employees.length;

  this.tableContents = [
    { title: 'Total Employees', value: this.employees.length },
    { title: 'Total Interns', value: interns.length },
    { title: 'Company Wide IC Experience', value: totalYears.toFixed(2) + ' Years' },
    { title: 'Average IC Experience per Employee', value: averageYoE.toFixed(2) + ' Years' }
  ];

  this.headers = [
    {
      text: 'topic',
      align: 'start',
      value: 'title'
    },
    { text: 'val', value: 'value' }
  ];
  this.dataReceived = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    storeIsPopulated
  },
  data() {
    return {
      dataReceived: false,
      employees: null,
      tableContents: null,
      headers: null
    };
  },
  methods: {
    fillData
  },
  mounted,
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) this.fillData();
    }
  }
};
</script>
