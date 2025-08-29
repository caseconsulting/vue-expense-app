<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart ref="pieChart" :key="chartKey" chartId="cust-org" :options="option" :chartData="chartData"></pie-chart>
    <v-container class="ma-0">
      <v-row justify="center" no-gutters>
        <v-radio-group inline v-model="showCurrent" class="d-flex justify-center">
          <v-radio label="All" value="All"></v-radio>
          <v-radio label="Current" value="Current"></v-radio>
          <v-radio label="Past" value="Past"></v-radio>
        </v-radio-group>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
import PieChart from '../base-charts/PieChart.vue';
import _forEach from 'lodash/forEach';
import _isEmpty from 'lodash/isEmpty';
import _first from 'lodash/first';
import { onBeforeMount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const chartData = ref(null);
const chartKey = ref(0);
const dataReceived = ref(false);
const employees = ref(null);
const label = ref([]);
const option = ref(null);
const quantities = ref([]);
const router = useRouter();
const showCurrent = ref('All');
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
onBeforeMount(async () => {
  if (store.getters.storeIsPopulated) {
    await fetchData();
    await fillData();
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Get all cust org data.
 */
function fetchData() {
  let allCompOrgExp = {};
  // access store
  employees.value = store.getters.employees;
  // tally up customer org experience for active employees
  employees.value.forEach((emp) => {
    if (emp.customerOrgExp && emp.workStatus != 0) {
      _forEach(emp.customerOrgExp, (org) => {
        let orgName = org.name;
        let orgYears = org.years;
        // We get whether or not we want to show current or past info
        let orgCurrent = showCurrent.value === 'Current' ? org.current : !org.current;

        // error checks if orgYears is undefined
        if (orgYears && (orgCurrent || showCurrent.value === 'All')) {
          if (allCompOrgExp[orgName]) {
            allCompOrgExp[orgName] += Math.round(Number(orgYears) * 100) / 100;
          } else {
            allCompOrgExp[orgName] = Math.round(Number(orgYears) * 100) / 100;
          }
        }
      });
    }
  });
  let labels = Object.keys(allCompOrgExp);
  quantities.value = [];

  _forEach(labels, (label) => {
    quantities.value.push(allCompOrgExp[label]);
  });
  label.value = labels;
} // fetchData

/**
 * Sets up the chart formatting and data options.
 */
function fillData() {
  let text = '';
  let colors = [];
  let enabled = true;
  if (_isEmpty(quantities.value)) {
    text = 'No Customer Org Data Found';
    quantities.value.push(1);
    enabled = false;
    colors = ['grey'];
  } else {
    colors = [
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
    text = `${showCurrent.value} Customer Org Experience (Years)`;
  }
  chartData.value = {
    labels: label.value,
    datasets: [
      {
        data: quantities.value,
        backgroundColor: colors
      }
    ]
  };

  option.value = {
    onClick: (x, y) => {
      let index = _first(y).index;
      localStorage.setItem(
        'requestedFilter',
        JSON.stringify({ type: 'customerOrgs', search: chartData.value.labels[index] })
      );
      router.push({
        path: '/reports',
        name: 'reports'
      });
    },
    plugins: {
      title: {
        display: true,
        text: text,
        font: {
          size: 15
        }
      },
      subtitle: {
        display: true,
        text: '*Click on a segment of the pie chart to see employees',
        font: {
          style: 'italic'
        }
      },
      tooltip: {
        enabled: enabled
      }
    },
    maintainAspectRatio: false
  };

  dataReceived.value = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for showCurrent - fills data.
 */
watch(showCurrent, () => {
  fetchData();
  fillData(); // renders a different chart every time the radio button changes
  chartKey.value++; // rerenders the chart
});

watch(
  () => store.getters.storeIsPopulated,
  () => {
    fetchData();
    fillData();
  }
);
</script>
