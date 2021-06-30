<template>
  <v-container>
    <v-row>
      <v-col md="6" sm="12">
        <certification-chart></certification-chart>
      </v-col>
      <v-col md="6" sm="12">
        <Ic-Chart></Ic-Chart>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" sm="12">
        <certification-chart></certification-chart>
      </v-col>
      <v-col md="6" sm="12">
        <Ic-Chart></Ic-Chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CertificationChart from '../customCharts/CertificationChart.vue';
import IcChart from '../customCharts/ICChart.vue';

export default {
  components: { CertificationChart, IcChart }
};
</script>
