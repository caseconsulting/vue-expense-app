<script>
import { HorizontalBar, mixins } from 'vue-chartjs';

/**
 * mounted lifecycle hook
 */
function mounted() {
  this.renderChart(this.chartData, this.options);
} // mounted

export default {
  extends: HorizontalBar,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options'],
  mounted,
  watch: {
    options() {
      // If options change, re-render chart
      this.renderChart(this.chartData, this.options);
    }
  }
};
</script>
