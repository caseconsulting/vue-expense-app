<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart ref="chart" :key="chartKey" chartId="majors-chart" :options="options" :chartData="chartData"></pie-chart>
  </v-card>
</template>

<script>
import PieChart from '../baseCharts/PieChart.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
async function mounted() {
  // emit comes from HighestDegreeChart when a pie slice is clicked
  await window.EventBus.$on('majors-update', async (receiveMajors) => {
    this.quantities = [];
    this.labels = [];
    this.dataReceived = false;
    let majors = receiveMajors.majors;
    this.degree = receiveMajors.degree;
    await this.fetchData(majors);
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

/**
 * beforeDestroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('majors-update');
  this.$refs.chart.destroyChart();
} //beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all the major data.
 * @param majors The array of majors for a degree
 */
function fetchData(majors) {
  if (majors) {
    this.enabled = true;
    const sortable = Object.entries(majors)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    for (let i = 0; i < 10; i++) {
      let major = Object.keys(sortable)[i];
      if (major) {
        this.quantities.push(sortable[major]);
        this.labels.push(major);
      }
    }
    this.text = `Top ${this.degree} Degree Majors`;
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
  } else {
    //these presets are when a degree has not been selected
    this.quantities.push(1);
    this.enabled = false;
    this.text = `Click on a Degree To See the Top Majors`;
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
      majors: null,
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
  methods: {
    fetchData,
    fillData
  },
  mounted,
  created,
  beforeDestroy
};
</script>
