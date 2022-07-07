<script>
import { Pie } from 'vue-chartjs/legacy';
import 'chart.js/auto';
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
function mounted() {
  setTimeout(() => {
    this.renderChart(this.chartData, this.options);
  }, 0);
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  extends: Pie,
  mounted,
  props: [
    'chartData', // chart data to render
    'options' // chart options
  ]
};
</script>
