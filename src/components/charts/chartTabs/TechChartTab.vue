<template>
  <v-container>
    <v-row>
      <v-col md="6" sm="12" class="mt-4">
        <tech-bar-chart></tech-bar-chart>
      </v-col>
      <v-col md="6" sm="12" class="mt-4">
        <tech-bar-chart></tech-bar-chart>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" sm="12" class="mt-4">
        <tech-bar-chart></tech-bar-chart>
      </v-col>
      <v-col md="6" sm="12" class="my-4">
        <tech-bar-chart></tech-bar-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TechBarChart from '../customCharts/TechBarChart.vue';
export default {
  components: { TechBarChart }
};
</script>
