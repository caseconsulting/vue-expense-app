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
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

function fillData() {
  let ICData = {};
  let totalYears = 0;
  this.employees.forEach((emp) => {
    if (emp.icTimeFrames) {
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
    { title: 'Company wide IC experience', value: totalYears.toFixed(2) + ' years' },
    { title: 'Average IC experience per employee', value: averageYoE.toFixed(2) + ' years' }
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
  //return [averageYoE, totalYears];
}

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
  async created() {
    this.employees = await api.getItems(api.EMPLOYEES);
    this.fillData();
  }
};
</script>

<style></style>
