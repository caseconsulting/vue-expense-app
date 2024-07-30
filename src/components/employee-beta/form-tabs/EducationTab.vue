<template>
  <v-form ref="form" validate-on="lazy">
    <v-row>
      <v-col>
        <v-row>
          <v-col v-if="displayUni">
            <b>University Information:</b>
          </v-col>
        </v-row>
        <!-- Start University loop -->
        <v-row v-for="(edu, index) in editedEducation" :key="edu.id">
          <v-col v-if="edu.type === 'university'">
            <university-form :school="edu" :allowAdditions="allowAdditions" :schoolIndex="index"></university-form>
          </v-col>
          <!-- Start delete university -->
          <v-col cols="1" v-if="edu.type === 'university'">
            <v-btn @click="deleteEducation(index)" variant="text" icon="" class="mt-6">
              <v-tooltip activator="parent" location="bottom"> Delete Education </v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon></v-btn
            >
          </v-col>
          <!-- End delete university -->
        </v-row>
        <!-- End University loop -->

        <v-divider v-if="displayUni" :thickness="4" class="border-opacity-25 mb-5"></v-divider>

        <v-row>
          <v-col v-if="displayMilitary">
            <b>Military Information:</b>
          </v-col>
        </v-row>
        <!-- Start military lopp -->
        <v-row v-for="(edu, index) in editedEducation" :key="edu.id">
          <v-col v-if="edu.type === 'military'">
            <military-form :service="edu" :militaryIndex="index"></military-form>
          </v-col>
          <!-- Start delete military -->
          <v-col cols="1" v-if="edu.type === 'military'">
            <v-btn @click="deleteEducation(index)" variant="text" icon="" class="mt-6">
              <v-tooltip activator="parent" location="bottom"> Delete Service </v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon></v-btn
            >
          </v-col>
          <!-- End delete militart -->
        </v-row>
        <!-- End military loop -->

        <v-divider v-if="displayMilitary" :thickness="4" class="border-opacity-25 my-5"></v-divider>

        <v-row v-if="displayHS">
          <v-col>
            <b>High School Information</b>
          </v-col>
        </v-row>
        <!-- Start high school loop -->
        <v-row v-for="(edu, index) in editedEducation" :key="edu.id">
          <v-col v-if="edu.type === 'highSchool'">
            <high-school-form :school="edu" :schoolIndex="index"></high-school-form>
          </v-col>
          <!-- Start delete high school -->
          <v-col cols="1" v-if="edu.type === 'highSchool'">
            <v-btn @click="deleteEducation(index)" variant="text" icon="" class="mt-6">
              <v-tooltip activator="parent" location="bottom"> Delete Education </v-tooltip>
              <v-icon class="case-gray pr-1">mdi-delete</v-icon></v-btn
            >
          </v-col>
          <!-- End delete high school -->
        </v-row>
        <!-- End high school loop -->

        <v-divider v-if="displayHS" :thickness="4" class="border-opacity-25 my-5"></v-divider>

        <!-- Start add education -->
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
                  v-for="item in EDU_TYPES"
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
        <!-- End add education -->
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { map } from 'lodash';
import { inject, ref } from 'vue';
import HighSchoolForm from '../forms/education-forms/HighSchoolForm.vue';
import MilitaryForm from '../forms/education-forms/MilitaryForm.vue';
import UniversityForm from '../forms/education-forms/UniversityForm.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const EDU_TYPES = [
  { display: 'University', value: 'university' },
  { display: 'Military', value: 'military' },
  { display: 'High School', value: 'highSchool' }
];

defineProps(['allowAdditions']);
const emitter = inject('emitter');

const editedEmployee = defineModel({ required: true });
const form = ref(null); // template ref

const editedEducation = ref(
  map(editedEmployee.value.education, (item) => {
    item.id = getRandId();
    return item;
  })
); // stores edited education info

defineExpose({ prepareSubmit });

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeUnmount(prepareSubmit);

// |--------------------------------------------------|
// |                                                  |
// |                    METHODS                       |
// |                                                  |
// |--------------------------------------------------|

async function prepareSubmit() {
  await validate();

  // remove id that was generated for use in this file
  editedEmployee.value.education = map(editedEducation.value, (education) => {
    delete education.id;
    return education;
  });
}

async function validate() {
  if (form.value) {
    const result = await form.value.validate();
    emitter.emit('validating', { tab: 'education', valid: result.valid });
    return result;
  }
  return null;
}

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
