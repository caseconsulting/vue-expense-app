<template>
  <div class="chart">
    <bar-chart v-if="dataReceived" :options="options" :chartData="chartData" />
  </div>
</template>

<script>
import BarChart from '../baseCharts/BarChart.vue';
import moment from 'moment-timezone';
import api from '@/shared/api.js';
moment.tz.setDefault('America/New_York');

function jobExperienceData() {
  //init the jobExperience array
  const MAXIMUM_INDEX = 10;
  for (let i = 0; i < MAXIMUM_INDEX; i++) {
    this.jobExperience.push(0);
  }
  this.employees.forEach((employee) => {
    if (employee.hireDate !== undefined) {
      // find time at case
      var amOfYears = calculateTimeDifference(employee.hireDate, undefined);
      if (employee.jobs !== undefined) {
        //we do a for each on the jobs array
        //calculate the difference in the startDate and the endDate (today's date if endDate is undefined)
        employee.jobs.forEach((job) => {
          amOfYears += calculateTimeDifference(job.startDate, job.endDate);
        });
      }
      // push time to array
      if (amOfYears > 45) amOfYears = 45;
      else if (amOfYears < 0) amOfYears = 0;
      this.jobExperienceHist.push(Math.round(amOfYears));
      this.jobExperience[Math.round(Math.round(amOfYears) / 5)] += 1;
    }
  });
} //jobExperienceData

function calculateTimeDifference(startDate, endDate) {
  var start = stringToDate(startDate);
  var end = endDate;
  //Checks if endDate is valid or not
  if (end === undefined) {
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
  let data = {
    labels: ['0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40', '40-45', '45+'],
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
      jobExperience: [],
      jobExperienceHist: []
    };
  },
  methods: {
    drawJobExpHistGraph,
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
