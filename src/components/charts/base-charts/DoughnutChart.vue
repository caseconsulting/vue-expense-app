<template>
  <div class="donut-chart-wrapper">
    <canvas :id="chartId"></canvas>
    <div class="middle-text">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';
// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const chart = ref(null);
const props = defineProps([
  'chartData', // chart data to render
  'options', // chart options
  'chartId' // id for the canvas
]);

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
onMounted(() => {
  const canvas = document.getElementById(props.chartId);
  const ctx = canvas.getContext('2d');
  chart.value = new Chart(ctx, {
    type: 'doughnut',
    data: props.chartData,
    options: { ...props.options, responsive: true }
  });
}); // mounted
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
