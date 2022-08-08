<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart
      ref="pieChart"
      chartId="concentrations-chart"
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
 * mounted lifecycle hook
 */
async function mounted() {
  // emit comes from HighestDegreeChart.vue when a pie slice is clicked
  await window.EventBus.$on('concentrations-update', async (receiveConcentrations) => {
    this.quantities = [];
    this.labels = [];
    this.dataReceived = false;
    this.degree = receiveConcentrations.degree;
    this.concentrations = receiveConcentrations.concentrations;
    await this.fetchData(this.concentrations);
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
  window.EventBus.$off('concentrations-update');
  this.$refs.pieChart.destroyChart();
} //beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all the major data.
 * @param concentations - An array of the highest degree concentrations
 */
function fetchData(concentrations) {
  if (concentrations) {
    if (_.isEmpty(concentrations)) {
      this.text = `There are no concentrations for a degree of ${this.degree}`;
      this.quantities.push(1);
      this.enabled = false;
      this.colors = ['grey'];
    } else {
      this.text = `${this.degree} Degree Concentrations`;
      this.enabled = true;
      const sortable = Object.entries(concentrations)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

      for (let i = 0; i < 10; i++) {
        let con = Object.keys(sortable)[i];
        if (con) {
          this.quantities.push(sortable[con]);
          this.labels.push(con);
        }
      }
      console.log(this.quantities);
      console.log(this.labels);
      this.text = `Top ${this.degree} Degree Concentrations`;
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
    //these presets are when a degree has not been selected OR if there are no concentrations
    if (!_.isEmpty(concentrations)) {
      this.text = 'There are no concentrations for this type of degree';
    } else {
      this.text = 'Click on a Degree To See Concentrations';
    }
    this.quantities.push(1);
    this.enabled = false;
    this.colors = ['grey'];
  }
} //fetchData

/**
 * Sets up the formatting and data options for the chart.
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
      concentrations: null,
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
