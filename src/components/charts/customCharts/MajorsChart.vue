<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart :options="options" :chartData="chartData"></pie-chart>
  </v-card>
  <v-skeleton-loader v-else type="paragraph@5"></v-skeleton-loader>
</template>

<script>
import PieChart from '../baseCharts/PieChart.vue';
import _ from 'lodash';
function fillData(majors) {
  let text;
  let colors;
  let enabled;
  let labels = [];
  let quantities = [];
  if (majors) {
    text = `${this.degree} Degree Majors`;
    enabled = true;
    _.forEach(Object.keys(majors), (label) => {
      quantities.push(majors[label]);
      labels.push(label);
    });
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
  } else {
    //these presets are when a degree has not been selected
    quantities.push(1);
    enabled = false;
    text = 'Click on a degree to see majors';
    colors = ['grey'];
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
  },
  created() {
    this.fillData(null);
  }
};
</script>

<style></style>
