<template>
  <v-container>
    <h1>Employee Statistics Dashboard</h1>
    <job-experience-histogram :options="optionSet" :chart-data="dataSet"></job-experience-histogram>
    <div id="google-job-exp-hist-chart"></div>

    <div>
      <v-container flex>
        <v-row>
          <v-col>
            <div class="techChart">
              <tech-bar-chart
                v-if="techChartDataReceived"
                :chart-data="techChartData"
                :options="techChartOptions"
              ></tech-bar-chart>
            </div>
          </v-col>
          <v-col>
            <div id="chart_div"></div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>

<script>
import TechBarChart from '../components/TechBarChart.vue';
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
  var dataArray = [['Year']];
  for (var i = 0; i < this.jobExperienceHist.length; i++) {
    dataArray.push([this.jobExperienceHist[i]]);
  }
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

async function fillData() {
  //Get data
  //Put into dictionary where key is kinda tech and value is quantity
  let employees = await api.getItems(api.EMPLOYEES);

  let technologies = {};

  employees.forEach((employee) => {
    if (employee.technologies) {
      employee.technologies.forEach((currTech) => {
        if (!technologies[currTech.name]) {
          technologies[currTech.name] = 1;
        } else {
          technologies[currTech.name] += 1;
        }
      });
    }
  });

  //We now sort the entries
  let technologyPairs = Object.entries(technologies);
  technologyPairs = technologyPairs.sort((a, b) => {
    return b[1] - a[1];
  });

  technologyPairs = technologyPairs.slice(0, 5);

  let labels = [];
  let values = [];

  for (let i = 0; i < technologyPairs.length; i++) {
    labels.push(technologyPairs[i][0]);
    values.push(technologyPairs[i][1]);
  }

  //We cycle through these colors to get the bar colors
  let colors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)'
  ];

  let backgroundColors = [];
  let borderColors = [];

  //Set the background and border colors
  for (let i = 0; i < labels.length; i++) {
    backgroundColors[i] = colors[i];
    borderColors[i] = colors[i];
  }

  //Set the chart data
  this.techChartData = {
    labels: labels,
    datasets: [
      {
        label: null,
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }
    ]
  };
  this.techChartOptions = {
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }
      ]
    },
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Types of Technologies used by Employees'
    }
  };

  this.techChartDataReceived = true;
}

async function googleChart() {
  let employees = await api.getItems(api.EMPLOYEES);
  let technologies = {};

  employees.forEach((employee) => {
    if (employee.technologies) {
      employee.technologies.forEach((currTech) => {
        if (!technologies[currTech.name]) {
          technologies[currTech.name] = 1;
        } else {
          technologies[currTech.name] += 1;
        }
      });
    }
  });

  //We now sort the entries
  let technologyPairs = Object.entries(technologies);
  technologyPairs = technologyPairs.sort((a, b) => {
    return b[1] - a[1];
  });

  technologyPairs = technologyPairs.slice(0, 5);

  let colors = [
    'color: pink; stroke-color: red; stroke-width: 1',
    'color: #b6ecfc; stroke-color: #59bbf0; stroke-width: 1',
    'color: #f6fab1; stroke-color: #c5c969; stroke-width: 1',
    'color: #cdf2b6; stroke-color: #649447; stroke-width: 1',
    'color: #d5b6f2; stroke-color: #a759f0; stroke-width: 1'
  ];

  for (let i = 0; i < technologyPairs.length; i++) {
    technologyPairs[i].push(colors[i]);
  }

  technologyPairs.unshift(['Technology', 'Quantity', { role: 'style' }]);

  /* eslint-disable-next-line no-undef */
  let data = google.visualization.arrayToDataTable(technologyPairs);

  //Set the chart data
  let options = {
    title: 'Types of technogolies employees use',
    width: 750,
    height: 500,
    backgroundColor: 'transparent',
    legend: 'none'
  };

  /* eslint-disable-next-line no-undef */
  var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
  chart.draw(data, options);

  this.techChartDataReceived = true;
}

export default {
  components: {
    TechBarChart,
    JobExperienceHistogram
  },
  data() {
    return {
      techChartData: null,
      techChartOptions: null,
      techChartDataReceived: false,
      techGoogleChartData: null,
      techGoogleChartOption: null,
      dataSet: [],
      optionSet: [],
      employees: [],
      jobExperience: [],
      jobExperienceHist: []
    };
  },
  methods: {
    fillData,
    googleChart,
    calculateTimeDifference,
    drawJobExpHistGraph,
    googleJobExpHistGraph,
    jobExperienceData,
    stringToDate
  },
  mounted() {
    this.fillData();
  },
  created: async function () {
    // eslint-disable-next-line no-undef
    google.charts.load('current', { packages: ['corechart'] });
    this.employees = await api.getItems(api.EMPLOYEES);
    await this.jobExperienceData();
    this.drawJobExpHistGraph();
    // eslint-disable-next-line no-undef
    google.charts.setOnLoadCallback(this.googleJobExpHistGraph);
    // eslint-disable-next-line no-undef
    google.charts.setOnLoadCallback(this.googleChart);
  }
};
</script>

<style scoped>
#google-job-exp-hist-chart {
  width: 900px;
  height: 500px;
}

.techChart {
  height: 35%;
  width: 50%;
}
</style>
