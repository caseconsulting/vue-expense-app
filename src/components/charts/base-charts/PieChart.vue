<template>
  <div class="chart-wrapper">
    <canvas :id="chartId"></canvas>
  </div>
</template>

<script setup>
import { onMounted, defineProps, ref } from 'vue';
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
    type: 'pie',
    data: props.chartData,
    options: { ...props.options, responsive: true }
  });
}); // mounted
</script>

<style>
.chart-wrapper {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
