<template>
  <v-container>
    <v-row justify="center">
      <v-col md="6" sm="12" class="mt-4">
        <certification-chart />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CertificationChart from '../customCharts/CertificationChart.vue';

export default {
  components: { CertificationChart }
};
</script>
