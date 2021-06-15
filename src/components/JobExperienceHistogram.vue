<script>
import { Bar, mixins } from 'vue-chartjs';

export default {
  extends: Bar,
  mixins: [mixins.reactiveProp],
  mounted() {
    this.renderChart(this.charData, this.options);
  },
  props: [
    'chartData', // chart data to render
    'options' // chart options
  ]
};
</script>
