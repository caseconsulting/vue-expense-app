<template>
  <v-card v-if="dataReceived" class="pa-7">
    <pie-chart ref="chart" :key="chartKey" chartId="majors-chart" :options="option" :chartData="chartData"></pie-chart>
  </v-card>
</template>

<script setup>
import PieChart from '../base-charts/PieChart.vue';
import { onBeforeUnmount, onBeforeMount, onMounted, ref, inject } from 'vue';
import _first from 'lodash/first';
import _some from 'lodash/some';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
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
const eduKind = ref(null);
const emitter = inject('emitter');
const enabled = ref(false);
const label = ref([]);
const option = ref(null);
const quantities = ref([]);
const router = useRouter();
const store = useStore();
const text = ref('');

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
onMounted(async () => {
  // emit comes from HighestDegreeChart when a pie slice is clicked
  await emitter.on('majors-update', async (receiveData, title) => {
    quantities.value = [];
    label.value = [];
    dataReceived.value = false;
    let majorsOrSchools = receiveData.majorsOrSchools;
    eduKind.value = receiveData.eduKind;

    await fetchData(majorsOrSchools);
    await fillData(title);
  });
}); // mounted

/**
 * Created lifecycle hook
 */
onBeforeMount(async () => {
  await fetchData(null);
  await fillData();
}); // created

/**
 * Before destroy lifecycle hook.
 */
onBeforeUnmount(() => {
  emitter.off('majors-update');
}); //beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all the major/school data.
 *
 * @param majorsOrSchools The array of majors/schools for an education kind
 */
function fetchData(majorsOrSchools) {
  if (majorsOrSchools) {
    enabled.value = true;
    const sortable = Object.entries(majorsOrSchools)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    for (let i = 0; i < 10; i++) {
      let majorOrSchool = Object.keys(sortable)[i];
      if (majorOrSchool) {
        quantities.value.push(sortable[majorOrSchool]);
        label.value.push(majorOrSchool);
      }
    }
    text.value = `Top ${eduKind.value} Degree Majors`;
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
  } else {
    // these presets are when an education has not been selected
    quantities.value.push(1);
    enabled.value = false;
    text.value = `Click on an Education To See the Top Majors/Schools`;
    colors.value = ['grey'];
  }
} // fetchData

/**
 * Sets the chart formatting and options data.
 *
 * @param title the title to display if there is one
 */
function fillData(title) {
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
        text: title ? title : text.value,
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
        localStorage.setItem('requestedFilter', getMajorList(labelClicked, eduKind.value));
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
 * @param major the major that needs to be searched
 * @param eduType the type of education/degree
 */
function getMajorList(major, eduType) {
  let employees = store.getters.employees;
  let empList = [];
  empList = _filter(employees, (emp) => {
    return _some(emp?.education, (edu) => {
      if (eduType === 'High School' && edu.type === 'highSchool' && edu.name === major) {
        return true;
      } else if (
        (eduType === 'Associate' || eduType === 'Bachelor' || eduType === 'Master' || eduType === 'PhD/Doctorate') &&
        edu.type === 'university'
      ) {
        return _some(edu.degrees, (deg) => {
          return (deg.degreeType === eduType || deg.degreeType === eduType + 's') && deg.majors?.includes(major);
        });
      } else if (eduType === 'Military' && edu.type === 'military' && edu.branch === major) {
        return true;
      }
      return false;
    });
  });
  empList = _map(empList, (emp) => `${emp.firstName} ${emp.lastName}`);
  return empList;
}
</script>

<style scoped>
.tmp {
  height: 100%;
}
</style>
