<template>
  <v-container>
    <v-row>
      <v-col md="6" sm="12">
        <tech-bar-chart></tech-bar-chart>
      </v-col>
      <v-col md="6" sm="12">
        <tech-bar-chart></tech-bar-chart>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" sm="12">
        <tech-bar-chart></tech-bar-chart>
      </v-col>
      <v-col md="6" sm="12">
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
