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
  const myChart = new Chart(ctx, {
    type: 'pie',
    data: this.chartData,
    options: { ...this.options, responsive: true }
  });

  if (this.options.myFunctions) {
    canvas.onclick = (e) => {
      let points = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
      if (points.length) {
        let firstPoint = points[0];
        this.options.myFunctions[firstPoint.index]();
      }
    };
  }
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

<style>
.chart-wrapper {
  width: 80%;
  height: 400px;
  margin: 0 auto;
}
</style>
