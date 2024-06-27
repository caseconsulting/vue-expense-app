<template>
  <v-dialog v-model="dialog" max-height="500" max-width="900">
    <template v-slot:default>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between beta_header_style">
          <h3>All Education</h3>
          <div>
            <v-btn v-if="isAdmin || isUser" @click="toggleEdit()" density="comfortable" variant="text" icon="">
              <v-tooltip activator="parent" location="top"> Edit Education </v-tooltip>
              <v-icon id="edit" color="white"> mdi-pencil </v-icon>
            </v-btn>
            <v-btn @click="dialog = false" variant="text" icon="">
              <v-tooltip activator="parent" location="top"> Collapse </v-tooltip>
              <v-icon id="collapse" color="white">mdi-arrow-collapse</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <v-list-item v-for="(edu, index) in totalList" :key="edu + index">
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
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { inject, onBeforeMount, ref } from 'vue';
import { monthYearFormatBETA, isEmpty } from '../../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const dialog = defineModel();

const emitter = inject('emitter');
const totalList = ref([]);
const isUser = inject('isUser');
const isAdmin = inject('isAdmin');

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

function toggleEdit() {
  dialog.value = false;
  emitter.emit('editing', 'Education');
}
</script>
