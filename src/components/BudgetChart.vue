<script>
import { Bar, mixins } from 'vue-chartjs';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  barPercentage: 1, // chart.js 3.x
  categoryPercentage: 0.5, // chart.js 3.x
  extends: Bar,
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
