<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart ref="barChart" chartId="case-years" :options="option" :chartData="chartData" />
  </v-card>
  <v-skeleton-loader v-else type="paragraph@5"></v-skeleton-loader>
</template>

<script setup>
import BarChart from '../base-charts/BarChart.vue';
import { difference, getTodaysDate } from '@/shared/dateUtils';
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
const caseYears = ref([]);
const caseYearsNames = ref({});
const chartData = ref(null);
const dataReceived = ref(false);
const employees = ref(null);
const option = ref(null);
const router = useRouter();
const store = useStore();

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
    await caseYearsData();
    await drawCaseYearsHistGraph();
  }
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Puts an employee in an array based on a time interval of
 * 2 years for each index from their hire date.
 */
function caseYearsData() {
  //init the caseYears array
  const MAXIMUM_INDEX = 10;
  for (let i = 0; i < MAXIMUM_INDEX; i++) {
    caseYears.value.push(0);
  }
  employees.value = store.getters.employees;
  employees.value.forEach((employee) => {
    let name = employee.firstName + ' ' + employee.lastName;
    if (employee.hireDate !== undefined && employee.workStatus != 0) {
      // find time at case
      var amOfYears = calculateTimeDifference(employee.hireDate);

      // push time to array
      if (amOfYears > 18) amOfYears = 18;
      else if (amOfYears < 0) amOfYears = 0;
      let index = Math.floor(Math.round(amOfYears) / 2);
      caseYears.value[index] += 1;
      if (caseYears.value[index] == 1) {
        caseYearsNames.value[index] = [name]; // add a new key-value array if it is the first instance
      } else {
        caseYearsNames.value[index].push(name); // add a new name to existing key
      }
    }
  });
} // caseYearsData

/**
 * Helper function to determine how long an employee has worked from their hire date.
 *
 * @param startDate - date to compare to now
 * @return - the decimal value of the difference
 */
function calculateTimeDifference(startDate) {
  let end = getTodaysDate();
  return difference(end, startDate, 'years'); //Provides decimal value
} // calculateTimeDifference

/**
 * Format and set data options for case years chart.
 *
 * @return Object - case years chart data
 */
function drawCaseYearsHistGraph() {
  let experienceNum = caseYears.value;
  let chartLabels = ['0-1', '2-3', '4-5', '6-7', '8-9', '10-11', '12-13', '14-15', '16-17', '18+'];
  let maxIndex = findMaxIndex();
  let data = {
    labels: chartLabels.splice(0, maxIndex + 1),
    datasets: [
      {
        data: experienceNum,
        backgroundColor: props.colors
      }
    ]
  };

  let options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Employees',
          font: {
            weight: 'bold'
          }
        }
      },
      x: {
        ticks: {
          autoSkip: false
        },
        title: {
          display: true,
          text: 'Years at CASE',
          font: {
            weight: 'bold'
          }
        }
      }
    },
    onClick: (x, y) => {
      if (_first(y)) {
        let index = _first(y).index;
        localStorage.setItem('requestedFilter', caseYearsNames.value[index]);
        router.push({
          path: '/employees',
          name: 'employees'
        });
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Number of Years at CASE for Employees',
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
  chartData.value = data;
  option.value = options;
  dataReceived.value = true;
} // drawCaseYearsHistGraph

/**
 * Finds the last index where the element is greater than 0 to ensure the
 * chart does not show all of the labels are there is no data.
 *
 * @return - last index that is greater than 0
 */
function findMaxIndex() {
  let max = 0;
  caseYears.value.forEach((element, index) => {
    if (element !== undefined || element !== null) {
      if (element > 0) max = index;
    }
  });
  return max;
} // findMaxIndex

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => store.getters.storeIsPopulated,
  () => {
    drawCaseYearsHistGraph();
    caseYearsData();
  }
);
</script>
