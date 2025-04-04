<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart ref="barChart" chartId="job-roles-chart" :options="option" :chartData="chartData" />
  </v-card>
</template>

<script setup>
import BarChart from '../base-charts/BarChart.vue';
import _first from 'lodash/first';
import { onMounted, ref, watch } from 'vue';
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
const jobTitles = ref([]);
const jobQuantities = ref([]);
const option = ref(null);
const roles = ref({});
const router = useRouter();
const store = useStore();

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
 * Extracts the job role from each employee and tallies up
 * each role for active employees.
 */
function fetchData() {
  employees.value = store.getters.employees;
  employees.value.forEach((emp) => {
    if (emp.jobRole && emp.workStatus != 0) {
      if (roles.value[emp.jobRole]) {
        roles.value[emp.jobRole] += 1;
      } else {
        roles.value[emp.jobRole] = 1;
      }
    }
  });
  //sorts contents from most common roles to least
  let sortedRoles = Object.entries(roles.value);
  sortedRoles = sortedRoles.sort((a, b) => {
    return b[1] - a[1];
  });
  //10 is just a limit to prevent an extremely long and crammed graph
  for (let i = 0; i < 10; i++) {
    if (sortedRoles.length > i) {
      jobTitles.value.push(sortedRoles[i][0]);
      jobQuantities.value.push(sortedRoles[i][1]);
    }
  }
} // fetchData

/**
 * Sets the chart formatting and options data.
 */
function fillData() {
  chartData.value = {
    labels: jobTitles.value,
    datasets: [
      {
        data: jobQuantities.value,
        backgroundColor: props.colors
      }
    ]
  };

  option.value = {
    aspectRatio: 2,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Name of Position',
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
        localStorage.setItem('requestedDataType', 'jobRoles');
        localStorage.setItem('requestedFilter', chartData.value.labels[index]);
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
        text: 'Top Job Roles at CASE',
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
