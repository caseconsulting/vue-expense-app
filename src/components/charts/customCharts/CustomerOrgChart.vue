<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart :options="options" :chartData="chartData"></pie-chart>
    <v-container class="ma-0">
      <v-row justify="center" no-gutters>
        <v-radio-group row v-model="showCurrent">
          <v-radio label="All" value="All"></v-radio>
          <v-radio label="Current" value="Current"></v-radio>
          <v-radio label="Past" value="Past"></v-radio>
        </v-radio-group>
      </v-row>
    </v-container>
  </v-card>
  <v-skeleton-loader v-else type="paragraph@5"></v-skeleton-loader>
</template>

<script>
function fillData() {
  let allCompOrgExp = {};
  this.employees.forEach((emp) => {
    if (emp.customerOrgExp && emp.workStatus != 0) {
      _.forEach(emp.customerOrgExp, (org) => {
        let orgName = org.name;
        let orgYears = org.years;
        //We get whether or not we want to show current or past info
        let orgCurrent = this.showCurrent === 'Current' ? org.current : !org.current;

        //error checks if orgYears is undefined
        if (orgYears && (orgCurrent || this.showCurrent === 'All')) {
          if (allCompOrgExp[orgName]) {
            allCompOrgExp[orgName] += Number(orgYears);
          } else {
            allCompOrgExp[orgName] = Number(orgYears);
          }
        }
      });
    }
  });
  let text = '';
  let colors = [];
  let enabled = true;
  let labels = Object.keys(allCompOrgExp);
  let quantities = [];

  _.forEach(labels, (label) => {
    quantities.push(allCompOrgExp[label]);
  });

  if (_.isEmpty(quantities)) {
    text = 'No Customer Org Data Found';
    quantities.push(1);
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
    text = `${this.showCurrent} Employee Customer Org Experience (in Years)`;
  }
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
      text: text,
      fontSize: 15
    },

    maintainAspectRatio: false,
    tooltips: {
      enabled: enabled
    }
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
      employees: null,
      showCurrent: 'All'
    };
  },
  methods: { fillData },
  async created() {
    this.employees = await api.getItems(api.EMPLOYEES);
    this.fillData();
    this.$forceUpdate();
  },
  watch: {
    showCurrent() {
      this.fillData();
    }
  }
};
</script>

<style></style>
