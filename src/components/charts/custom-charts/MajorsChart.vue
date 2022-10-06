<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart ref="chart" :key="chartKey" chartId="majors-chart" :options="options" :chartData="chartData"></pie-chart>
  </v-card>
</template>

<script>
import PieChart from '../base-charts/PieChart.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
async function mounted() {
  // emit comes from HighestDegreeChart when a pie slice is clicked
  await window.EventBus.$on('majors-update', async (receiveData, title) => {
    this.quantities = [];
    this.labels = [];
    this.dataReceived = false;
    let majorsOrSchools = receiveData.majorsOrSchools;
    this.eduKind = receiveData.eduKind;

    await this.fetchData(majorsOrSchools);
    await this.fillData(title);
  });
} // mounted

/**
 * Created lifecycle hook
 */
async function created() {
  await this.fetchData(null);
  await this.fillData();
} // created

/**
 * Before destroy lifecycle hook.
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
 * Gets all the major/school data.
 *
 * @param majorsOrSchools The array of majors/schools for an education kind
 */
function fetchData(majorsOrSchools) {
  if (majorsOrSchools) {
    this.enabled = true;
    const sortable = Object.entries(majorsOrSchools)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    for (let i = 0; i < 10; i++) {
      let majorOrSchool = Object.keys(sortable)[i];
      if (majorOrSchool) {
        this.quantities.push(sortable[majorOrSchool]);
        this.labels.push(majorOrSchool);
      }
    }
    this.text = `Top ${this.eduKind} Degree Majors`;
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
    // these presets are when an education has not been selected
    this.quantities.push(1);
    this.enabled = false;
    this.text = `Click on an Education To See the Top Majors/Schools`;
    this.colors = ['grey'];
  }
} // fetchData

/**
 * Sets the chart formatting and options data.
 *
 * @param title the title to display if there is one
 */
function fillData(title) {
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
        text: title ? title : this.text,
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
      majorsOrSchools: null,
      dataReceived: false,
      kind: null,
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
