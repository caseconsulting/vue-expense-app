<template>
  <canvas :id="chartId" width="400" height="300"></canvas>
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
    type: 'bar',
    data: this.chartData,
    options: { ...this.options, responsive: false }
  });

  if (this.options.myFunctions) {
    canvas.onclick = (e) => {
      let points = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
      if (points.length) {
        let firstPoint = points[0];
        this.options.myFunctions[firstPoint.index]();
      } else {
        this.options.myFunctions[this.options.myFunctions.length - 1]();
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
