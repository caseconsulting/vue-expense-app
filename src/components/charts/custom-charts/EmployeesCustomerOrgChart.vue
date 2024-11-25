<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart ref="barChart" chartId="employees-cust-org-chart" :options="option" :chartData="chartData"></bar-chart>
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

const customerOrgs = ref({});
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
 * Gets customer org data count from employees list.
 */
function fetchData() {
  let contracts = store.getters.contracts;
  _forEach(contracts, (c) => {
    _forEach(c.projects, (p) => {
      if (p.status === api.CONTRACT_STATUSES.ACTIVE) addCustomerOrg(c, p);
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
          text: 'Customer Orgs',
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
        let index = _first(y).index;
        let labelClicked = chartData.value.labels[index];
        localStorage.setItem('requestedDataType', 'customerOrgs');
        localStorage.setItem('requestedFilter', labelClicked);
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
  dataReceived.value = true;
} // fillData

/**
 * Gets the labels and data sets for the stacked bar chart.
 */
function getChartData() {
  let datasets = [];
  let orgBreakdowns = {};
  let labels = getSortedLabels();
  // set all org breakdowns in a non-nested object
  _forEach(labels, (label) => {
    orgBreakdowns = { ...orgBreakdowns, ...customerOrgs.value[label] };
  });
  let i = 0;
  let j = 0;
  _forEach(labels, (label) => {
    // sort each customer org by total employees attached to an org breakdown
    let sortedOrgBreakdowns = Object.keys(customerOrgs.value[label]).sort(
      (a, b) => customerOrgs.value[label][b] - customerOrgs.value[label][a]
    );
    _forEach(sortedOrgBreakdowns, (key) => {
      // create a dataset for each org breakdown
      datasets.push({
        label: key,
        data: getDataValues(labels, key),
        backgroundColor: colors[i % colors.length][j % colors[i].length]
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
 * Gets the sorted customer orgs by total employees connected to the org.
 *
 * @returns {Array} - The sorted customer org labels by total employees
 */
function getSortedLabels() {
  let sortedLabelMap = {};
  _forEach(customerOrgs.value, (orgBreakdowns, customerOrg) => {
    let total = 0;
    _forEach(orgBreakdowns, (count) => {
      total += count;
    });
    sortedLabelMap[customerOrg] = total;
  });
  return Object.keys(sortedLabelMap).sort((a, b) => sortedLabelMap[b] - sortedLabelMap[a]);
} // getSortedLabels

/**
 * Gets an array of total employees for each customer org with the org breakdown.
 *
 * @param {Array} labels - The customer orgs
 * @param {String} orgBreakdown - The lowest level customer org breakdown
 * @returns {Array} - The total number of employees for each customer org breakdown
 */
function getDataValues(labels, orgBreakdown) {
  let data = [];
  _forEach(labels, (label) => {
    data.push(customerOrgs.value[label]?.[orgBreakdown] || 0);
  });
  return data;
} // getDataValues

/**
 * Add the org breakdown from a customer org. The org will breakdown to the lowest level org that.
 * The number of total employees will be the value of the org breakdown.
 *
 * @param {Object} c - The contract
 * @param {Object} p - The project
 */
function addCustomerOrg(c, p) {
  let customerOrg, nextOrg;
  let count = getProjectCurrentEmployees(c, p, store.getters.employees)?.length || 0;
  if (!p.customerOrg && c.customerOrg) {
    // if project does not have a customer org, inherit it from contract
    customerOrg = c.customerOrg;
    if (getOrgBreakdown(p)) nextOrg = getOrgBreakdown(p);
    else nextOrg = getOrgBreakdown(c);
  } else if (p.customerOrg) {
    customerOrg = p.customerOrg;
    nextOrg = getOrgBreakdown(p);
  }
  if (customerOrg && nextOrg && count) {
    if (customerOrgs.value[customerOrg]) {
      // org exists in dictionary
      if (customerOrgs.value[customerOrg][nextOrg]) customerOrgs.value[customerOrg][nextOrg] += count;
      else customerOrgs.value[customerOrg][nextOrg] = count;
    } else {
      // add org and org breakdown to dictionary
      customerOrgs.value[customerOrg] = { [`${nextOrg}`]: count };
    }
  }
} // addCustomerOrg

/**
 * Gets the lowest level org that exists in the contract or project.
 *
 * @param {Object} item - The contract or project
 */
function getOrgBreakdown(item) {
  return item.org3 || item.org2 || item.directorate || item.customerOrg;
} // getOrgBreakdown
</script>
