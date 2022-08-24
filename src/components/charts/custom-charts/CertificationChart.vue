<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart ref="barChart" chartId="certifications-chart" :options="options" :chartData="chartData"></bar-chart>
  </v-card>
</template>

<script>
import BarChart from '../base-charts/BarChart.vue';
import moment from 'moment-timezone';
import { storeIsPopulated } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
async function mounted() {
  if (this.storeIsPopulated) {
    await this.fetchCertData();
    await this.fillCertData();
  }
} // mounted

/**
 * Calls the destroy chart function in the base chart.
 */
function beforeDestroy() {
  this.$refs.barChart.destroyChart();
} // beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Extract each employees certifications and tally up each one.
 */
async function fetchCertData() {
  // Put into dictionary where key is kinda tech and value is quantity
  let certifications = {};
  this.employees = this.$store.getters.employees;
  // tally up each certification
  this.employees.forEach((employee) => {
    if (employee.certifications && employee.workStatus != 0) {
      employee.certifications.forEach((currCert) => {
        if (!currCert.expirationDate || moment().isBefore(moment(currCert.expirationDate))) {
          if (!certifications[currCert.name]) {
            certifications[currCert.name] = 1;
          } else {
            certifications[currCert.name] += 1;
          }
        }
      });
    }
  });

  // We now sort the entries
  let certificationPairs = Object.entries(certifications);
  certificationPairs = certificationPairs.sort((a, b) => {
    return b[1] - a[1];
  });
  // take the top 5 obtained certifications
  certificationPairs = certificationPairs.slice(0, 5);

  // if a certification text becomes too long for the chart, break the cert up into two lines
  // could be problematic for really long certifications
  for (let i = 0; i < certificationPairs.length; i++) {
    if (certificationPairs[i][0].length > 30) {
      this.labels.push(this.breakSentence(certificationPairs[i][0]));
    } else {
      this.labels.push(certificationPairs[i][0]);
    }
    this.values.push(certificationPairs[i][1]);
  }
} // fetchCertData

/**
 * Extract each employees certifications and tally up each one.
 * Also formats and sets data options for the chart.
 */
function fillCertData() {
  // We cycle through these colors to get the bar colors
  let colors = [
    'rgba(254, 147, 140, 1)',
    'rgba(230, 184, 156, 1)',
    'rgba(234, 210, 172, 1)',
    'rgba(156, 175, 183, 1)',
    'rgba(66, 129, 164, 1)'
  ];

  let backgroundColors = [];
  let borderColors = [];

  // Set the background and border colors
  for (let i = 0; i < this.labels.length; i++) {
    backgroundColors[i] = colors[i];
    borderColors[i] = colors[i];
  }
  // Set the chart data
  this.chartData = {
    labels: this.labels,
    datasets: [
      {
        label: null,
        data: this.values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }
    ]
  };
  this.options = {
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Name of Certification',
          font: {
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Number of Employees',
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
        text: 'Top ' + this.values.length + ' Certifications Used by Employees',
        font: {
          size: 15
        }
      },
      tooltip: {
        callbacks: {
          title: (tooltipItem) => {
            if (Array.isArray(this.labels[tooltipItem[0].dataIndex])) {
              let label = '';
              this.labels[tooltipItem[0].dataIndex].forEach((item) => (label += item + ' '));
              return label.trim();
            } else {
              return tooltipItem[0].label;
            }
          }
        }
      }
    },
    maintainAspectRatio: false
  };
  this.dataReceived = true;
} // fillCertData

/**
 * Helper function to split the text into two sections.
 *
 * @param s - The text of the certification
 * @return Array - An array of 2 with the split text
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
} // breakSentence

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { BarChart },
  beforeDestroy,
  mounted,
  computed: {
    storeIsPopulated
  },
  data() {
    return {
      options: null,
      chartData: null,
      dataReceived: false,
      values: [],
      labels: []
    };
  },
  methods: {
    fetchCertData,
    fillCertData,
    breakSentence
  },
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) {
        this.fetchCertData();
        this.fillCertData();
      }
    }
  }
};
</script>
