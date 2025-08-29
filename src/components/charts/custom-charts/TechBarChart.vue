<template>
  <v-card elevation="1" v-if="enoughData" class="px-2 pb-2 pt-0">
    <v-container v-if="dataReceived" class="ma-0">
      <v-row justify="end">
        <v-col class="text-right">
          <DownloadCSV
            v-if="userRoleIsAdmin()"
            filename="technologies.csv"
            :generateData="generateCsvData"
            sortKey="Technology"
            :tooltip="'Download ' + showCurrent + ' Technologies to CSV'"
          ></DownloadCSV>
        </v-col>
      </v-row>
      <bar-chart ref="barChart" :key="chartKey" chartId="tech" :options="option" :chartData="chartData"></bar-chart>
      <v-row no-gutters>
        <v-col cols="12" xxl="6" xl="6" lg="6" md="6" sm="6">
          <v-radio-group inline v-model="showCurrent" class="mt-5 mb-0 mx-0">
            <v-radio label="All" value="All"></v-radio>
            <v-radio label="Current" value="Current"></v-radio>
            <v-radio label="Past" value="Past"></v-radio>
          </v-radio-group>
        </v-col>
        <v-col cols="12" xxl="6" xl="6" lg="6" md="6" sm="6" :class="!isMobile() ? 'text-right' : ''">
          <v-btn v-if="!isMobile()" :disabled="reachedMin" @click="oneLessColumn()" size="small" class="mr-2">
            <v-tooltip activator="parent" location="top">Decrease Number of Columns Shown</v-tooltip>
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <v-btn v-if="!isMobile()" :disabled="reachedMax" @click="oneMoreColumn()" size="small" class="mr-2">
            <v-tooltip activator="parent" location="top">Increase Number of Columns Shown</v-tooltip>
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
  <v-card v-else>
    <div class="pa-15 text-center">
      <h2>Not Enough Data Avaliable.</h2>
      <h5 class="pt-3">Try adding some information to your profile!</h5>
    </div>
  </v-card>
</template>

