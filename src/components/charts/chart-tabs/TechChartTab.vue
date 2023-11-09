<template>
  <v-container fluid class="mt-0">
    <v-row justify="center" class="pt-0">
      <v-col xl="6" lg="6" md="6" sm="12" class="d-flex flex-column align-center justify-center">
        <span style="font-style: italic; font-size: 12px">*Click on a word to see employees</span>
        <vue-word-cloud
          style="height: 25vh; width: inherit"
          :words="words"
          :color="([, weight]) => (weight > 20 ? colors[0] : weight > 10 ? colors[1] : colors[2])"
          font-family="Avenir, Helvetica, Ariel, sans-serif"
          :spacing="0.7"
          :font-size-ratio="0.2"
        >
          <template v-slot="props">
            <div @click="wordClicked(props.text)" style="cursor: pointer">
              <v-tooltip activator="parent" location="top">
                <span style="text-align: center">{{ props.weight }}</span>
              </v-tooltip>
              {{ props.text }}
            </div>
          </template>
        </vue-word-cloud>
      </v-col>
      <v-col xl="6" lg="6" md="6" sm="12" class="mt-4">
        <tech-bar-chart></tech-bar-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _ from 'lodash';
import TechBarChart from '../custom-charts/TechBarChart.vue';
import VueWordCloud from 'vuewordcloud';
import { storeIsPopulated } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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

/**
 * Redirects to the reports page with a filter of the word clicked on.
 *
 * @param word String - The word clicked on
 */
function wordClicked(word) {
  localStorage.setItem('requestedDataType', 'technologies');
  localStorage.setItem('requestedFilter', word);
  this.$router.push({
    path: '/reports',
    name: 'reports'
  });
} // wordClicked

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
      colors: ['#bc3825', '#415364', '#7F4645'],
      employees: null,
      technologies: {},
      words: []
    };
  },
  methods: {
    parseEmployeeData,
    wordClicked
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
