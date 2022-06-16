<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col xl="6" lg="8" sm="12">
        <vue-word-cloud
          style="height: 280px; width: 640px"
          :words="words"
          :color="([, weight]) => (weight > 10 ? 'red' : weight > 5 ? 'blue' : 'grey')"
          font-family="Roboto"
        />
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col xl="6" lg="8" sm="12" class="mt-4">
        <tech-bar-chart></tech-bar-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script type="application/javascript" src="https://unpkg.com/vue"></script>
<script type="application/javascript" src="https://unpkg.com/vuewordcloud"></script>

<script>
import TechBarChart from '../customCharts/TechBarChart.vue';
import VueWordCloud from 'vuewordcloud';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { TechBarChart, [VueWordCloud.name]: VueWordCloud },
  data() {
    return {
      words: [
        ['romance', 19],
        ['horror', 3],
        ['fantasy', 7],
        ['adventure', 3]
      ]
    };
  }
};
</script>
