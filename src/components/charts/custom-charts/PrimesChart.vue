<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart ref="barChart" chartId="primes-chart" :options="options" :chartData="chartData"></bar-chart>
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
 * Calls the destroy chart function in the base chart.
 */
function beforeDestroy() {
  this.$refs.barChart.destroyChart();
} // beforeDestroy

/**
 * Gets all of the current projects the user has.
 *
 * @param employee - the employee that we are getting the current projects for
 * @return array - the current contracts
 */
function getCurrentProjects(employee) {
  let currentContracts = [];
  if (employee.contracts) {
    employee.contracts.forEach((contract) => {
      let currContract = {};
      currContract.projects = [];
      if (contract.projects) {
        contract.projects.forEach((project) => {
          if (currContract.projects.length === 0) {
            let con = this.$store.getters.contracts.find((c) => c.id === contract.contractId);
            currContract.name = con.contractName;
            currContract.prime = con.primeName;
          }
          if (!project.endDate) {
            currContract.projects.push(project);
          }
        });
      }
      if (currContract.projects.length > 0) {
        currentContracts.push(currContract);
      }
    });
  }

  return currentContracts;
} // getCurrentProjects

/**
 * Extracts and tallies up each employees primes.
 */
function fetchData() {
  this.employees = this.$store.getters.employees;
  //Put into dictionary where key is prime and value is quantity
  this.employees.forEach((employee) => {
    if (employee.workStatus != 0) {
      let currContracts = this.getCurrentProjects(employee);
      //let currPrimes = {};
      currContracts.forEach((contract) => {
        if (!this.primes[contract.prime]) {
          this.primes[contract.prime] = 1;
        } else {
          this.primes[contract.prime] += 1;
        }
      });
    }
  });

  // We now sort the entries
  let primePairs = Object.entries(this.primes);
  primePairs = primePairs.sort((a, b) => {
    return b[1] - a[1];
  });

  for (let i = 0; i < primePairs.length; i++) {
    this.labels.push(primePairs[i][0]);
    this.values.push(primePairs[i][1]);
  }
} // fetchData

/**
 * Sets the chart formatting and options data.
 */
function fillData() {
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
    backgroundColors[i] = colors[i % 4];
    borderColors[i] = colors[i % 4];
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
        title: {
          display: true,
          text: 'Prime',
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
        localStorage.setItem('requestedDataType', 'contracts');
        localStorage.setItem('requestedFilter', this.chartData.labels[index]);
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
        text: 'Top ' + this.values.length + ' Primes That We Currently Subcontract',
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
  this.dataReceived = true;
} // fillData

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
      primes: {},
      labels: [],
      values: []
    };
  },
  methods: {
    getCurrentProjects,
    fetchData,
    fillData
  },
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) {
        this.fetchData();
        this.fillData();
      }
    }
  }
};
</script>
