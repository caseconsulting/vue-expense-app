<template>
  <div>
    <doughnut-chart
      v-if="dataReceived"
      ref="doughnutChart"
      chartId="timesheets-chart"
      :options="options"
      :chartData="chartData"
    >
      <div name="middle-text">
        <div class="divider pb-1 font-weight-medium">{{ completed }}h</div>
        <div class="pt-1 font-weight-medium">{{ needed }}h</div>
      </div>
    </doughnut-chart>
  </div>
</template>

<script>
import DoughnutChart from '../base-charts/DoughnutChart.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
async function mounted() {
  await this.fetchData();
  await this.fillData();
  this.dataReceived = true;
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Extracts the job role from each employee and tallies up
 * each role for active employees.
 */
function fetchData() {} // fetchData

/**
 * Sets the chart formatting and options data.
 */
function fillData() {
  let colors = ['#1A237E', '#5C6BC0', '#9FA8DA', '#EAEAEA'];

  this.chartData = {
    labels: ['Case Portal/Expens...', 'R&D - Delphi', 'Holiday', 'Remaining'],
    datasets: [
      {
        data: [100, 22, 8, 38],
        backgroundColor: colors,
        borderWidth: 2
      }
    ]
  };

  this.options = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        displayColors: false
      }
    }
  };
  this.dataReceived = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { DoughnutChart },
  data() {
    return {
      options: null,
      chartData: null,
      dataReceived: false
    };
  },
  methods: { fetchData, fillData },
  mounted,
  props: ['completed', 'needed']
};
</script>

<style scoped>
.divider {
  border-bottom: 1px solid rgb(28, 28, 28);
}
</style>