<script setup>
import _first from 'lodash/first';
import BarChart from '../base-charts/BarChart.vue';
import DownloadCSV from '@/components/utils/DownloadCSV.vue';
import { isMobile, userRoleIsAdmin } from '@/utils/utils';
import { onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const chartData = ref(null);
const chartKey = ref(0);
const currentTechnologies = ref({});
const dataReceived = ref(false);
const employees = ref(null);
const enoughData = ref(true);
const nonCurrentTechnologies = ref({});
const numOfColumns = ref(5);
const numOfColumnsMin = ref(2);
const numOfColumnsMax = ref(10);
const option = ref(null);
const reachedMin = ref(false);
const reachedMax = ref(false);
const router = useRouter();
const showCurrent = ref('All');
const store = useStore();
const technologies = ref({});
const technologyPairs = ref({});

// |--------------------------------------------------|
// |                                                  |
// |                  LIFECYCLE HOOKS                 |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook - get items, organize them and fill data.
 */
onMounted(async () => {
  if (store.getters.storeIsPopulated) {
    await parseEmployeeData();
    // Sort tech by number of occurances
    await sortTech(technologies.value);

    await fillData();
  }
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Takes data that was captured upon load and displays it on the chart.
 */
function fillData() {
  let pairs = technologyPairs.value.sort((a, b) => {
    return b[1] - a[1];
  });
  pairs = pairs.slice(0, numOfColumns.value);
  let labels = [];
  let values = [];

  for (let i = 0; i < pairs.length; i++) {
    labels.push(pairs[i][0]);
    values.push(pairs[i][1]);
  }
  // We cycle through these colors to get the bar colors
  let colors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)'
  ];

  let backgroundColors = [];
  let borderColors = [];

  // Set the background and border colors
  for (let i = 0; i < labels.length; i++) {
    backgroundColors[i] = colors[i];
    borderColors[i] = colors[i];
  }

  // Set the chart data
  chartData.value = {
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
  option.value = {
    scales: {
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
      },
      x: {
        title: {
          display: true,
          text: 'Name of Technology',
          font: {
            weight: 'bold'
          }
        }
      }
    },
    onClick: (x, y) => {
      if (_first(y)) {
        let index = _first(y).index;
        localStorage.setItem(
          'requestedFilter',
          JSON.stringify({ type: 'technologies', search: chartData.value.labels[index] })
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
        text: `Top ${pairs.length} ${
          showCurrent.value === 'All' ? '' : showCurrent.value + ' '
        }Technologies Used by Employees`,
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
  chartKey.value++; // rerenders the chart
  dataReceived.value = true;
} // fillData

/**
 * Generates an object of data to be turned into a csv file.
 *
 * @returns Array - An array of objects
 */
function generateCsvData() {
  let csvData = [];
  employees.value.forEach((e) => {
    if (e.technologies) {
      e.technologies.forEach((t) => {
        if (
          showCurrent.value == 'All' ||
          (showCurrent.value == 'Current' && t.current) ||
          (showCurrent.value == 'Past' && !t.current)
        )
          csvData.push({ Technology: t.name, Employee: `${e.firstName} ${e.lastName}` });
      });
    }
  });
  return csvData;
} // generateCsvData

/**
 * Increases the number of columns on the chart
 */
function oneMoreColumn() {
  if (numOfColumns.value < numOfColumnsMax.value && numOfColumns.value < technologyPairs.value.length) {
    reachedMin.value = false;
    numOfColumns.value++;
    fillData(); // Refresh the chart
  }
  // Disable the "+" button if the max has been reached
  if (numOfColumns.value === numOfColumnsMax.value || numOfColumns.value === technologyPairs.value.length) {
    reachedMax.value = true;
  }
} // oneMoreColumn

/**
 * Decreases the number of columns on the chart
 */
function oneLessColumn() {
  if (numOfColumns.value > numOfColumnsMin.value) {
    reachedMax.value = false;
    numOfColumns.value--;
    fillData(); // Refresh the chart
  }
  // Disable the "-" button if the min has been reached
  if (numOfColumns.value === numOfColumnsMin.value) {
    reachedMin.value = true;
  }
} // oneLessColumn

/**
 * Sets num of columns to show when radio buttons are changed
 *
 * @param techArray - The array of different technologies
 */
function setNumOfColumns(techArray) {
  if (techArray.length <= 5) {
    numOfColumns.value = techArray.length;
    reachedMax.value = true;
  } else {
    numOfColumns.value = 5;
    reachedMax.value = false;
    reachedMin.value = false;
  }
} // setNumOfColumns

/**
 * Sorts array of tech skills
 *
 * @param techArray - The array of different technologies
 */
function sortTech(techArray) {
  // We now sort the entries
  technologyPairs.value = Object.entries(techArray);
  if (technologyPairs.value.length <= numOfColumnsMin.value) {
    numOfColumns.value = technologyPairs.value.length;
    numOfColumnsMin.value = technologyPairs.value.length;
    reachedMin.value = true;
    reachedMax.value = true;
  }
  if (technologyPairs.value.length <= numOfColumns.value) {
    numOfColumns.value = technologyPairs.value.length;
    reachedMax.value = true;
  }
  // Set number of columns to display
  setNumOfColumns(techArray);
} // sortTech

/**
 * Parse through employee data to get technologies
 *
 */
function parseEmployeeData() {
  employees.value = store.getters.employees;
  // Put into dictionary where key is tech type and value is quantity
  employees.value.forEach((employee) => {
    if (employee.technologies && employee.workStatus != 0) {
      employee.technologies.forEach((currTech) => {
        // **** ALL TECH ****
        if (!technologies.value[currTech.name]) {
          technologies.value[currTech.name] = 1;
        } else {
          technologies.value[currTech.name] += 1;
        }
        // **** CURRENT TECH ****
        // Not in array yet, but is current
        if (!currentTechnologies.value[currTech.name] && currTech.current) {
          currentTechnologies.value[currTech.name] = 1;
        }
        // Already in array, but is current
        else if (currentTechnologies.value[currTech.name] && currTech.current) {
          currentTechnologies.value[currTech.name] += 1;
        }
        // **** NON CURRENT TECH ****
        // Not in array yet, and is not current
        else if (!nonCurrentTechnologies.value[currTech.name] && !currTech.current) {
          nonCurrentTechnologies.value[currTech.name] = 1;
        }
        // Already in array, and is not current
        else if (nonCurrentTechnologies.value[currTech.name] && !currTech.current) {
          nonCurrentTechnologies.value[currTech.name] += 1;
        }
      });
    }
  });

  // Check if there is enough data to display chart
  if (technologies.value.length >= 2) {
    enoughData.value = false;
  }
} // parseEmployeeData

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for showCurrent - sorts tech info and then fills data.
 */
watch(showCurrent, () => {
  if (showCurrent.value === 'All') {
    sortTech(technologies.value);
  } else if (showCurrent.value === 'Current') {
    sortTech(currentTechnologies.value);
  } else {
    sortTech(nonCurrentTechnologies.value);
  }
  fillData();
}); // watchShowCurrent

watch(
  () => store.getters.storeIsPopulated,
  () => {
    parseEmployeeData();
    // Sort tech by number of occurances
    sortTech(technologies.value);
    fillData();
  }
);
</script>

<style scoped>
button {
  top: 30px;
}

.right {
  float: right;
}
</style>
