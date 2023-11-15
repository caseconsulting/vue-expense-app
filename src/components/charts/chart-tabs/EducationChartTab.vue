<template>
  <v-container class="px-1 px-md-4">
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
import HighestDegreeChart from '../custom-charts/HighestDegreeChart.vue';
import MajorsChart from '../custom-charts/MajorsChart.vue';
import MinorsChart from '../custom-charts/MinorsChart.vue';
import ConcentrationsChart from '../custom-charts/ConcentrationsChart.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { HighestDegreeChart, MajorsChart, MinorsChart, ConcentrationsChart }
};
</script>
