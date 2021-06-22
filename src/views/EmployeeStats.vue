<template>
  <v-container>
    <h1>Employee Statistics Dashboard</h1>
    <job-experience-histogram :options="optionSet" :chart-data="dataSet"></job-experience-histogram>

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
            <tech-bar-chart
              v-if="certChartDataReceived"
              :chart-data="certChartData"
              :options="certChartOptions"
            ></tech-bar-chart>
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
  this.dataSet = data;
  this.optionSet = options;
} // drawJobExpHistGraph

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
          },
          scaleLabel: {
            display: true,
            labelString: 'Number of Employees'
          }
        }
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Name of Technology'
          }
        }
      ]
    },
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Top 5 Technologies Used By Employees'
    }
  };
  this.techChartDataReceived = true;
} //fillData

async function fillCertData() {
  //Get data
  //Put into dictionary where key is kinda tech and value is quantity
  let employees = await api.getItems(api.EMPLOYEES);
  let certifications = {};

  employees.forEach((employee) => {
    if (employee.certifications) {
      employee.certifications.forEach((currCert) => {
        if (!certifications[currCert.name]) {
          certifications[currCert.name] = 1;
        } else {
          certifications[currCert.name] += 1;
        }
      });
    }
  });

  //We now sort the entries
  let certificationPairs = Object.entries(certifications);
  certificationPairs = certificationPairs.sort((a, b) => {
    return b[1] - a[1];
  });

  certificationPairs = certificationPairs.slice(0, 5);

  let labels = [];
  let values = [];

  for (let i = 0; i < certificationPairs.length; i++) {
    labels.push(certificationPairs[i][0]);
    values.push(certificationPairs[i][1]);
  }

  //We cycle through these colors to get the bar colors
  let colors = [
    'rgba(254, 147, 140, 1)',
    'rgba(230, 184, 156, 1)',
    'rgba(234, 210, 172, 1)',
    'rgba(156, 175, 183, 1)',
    'rgba(66, 129, 164, 1)'
  ];

  let backgroundColors = [];
  let borderColors = [];

  //Set the background and border colors
  for (let i = 0; i < labels.length; i++) {
    backgroundColors[i] = colors[i];
    borderColors[i] = colors[i];
  }

  //Set the chart data
  this.certChartData = {
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
  this.certChartOptions = {
    scales: {
      xAxes: [
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
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Name of Certification'
          }
        }
      ]
    },
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Top 5 Certifications Used By Employees'
    }
  };
  this.certChartDataReceived = true;
}

function stringToDate(dateAsString) {
  var date = moment(dateAsString);
  return date;
} //stringToDate

export default {
  components: {
    TechBarChart,
    JobExperienceHistogram
  },
  data() {
    return {
      certChartData: null,
      certChartOptions: null,
      certChartDataReceived: false,
      techChartData: null,
      techChartOptions: null,
      techChartDataReceived: false,
      dataSet: [],
      optionSet: [],
      employees: [],
      jobExperience: [],
      jobExperienceHist: []
    };
  },
  methods: {
    fillData,
    calculateTimeDifference,
    fillCertData,
    drawJobExpHistGraph,
    jobExperienceData,
    stringToDate
  },
  mounted() {
    this.fillData();
    this.fillCertData();
  },
  created: async function () {
    // eslint-disable-next-line no-undef
    this.employees = await api.getItems(api.EMPLOYEES);
    await this.jobExperienceData();
    this.drawJobExpHistGraph();
  }
};
</script>

<style scoped>
.techChart {
  height: 35%;
  width: 100%;
}
</style>
