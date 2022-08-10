<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart
      ref="pieChart"
      chartId="minors-chart"
      :key="chartKey"
      :options="options"
      :chartData="chartData"
    ></pie-chart>
  </v-card>
</template>

<script>
import PieChart from '../baseCharts/PieChart.vue';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * beforeDestroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('minors-update');
  this.$refs.pieChart.destroyChart();
} //beforeDestroy

/**
 * mounted lifecycle hook
 */
async function mounted() {
  // emit comes from HighestDegreeChart.vue when a pie slice is clicked
  window.EventBus.$on('minors-update', async (receiveMinors) => {
    this.quantities = [];
    this.labels = [];
    this.dataReceived = false;
    this.degree = receiveMinors.degree;
    this.minors = receiveMinors.minors;
    await this.fetchData(this.minors);
    await this.fillData();
  });
} // mounted

/**
 * created lifecycle hook
 */
async function created() {
  await this.fetchData(null);
  await this.fillData();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all the minor data.
 * @param majors The array of minors for a degree
 */
function fetchData(minors) {
  if (minors) {
    if (_.isEmpty(minors)) {
      this.text = `There are no minors for an education of ${this.degree}`;
      this.quantities.push(1);
      this.enabled = false;
      this.colors = ['grey'];
    } else {
      this.enabled = true;
      const sortable = Object.entries(minors)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

      for (let i = 0; i < 10; i++) {
        let minor = Object.keys(sortable)[i];
        if (minor) {
          this.quantities.push(sortable[minor]);
          this.labels.push(minor);
        }
      }
      this.text = `Top ${this.degree} Degree Minors`;
      this.colors = [
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
      this.text = 'There are no minors for this type of education';
    } else {
      this.text = 'Click on an Education To See Minors';
    }
    this.quantities.push(1);
    this.enabled = false;
    this.colors = ['grey'];
  }
} //fetchData

/**
 * Sets the chart formatting and options data.
 */
function fillData() {
  this.chartData = {
    labels: this.labels,
    datasets: [
      {
        data: this.quantities,
        backgroundColor: this.colors
      }
    ]
  };
  this.options = {
    plugins: {
      title: {
        display: true,
        text: this.text,
        font: {
          size: 15
        }
      },
      tooltip: {
        enabled: this.enabled
      }
    },
    maintainAspectRatio: false
  };
  this.chartKey++; // rerenders the chart
  this.dataReceived = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { PieChart },
  data() {
    return {
      options: null,
      chartData: null,
      minors: null,
      dataReceived: false,
      degree: null,
      chartKey: 0,
      text: '',
      colors: [],
      enabled: false,
      labels: [],
      quantities: []
    };
  },
  methods: { fetchData, fillData },
  mounted,
  created,
  beforeDestroy
};
</script>
