<script>
import { HorizontalBar, mixins } from 'vue-chartjs';

export default {
  extends: HorizontalBar,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options', 'chartType'],
  mounted() {
    this.renderChart(this.chartData, this.options);
    if (this.chartType == 'tech') {
      window.EventBus.$on(`updateChart-${this.chartType}`, (options) => {
        this.renderChart(this.chartData, options);
      });
    }
  }
};
</script>
