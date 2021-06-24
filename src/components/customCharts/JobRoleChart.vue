<template>
  <bar-chart v-if="dataReceived" :options="options" :chartData="chartData" />
</template>

<script>
import BarChart from '../baseCharts/BarChart.vue';
import api from '@/shared/api.js';

function fillData() {
  let roles = {};
  this.employees.forEach((emp) => {
    if (emp.jobRole) {
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
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'Name of Position'
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            stepSize: 1
          },
          scaleLabel: {
            display: true,
            labelString: 'Number of Employees'
          }
        }
      ]
    },
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Top Job Roles at Case Consulting Inc.'
    },
    maintainAspectRatio: false
  };
  this.dataReceived = true;
}

export default {
  components: { BarChart },
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
  async created() {
    this.employees = await api.getItems(api.EMPLOYEES);
    this.fillData();
  }
};
</script>

<style></style>
