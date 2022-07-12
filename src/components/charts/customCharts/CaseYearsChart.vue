<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart chartId="case-years" :options="options" :chartData="chartData" />
  </v-card>
  <v-skeleton-loader v-else type="paragraph@5"></v-skeleton-loader>
</template>

<script>
import BarChart from '../baseCharts/BarChart.vue';
import { storeIsPopulated } from '@/utils/utils';
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
function mounted() {
  if (this.storeIsPopulated) {
    this.caseYearsData();
    this.drawCaseYearsHistGraph();
  }
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Puts an employee in an array based on a time interval of 2 years for each index from their hire date.
 */
function caseYearsData() {
  //init the caseYears array
  const MAXIMUM_INDEX = 10;
  for (let i = 0; i < MAXIMUM_INDEX; i++) {
    this.caseYears.push(0);
  }
  this.employees = this.$store.getters.employees;
  this.employees.forEach((employee) => {
    if (employee.hireDate !== undefined && employee.workStatus != 0) {
      // find time at case
      var amOfYears = this.calculateTimeDifference(employee.hireDate);

      // push time to array
      if (amOfYears > 18) amOfYears = 18;
      else if (amOfYears < 0) amOfYears = 0;
      this.caseYears[Math.floor(Math.round(amOfYears) / 2)] += 1;
    }
  });
} //caseYearsData

/**
 * Helper function to determine how long an employee has worked from their hire date.
 *
 * @param startDate - date to compare to now
 * @return - the decimal value of the difference
 */
function calculateTimeDifference(startDate) {
  var start = this.stringToDate(startDate);

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
  let chartLabels = ['0-1', '2-3', '4-5', '6-7', '8-9', '10-11', '12-13', '14-15', '16-17', '18+'];
  let maxIndex = this.findMaxIndex();
  let data = {
    labels: chartLabels.splice(0, maxIndex + 1),
    datasets: [
      {
        backgroundColor: '#BC3825',
        data: experienceNum
      }
    ]
  };

  let options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Employees',
          font: {
            weight: 'bold'
          }
        }
      },
      x: {
        ticks: {
          autoSkip: false
        },
        title: {
          display: true,
          text: 'Years at Case Consulting',
          font: {
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Number of Years at Case Consulting for Employees',
        font: {
          size: 15
        }
      }
    },
    maintainAspectRatio: true
  };
  this.chartData = data;
  this.options = options;
  this.dataReceived = true;
} // drawCaseYearsHistGraph

/**
 * Finds the last index where the element is greater than 0 to ensure the chart does not show all of the labels are there is no data.
 *
 * @return - last index that is greater than 0
 */
function findMaxIndex() {
  let max = 0;
  this.caseYears.forEach((element, index) => {
    if (element !== undefined || element !== null) {
      if (element > 0) max = index;
    }
  });
  return max;
} // findMaxIndex

/**
 * Converts a date as a string into a moment objects.
 *
 * @param dateAsString - date that is currently a string
 * @return - the moment date object
 */
function stringToDate(dateAsString) {
  var date = moment(dateAsString);
  return date;
} //stringToDate

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { BarChart },
  computed: {
    storeIsPopulated
  },
  data() {
    return {
      options: null,
      chartData: null,
      dataReceived: false,
      employees: null,
      caseYears: []
    };
  },
  methods: {
    caseYearsData,
    calculateTimeDifference,
    drawCaseYearsHistGraph,
    findMaxIndex,
    stringToDate
  },
  mounted,
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) {
        this.drawCaseYearsHistGraph();
        this.caseYearsData();
      }
    }
  }
};
</script>
