<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart ref="barChart" chartId="employees-cust-org-chart" :options="option" :chartData="chartData"></bar-chart>
  </v-card>
</template>

<script setup>
import BarChart from '../base-charts/BarChart.vue';
import _forEach from 'lodash/forEach';
import _first from 'lodash/first';
import { onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const chartData = ref(null);
const dataReceived = ref(false);
const label = ref([]);
const option = ref(null);
const router = useRouter();
const store = useStore();
const values = ref([]);

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
 * Gets customer org data count from employees list.
 */
function fetchData() {
  let employees = store.getters.employees;
  let employeesCustOrg = {};
  employees.forEach((e) => {
    if (e.customerOrgExp && e.workStatus != 0) {
      _forEach(e.customerOrgExp, (org) => {
        if ((org.years || org.years == 0) && org.current) {
          let orgName = org.name;
          if (employeesCustOrg[orgName]) {
            employeesCustOrg[orgName] += 1;
          } else {
            employeesCustOrg[orgName] = 1;
          }
        }
      });
    }
  });

  let sortedEmployeeCustOrg = Object.entries(employeesCustOrg);
  sortedEmployeeCustOrg = sortedEmployeeCustOrg.sort((a, b) => {
    return b[1] - a[1];
  });

  for (let i = 0; i < sortedEmployeeCustOrg.length; i++) {
    if (sortedEmployeeCustOrg.length > 1) {
      label.value.push(sortedEmployeeCustOrg[i][0]);
      values.value.push(sortedEmployeeCustOrg[i][1]);
    }
  }
} // fetchData

/**
 * Formats and sets data options for the chart.
 */
function fillData() {
  let colors = [
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

  let backgroundColors = [];
  let borderColors = [];

  // Set the background and border colors
  for (let i = 0; i < label.value.length; i++) {
    backgroundColors[i] = colors[i % 9];
    borderColors[i] = colors[i % 9];
  }

  chartData.value = {
    labels: label.value,
    datasets: [
      {
        data: values.value,
        backgroundColor: backgroundColors
      }
    ]
  };
  option.value = {
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Customer Orgs',
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
        let labelClicked = chartData.value.labels[index];
        localStorage.setItem('requestedDataType', 'customerOrgs');
        localStorage.setItem('requestedFilter', labelClicked);
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
        text: 'Number of Employees for Each Customer Org',
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
</script>
