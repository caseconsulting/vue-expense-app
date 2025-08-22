<template>
  <v-card v-if="dataReceived" class="pa-5">
    <div v-if="userRoleIsAdmin()" class="float-right">
      <DownloadCSV
        filename="directorates"
        :csv="generateCsvData()"
        :xlsxFormat="false"
        tooltip="Download Active Certifications to CSV"
      ></DownloadCSV>
    </div>
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
import DownloadCSV from '@/components/utils/DownloadCSV.vue';
import api from '@/shared/api';
import { userRoleIsAdmin } from '@/utils/utils';
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { getProjectCurrentEmployees } from '@/shared/contractUtils';
import baseCsv from '@/utils/csv/baseCsv.js';

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
 * Makes the desired CSV for directorates
 */
function generateCsvData() {
  // needs like:
  //
  // {Top level directorate}: 15
  // {Second level dir}: 10
  // {Second level dir}: 5
  //
  // {Top level directorate}: 20
  // {Second level dir}: 10
  // {Second level dir}: 7
  // {Second level dir}: 3
  //
  // {Top level directorate}: 15
  // {Second level dir}: 10
  // {Second level dir}: 5
  //

  // extract chart data
  let { labels_raw: labels, datasets } = chartData.value;

  // build object categories by top level dir
  labels = labels.map(l => ({ name: l, count: 0, items: [] }));
  for (let item of datasets) {
    for (let [i, v] of item.data.entries()) {
      if (v === 0) continue;
      labels[i].count += v;
      labels[i].items.push({ name: item.label, count: v });
    }
  }

  // build 2D array of top level dir, with subdirs under it
  let dirArray = [];
  let row = (item) => ["", `${item.name}:`, item.count];
  let add = (item) => dirArray.push(row(item));
  let space = () => dirArray.push(["", "", ""]);
  space();
  for (let label of labels) {
    space();
    add(label);
    for (let item of label.items) add(item)
  }

  let csv = baseCsv.generateFrom2dArray(dirArray);
  console.log(csv);
  return csv;
} // generateCsvData

/**
 * Gets directorate data count from employees list.
 */
function fetchData() {
  let contracts = store.getters.contracts;
  for (let c of contracts) {
    for (let p of c.projects) {
      if (p.status === api.CONTRACT_STATUSES.ACTIVE) addDirectorate(c, p);
    }
  }
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
      if (y[0]) {
        let directorateIndex = y[0].index;
        let orgIndex = y[0].datasetIndex;
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
  let { labels, totals } = getSortedLabels();
  let labels_raw = [];
  let label;
  for (let i in labels) {
    label = labels[i];
    labels_raw[i] = label; // setting here is faster than a spread operator
    // sort each directorate by total employees attached to a directorate breakdown
    let sortedDirBreakdowns = Object.keys(directorates.value[label]).sort(
      (a, b) => directorates.value[label][b] - directorates.value[label][a]
    );
    // create a dataset for each directorate breakdown
    for (let j in sortedDirBreakdowns) {
      datasets.push({
        label: sortedDirBreakdowns[j],
        data: getDataValues(labels, sortedDirBreakdowns[j]),
        backgroundColor: colors[i % colors.length][j % colors[i % colors.length].length]
      });
    }
    // rename the label to include the total
    labels[i] = `${label} (${totals[label]} total)`;
  }
  return {
    labels,
    labels_raw,
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
  for (let [directorate, breakdown] of Object.entries(directorates.value)) {
    let total = 0;
    for (let count of Object.values(breakdown)) {
      total += count;
    }
    sortedLabelMap[directorate] = total;
  }
  let labels = Object.keys(sortedLabelMap).sort((a, b) => sortedLabelMap[b] - sortedLabelMap[a]);
  let totals = sortedLabelMap;
  return { labels, totals };
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
  for(let label of labels) {
    data.push(directorates.value[label]?.[dirBreakdown] || 0);
  }
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
  let currEmployees;
  for (let c of contracts) {
    for (let p of c.projects) {
      let nextOrg = getOrgBreakdown(p) ?? getOrgBreakdown(c);
      if ((org == null || nextOrg === org) && p.directorate === directorate) {
        currEmployees = getProjectCurrentEmployees(c, p, employees);
        for (let e of currEmployees) {
          chartList.push(e.fullName ?? `${e.firstName} ${e.lastName}`);
        }
      }
    }
  }
  return chartList;
}
</script>
