<template>
  <div class="chart-wrapper">
    <canvas :id="chartId"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
function mounted() {
  const canvas = document.getElementById(this.chartId);
  const ctx = canvas.getContext('2d');
  this.chart = new Chart(ctx, {
    type: 'bar',
    data: this.chartData,
    options: { ...this.options, responsive: true }
  });
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Destroys the instance of the current chart.
 */
function destroyChart() {
  this.chart.destroy();
} // destroyChart

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  mounted,
  props: [
    'chartData', // chart data to render
    'options', // chart options
    'chartId' // id for the canvas
  ],
  methods: {
    destroyChart
  },
  data() {
    return {
      chart: null
    };
  }
};
</script>
