<template>
  <v-container fluid class="px-1 px-md-4">
    <v-row justify="center">
      <v-col xl="6" lg="8" sm="12" class="mt-4">
        <certification-chart />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import CertificationChart from '../custom-charts/CertificationChart.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { CertificationChart }
};
</script>
