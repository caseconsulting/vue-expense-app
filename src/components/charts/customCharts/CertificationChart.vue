<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart :options="options" :chartData="chartData"></bar-chart>
  </v-card>
  <v-skeleton-loader v-else type="paragraph@5"></v-skeleton-loader>
</template>

<script>
import api from '@/shared/api.js';
import BarChart from '../baseCharts/BarChart.vue';
import moment from 'moment-timezone';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
async function mounted() {
  this.$forceUpdate();
  await this.fillCertData();
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Extract each employees certifications and tally up each one. Also formats and sets data options for the chart.
 */
async function fillCertData() {
  let employees = await api.getItems(api.EMPLOYEES);
  //Get data
  //Put into dictionary where key is kinda tech and value is quantity
  let certifications = {};
  // tally up each certification
  employees.forEach((employee) => {
    if (employee.certifications && employee.workStatus != 0) {
      employee.certifications.forEach((currCert) => {
        if (moment().isBefore(moment(currCert.expirationDate))) {
          if (!certifications[currCert.name]) {
            certifications[currCert.name] = 1;
          } else {
            certifications[currCert.name] += 1;
          }
        }
      });
    }
  });

  //We now sort the entries
  let certificationPairs = Object.entries(certifications);
  certificationPairs = certificationPairs.sort((a, b) => {
    return b[1] - a[1];
  });
  // take the top 5 obtained certifications
  certificationPairs = certificationPairs.slice(0, 5);

  let labels = [];
  let values = [];
  // if a certification text becomes too long for the chart, break the cert up into two lines
  // could be problematic for really long certifications
  for (let i = 0; i < certificationPairs.length; i++) {
    if (certificationPairs[i][0].length > 30) {
      labels.push(this.breakSentence(certificationPairs[i][0]));
    } else {
      labels.push(certificationPairs[i][0]);
    }
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
  this.chartData = {
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
  this.options = {
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'Name of Certification',
            fontStyle: 'bold'
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            stepSize: 1
          },
          scaleLabel: {
            display: true,
            labelString: 'Number of Employees',
            fontStyle: 'bold'
          }
        }
      ]
    },
    tooltips: {
      callbacks: {
        title: (tooltipItem) => {
          if (Array.isArray(tooltipItem[0].xLabel)) {
            let label = '';
            tooltipItem[0].xLabel.forEach((item) => (label += item + ' '));
            return label.trim();
          } else {
            return tooltipItem[0].label;
          }
        }
      }
    },
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Top ' + values.length + ' Certifications Used by Employees',
      fontSize: 15
    },
    maintainAspectRatio: false
  };
  this.dataReceived = true;
} //fillCertData

/**
 * Helper function to split the text into two sections.
 * @param s - The text of the certification
 * @returns Array - An array of 2 with the split text
 */
function breakSentence(s) {
  var middle = Math.floor(s.length / 2);
  var before = s.lastIndexOf(' ', middle);
  var after = s.indexOf(' ', middle + 1);

  if (middle - before < after - middle) {
    middle = before;
  } else {
    middle = after;
  }
  var returnArr = [s.substr(0, middle), s.substr(middle + 1)];
  return returnArr;
} //breakSentence

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
      dataReceived: false
    };
  },
  methods: {
    fillCertData,
    breakSentence
  },
  mounted
};
</script>
