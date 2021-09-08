<script>
import { Pie, mixins } from 'vue-chartjs';

/**
 * mounted lifecycle hook
 */
function mounted() {
  setTimeout(() => {
    this.renderChart(this.chartData, this.options);
  }, 0);
  //this.renderChart(this.chartData, this.options);
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  extends: Pie,
  mixins: [mixins.reactiveProp],
  mounted,
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
