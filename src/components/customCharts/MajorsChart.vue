<template>
  <pie-chart v-if="dataReceived" :options="options" :chartData="chartData"></pie-chart>
</template>

<script>
import PieChart from '../baseCharts/PieChart.vue';
import _ from 'lodash';
function fillData(majors) {
  let labels = Object.keys(majors);
  let quantities = [];
  _.forEach(labels, (label) => {
    quantities.push(majors[label]);
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
  let text = `${this.degree} degree majors`;
  this.options = {
    title: {
      display: true,
      text: text
    },
    maintainAspectRatio: false
  };
  this.dataReceived = true;
}

export default {
  components: { PieChart },
  data() {
    return {
      options: null,
      chartData: null,
      majors: null,
      dataReceived: false,
      degree: null
    };
  },
  methods: {
    fillData
  },
  mounted() {
    window.EventBus.$on('majors-update', (receiveMajors) => {
      let majors = receiveMajors.majors;
      this.degree = receiveMajors.degree;
      this.fillData(majors);
    });
  }
};
</script>

<style></style>
