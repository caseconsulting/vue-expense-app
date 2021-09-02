<template>
  <v-container>
    <v-row justify="center">
      <v-col xl="6" lg="8" sm="12" class="mt-4">
        <certification-chart />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CertificationChart from '../customCharts/CertificationChart.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { CertificationChart }
};
</script>
