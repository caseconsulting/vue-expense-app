<template>
  <v-container>
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <b>University Information:</b>
          </v-col>
        </v-row>
        <v-row v-for="(edu, index) in editedEducation" :key="edu.id">
          <v-col v-if="edu.type === 'university'">
            <university-form
              :school="edu"
              :allowAdditions="allowAdditions"
              :validating="validating"
              :schoolIndex="index"
            ></university-form>
          </v-col>
          <v-col cols="1" v-if="edu.type === 'university'">
            <v-btn @click="deleteEducation(index)" variant="text" icon="" class="mt-6">
              <v-tooltip activator="parent" location="bottom"> Delete Education </v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon></v-btn
            >
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <b>Military Information:</b>
          </v-col>
        </v-row>
        <v-row v-for="(edu, index) in editedEducation" :key="edu.id">
          <v-col v-if="edu.type === 'military'">
            <military-form :service="edu" :militaryIndex="index" :validating="validating"></military-form>
          </v-col>
          <v-col cols="1" v-if="edu.type === 'military'">
            <v-btn @click="deleteEducation(index)" variant="text" icon="" class="mt-6">
              <v-tooltip activator="parent" location="bottom"> Delete Service </v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon></v-btn
            >
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <b>High School Information</b>
          </v-col>
        </v-row>
        <v-row v-for="(edu, index) in editedEducation" :key="edu.id">
          <v-col v-if="edu.type === 'highSchool'">
            <high-school-form :school="edu" :schoolIndex="index" :validating="validating"></high-school-form>
          </v-col>
          <v-col cols="1" v-if="edu.type === 'highSchool'">
            <v-btn @click="deleteEducation(index)" variant="text" icon="" class="mt-6">
              <v-tooltip activator="parent" location="bottom"> Delete Education </v-tooltip>
              <v-icon class="case-gray pr-1">mdi-delete</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row>
          <v-col align="center">
            <v-menu location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props">
                  <v-icon class="pr-1">mdi-plus</v-icon>
                  Education
                </v-btn>
              </template>
              <v-list class="py-0 pointer">
                <v-list-item
                  ripple
                  v-for="item in eduTypes"
                  :key="item.value"
                  class="eduSelector"
                  @click="addSchool(item.value)"
                >
                  <v-list-item-title>{{ item.display }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import _ from 'lodash';
import { inject, onBeforeMount, ref } from 'vue';
import UniversityForm from '../forms/education-forms/UniversityForm.vue';
import MilitaryForm from '../forms/education-forms/MilitaryForm.vue';
import HighSchoolForm from '../forms/education-forms/HighSchoolForm.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const props = defineProps(['model', 'allowAdditions', 'validating']);

const editedEducation = ref(
  _.map(props.model, (item) => {
    return {
      ...item,
      id: getRandId()
    };
  })
); // stores edited education info
const eduCount = ref(0);
const eduTypes = ref([
  { display: 'University', value: 'university' },
  { display: 'Military', value: 'military' },
  { display: 'High School', value: 'highSchool' }
]);
const numErrors = ref(0);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(async () => {
  emitter.emit('created', 'education');

  emitter.on('doneValidatingEducation', async (data) => {
    editedEducation.value[data.index] = data.content;
    eduCount.value++;
    numErrors.value += data.errors;

    if (eduCount.value === editedEducation.value.length) {
      emitter.emit('educationStatus', numErrors.value); // emit error status
      emitter.emit('doneValidating', { tab: 'education', data: editedEducation.value }); // emit done validating
      if (numErrors.value === 0) emitter.off('doneValidatingEducation');
      numErrors.value = 0;
      eduCount.value = 0;
    }
  });
}); // onBeforeMount

// |--------------------------------------------------|
// |                                                  |
// |                    METHODS                       |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds a school.
 *
 * @param type the kind of education to add
 */
function addSchool(type) {
  if (!editedEducation.value) editedEducation.value = [];
  switch (type) {
    case 'university':
      editedEducation.value.push({
        type: type,
        id: getRandId(),
        name: null,
        degrees: [
          {
            completionDate: null,
            concentrations: [],
            degreeType: null,
            majors: [null],
            minors: [],
            showEducationMenu: false
          }
        ]
      });
      break;
    case 'military':
      editedEducation.value.push({
        type: type,
        id: getRandId(),
        branch: null,
        startDate: null,
        completionDate: null
      });
      break;
    case 'highSchool':
      editedEducation.value.push({
        type: type,
        id: getRandId(),
        name: null,
        gradDate: null
      });
      break;
    default:
      break;
  }
} // addSchool

/**
 * Deletes a School.
 *
 * @param index - array index of education to delete
 */
function deleteEducation(index) {
  editedEducation.value.splice(index, 1);
} // deleteSchool

/**
 * Generate a random hex value as the ID for the education.
 *
 * @return string - A random ID for educations
 */
function getRandId() {
  return ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
} //getRandId
</script>
