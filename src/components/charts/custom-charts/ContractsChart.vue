<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart ref="barChart" chartId="contracts-chart" :options="option" :chartData="chartData"></bar-chart>
  </v-card>
</template>

<script setup>
import BarChart from '../base-charts/BarChart.vue';
import _first from 'lodash/first';
import { onMounted, ref, watch, defineProps } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['colors']);
const chartData = ref(null);
const dataReceived = ref(false);
const employees = ref(null);
const label = ref([]);
const option = ref(null);
const contracts = ref({});
const store = useStore();
const router = useRouter();
const values = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
onMounted(async () => {
  if (store.getters.storeIsPopulated) {
    await fetchData();
    await fillData();
  }
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

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
            let con = store.getters.contracts.find((c) => c.id === contract.contractId);
            currContract.name = con.contractName;
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
 * Extracts and tallies up each employees contracts.
 */
function fetchData() {
  employees.value = store.getters.employees;
  // Put into dictionary where key is contract and value is quantity
  employees.value.forEach((employee) => {
    if (employee.workStatus != 0) {
      let currContracts = getCurrentProjects(employee);
      for (let contract of currContracts) {
        if (!contracts.value[contract.name]) contracts.value[contract.name] = 0;
        contracts.value[contract.name]++;
      }
    }
  });

  // We now sort the entries
  let contractPairs = Object.entries(contracts.value);
  contractPairs = contractPairs.sort((a, b) => {
    return b[1] - a[1];
  });

  for (let i = 0; i < contractPairs.length; i++) {
    label.value.push(contractPairs[i][0]);
    values.value.push(contractPairs[i][1]);
  }
} // fetchData

/**
 * Sets the chart formatting and options data.
 */
function fillData() {
  // Set the chart data
  chartData.value = {
    labels: label.value,
    datasets: [
      {
        label: null,
        data: values.value,
        backgroundColor: props.colors
      }
    ]
  };
  option.value = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Contract',
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
      if (_first(y)) {
        let index = _first(y).index;
        localStorage.setItem('requestedDataType', 'contracts');
        localStorage.setItem(
          'requestedFilter',
          JSON.stringify({ type: 'contract', search: chartData.value.labels[index] })
        );
        router.push({
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
        text: 'Top ' + values.value.length + ' Contracts',
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
  dataReceived.value = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => store.getters.storeIsPopulated,
  () => {
    fetchData();
    fillData();
  }
);
</script>
