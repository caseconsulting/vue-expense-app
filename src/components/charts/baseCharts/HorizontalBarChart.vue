<script>
import { HorizontalBar, mixins } from 'vue-chartjs';

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
 * watcher for options - re-render chart
 */
function watchOptions() {
  // If options change, re-render chart
  this.renderChart(this.chartData, this.options);
} // watchOptions

export default {
  extends: HorizontalBar,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options'],
  mounted,
  watch: {
    options: watchOptions
  }
};
</script>
