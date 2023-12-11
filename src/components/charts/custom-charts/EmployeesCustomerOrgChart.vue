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
        if (org.years && org.current) {
          let orgName = org.name;
          if (employeesCustOrg[orgName]) {
            employeesCustOrg[orgName] += 1;
          } else {
            employeesCustOrg[orgName] = 1;
          }
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
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(230, 184, 156, 1)',
    'rgba(234, 210, 172, 1)',
    'rgba(156, 175, 183, 1)',
    'rgba(66, 129, 164, 1)'
  ];

  let backgroundColors = [];
  let borderColors = [];

  // Set the background and border colors
  for (let i = 0; i < this.labels.length; i++) {
    backgroundColors[i] = colors[i % 9];
    borderColors[i] = colors[i % 9];
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
    onClick: (x, y) => {
      if (_.first(y)) {
        let index = _.first(y).index;
        let labelClicked = this.chartData.labels[index];
        localStorage.setItem('requestedDataType', 'customer orgs');
        localStorage.setItem('requestedFilter', labelClicked);
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
        text: 'Number of Employees for Each Customer Org',
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
