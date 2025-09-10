<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart ref="pieChart" :key="chartKey" chartId="cust-org" :options="options" :chartData="chartData"></pie-chart>
    <v-container class="ma-0">
      <v-row justify="center" no-gutters>
        <v-radio-group v-model="filter" class="d-flex justify-center" inline>
          <v-radio v-for="option of filterOptions" :key="option" :label="option" :value="option" />
        </v-radio-group>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
import PieChart from '../base-charts/PieChart.vue';
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
const label = ref([]);
const options = ref(null);
const quantities = ref([]);
const router = useRouter();
const filter = ref('All');
const filterOptions = ref(['All', 'Current', 'Past']);
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
  let employees = store.getters.employees;
  let contracts = store.getters.contracts;
  contracts = contracts.reduce((acc, item) => { acc[item.id] = item; return acc; }, {})
  // tally up customer org experience for active employees
  for (let emp of employees) {
    if (emp.workStatus <= 0) continue;
    // loop through org experience
    for (let org of emp.customerOrgExp ?? []) {
      // We get whether or not we want to show current or past info
      let isOrgCurrent = filter.value === 'Current' ? org.current : !org.current;
      // error checks if orgYears is undefined
      if (org.years && (isOrgCurrent || filter.value === 'All')) {
        allCompOrgExp[org.name] ??= 0;
        allCompOrgExp[org.name] += Math.round(Number(org.years) * 100) / 100;
      }
    }
    // loop through current contract experience
    for (let c of emp.contracts ?? []) {
      let contract = contracts[c.contractId];
      if (emp.lastName === "Ogburn") {
        console.log(c);
        console.log(contract);
      }
      for (let p of c.projects) {

      }
    }
  }
  let labels = Object.keys(allCompOrgExp);
  quantities.value = [];

  for (let label of labels ?? []) {
    quantities.value.push(allCompOrgExp[label]);
  }
  label.value = labels;
} // fetchData

/**
 * Sets up the chart formatting and data options.
 */
function fillData() {
  let text = '';
  let colors = [];
  let enabled = true;
  if (quantities.value.length === 0) {
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
    text = `${filter.value} Customer Org Experience (Years)`;
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

  options.value = {
    onClick: (x, y) => {
      let index = y[0]?.index;
      localStorage.setItem(
        'requestedFilter',
        JSON.stringify({ tab: 'customerOrgs', search: chartData.value.labels[index] })
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
 * Watcher for filter - fills data.
 */
watch(filter, () => {
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
