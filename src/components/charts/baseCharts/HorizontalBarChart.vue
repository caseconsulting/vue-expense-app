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
  setTimeout(() => {
    this.renderChart(this.chartData, this.options);
  }, 0);
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for options - re-render chart
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
  extends: HorizontalBar,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options'],
  mounted,
  watch: {
    options: watchOptions
  }
};
</script>
