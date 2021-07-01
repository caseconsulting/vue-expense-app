<template>
  <pie-chart v-if="dataReceived" :options="options" :chartData="chartData"></pie-chart>
</template>

<script>
function fillData() {
  let allCompOrgExp = {};
  this.employees.forEach((emp) => {
    if (emp.customerOrgExp) {
      _.forEach(emp.customerOrgExp, (org) => {
        let orgName = org.name;
        let orgYears = org.years;
        //error checks if orgYears is undefined
        if (orgYears) {
          if (allCompOrgExp.orgName) {
            allCompOrgExp[orgName] += Number(orgYears);
          } else {
            allCompOrgExp[orgName] = Number(orgYears);
          }
        }
      });
    }
  });
  let labels = Object.keys(allCompOrgExp);
  let quantities = [];
  _.forEach(labels, (label) => {
    quantities.push(allCompOrgExp[label]);
  });

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
  this.chartData = {
    labels: labels,
    datasets: [
      {
        data: quantities,
        backgroundColor: colors
      }
    ]
  };

  this.options = {
    title: {
      display: true,
      text: 'Employee Customer Org Experience (in years)'
    },

    maintainAspectRatio: false
  };

  this.dataReceived = true;
}

import PieChart from '../baseCharts/PieChart.vue';
import _ from 'lodash';
import api from '@/shared/api.js';
export default {
  components: { PieChart },
  data() {
    return {
      dataReceived: false,
      chartData: null,
      options: null,
      employees: null
    };
  },
  methods: { fillData },
  async created() {
    this.employees = await api.getItems(api.EMPLOYEES);
    this.fillData();
  }
};
</script>

<style></style>
