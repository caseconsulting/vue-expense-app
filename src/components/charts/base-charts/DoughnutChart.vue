<template>
  <div class="donut-chart-wrapper">
    <canvas :id="chartId"></canvas>
    <div class="middle-text">
      <slot slot="middle-text"></slot>
    </div>
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
    type: 'doughnut',
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

<style>
.donut-chart-wrapper {
  width: 100%;
  height: 135px !important;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.middle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
</style>
