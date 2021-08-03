<template>
  <v-container>
    <v-row class="my-4">
      <v-col md="6" sm="12">
        <highest-degree-chart></highest-degree-chart>
      </v-col>
      <v-col md="6" sm="12">
        <majors-chart></majors-chart>
      </v-col>
      <v-col md="6" sm="12">
        <minors-chart></minors-chart>
      </v-col>
      <v-col md="6" sm="12">
        <concentrations-chart></concentrations-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import HighestDegreeChart from '../customCharts/HighestDegreeChart.vue';
import MajorsChart from '../customCharts/MajorsChart.vue';
import MinorsChart from '../customCharts/MinorsChart.vue';
import ConcentrationsChart from '../customCharts/ConcentrationsChart.vue';

export default {
  components: { HighestDegreeChart, MajorsChart, MinorsChart, ConcentrationsChart }
};
</script>
