<template>
  <v-card v-if="dataReceived" class="pa-5">
    <div v-if="userRoleIsAdmin()" class="float-right">
      <DownloadCSV
        filename="certifications.csv"
        :generateData="generateCsvData"
        sortKey="Certification"
        tooltip="Download Active Certifications to CSV"
      ></DownloadCSV>
    </div>
    <bar-chart ref="barChart" chartId="certifications-chart" :options="options" :chartData="chartData"></bar-chart>
  </v-card>
</template>

<script>
import _ from 'lodash';
import BarChart from '../base-charts/BarChart.vue';
import DownloadCSV from '@/components/utils/DownloadCSV.vue';
import { storeIsPopulated, userRoleIsAdmin } from '@/utils/utils';
import { getTodaysDate, isBefore, isSameOrBefore } from '@/shared/dateUtils';

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
        if (!currCert.expirationDate || this.isBefore(this.getTodaysDate(), currCert.expirationDate)) {
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
    onClick: (x, y) => {
      if (_.first(y)) {
        let index = _.first(y).index;
        let label = Array.isArray(this.chartData.labels[index])
          ? this.chartData.labels[index].join(' ')
          : this.chartData.labels[index];
        localStorage.setItem('requestedDataType', 'certifications');
        localStorage.setItem('requestedFilter', label);
        this.$router.push({
          path: '/reports',
          name: 'reports'
        });
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
      subtitle: {
        display: true,
        text: '*Click on a bar to see employees',
        font: {
          style: 'italic'
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
 * Generates an object of data to be turned into a csv file.
 *
 * @returns Array - An array of objects
 */
function generateCsvData() {
  let csvData = [];
  let employees = this.$store.getters.employees;
  employees.forEach((e) => {
    if (e.certifications) {
      e.certifications.forEach((c) => {
        if ((c.expirationDate && isSameOrBefore(getTodaysDate(), c.expirationDate)) || !c.expirationDate) {
          csvData.push({ Certification: c.name, Employee: `${e.firstName} ${e.lastName}` });
        }
      });
    }
  });
  return csvData;
} // generateCsvData

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
  components: { BarChart, DownloadCSV },
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
    breakSentence,
    fetchCertData,
    fillCertData,
    generateCsvData,
    getTodaysDate, // dateUtils
    isBefore, // dateUtils
    userRoleIsAdmin
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

<style scoped>
.right {
  float: right;
}
</style>
