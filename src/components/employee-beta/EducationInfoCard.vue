<template>
  <div class="eduTab">
    <base-card title="Education">
      <v-card-text v-if="isEmpty(showableList)">
        <p>No Education to display</p>
      </v-card-text>
      <v-card-text v-else>
        <v-list-item v-for="(edu, index) in showableList" :key="edu + index">
          <!-- START UNIVERSITY SECTION -->
          <div class="ml-4" v-if="edu.type === 'university'">
            <v-list-item-title class="d-flex align-center">
              <v-icon class="mx-3">mdi-school-outline</v-icon>
              <p class="mt-3">
                <b>{{ edu.name }}</b>
              </p>
              <p
                class="ma-2 px-6"
                style="color: #828282"
                v-if="edu.degrees.length === 1 && edu.degrees[0].completionDate"
              >
                {{ monthYearFormatBETA(edu.degrees[0].completionDate) }}
              </p>
            </v-list-item-title>
            <div
              class="ml-12"
              style="color: #828282; font-size: 15px"
              v-for="(degree, index) in edu.degrees"
              :key="degree + index"
            >
              <p><b>Degree: </b>{{ degree.degreeType }}</p>
              <div v-for="(major, majorIndex) in degree.majors" :key="major + majorIndex">
                <p><b>Major(s): </b> {{ major }}</p>
                <p v-if="degree.minors.length > 1"><b>Minor(s): </b>{{ getMinors(degree) }}</p>
                <p v-else-if="degree.minors.length === 1"><b>Minor(s): </b>{{ degree.minors[0] }}</p>
              </div>
            </div>
          </div>
          <!-- END UNIVERSITY SECTION -->

          <!-- START MILITARY SECTION -->
          <div class="ml-4" v-if="edu.type === 'military'">
            <v-list-item-title class="d-flex align-center">
              <v-icon class="mx-3">mdi-school-outline</v-icon>
              <p class="mt-3">
                <b>{{ edu.branch }} (Military Service)</b>
              </p>
              <p class="ma-2 px-6" style="color: #828282" v-if="edu.completeDate">
                {{ monthYearFormatBETA(edu.startDate) }} - {{ monthYearFormatBETA(edu.completeDate) }}
              </p>
              <p v-else>{{ monthYearFormatBETA(edu.startDate) }} - Present</p>
            </v-list-item-title>
          </div>
          <!-- END MILITARY SECTION -->

          <!-- START HIGHSCHOOL SECTION -->
          <div class="ml-4" v-if="edu.type === 'highSchool'">
            <v-list-item-title class="d-flex align-center">
              <v-icon class="mx-3">mdi-school-outline</v-icon>
              <p class="mt-3">
                <b>{{ edu.name }}</b>
              </p>
              <p class="ma-2 px-6" style="color: #828282" v-if="edu.gradDate">
                {{ monthYearFormatBETA(edu.gradDate) }}
              </p>
            </v-list-item-title>
          </div>
          <!-- END HIGHSCHOOL SECTION -->
        </v-list-item>
        <div v-if="!isEmpty(showableList) && Math.ceil(totalList.length / 2) != 1" class="text-center">
          <v-card-actions>
            <v-btn block @click="dialog = true">Click to see more</v-btn>
          </v-card-actions>
        </div>
      </v-card-text>
      <education-modal :model="model" v-model="dialog"></education-modal>
    </base-card>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';

import { monthYearFormatBETA, isEmpty } from '../../utils/utils';
import EducationModal from './modals/EducationModal.vue';
import BaseCard from '@/components/employee-beta/BaseCard.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const dialog = ref(false);
const showableList = ref([]);
const totalList = ref([]);
const props = defineProps(['model']);

// |--------------------------------------------------|
// |                                                  |
// |                LIFESTYLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
onBeforeMount(() => {
  if (!isEmpty(props.model.education)) {
    showableList.value = props.model.education.slice(0, 2); // only shows 2 educations at a time
    totalList.value = props.model.education; // gets all education
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all the minors to a specific degree and returns them as a string
 *
 * @param degree the degree to search
 */
function getMinors(degree) {
  let minorsString = ''; // Initialize an empty string to store the result
  for (let i = 0; i < degree.minors.length; i++) {
    minorsString += degree.minors[i];
    if (i < degree.minors.length - 1) {
      minorsString += ', '; // Add comma and space if it's not the last minor
    }
  }
  return minorsString;
}
</script>
