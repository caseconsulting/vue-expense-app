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
 * mounted lifecycle hook
 */
function mounted() {
  const canvas = document.getElementById(this.chartId);
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: this.chartData,
    options: { ...this.options, responsive: true }
  });
} // mounted

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
  ]
};
</script>
