<script>
import { Bar, mixins } from 'vue-chartjs';

/**
 * mounted lifecycle hook
 */
function mounted() {
  this.renderChart(this.chartData, this.options);
} // mounted

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
    options() {
      // If options change, re-render chart
      this.renderChart(this.chartData, this.options);
    }
  }
};
</script>
