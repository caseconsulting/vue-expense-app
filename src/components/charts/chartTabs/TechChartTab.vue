<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col xl="6" lg="8" sm="12" class="mt-4">
        <tech-bar-chart></tech-bar-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TechBarChart from '../customCharts/TechBarChart.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { TechBarChart }
};
</script>
