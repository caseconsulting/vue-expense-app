<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart :options="options" :chartData="chartData"></bar-chart>
  </v-card>
  <v-skeleton-loader v-else type="paragraph@5"></v-skeleton-loader>
</template>

<script>
import api from '@/shared/api.js';
import BarChart from '../baseCharts/BarChart.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
async function mounted() {
  await this.fillPrimeData();
  this.$forceUpdate();
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all of the current projects the user has
 *
 * @param employee - the employee that we are getting the current projects for
 * @return array - the current contracts
 */
function getCurrentProjects(employee) {
  let contracts = [];
  if (employee.contracts) {
    employee.contracts.forEach((contract) => {
      let currContract = {};
      currContract.projects = [];
      if (contract.projects) {
        contract.projects.forEach((project) => {
          if (currContract.projects.length === 0) {
            currContract.name = contract.name;
            currContract.prime = contract.prime;
          }
          if (!project.endDate) {
            currContract.projects.push(project);
          }
        });
      }
      if (currContract.projects.length > 0) {
        contracts.push(currContract);
      }
    });
  }

  return contracts;
} // getCurrentProjects

/**
 * Extracts and tallies up each employees primes, and sets the chart formatting and options data.
 */
async function fillPrimeData() {
  let employees = await api.getItems(api.EMPLOYEES);
  //Get data
  //Put into dictionary where key is prime and value is quantity
  let primes = {};
  employees.forEach((employee) => {
    if (employee.workStatus != 0) {
      let currContracts = this.getCurrentProjects(employee);
      let currPrimes = {};
      currContracts.forEach((contract) => {
        let currPrime = contract.prime;
        //This if statement is to consider if different current contracts have the same prime
        if (!currPrimes[currPrime]) {
          if (!primes[currPrime]) {
            primes[currPrime] = 1;
          } else {
            primes[currPrime] += 1;
          }
        }
      });
    }
  });

  //We now sort the entries
  let primePairs = Object.entries(primes);
  primePairs = primePairs.sort((a, b) => {
    return b[1] - a[1];
  });

  primePairs = primePairs.slice(0, 5);

  let labels = [];
  let values = [];

  for (let i = 0; i < primePairs.length; i++) {
    labels.push(primePairs[i][0]);
    values.push(primePairs[i][1]);
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
          scaleLabel: {
            display: true,
            labelString: 'Prime',
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
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Top ' + values.length + ' Primes That We Currently Subcontract',
      fontSize: 15
    },
    maintainAspectRatio: false
  };
  this.dataReceived = true;
} // fillCertData

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { BarChart },
  mounted,
  data() {
    return {
      options: null,
      chartData: null,
      dataReceived: false
    };
  },
  methods: {
    getCurrentProjects,
    fillPrimeData
  }
};
</script>
