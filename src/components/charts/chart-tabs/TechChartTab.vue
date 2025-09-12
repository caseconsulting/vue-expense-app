<template>
  <v-container fluid class="mt-0 px-1 px-md-4">
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

<script setup>
import { onMounted, ref, watch } from 'vue';
import _forEach from 'lodash/forEach';
import TechBarChart from '../custom-charts/TechBarChart.vue';
import VueWordCloud from 'vuewordcloud';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const colors = ['#bc3825', '#415364', '#7F4645'];
const employees = ref(null);
const router = useRouter();
const store = useStore();
const technologies = ref({});
const words = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook. Gets items then organizes them and fills data.
 */
onMounted(() => {
  if (store.getters.storeIsPopulated) {
    parseEmployeeData();
  }
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Parse through employee data to get technologies.
 */
function parseEmployeeData() {
  employees.value = store.getters.employees;
  //Put into dictionary where key is tech type and value is quantity
  employees.value.forEach((employee) => {
    if (employee.technologies && employee.workStatus != 0) {
      employee.technologies.forEach((currTech) => {
        // **** ALL TECH ****
        if (!technologies.value[currTech.name]) {
          technologies.value[currTech.name] = 1;
        } else {
          technologies.value[currTech.name] += 1;
        }
      });
    }
  });

  technologies.value = _forEach(technologies.value, (value, key) => {
    if (value > 1) {
      words.value.push([key, value]);
    }
  });
} // parseEmployeeData

/**
 * Redirects to the reports page with a filter of the word clicked on.
 *
 * @param word String - The word clicked on
 */
function wordClicked(word) {
  localStorage.setItem(
    'requestedFilter',
    JSON.stringify({ tab: 'technologies', search: word })
  );
  router.push({
    path: '/reports',
    name: 'reports'
  });
} // wordClicked

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => store.getters.storeIsPopulated,
  () => {
    parseEmployeeData;
  }
);
</script>
