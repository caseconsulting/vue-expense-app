<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart :options="options" :chartData="chartData" />
  </v-card>
</template>

<script>
import BarChart from '../baseCharts/BarChart.vue';
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
function created() {
  // eslint-disable-next-line no-undef
  this.jobExperienceData();
  this.drawJobExpHistGraph();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Finds the last index that has an element greater than 0 to prevent too many labels showing up on the chart.
 *
 * @return Number - The index greater than 0
 */
function findMaxIndex() {
  let max = 0;
  this.jobExperience.forEach((element, index) => {
    if (element !== undefined || element !== null) {
      if (element > 0) max = index;
    }
  });
  return max;
} // findMaxIndex

/**
 * Extracts each employees job experience and determines how many years they have worked, including time at Case.
 * Each employees experience will be put in an array slot that is based on an increment of experience of 5 years.
 */
function jobExperienceData() {
  this.employees3.forEach((employee) => {
    // only include active employees
    if (employee.hireDate !== undefined && employee.workStatus != 0) {
      // find time at case
      var amOfYears = this.calculateTimeDifference(employee.hireDate, undefined);
      if (employee.companies !== undefined) {
        //we do a for each on the jobs array
        //calculate the difference in the startDate and the endDate (today's date if endDate is undefined)
        employee.companies.forEach((company) => {
          if (company.positions !== undefined) {
            company.positions.forEach((position) => {
              amOfYears += this.calculateTimeDifference(position.startDate, position.endDate);
            });
          }
        });
      }
      // push time to array
      if (amOfYears > 45) amOfYears = 45;
      // max years for data control
      else if (amOfYears < 0) amOfYears = 0; // min years for data control
      let index = Math.floor(Math.round(amOfYears) / 5);
      if (this.jobExperience[index] !== undefined) {
        this.jobExperience[index] += 1; // bumps counter
      } else {
        this.jobExperience[index] = 1; // creates array slot
      }
    }
  });
} //jobExperienceData

/**
 * Gets the time difference in years between the job start and end date.
 *
 * @param startDate - the start of the difference
 * @param endDate - the end of the difference
 * @return Number - The amount of years difference
 */
function calculateTimeDifference(startDate, endDate) {
  var start = this.stringToDate(startDate);
  var end = endDate;
  //Checks if endDate is valid or not
  if (end === undefined || end === null) {
    end = moment(); //Provides today's date
  } else {
    end = this.stringToDate(endDate);
  }
  return end.diff(start, 'years', true); //Provides decimal value
} //calculateTimeDifference

/**
 * Format and set data options for job experience chart.
 */
function drawJobExpHistGraph() {
  let experienceNum = this.jobExperience;
  let chartLabels = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45+'];
  let maxIndex = this.findMaxIndex();
  let data = {
    labels: chartLabels.splice(0, maxIndex + 1),
    datasets: [
      {
        backgroundColor: '#2195f3',
        data: experienceNum
      }
    ]
  };

  let options = {
    title: {
      display: true,
      text: 'Number of Years of Job Experience for Employees',
      fontSize: 15
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'Number of Employees',
            fontStyle: 'bold'
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
            labelString: 'Years of Job Experience',
            fontStyle: 'bold'
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
} // drawJobExpHistGraph

/**
 * Creates a moment object out of a String that is a date.
 *
 * @param dateAsString - The date
 * @return Object - The Moment date object
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
  data() {
    return {
      options: null,
      chartData: null,
      dataReceived: false,
      employees: null,
      jobExperience: []
    };
  },
  methods: {
    drawJobExpHistGraph,
    findMaxIndex,
    jobExperienceData,
    calculateTimeDifference,
    stringToDate
  },
  created,
  props: ['employees3'] // stats page (employees) --> tab (employees2) --> chart (employees3)
};
</script>
