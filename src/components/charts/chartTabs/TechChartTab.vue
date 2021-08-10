<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col class="mt-4">
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
