<script>
import { Pie, mixins } from 'vue-chartjs';

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
// |                     WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for options - re-render chart
 */
function watchOptions() {
  this.renderChart(this.chartData, this.options);
} // watchOptions

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  extends: Pie,
  mixins: [mixins.reactiveProp],
  mounted,
  props: [
    'chartData', // chart data to render
    'options' // chart options
  ],
  watch: {
    //used to update chart if any changes made to options
    options: watchOptions
  }
};
</script>
