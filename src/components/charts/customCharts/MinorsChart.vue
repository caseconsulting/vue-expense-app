<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart :options="options" :chartData="chartData"></pie-chart>
  </v-card>
  <v-skeleton-loader v-else type="paragraph@5"></v-skeleton-loader>
</template>

<script>
import PieChart from '../baseCharts/PieChart.vue';
import _ from 'lodash';
function fillData(minors) {
  let text;
  let colors;
  let enabled;
  let labels = [];
  let quantities = [];
  if (minors) {
    if (_.isEmpty(minors)) {
      text = `There are no minors for a degree of ${this.degree}`;
      quantities.push(1);
      enabled = false;
      colors = ['grey'];
    } else {
      text = `${this.degree} Degree Minors`;
      enabled = true;
      _.forEach(Object.keys(minors), (label) => {
        quantities.push(minors[label]);
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
    }
  } else {
    //these presets are when a degree has not been selected OR if there are no minors
    if (!_.isEmpty(minors)) {
      text = 'There are no minors for this type of degree';
    } else {
      text = 'Click on a degree to see minors';
    }
    quantities.push(1);
    enabled = false;
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
      minors: null,
      dataReceived: false,
      degree: null
    };
  },
  methods: {
    fillData
  },
  mounted() {
    window.EventBus.$on('minors-update', (receiveMinors) => {
      this.degree = receiveMinors.degree;
      this.minors = receiveMinors.minors;
      this.fillData(this.minors);
    });
  },
  created() {
    this.fillData(null);
  }
};
</script>

<style></style>
