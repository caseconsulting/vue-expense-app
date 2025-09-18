<template>
  <v-card v-if="dataReceived" class="pa-5">
    <div v-if="userRoleIsAdmin()" class="float-right">
      <DownloadCSV
        filename="directorates"
        :csv="generateCsvData()"
        :xlsxFormat="false"
        tooltip="Download Directorates to CSV"
      />
    </div>
    <bar-chart
      ref="barChart"
      chartId="employees-directorate-chart"
      :chartData="chartData"
      :options="options"
    />
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

const router = useRouter();
const store = useStore();

// chart data for template
const dataReceived = ref(false);
const chartData = ref(null);
const options = ref(null);

// chart data for code-only
const directorates = {};
const onlyDirs = new Set(); // track which lowest-levels aren't orgs
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
});

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Makes the desired CSV for directorates
 */
function generateCsvData() {
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
  return csv;
}

/**
 * Gets directorate data count from employees list.
 */
function fetchData() {
  dataReceived.value = false;
  for (let c of store.getters.contracts) {
    for (let p of c.projects) {
      if (p.status === api.CONTRACT_STATUSES.ACTIVE) addDirectorate(c, p);
    }
  }
}

/**
 * Formats and sets data options for the chart.
 */
function fillData() {
  chartData.value = getChartData();
  options.value = {
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Directorates',
          font: { weight: 'bold' }
        },
        stacked: true
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        title: {
          display: true,
          text: 'Number of Employees',
          font: { weight: 'bold' }
        },
        stacked: true
      }
    },
    onClick: (x, y) => {
      if (y[0]) {
        let orgIndex = y[0].datasetIndex;
        let org = chartData.value.datasets[orgIndex].label;
        let isDir = onlyDirs.has(org);
        let type = isDir ? 'directorate' : 'org';
        localStorage.setItem(
          'requestedFilter',
          JSON.stringify({ tab: 'directorates', type, search: org })
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
        font: { size: 15 }
      },
      subtitle: {
        display: true,
        text: '*Click on a bar to see employees',
        font: { style: 'italic' }
      }
    },
    maintainAspectRatio: false
  };
  dataReceived.value = true;
}

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
    let sortedDirBreakdowns = Object.keys(directorates[label]).sort(
      (a, b) => directorates[label][b] - directorates[label][a]
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
}

/**
 * Gets the sorted directorates by total employees connected to the directorate.
 *
 * @returns {Array} - The sorted direactorate labels by total employees
 */
function getSortedLabels() {
  let sortedLabelMap = {};
  for (let [directorate, breakdown] of Object.entries(directorates)) {
    let total = 0;
    for (let count of Object.values(breakdown)) {
      total += count;
    }
    sortedLabelMap[directorate] = total;
  }
  let labels = Object.keys(sortedLabelMap).sort((a, b) => sortedLabelMap[b] - sortedLabelMap[a]);
  let totals = sortedLabelMap;
  return { labels, totals };
}

/**
 * Gets an array of total employees for each directorate with the directorate breakdown.
 *
 * @param {Array} labels - The directorates
 * @param {String} dirBreakdown - The lowest level directorate breakdown
 * @returns {Array} - The total number of employees for each directorate breakdown
 */
function getDataValues(labels, dirBreakdown) {
  let data = [];
  for (let label of labels) {
    data.push(directorates[label]?.[dirBreakdown] || 0);
  }
  return data;
}

/**
 * Add the directorate breakdown from a directorate. The directorate will breakdown to the lowest level directorate that.
 * The number of total employees will be the value of the directorate breakdown.
 *
 * @param {Object} c - The contract
 * @param {Object} p - The project
 */
function addDirectorate(c, p) {
  // get lowest level directorate and next org, and its count
  let directorate = p.directorate ?? c.directorate;
  let nextOrg = getOrgBreakdown(p) ?? getOrgBreakdown(c);
  let count = getProjectCurrentEmployees(c, p, store.getters.employees)?.length || 0;

  // add to chart
  if (directorate && nextOrg && count) {
    directorates[directorate] ??= {};
    directorates[directorate][nextOrg] ??= 0;
    directorates[directorate][nextOrg] += count;
    // add to directorates-only if it's not lower-level
    if (nextOrg == directorate) onlyDirs.add(directorate);
  }
}

/**
 * Gets the lowest level directorate that exists in the contract or project.
 *
 * @param {Object} item - The contract or project
 */
function getOrgBreakdown(item) {
  return item.org3 || item.org2 || item.directorate;
}
</script>
