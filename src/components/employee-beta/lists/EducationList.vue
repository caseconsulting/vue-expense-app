<template>
  <v-list>
    <v-list-item v-for="(edu, index) in list" :key="edu + index">
      <!-- START UNIVERSITY SECTION -->
      <div v-if="edu.type === 'university'">
        <v-list-item-title class="d-flex align-center">
          <v-icon class="mx-3">mdi-school-outline</v-icon>
          <p class="mt-3">
            <b>{{ edu.name }}</b>
          </p>
          <p class="my-2 mx-6 date-text" v-if="edu.degrees.length === 1 && edu.degrees[0].completionDate">
            {{ monthYearFormatBETA(edu.degrees[0].completionDate) }}
          </p>
        </v-list-item-title>
        <div class="ml-12 degree-text" v-for="(degree, index) in edu.degrees" :key="degree + index">
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
      <div v-if="edu.type === 'military'">
        <v-list-item-title class="d-flex align-center">
          <v-icon class="mx-3">mdi-school-outline</v-icon>
          <p class="mt-3">
            <b>{{ edu.branch }} (Military Service)</b>
          </p>
          <p class="my-2 mx-6" style="color: #828282" v-if="edu.completeDate">
            {{ monthYearFormatBETA(edu.startDate) }} - {{ monthYearFormatBETA(edu.completeDate) }}
          </p>
          <p v-else>{{ monthYearFormatBETA(edu.startDate) }} - Present</p>
        </v-list-item-title>
      </div>
      <!-- END MILITARY SECTION -->

      <!-- START HIGHSCHOOL SECTION -->
      <div v-if="edu.type === 'highSchool'">
        <v-list-item-title class="d-flex align-center">
          <v-icon class="mx-3">mdi-school-outline</v-icon>
          <p class="mt-3">
            <b>{{ edu.name }}</b>
          </p>
          <p class="my-2 mx-6" style="color: #828282" v-if="edu.gradDate">
            {{ monthYearFormatBETA(edu.gradDate) }}
          </p>
        </v-list-item-title>
      </div>
      <!-- END HIGHSCHOOL SECTION -->
      <v-row no-gutters class="mx-5">
        <v-divider v-if="index < list.length - 1" />
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { monthYearFormatBETA } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

defineProps({
  list: {
    type: Array,
    required: true
  }
});

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

<style scoped>
.university-text {
  font-size: 16px;
}

.date-text {
  color: #828282;
  font-size: 15px;
}

.degree-text {
  color: #828282;
  font-size: 15px;
}
</style>
