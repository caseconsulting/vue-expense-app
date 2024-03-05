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
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
async function mounted() {
  await this.fillData();
  this.dataReceived = true;

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
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sets the chart formatting and options data.
 */
function fillData() {
  let colors = ['#1A237E', '#5C6BC0', '#9FA8DA'];
  let colorsOptions = ['#1A237E', '#5C6BC0', '#9FA8DA'];
  // remove pto jobcodes from chart for yearly data
  let jobcodes = _.pickBy(this.jobcodes, (value, key) => !this.nonBillables?.includes(key));
  let jobCodeValues = _.map(Object.values(jobcodes), (duration) => {
    return Number(duration / 60 / 60)
      ?.toFixed(2)
      ?.replace(/[.,]00$/, '');
  }); // removes decimals if a whole number

  for (let i = 0; i < jobCodeValues?.length / colorsOptions.length; i++) {
    colors = [...colors, ...colorsOptions];
  }
  colors = _.slice(colors, 0, jobCodeValues?.length);
  colors.push('#EAEAEA'); // push grey for remaining hours

  this.chartData = {
    labels: [...Object.keys(jobcodes || []), 'Remaining'],
    datasets: [
      {
        data: [...jobCodeValues, this.remainingHours >= 0 ? this.remainingHours : 0],
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
      const title = tooltipModel.title[0] || '';
      const value = tooltipModel.dataPoints[0].raw;
      tooltipEl.innerHTML = `
        <p class='ma-0 font-weight-bold'>${title}</p>
        <p class='ma-0'>${value}</p>
      `;
    }

    // Set position
    const position = context.chart.canvas.getBoundingClientRect();
    tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
    tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretX + 'px';
  } // externalTooltipHandler

  this.options = {
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
  methods: { fillData },
  mounted,
  props: ['completed', 'needed', 'jobcodes', 'nonBillables', 'remainingHours']
};
</script>

<style scoped>
.divider {
  border-bottom: 1px solid rgb(28, 28, 28);
}
</style>