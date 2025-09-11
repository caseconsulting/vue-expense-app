<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart ref="pieChart" chartId="cust-org" :options="chartOptions" :chartData="chartData" :key="chartKey"/>
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
import PieChart from '@/components/charts/base-charts/PieChart.vue';
import { getEmployeeCurrentContracts } from '@/shared/employeeUtils';
import { getTodaysDate, difference } from '@/shared/dateUtils';
import { onBeforeMount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

// vars that connect to template
const dataReceived = ref(false);
const chartData = ref(null);
const chartOptions = ref(null);
const chartKey = ref(0);
const filter = ref('All');
const filterOptions = ref(['All', 'Current', 'Past']);

// vars for code-only
const quantities = {};
const router = useRouter();
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
  // unset the table
  dataReceived.value = false;

  // init vars
  let employees = store.getters.employees;
  let contracts = store.getters.contracts.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
  let today = getTodaysDate();
  let experience = { All: [], Current: [], Past: [] };

  // helper: whether or not to add experience based on filter and current status
  function shouldAdd(filterType, isCurrent) {
    return filterType === 'All'
      || (filterType === 'Current' && isCurrent)
      || (filterType === 'Past' && !isCurrent)
  };

  // helper: adds value to allCompOrgExp[name] for all filter types that should
  // include it skips if any inputs are missing/invalid
  function add(name, value, isCurrent) {
    if (!name || !value || isCurrent == null) return;
    for (let filterType of filterOptions.value) {
      if (!shouldAdd(filterType, isCurrent)) continue;
      experience[filterType][name] ??= 0;
      experience[filterType][name] += value;
    }
  }

  // tally up customer org experience for active employees
  for (let emp of employees) {
    if (emp.workStatus <= 0) continue;

    // loop through org experience
    for (let org of emp.customerOrgExp ?? []) {
      if (!org.years) continue; // skip if no years of experience
      // get the status and duration of the org experience
      let isOrgCurrent = filter.value === 'Current' ? org.current : !org.current;
      let yearsExp = Math.round(Number(org.years) * 100) / 100;
      // add to tallies
      add(org.name, yearsExp, isOrgCurrent);
    }

    // loop through current contract experience
    for (let c of emp.contracts ?? []) {
      let contract = contracts[c.contractId];
      if (!contract?.customerOrg) continue; // exit if no org name
      // get the status of contract
      let currentContracts = getEmployeeCurrentContracts(emp);
      currentContracts = new Set(currentContracts.map(c => c.id));
      let isContractCurrent = currentContracts.has(contract.id);
      // get the duration on the contract
      let daysBetween = (p) => difference(p.endDate ?? today, p.startDate, 'day')
      let duration = c.projects.reduce((acc, p) => acc + daysBetween(p), 0);
      duration = Math.round(duration / 365 * 100) / 100;
      // add to tallies
      add(contract.customerOrg, duration, isContractCurrent);
    }
  }

  // split org names from values, so that they can be added to pie chart
  for (let option of filterOptions.value) {
    quantities[option] = {
      data: Object.values(experience[option]),
      labels: Object.keys(experience[option])
    }
  }
} // fetchData

/**
 * Sets up the chart formatting and data options.
 */
function fillData() {
  // default chart options
  let text = `${filter.value} Customer Org Experience (Years)`;
  let { data, labels } = quantities[filter.value];
  let enabled = true;
  let backgroundColor = ['#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF6384', '#E6B89C', '#EAD2AC', '#9CAFB7', '#4281A4'];

  // chart options if no data found
  if (data.length === 0) {
    text = 'No Customer Org Data Found';
    data = [1];
    enabled = false;
    backgroundColor = ['lightgrey'];
  }

  // set chartData for template
  chartData.value = {
    labels: labels,
    datasets: [{ data, backgroundColor }]
  };

  // set chartOptions for template
  chartOptions.value = {
    onClick: (x, y) => {
      let index = y[0]?.index;
      localStorage.setItem(
        'requestedFilter',
        JSON.stringify({ tab: 'customerOrgs', search: labels[index] })
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
        font: { size: 15 }
      },
      subtitle: {
        display: true,
        text: '*Click on a segment of the pie chart to see employees',
        font: { style: 'italic' }
      },
      tooltip: {
        enabled
      }
    },
    maintainAspectRatio: false
  };

  // show the pie chart
  dataReceived.value = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Fills data on filter update
 */
watch(
  filter,
  () => {
    fetchData();
    fillData(); // renders a different chart every time the radio button changes
    chartKey.value++; // rerenders the chart
  }
);
</script>
