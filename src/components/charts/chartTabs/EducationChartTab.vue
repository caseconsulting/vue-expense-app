<template>
  <v-container>
    <v-row>
      <highest-degree-chart></highest-degree-chart>
    </v-row>
    <v-row>
      <highest-degree-chart></highest-degree-chart>
    </v-row>
  </v-container>
</template>

<script>
import HighestDegreeChart from '../customCharts/HighestDegreeChart.vue';

export default {
  components: { HighestDegreeChart }
};
</script>
