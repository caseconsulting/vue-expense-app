<template>
  <v-container fluid>
    <v-row justify="center" class="pt-2">
      <v-col xl="6" lg="8" sm="12">
        <vue-word-cloud
          style="height: 25vh; width: inherit"
          :words="words"
          :color="([, weight]) => (weight > 20 ? colors[0] : weight > 10 ? colors[1] : colors[2])"
          font-family="Avenir, Helvetica, Ariel, sans-serif"
          :spacing="0.7"
          :font-size-ratio="0.2"
        >
          <template v-slot="props">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <div style="cursor: pointer" v-on="on">{{ props.text }}</div>
              </template>
              <div style="text-align: center">{{ props.weight }}</div>
            </v-tooltip>
          </template>
        </vue-word-cloud>
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
import TechBarChart from '../custom-charts/TechBarChart.vue';
import VueWordCloud from 'vuewordcloud';
import { storeIsPopulated } from '@/utils/utils';

/**
 * Parse through employee data to get technologies.
 */
function parseEmployeeData() {
  this.employees = this.$store.getters.employees;
  //Put into dictionary where key is tech type and value is quantity
  this.employees.forEach((employee) => {
    if (employee.technologies && employee.workStatus != 0) {
      employee.technologies.forEach((currTech) => {
        // **** ALL TECH ****
        if (!this.technologies[currTech.name]) {
          this.technologies[currTech.name] = 1;
        } else {
          this.technologies[currTech.name] += 1;
        }
      });
    }
  });

  this.technologies = _.forEach(this.technologies, (value, key) => {
    if (value > 1) {
      this.words.push([key, value]);
    }
  });
} // parseEmployeeData

// |--------------------------------------------------|
// |                                                  |
// |                  LIFECYCLE HOOKS                 |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook. Gets items then organizes them and fills data.
 */
function mounted() {
  if (this.storeIsPopulated) {
    this.parseEmployeeData();
  }
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    TechBarChart,
    [VueWordCloud.name]: VueWordCloud
  },
  computed: {
    storeIsPopulated
  },
  data() {
    return {
      colors: ['rgba(254, 147, 140, 1)', 'rgba(230, 184, 156, 1)', 'rgba(66, 129, 164, 1)'],
      employees: null,
      technologies: {},
      words: []
    };
  },
  methods: {
    parseEmployeeData
  },
  mounted,
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) {
        this.parseEmployeeData();
      }
    }
  }
};
</script>
