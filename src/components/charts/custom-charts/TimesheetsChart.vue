<template>
  <div :key="updateKey">
    <doughnut-chart
      v-if="dataReceived"
      ref="doughnutChart"
      chartId="timesheets-chart"
      :options="options"
      :chartData="chartData"
    >
      <div name="middle-text">
        <div
          class="pointer"
          @click="
            showCustomCompletedInput = true;
            customCompletedInput = completed;
          "
        >
          <div v-if="!showCustomCompletedInput" class="divider pb-1 font-weight-medium">{{ completed }}h</div>
          <v-text-field
            v-else
            v-model="customCompletedInput"
            autofocus
            type="text"
            variant="outlined"
            class="divider ma-0 pa-1 custom-input"
            hide-details
            @keydown.enter="showCustomCompletedInput = false"
            @blur="showCustomCompletedInput = false"
          ></v-text-field>
        </div>
        <div
          class="pointer"
          @click="
            showCustomNeededInput = true;
            customNeededInput = needed;
          "
        >
          <div v-if="!showCustomNeededInput" class="pt-1 font-weight-medium">{{ needed }}h</div>
          <v-text-field
            v-else
            v-model="customNeededInput"
            autofocus
            type="text"
            variant="outlined"
            class="ma-0 pa-1 custom-input"
            hide-details
            @keydown.enter="showCustomNeededInput = false"
            @blur="showCustomNeededInput = false"
          ></v-text-field>
        </div>
      </div>
    </doughnut-chart>
    <div v-else class="d-flex justify-center align-center mt-15">Error loading chart data...</div>
  </div>
</template>

<script setup>
import DoughnutChart from '@/components/charts/base-charts/DoughnutChart.vue';
import { inject, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { formatNumber } from '@/utils/utils.js';
import _map from 'lodash/map';
import _pickBy from 'lodash/pickBy';
import _sum from 'lodash/sum';
import _slice from 'lodash/slice';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['jobcodes', 'nonBillables', 'title']);
const emitter = inject('emitter');

const completed = ref(0);
const needed = ref(0);
const remainingHours = ref(0);
const updateKey = ref(0);
const options = ref(null);
const customCompletedInput = ref(null);
const customNeededInput = ref(null);
const showCustomCompletedInput = ref(null);
const showCustomNeededInput = ref(null);
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
  let jobcodes = _pickBy(
    props.jobcodes,
    (value, key) => !props.nonBillables?.includes(key) && (value.title == props.title || value.title == null)
  );
  let jobCodeValues = _map(Object.values(jobcodes), (duration) => {
    return formatNumber(Number((duration.duration ?? duration) / 60 / 60));
  }); // removes decimals if a whole number

  let jobCodeValuesSum = _sum(_map(jobCodeValues, (v) => Number(v)));
  // user inputted custom data
  let difference = Number(completed.value) - jobCodeValuesSum;
  if (difference > 0) {
    jobcodes['Custom Input'] = difference * 60 * 60;
    jobCodeValues?.push(formatNumber(difference));
  }

  for (let i = 0; i < jobCodeValues?.length / colorsOptions.length; i++) {
    colors = [...colors, ...colorsOptions];
  }

  colors = _slice(colors, 0, jobCodeValues?.length);
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

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => [showCustomCompletedInput.value, showCustomNeededInput.value],
  async () => {
    if (!showCustomCompletedInput.value && !showCustomNeededInput.value) {
      let customCompleted, customNeeded;
      // evaluate custom input as expressions
      try {
        customCompleted = eval(customCompletedInput.value);
      } catch (err) {
        customCompleted = completed.value;
      }
      try {
        customNeeded = eval(customNeededInput.value);
      } catch (err) {
        customNeeded = needed.value;
      }
      // emit to TimePeriodDetails if input has changed
      if (customCompleted && !isNaN(customCompleted) && !isNaN(parseFloat(customCompleted))) {
        completed.value = customCompleted;
        emitter.emit('update-time-data-completed', completed.value);
      }
      if (customNeeded && !isNaN(customNeeded) && !isNaN(parseFloat(customNeeded))) {
        needed.value = customNeeded;
        emitter.emit('update-time-data-needed', needed.value);
      }
      // update chart with custom input
      remainingHours.value = needed.value - completed.value;
      await fillData();
      updateKey.value++;
    }
  }
);
</script>

<style>
.custom-input input {
  padding: 5px 10px 3px 9px;
  width: 78px;
  height: 10px;
  min-height: 25px;
  font-size: 12px;
}
</style>

<style scoped>
.divider {
  border-bottom: 1px solid rgb(28, 28, 28);
}
</style>
