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

function findMaxIndex() {
  let max = 0;
  this.jobExperience.forEach((element, index) => {
    if (element !== undefined || element !== null) {
      if (element > 0) max = index;
    }
  });
  return max;
}

function jobExperienceData() {
  this.employees.forEach((employee) => {
    if (employee.hireDate !== undefined) {
      // find time at case
      var amOfYears = calculateTimeDifference(employee.hireDate, undefined);
      if (employee.companies !== undefined) {
        //we do a for each on the jobs array
        //calculate the difference in the startDate and the endDate (today's date if endDate is undefined)
        employee.companies.forEach((company) => {
          if (company.positions !== undefined) {
            company.positions.forEach((position) => {
              amOfYears += calculateTimeDifference(position.startDate, position.endDate);
            });
          }
        });
      }
      // push time to array
      if (amOfYears > 45) amOfYears = 45;
      else if (amOfYears < 0) amOfYears = 0; // min years for data control
      let index = Math.round(Math.round(amOfYears) / 5);
      if (this.jobExperience[index] !== undefined) {
        this.jobExperience[index] += 1; // bumps counter
      } else {
        this.jobExperience[index] = 1; // creates array slot
      }
    }
  });
} //jobExperienceData

function calculateTimeDifference(startDate, endDate) {
  var start = stringToDate(startDate);
  var end = endDate;
  //Checks if endDate is valid or not
  if (end === undefined || end === null) {
    end = moment(); //Provides today's date
  } else {
    end = stringToDate(endDate);
  }
  return end.diff(start, 'years', true); //Provides decimal value
} //calculateTimeDifference

/**
 * Format and set data options for job experience chart.
 *
 * @return Object - job experience chart data
 */
function drawJobExpHistGraph() {
  let experienceNum = this.jobExperience;
  let chartLabels = ['0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40', '40-45', '45+'];
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
      text: 'Number of Years of Job Experience for Employees'
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
            labelString: 'Years of Job Experience'
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

  mounted() {
    this.drawJobExpHistGraph();
  },
  created: async function () {
    // eslint-disable-next-line no-undef
    this.employees = await api.getItems(api.EMPLOYEES);
    this.jobExperienceData();
    this.drawJobExpHistGraph();
  }
};
</script>

<style></style>
