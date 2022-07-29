<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart chartId="job-roles-chart" :options="options" :chartData="chartData" />
  </v-card>
</template>

<script>
import BarChart from '../baseCharts/BarChart.vue';
import { storeIsPopulated } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
async function mounted() {
  if (this.storeIsPopulated) await this.fillData();
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Extracts the job role from each employee and tallies up each role for active
 * employees. Also sets the chart formatting and options data.
 */
function fillData() {
  let roles = {};
  let ourFunctions = [];

  this.employees = this.$store.getters.employees;
  this.employees.forEach((emp) => {
    if (emp.jobRole && emp.workStatus != 0) {
      if (roles[emp.jobRole]) {
        roles[emp.jobRole] += 1;
      } else {
        roles[emp.jobRole] = 1;
      }
    }
  });
  //sorts contents from most common roles to least
  let sortedRoles = Object.entries(roles);
  sortedRoles = sortedRoles.sort((a, b) => {
    return b[1] - a[1];
  });
  let jobTitles = [];
  let jobQuantities = [];
  //10 is just a limit to prevent an extremely long and crammed graph
  for (let i = 0; i < 10; i++) {
    if (sortedRoles.length > i) {
      ourFunctions.push(() => {
        this.$router.push({
          path: '/reports',
          name: 'reports',
          params: { requestedDataType: 'Job Roles', requestedFilter: sortedRoles[i][0] }
        });
      });
      jobTitles.push(sortedRoles[i][0]);
      jobQuantities.push(sortedRoles[i][1]);
    }
  }
  let colors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(230, 184, 156, 1)',
    'rgba(234, 210, 172, 1)',
    'rgba(156, 175, 183, 1)',
    'rgba(66, 129, 164, 1)'
  ];

  this.chartData = {
    labels: jobTitles,
    datasets: [
      {
        data: jobQuantities,
        backgroundColor: colors
      }
    ]
  };

  this.options = {
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
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Top Job Roles at Case Consulting',
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
    maintainAspectRatio: false,
    myFunctions: ourFunctions
  };
  this.dataReceived = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { BarChart },
  computed: {
    storeIsPopulated
  },
  data() {
    return {
      options: null,
      chartData: null,
      dataReceived: false,
      employees: null
    };
  },
  methods: {
    fillData
  },
  mounted,
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) this.fillData();
    }
  }
};
</script>
