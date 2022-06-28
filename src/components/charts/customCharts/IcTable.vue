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
    <v-radio-group row id="radioGroup" v-model="filterSelection" class="ma-0 text-center">
      <v-radio v-for="item in filterItems" :key="item" :label="item" :value="item"></v-radio>
      <v-checkbox v-model="showInterns" :label="`Show Interns`"></v-checkbox>
    </v-radio-group>
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

  // filter out interns for Total Employees
  this.employeesOnly = this.employees.filter(
    (emp) => emp.workStatus != 0 && (emp.jobRole ? emp.jobRole.toLowerCase() != 'intern' : true)
  );

  // find inactive employees (including info) and intern
  let interns = this.employees.filter(
    (emp) => emp.workStatus != 0 && (emp.jobRole ? emp.jobRole.toLowerCase() == 'intern' : false)
  );

  // filter out inactive and interns if selected
  if (!this.showInterns) {
    this.employees = this.employees.filter(
      (emp) => emp.workStatus != 0 && (emp.jobRole ? emp.jobRole.toLowerCase() != 'intern' : true)
    );
  }

  // filter out employees based on radio selection
  if (this.filterSelection === 'Full Time') {
    this.employees = this.employees.filter((emp) => emp.workStatus === 100);
  } else if (this.filterSelection === 'Part Time') {
    this.employees = this.employees.filter((emp) => emp.workStatus > 0 && emp.workStatus < 100);
  } else {
    this.employees = this.employees.filter((emp) => emp.workStatus != 0);
  }

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
    }
  });

  let averageYoE = totalYears / this.employees.length;

  this.tableContents = [
    { title: 'Total Employees', value: this.employeesOnly.length },
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
      employeesOnly: null,
      tableContents: null,
      headers: null,
      filterItems: ['All', 'Full Time', 'Part Time'],
      filterSelection: 'All',
      showInterns: true
    };
  },
  methods: {
    fillData
  },
  mounted,
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) this.fillData();
    },
    showInterns: function () {
      if (this.storeIsPopulated) this.fillData();
    },
    filterSelection: function () {
      if (this.storeIsPopulated) this.fillData();
    }
  }
};
</script>

<style>
#radioGroup {
  justify-content: center;
}
</style>
