<template>
  <div>
    <pie-chart v-if="dataReceived" :options="options" :chartData="chartData" />
    <h4 v-if="employees">Total Employees: {{ employees.length }}</h4>
    <h4>Company wide IC experience: {{ totalYears.toFixed(2) }} years</h4>
    <h4>Average IC experience per employee (company-wide): {{ averageYoE.toFixed(2) }} years</h4>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import PieChart from '@/components/baseCharts/PieChart.vue';
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
  let labels = [];
  let years = [];
  _.forEach(Object.entries(ICData), (entry) => {
    labels.push(entry[0]);
    years.push(entry[1]);
  });

  let colors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(230, 184, 156, 1)',
    'rgba(234, 210, 172, 1)',
    'rgba(156, 175, 183, 1)',
    'rgba(66, 129, 164, 1)'
  ];

  this.chartData = {
    labels: labels,
    datasets: [
      {
        data: years,
        backgroundColor: colors
      }
    ]
  };

  this.options = {
    title: {
      display: true,
      text: 'IC Experience (in years)'
    },
    legend: {
      display: false
    },
    maintainAspectRatio: false
  };

  this.dataReceived = true;
  return [averageYoE, totalYears];
}

export default {
  components: {
    PieChart
  },
  data() {
    return {
      options: null,
      chartData: null,
      dataReceived: false,
      averageYoE: 0,
      employees: null,
      totalYears: 0
    };
  },
  methods: {
    fillData
  },
  async created() {
    this.employees = await api.getItems(api.EMPLOYEES);
    let results = this.fillData();
    this.averageYoE = results[0];
    this.totalYears = results[1];
  }
};
</script>

<style></style>
