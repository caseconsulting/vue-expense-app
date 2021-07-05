<template>
  <div>
    <bar-chart v-if="dataReceived" :options="options" :chartData="chartData" />
  </div>
</template>

<script>
import BarChart from '../baseCharts/BarChart.vue';
import moment from 'moment-timezone';
import api from '@/shared/api.js';
moment.tz.setDefault('America/New_York');

function caseYearsData() {
  //init the caseYears array
  const MAXIMUM_INDEX = 10;
  for (let i = 0; i < MAXIMUM_INDEX; i++) {
    this.caseYears.push(0);
  }
  this.employees.forEach((employee) => {
    if (employee.hireDate !== undefined) {
      // find time at case
      var amOfYears = calculateTimeDifference(employee.hireDate);
      // push time to array
      if (amOfYears > 18) amOfYears = 18;
      else if (amOfYears < 0) amOfYears = 0;
      this.caseYearsHist.push(Math.round(amOfYears));
      this.caseYears[Math.round(Math.round(amOfYears) / 2)] += 1;
    }
  });
} //caseYearsData

function calculateTimeDifference(startDate) {
  var start = stringToDate(startDate);
  var end = moment();
  return end.diff(start, 'years', true); //Provides decimal value
} //calculateTimeDifference

/**
 * Format and set data options for case years chart.
 *
 * @return Object - case years chart data
 */
function drawCaseYearsHistGraph() {
  let experienceNum = this.caseYears;
  let data = {
    labels: ['0-2', '2-4', '4-6', '6-8', '8-10', '10-12', '12-14', '14-16', '16-18', '18+'],
    datasets: [
      {
        backgroundColor: '#BC3825',
        data: experienceNum
      }
    ]
  };

  let options = {
    title: {
      display: true,
      text: 'Number of Years at Case Consulting for Employees'
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'Number of Employees'
          }
        }
      ],
      xAxes: [
        {
          ticks: {
            autoSkip: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Years at Case Consulting'
          }
        }
      ]
    },
    legend: {
      display: false
    },
    responsive: true,
    maintainAspectRatio: false
  };
  this.chartData = data;
  this.options = options;
  this.dataReceived = true;
} // drawCaseYearsHistGraph

function stringToDate(dateAsString) {
  var date = moment(dateAsString);
  return date;
} //stringToDate

export default {
  components: { BarChart },
  data() {
    return {
      options: null,
      chartData: null,
      dataReceived: false,
      employees: null,
      caseYears: [],
      caseYearsHist: []
    };
  },
  methods: {
    drawCaseYearsHistGraph,
    caseYearsData,
    calculateTimeDifference,
    stringToDate
  },

  mounted() {
    this.drawCaseYearsHistGraph();
  },
  created: async function () {
    // eslint-disable-next-line no-undef
    this.employees = await api.getItems(api.EMPLOYEES);
    this.caseYearsData();
    this.drawCaseYearsHistGraph();
  }
};
</script>

<style></style>
