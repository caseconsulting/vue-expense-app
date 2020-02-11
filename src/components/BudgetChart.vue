<script>
import { Bar, mixins } from 'vue-chartjs';

export default {
  extends: Bar,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options'],
  categoryPercentage: 0.5, // chart.js 3.x
  barPercentage: 1, // chart.js 3.x
  mounted() {
    this.renderChart(this.chartData, this.options);
  }
};
</script>
