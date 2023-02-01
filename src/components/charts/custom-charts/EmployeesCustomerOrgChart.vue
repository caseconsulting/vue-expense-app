<template>
  <v-card v-if="dataRecieved" class="pa-5">
    <bar-chart ref="barChart" chartId="employees-cust-org-chart" :options="options" :chartData="chartData"></bar-chart>
  </v-card>
</template>
<script>
import BarChart from '../base-charts/BarChart.vue';
import _ from 'lodash';
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
    await this.fetchData();
    await this.fillData();
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
 * Gets customer org data count from employees list.
 */
function fetchData() {
  let employees = this.$store.getters.employees;
  let employeesCustOrg = {};
  employees.forEach((e) => {
    if (e.customerOrgExp && e.workStatus != 0) {
      _.forEach(e.customerOrgExp, (org) => {
        let orgName = org.name;
        if (employeesCustOrg[orgName]) {
          employeesCustOrg[orgName] += 1;
        } else {
          employeesCustOrg[orgName] = 1;
        }
      });
    }
  });

  let sortedEmployeeCustOrg = Object.entries(employeesCustOrg);
  sortedEmployeeCustOrg = sortedEmployeeCustOrg.sort((a, b) => {
    return b[1] - a[1];
  });

  for (let i = 0; i < sortedEmployeeCustOrg.length; i++) {
    if (sortedEmployeeCustOrg.length > 1) {
      this.labels.push(sortedEmployeeCustOrg[i][0]);
      this.values.push(sortedEmployeeCustOrg[i][1]);
    }
  }
} // fetchData

/**
 * Formats and sets data options for the chart.
 */
function fillData() {
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
    backgroundColors[i] = colors[i % 4];
    borderColors[i] = colors[i % 4];
  }

  this.chartData = {
    labels: this.labels,
    datasets: [
      {
        data: this.values,
        backgroundColor: backgroundColors
      }
    ]
  };
  this.options = {
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Customer Orgs',
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
        text: 'Number of Employees for Each Customer Org',
        font: {
          size: 15
        }
      }
    },
    maintainAspectRatio: false
  };
  this.dataRecieved = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy,
  mounted,
  components: { BarChart },
  data() {
    return {
      options: null,
      chartData: null,
      dataRecieved: false,
      labels: [],
      values: []
    };
  },
  computed: {
    storeIsPopulated
  },
  methods: {
    fillData,
    fetchData
  }
};
</script>
