<script>
import { Pie, mixins } from 'vue-chartjs';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  extends: Pie,
  mixins: [mixins.reactiveProp],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
  props: [
    'chartData', // chart data to render
    'options' // chart options
  ]
};
</script>
