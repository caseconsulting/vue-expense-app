<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart ref="barChart" chartId="job-experience" :options="option" :chartData="chartData" />
  </v-card>
</template>

<script setup>
import BarChart from '../base-charts/BarChart.vue';
import { difference, getTodaysDate } from '@/shared/dateUtils';
import _first from 'lodash/first';
import { onMounted, ref, watch, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['colors']);
const chartData = ref(null);
const dataReceived = ref(false);
const employees = ref(null);
const jobExperience = ref([]);
const jobExperienceNames = ref({});
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
    // eslint-disable-next-line no-undef
    await jobExperienceData();
    await drawJobExpHistGraph();
  }
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Finds the last index that has an element greater than 0 to prevent
 * too many labels showing up on the chart.
 *
 * @return Number - The index greater than 0
 */
function findMaxIndex() {
  let max = 0;
  jobExperience.value.forEach((element, index) => {
    if (element !== undefined || element !== null) {
      if (element > 0) max = index;
    }
  });
  return max;
} // findMaxIndex

/**
 * Extracts each employees job experience and determines how many years
 * they have worked, including time at Case. Each employees experience
 * will be put in an array slot that is based on an increment of experience
 * of 5 years.
 */
function jobExperienceData() {
  employees.value = store.getters.employees;
  employees.value.forEach((employee) => {
    // get the name so we can filter on click later
    let name = employee.firstName + ' ' + employee.lastName;
    // only include active employees
    if (employee.hireDate !== undefined && employee.workStatus != 0) {
      // find time at case
      var amOfYears = calculateTimeDifference(employee.hireDate, undefined);
      if (employee.companies !== undefined) {
        //we do a for each on the jobs array
        //calculate the difference in the startDate and the endDate (today's date if endDate is undefined)
        employee.companies.forEach((company) => {
          if (company.positions !== undefined) {
            company.positions.forEach((position) => {
              amOfYears += calculateTimeDifference(position.startDate, position.endDate);
            });
          }
        });
      }
      // push time to array
      if (amOfYears > 45) amOfYears = 45;
      // max years for data control
      else if (amOfYears < 0) amOfYears = 0; // min years for data control
      let index = Math.floor(Math.round(amOfYears) / 5);
      if (jobExperience.value[index] !== undefined) {
        jobExperience.value[index] += 1; // bumps counter
        jobExperienceNames.value[index].push(name); // pushed onto the value array
      } else {
        jobExperience.value[index] = 1; // creates array slot
        jobExperienceNames.value[index] = [name]; // creates a new key-value pair as an array
      }
    }
  });
} // jobExperienceData

/**
 * Gets the time difference in years between the job start and end date.
 *
 * @param startDate - the start of the difference
 * @param endDate - the end of the difference
 * @return Number - The amount of years difference
 */
function calculateTimeDifference(startDate, endDate) {
  var end = endDate;
  //Checks if endDate is valid or not
  if (end === undefined || end === null) {
    end = getTodaysDate(); //Provides today's date
  } else {
    end = endDate;
  }
  return difference(end, startDate, 'years'); //Provides decimal value
} // calculateTimeDifference

/**
 * Format and set data options for job experience chart.
 */
function drawJobExpHistGraph() {
  let chartLabels = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45+'];
  let experienceNum = jobExperience.value;
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
          text: 'Years of Job Experience',
          font: {
            weight: 'bold'
          }
        }
      }
    },
    onClick: (x, y) => {
      if (_first(y)) {
        let index = _first(y).index;
        localStorage.setItem('requestedFilter', jobExperienceNames.value[index]);
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
        text: 'Number of Years of Job Experience for Employees',
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
} // drawJobExpHistGraph

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => store.getters.storeIsPopulated,
  () => {
    // eslint-disable-next-line no-undef
    jobExperienceData();
    drawJobExpHistGraph();
  }
);
</script>
