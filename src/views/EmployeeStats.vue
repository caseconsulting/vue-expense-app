<template>
  <v-container>
    <h1>Employee Statistics Dashboard</h1>
    <job-experience-histogram :options="optionSet" :chart-data="dataSet"></job-experience-histogram>
    <div id="google-job-exp-hist-chart"></div>
  </v-container>
</template>
<script>
import api from '@/shared/api.js';
import JobExperienceHistogram from '@/components/JobExperienceHistogram.vue';
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');

async function jobExperienceData() {
  //init the jobExperience array
  const MAXIMUM_INDEX = 10;
  for (let i = 0; i < MAXIMUM_INDEX; i++) {
    this.jobExperience.push(0);
  }
  console.log(this.employees);
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

async function created() {
  // eslint-disable-next-line no-undef
  google.charts.load('current', { packages: ['corechart'] });
  this.employees = await api.getItems(api.EMPLOYEES);
  await this.jobExperienceData();
  this.drawJobExpHistGraph();
  // eslint-disable-next-line no-undef
  google.charts.setOnLoadCallback(this.googleJobExpHistGraph);
} //created

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
          }
        }
      ],
      xAxes: [
        {
          ticks: {
            autoSkip: false
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
  this.dataSet = data;
  this.optionSet = options;
} // drawJobExpHistGraph

function googleJobExpHistGraph() {
  console.log(this.jobExperience);
  var dataArray = [['Year']];
  for (var i = 0; i < this.jobExperienceHist.length; i++) {
    dataArray.push([this.jobExperienceHist[i]]);
  }
  console.log(dataArray);
  // eslint-disable-next-line no-undef
  var data = google.visualization.arrayToDataTable(dataArray);
  var options = {
    title: 'Number of Years of Job Experience for Employees',
    legend: { position: 'none' },
    histogram: {
      bucketSize: 5,
      hideBucketItems: true
      //lastBucketPercentile: 5
    },
    hAxis: {
      title: 'Years of Experience'
    },
    vAxis: {
      title: 'Quantity of Employees'
    }
  };

  // eslint-disable-next-line no-undef
  var chart = new google.visualization.Histogram(document.getElementById('google-job-exp-hist-chart'));
  chart.draw(data, options);
}

function stringToDate(dateAsString) {
  var date = moment(dateAsString);
  return date;
} //stringToDate

export default {
  components: {
    JobExperienceHistogram
  },
  created,
  data() {
    return {
      dataSet: [],
      optionSet: [],
      employees: [],
      jobExperience: [],
      jobExperienceHist: []
    };
  },
  methods: {
    calculateTimeDifference,
    drawJobExpHistGraph,
    googleJobExpHistGraph,
    jobExperienceData,
    stringToDate
  }
};
</script>

<style>
#google-job-exp-hist-chart {
  width: 900px;
  height: 500px;
}
</style>
