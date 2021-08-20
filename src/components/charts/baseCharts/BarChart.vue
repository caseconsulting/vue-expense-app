<script>
import { Bar, mixins } from 'vue-chartjs';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  extends: Bar,
  mixins: [mixins.reactiveProp],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
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
