<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart
      ref="barChart"
      chartId="employees-directorate-chart"
      :options="option"
      :chartData="chartData"
    ></bar-chart>
  </v-card>
</template>

<script setup>
import BarChart from '../base-charts/BarChart.vue';
import _forEach from 'lodash/forEach';
import _first from 'lodash/first';
import api from '@/shared/api';
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { getProjectCurrentEmployees } from '@/shared/contractUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const directorates = ref({});
const chartData = ref(null);
const dataReceived = ref(false);
const option = ref(null);
const router = useRouter();
const store = useStore();
const colors = [
  // each array is a gradient of a color from darker to lighter
  ['#5E35B1', '#9575CD', '#D1C4E9', '#EDE7F6'],
  ['#3949AB', '#7986CB', '#C5CAE9', '#E8EAF6'],
  ['#1E88E5', '#64B5F6', '#BBDEFB', '#E3F2FD'],
  ['#43A047', '#81C784', '#C8E6C9', '#E8F5E9'],
  ['#FB8C00', '#FFB74D', '#FFE0B2', '#FFF3E0'],
  ['#E53935', '#E57373', '#FFCDD2', '#FFEBEE'],
  ['#6D4C41', '#A1887F', '#D7CCC8', '#EFEBE9'],
  ['#546E7A', '#90A4AE', '#CFD8DC', '#ECEFF1']
];

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
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
 * Gets directorate data count from employees list.
 */
function fetchData() {
  let contracts = store.getters.contracts;
  _forEach(contracts, (c) => {
    _forEach(c.projects, (p) => {
      if (p.status === api.CONTRACT_STATUSES.ACTIVE) addDirectorate(c, p);
    });
  });
} // fetchData

/**
 * Formats and sets data options for the chart.
 */
function fillData() {
  chartData.value = getChartData();
  option.value = {
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Directorates',
          font: {
            weight: 'bold'
          }
        },
        stacked: true
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
        },
        stacked: true
      }
    },
    onClick: (x, y) => {
      if (_first(y)) {
        let directorateIndex = _first(y).index;
        let orgIndex = _first(y).datasetIndex;
        let directorate = chartData.value.labels[directorateIndex];
        let org = chartData.value.datasets[orgIndex].label;
        if (directorate === org) org = null;
        localStorage.setItem('requestedDataType', 'contracts');
        localStorage.setItem(
          'requestedFilter',
          JSON.stringify({ type: 'search', search: getChartList(directorate, org) })
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
        text: 'Number of Employees for Each Directorate',
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

/**
 * Gets the labels and data sets for the stacked bar chart.
 */
function getChartData() {
  let datasets = [];
  let dirBreakdowns = {};
  let labels = getSortedLabels();
  // set all directorate breakdowns in a non-nested object
  _forEach(labels, (label) => {
    dirBreakdowns = { ...dirBreakdowns, ...directorates.value[label] };
  });
  let i = 0;
  let j = 0;
  _forEach(labels, (label) => {
    // sort each directorate by total employees attached to a directorate breakdown
    let sortedDirBreakdowns = Object.keys(directorates.value[label]).sort(
      (a, b) => directorates.value[label][b] - directorates.value[label][a]
    );
    _forEach(sortedDirBreakdowns, (key) => {
      // create a dataset for each directorate breakdown
      datasets.push({
        label: key,
        data: getDataValues(labels, key),
        backgroundColor: colors[i % colors.length][j % colors[i % colors.length].length]
      });
      j++;
    });
    j = 0;
    i++;
  });
  return {
    labels,
    datasets
  };
} // getChartData

/**
 * Gets the sorted directorates by total employees connected to the directorate.
 *
 * @returns {Array} - The sorted direactorate labels by total employees
 */
function getSortedLabels() {
  let sortedLabelMap = {};
  _forEach(directorates.value, (dirBreakdowns, directorate) => {
    let total = 0;
    _forEach(dirBreakdowns, (count) => {
      total += count;
    });
    sortedLabelMap[directorate] = total;
  });
  return Object.keys(sortedLabelMap).sort((a, b) => sortedLabelMap[b] - sortedLabelMap[a]);
} // getSortedLabels

/**
 * Gets an array of total employees for each directorate with the directorate breakdown.
 *
 * @param {Array} labels - The directorates
 * @param {String} dirBreakdown - The lowest level directorate breakdown
 * @returns {Array} - The total number of employees for each directorate breakdown
 */
function getDataValues(labels, dirBreakdown) {
  let data = [];
  _forEach(labels, (label) => {
    data.push(directorates.value[label]?.[dirBreakdown] || 0);
  });
  return data;
} // getDataValues

/**
 * Add the directorate breakdown from a directorate. The directorate will breakdown to the lowest level directorate that.
 * The number of total employees will be the value of the directorate breakdown.
 *
 * @param {Object} c - The contract
 * @param {Object} p - The project
 */
function addDirectorate(c, p) {
  // get number of employees on project
  let count = getProjectCurrentEmployees(c, p, store.getters.employees)?.length || 0;

  // default directorate and next level of org to contract if project doesn't have one
  let directorate = p.directorate ?? c.directorate;
  let nextOrg = getOrgBreakdown(p) ?? getOrgBreakdown(c);

  // if we have all three pieces of info, add it to the chart
  if (directorate && nextOrg && count) {
    if (!directorates.value[directorate]) directorates.value[directorate] = {};
    if (!directorates.value[directorate][nextOrg]) directorates.value[directorate][nextOrg] = 0;
    directorates.value[directorate][nextOrg] += count;
  }
} // addCustomerOrg

/**
 * Gets the lowest level directorate that exists in the contract or project.
 *
 * @param {Object} item - The contract or project
 */
function getOrgBreakdown(item) {
  return item.org3 || item.org2 || item.directorate;
} // getOrgBreakdown

/**
 * Gets the employees under the directorate and org
 *
 * @param string directorate - The directorate
 * @param string org - The org
 */
function getChartList(directorate, org) {
  let contracts = store.getters.contracts;
  let employees = store.getters.employees;
  let chartList = [];
  _forEach(contracts, (c) => {
    _forEach(c.projects, (p) => {
      let nextOrg = getOrgBreakdown(p) ?? getOrgBreakdown(c);
      if ((org == null || nextOrg === org) && p.directorate === directorate) {
        _forEach(getProjectCurrentEmployees(c, p, employees), (e) => {
          chartList.push(e.fullName ?? `${e.firstName} ${e.lastName}`);
        });
      }
    });
  });
  return chartList;
}
</script>
