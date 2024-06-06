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
    <div v-else class="d-flex justify-center align-center mt-15">Error loading chart data...</div>
  </div>
</template>

<script setup>
import DoughnutChart from '@/components/charts/base-charts/DoughnutChart.vue';
import { inject, ref, onMounted, onBeforeUnmount } from 'vue';
import { formatNumber } from '@/utils/utils.js';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['jobcodes', 'nonBillables']);
const emitter = inject('emitter');

const completed = ref(0);
const needed = ref(0);
const remainingHours = ref(0);
const options = ref(null);
const chartData = ref(null);
const dataReceived = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * The Before Unmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('timesheets-chart-data');
}); // beforeUnmount

/**
 * Mounted lifecycle hook.
 */
onMounted(async () => {
  emitter.on('timesheets-chart-data', async ({ completed: c, needed: n, remainingHours: r }) => {
    completed.value = c;
    needed.value = n;
    remainingHours.value = r;
    await fillData();
    dataReceived.value = true;
  });

  // create tooltip
  let tooltipEl = document.createElement('div');
  tooltipEl.id = 'chartjs-tooltip';
  // set fade in/out animation
  tooltipEl.style.transition = `all 0.15s ease-in-out`;
  tooltipEl.style.opacity = 0;
  // Set manual styling
  tooltipEl.style.position = 'fixed';
  tooltipEl.style.pointerEvents = 'none';
  tooltipEl.style.color = '#EEEEEE';
  tooltipEl.style.backgroundColor = '#424242';
  tooltipEl.style.borderRadius = '0.4em';
  tooltipEl.style.fontSize = '0.9em';
  // Set vuetify class styling
  tooltipEl.classList.add('px-4', 'py-2');
  document.body.appendChild(tooltipEl);
}); // onMounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sets the chart formatting and options data.
 */
async function fillData() {
  let colors = ['#1A237E', '#5C6BC0', '#9FA8DA'];
  let colorsOptions = ['#1A237E', '#5C6BC0', '#9FA8DA'];
  // remove pto jobcodes from chart for yearly data
  let jobcodes = _.pickBy(props.jobcodes, (value, key) => !props.nonBillables?.includes(key));
  let jobCodeValues = _.map(Object.values(jobcodes), (duration) => {
    return formatNumber(Number(duration / 60 / 60));
  }); // removes decimals if a whole number

  for (let i = 0; i < jobCodeValues?.length / colorsOptions.length; i++) {
    colors = [...colors, ...colorsOptions];
  }
  colors = _.slice(colors, 0, jobCodeValues?.length);
  colors.push('#EAEAEA'); // push grey for remaining hours

  chartData.value = {
    labels: [...Object.keys(jobcodes || []), 'Remaining'],
    datasets: [
      {
        data: [...jobCodeValues, remainingHours.value >= 0 ? remainingHours.value : 0],
        backgroundColor: colors,
        borderWidth: 2
      }
    ]
  };

  // external tooltip helper function
  function externalTooltipHandler(context) {
    // Tooltip Element in HTML and model from ChartJS
    let tooltipEl = document.getElementById('chartjs-tooltip');
    const tooltipModel = context.tooltip;

    // Hide/show tooltip
    if (tooltipModel.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    } else {
      tooltipEl.style.opacity = 1;
    }

    // Set text
    if (tooltipModel.body) {
      let title = tooltipModel.title[0] || '';
      let value = tooltipModel.dataPoints[0].raw;
      value = formatNumber(Number(value));
      tooltipEl.innerHTML = `
        <p class='ma-0 font-weight-bold'>${title}</p>
        <p class='ma-0'>${value}</p>
      `;
    }

    // Set position
    const position = context.chart.canvas.getBoundingClientRect();
    tooltipEl.style.left = position.left + tooltipModel.caretX + 'px';
    tooltipEl.style.top = position.top + tooltipModel.caretY + 'px';
  } // externalTooltipHandler

  options.value = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        displayColors: false,
        enabled: false,
        position: 'nearest',
        external: externalTooltipHandler
      }
    },
    maintainAspectRatio: false
  };
  dataReceived.value = true;
} // fillData
</script>

<style scoped>
.divider {
  border-bottom: 1px solid rgb(28, 28, 28);
}
</style>
