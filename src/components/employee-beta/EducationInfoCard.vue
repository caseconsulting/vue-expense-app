<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between beta_header_style">
      <h3>Education</h3>
      <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text" icon="" class="mx-1">
        <v-tooltip activator="parent" location="top"> Edit Education </v-tooltip>
        <v-icon id="edit" color="white"> mdi-pencil </v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text v-if="isEmpty(filteredList)">
      <p>No Education to display</p>
    </v-card-text>
    <v-card-text v-else>
      <v-list-item v-for="(edu, index) in filteredList" :key="edu + index">
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
            <!-- <v-divider v-if="index < filteredList.length - 1" class="mb-3"></v-divider> -->
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
      </v-list-item>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';
import { isEmpty } from '@/utils/utils';
import { monthYearFormatBETA } from '../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const filteredList = ref([]);
const props = defineProps(['model', 'isAdmin', 'isUser']);

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
    filteredList.value = props.model.education.slice(0, 4);
  }

  console.log(filteredList.value);
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
