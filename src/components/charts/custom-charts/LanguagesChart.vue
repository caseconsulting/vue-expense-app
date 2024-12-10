<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart ref="barChart" chartId="foreign-languages" :options="option" :chartData="chartData" />
  </v-card>
</template>

<script setup>
import _first from 'lodash/first';
import BarChart from '../base-charts/BarChart.vue';
import { isEmpty } from '@/utils/utils';
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
const jobQuantities = ref([]);
const languageOptions = ref({});
const languages = ref([]);
const option = ref(null);
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
 * Extracts the language array from each employee and tallies
 * up each language for active employees.
 */
function fetchData() {
  employees.value = store.getters.employees;
  employees.value.forEach((emp) => {
    if (!isEmpty(emp.languages) && emp.workStatus != 0) {
      emp.languages.forEach((lang) => {
        if (lang.name !== 'English') {
          if (languageOptions.value[lang.name]) {
            languageOptions.value[lang.name] += 1;
          } else {
            languageOptions.value[lang.name] = 1;
          }
        }
      });
    }
  });

  //sorts contents from most common languages to least
  let sortedLangs = Object.entries(languageOptions.value);
  sortedLangs = sortedLangs.sort((a, b) => {
    return b[1] - a[1];
  });

  //10 is just a limit to prevent an extremely long and crammed graph
  for (let i = 0; i < 10; i++) {
    if (sortedLangs.length > i) {
      languages.value.push(sortedLangs[i][0]);
      jobQuantities.value.push(sortedLangs[i][1]);
    }
  }
} // fetchData

/**
 * Sets the chart formatting and options data.
 */
function fillData() {
  chartData.value = {
    labels: languages.value,
    datasets: [
      {
        data: jobQuantities.value,
        backgroundColor: props.colors
      }
    ]
  };

  option.value = {
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Language',
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
        localStorage.setItem('requestedDataType', 'foreignLanguages');
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
        text: 'Top Foreign Languages at CASE',
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
