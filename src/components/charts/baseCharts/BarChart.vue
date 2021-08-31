<script>
import { Bar, mixins } from 'vue-chartjs';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
function mounted() {
  this.renderChart(this.chartData, this.options);
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watch for options - re-render
 */
function watchOptions() {
  // If options change, re-render chart
  this.renderChart(this.chartData, this.options);
} // watchOptions

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  extends: Bar,
  mixins: [mixins.reactiveProp],
  mounted,
  props: [
    'chartData', // chart data to render
    'options' // chart options
  ],
  watch: {
    options: watchOptions
  }
};
</script>
