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
    setTimeout(() => {
      this.renderChart(this.chartData, this.options);
    }, 0);
    //this.renderChart(this.chartData, this.options);
  },
  props: [
    'chartData', // chart data to render
    'options' // chart options
  ],
  watch: {
    //used to update chart if any changes made to options
    options() {
      this.renderChart(this.chartData, this.options);
    }
  }
};
</script>
