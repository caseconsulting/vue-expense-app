<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart
      ref="pieChart"
      chartId="minors-chart"
      :key="chartKey"
      :options="option"
      :chartData="chartData"
    ></pie-chart>
  </v-card>
</template>

<script setup>
import PieChart from '../base-charts/PieChart.vue';
import _isEmpty from 'lodash/isEmpty';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, inject } from 'vue';
import _first from 'lodash/first';
import _filter from 'lodash/filter';
import _some from 'lodash/some';
import _map from 'lodash/map';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const chartData = ref(null);
const chartKey = ref(0);
const colors = ref([]);
const dataReceived = ref(false);
const degree = ref(null);
const emitter = inject('emitter');
const enabled = ref(false);
const label = ref([]);
const minors = ref(null);
const option = ref(null);
const quantities = ref([]);
const text = ref('');
const router = useRouter();
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Before destroy lifecycle hook.
 */
onBeforeUnmount(() => {
  emitter.off('minors-update');
}); // beforeUnmount

/**
 * Mounted lifecycle hook.
 */
onMounted(async () => {
  // emit comes from HighestDegreeChart.vue when a pie slice is clicked
  emitter.on('minors-update', async (receiveMinors) => {
    quantities.value = [];
    label.value = [];
    dataReceived.value = false;
    degree.value = receiveMinors.degree;
    minors.value = receiveMinors.minors;
    await fetchData(minors.value);
    await fillData();
  });
}); // mounted

/**
 * Created lifecycle hook.
 */
onBeforeMount(async () => {
  await fetchData(null);
  await fillData();
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all the minor data.
 * @param majors The array of minors for a degree
 */
function fetchData(minors) {
  if (minors) {
    if (_isEmpty(minors)) {
      text.value = `There are no minors for an education of ${degree.value}`;
      quantities.value.push(1);
      enabled.value = false;
      colors.value = ['grey'];
    } else {
      enabled.value = true;
      const sortable = Object.entries(minors)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

      for (let i = 0; i < 10; i++) {
        let minor = Object.keys(sortable)[i];
        if (minor) {
          quantities.value.push(sortable[minor]);
          label.value.push(minor);
        }
      }
      text.value = `Top ${degree.value} Degree Minors`;
      colors.value = [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(230, 184, 156, 1)',
        'rgba(234, 210, 172, 1)',
        'rgba(156, 175, 183, 1)',
        'rgba(66, 129, 164, 1)'
      ];
    }
  } else {
    // these presets are when a degree has not been selected OR if there are no minors
    if (!_isEmpty(minors)) {
      text.value = 'There are no minors for this type of education';
    } else {
      text.value = 'Click on an Education To See Minors';
    }
    quantities.value.push(1);
    enabled.value = false;
    colors.value = ['grey'];
  }
} // fetchData

/**
 * Sets the chart formatting and options data.
 */
function fillData() {
  chartData.value = {
    labels: label.value,
    datasets: [
      {
        data: quantities.value,
        backgroundColor: colors.value
      }
    ]
  };
  option.value = {
    plugins: {
      title: {
        display: true,
        text: text.value,
        font: {
          size: 15
        }
      },
      subtitle: {
        display: true,
        font: {
          style: 'italic'
        }
      },
      tooltip: {
        enabled: enabled.value
      }
    },
    onClick: (x, y) => {
      if (_first(y)) {
        let index = _first(y).index;
        let labelClicked = chartData.value.labels[index];
        localStorage.setItem('requestedDataType', 'education');
        localStorage.setItem('requestedFilter', getMinorList(labelClicked, degree.value));
        router.push({
          path: '/employees',
          name: 'employees'
        });
      }
    },
    maintainAspectRatio: false
  };
  chartKey.value++; // rerenders the chart
  dataReceived.value = true;
} // fillData

/**
 * Gets list of employees in clicked label
 *
 * @param minor the minor that needs to be searched
 * @param degreeType the type of degree (bachelor, master, etc.)
 */
function getMinorList(minor, degreeType) {
  let employees = store.getters.employees;
  let empList = [];
  empList = _filter(employees, (emp) => {
    return _some(emp?.education, (edu) => {
      return _some(edu?.degrees, (deg) => {
        return (deg.degreeType === degreeType || deg.degreeType === degreeType + 's') && deg.minors?.includes(minor);
      });
    });
  });
  empList = _map(empList, (emp) => `${emp.firstName} ${emp.lastName}`);
  return empList;
}
</script>
