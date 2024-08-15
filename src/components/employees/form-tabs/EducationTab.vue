<template>
  <div>
    <!-- Loop Education -->
    <div class="gray-border ma-0 py-3 px-5" v-for="(edu, index) in editedEducation" :key="edu.id">
      <university-form
        v-if="edu.type === 'university'"
        :school="edu"
        :allowAdditions="allowAdditions"
        :validating="validating"
        :schoolIndex="index"
      ></university-form>
      <high-school-form
        v-else-if="edu.type === 'highSchool'"
        :school="edu"
        :schoolIndex="index"
        :validating="validating"
      ></high-school-form>
      <military-form
        v-else-if="edu.type === 'military'"
        :service="edu"
        :militaryIndex="index"
        :validating="validating"
      ></military-form>
      <!-- Button to Delete Education -->
      <div class="pb-4" align="center" v-if="allowAdditions">
        <v-btn @click="deleteEducation(index)" variant="text" icon="">
          <v-tooltip activator="parent" location="bottom"> Delete Education </v-tooltip>
          <v-icon class="case-gray pr-1">mdi-delete</v-icon></v-btn
        >
      </div>
    </div>
    <!-- End Loop Education -->

    <!-- Button to Add Education -->
    <div class="pt-4" align="center">
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
    </div>
  </div>
</template>

<script>
import UniversityForm from './education-types/UniversityForm.vue';
import HighSchoolForm from './education-types/HighSchoolForm.vue';
import MilitaryForm from './education-types/MilitaryForm.vue';
import _map from 'lodash/map';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  this.emitter.emit('created', 'education');

  this.emitter.on('doneValidatingEducation', async (data) => {
    this.editedEducation[data.index] = data.content;
    this.eduCount++;
    this.numErrors += data.errors;

    if (this.eduCount === this.editedEducation.length) {
      this.emitter.emit('educationStatus', this.numErrors); // emit error status
      this.emitter.emit('doneValidating', { tab: 'education', data: this.editedEducation }); // emit done validating
      if (this.numErrors === 0) this.emitter.off('doneValidatingEducation');
      this.numErrors = 0; // just in case
      this.eduCount = 0; // just in case
    }
  });
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|
/**
 * Adds a school.
 *
 * @param type the kind of education to add
 */
function addSchool(type) {
  if (!this.editedEducation) this.editedEducation = [];
  switch (type) {
    case 'university':
      this.editedEducation.push({
        type: type,
        id: this.getRandId(),
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
      this.editedEducation.push({
        type: type,
        id: this.getRandId(),
        branch: null,
        startDate: null,
        completionDate: null
      });
      break;
    case 'highSchool':
      this.editedEducation.push({
        type: type,
        id: this.getRandId(),
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
  this.editedEducation.splice(index, 1);
} // deleteSchool

/**
 * Generate a random hex value as the ID for the education.
 *
 * @return string - A random ID for educations
 */
function getRandId() {
  return ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
} //getRandId

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields.
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating() {
  if (this.editedEducation.length === 0) {
    this.emitter.emit('doneValidating', { tab: 'education', data: this.editedEducation }); // emit done validating
    this.emitter.emit('educationStatus', 0); // emit error status
    this.emitter.off('doneValidatingEducation'); // emit done validating
  }
} // watchValidating

export default {
  created,
  components: { UniversityForm, HighSchoolForm, MilitaryForm },
  props: ['model', 'allowAdditions', 'validating'],
  data() {
    return {
      eduTypes: [
        { display: 'University', value: 'university' },
        { display: 'Military', value: 'military' },
        { display: 'High School', value: 'highSchool' }
      ],
      eduCount: 0,
      editedEducation: _map(this.$props.model, (item) => {
        return {
          ...item,
          id: this.getRandId()
        };
      }), // stores edited education info
      numErrors: 0
    };
  },
  methods: {
    addSchool,
    deleteEducation,
    getRandId
  },
  watch: {
    validating: watchValidating
  }
};
</script>

<style>
.eduSelector:hover {
  background-color: lightgray;
}
</style>
