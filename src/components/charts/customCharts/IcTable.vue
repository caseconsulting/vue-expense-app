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
          <v-toolbar-title>Intelligence Community Stats</v-toolbar-title>
        </v-toolbar>
      </template>
    </v-data-table>
    <v-skeleton-loader v-else type="paragraph@3"></v-skeleton-loader>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

/**
 * created lifecycle hook
 */
async function created() {
  this.$forceUpdate();
  this.employees = await api.getItems(api.EMPLOYEES);
  this.fillData();
} // created

/**
 * Gets the IC data, and sets the chart formatting and data options
 */
function fillData() {
  let ICData = {};
  let totalYears = 0;
  this.employees.forEach((emp) => {
    if (emp.icTimeFrames && emp.workStatus != 0) {
      let totalDurationYears = 0;
      let ranges = _.mapValues(emp.icTimeFrames, 'range');
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
        totalDurationYears += end.diff(start, 'months') / 12; // calculate range duration
      });
      let name;
      if (emp.nickname) {
        name = emp.nickname + ' ' + emp.lastName;
      } else {
        name = emp.firstName + ' ' + emp.lastName;
      }
      ICData[name] = totalDurationYears.toFixed(2);
      totalYears += totalDurationYears;
    }
  });

  let averageYoE = totalYears / this.employees.length;

  this.tableContents = [
    { title: 'Total Employees', value: this.employees.length },
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

export default {
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
  created
};
</script>
