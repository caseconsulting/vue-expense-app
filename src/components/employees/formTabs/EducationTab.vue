Education
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
      <!-- Button to Delete School -->
      <div class="pb-4" align="center" v-if="allowAdditions">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="deleteEducation(index)" text icon
              ><v-icon class="case-gray pr-1">delete</v-icon></v-btn
            >
          </template>
          <span>Delete School</span>
        </v-tooltip>
      </div>
    </div>
    <!-- End Loop Education -->

    <!-- Button to Add Education -->
    <div class="pt-4" align="center">
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on"><v-icon class="pr-1">add</v-icon>Education</v-btn>
        </template>
        <v-list style="cursor: pointer" class="py-0">
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
import UniversityForm from './education components/UniversityForm.vue';
import HighSchoolForm from './education components/HighSchoolForm.vue';
import MilitaryForm from './education components/MilitaryForm.vue';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  window.EventBus.$emit('created', 'education');

  window.EventBus.$on('doneValidatingEducation', async (content, index, errorCount) => {
    this.editedEducation[index] = content;
    this.eduCount++;
    this.numErrors += errorCount;

    if (this.eduCount === this.editedEducation.length) {
      window.EventBus.$emit('educationStatus', this.numErrors); // emit error status
      window.EventBus.$emit('doneValidating', 'education', this.editedEducation); // emit done validating
      if (this.numErrors === 0) window.EventBus.$off('doneValidatingEducation');
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
        name: '',
        degrees: [
          {
            completionDate: null,
            concentrations: [],
            degreeType: '',
            majors: [''],
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
        branch: '',
        startDate: null,
        completionDate: null
      });
      break;
    case 'highSchool':
      this.editedEducation.push({
        type: type,
        id: this.getRandId(),
        name: '',
        gradDate: null
      });
      break;
    default:
      break;
  }
} // addSchool

/**
 * Deletes a School
 *
 * @param index - array index of education to delete
 */
function deleteEducation(index) {
  this.editedEducation.splice(index, 1);
} // deleteSchool

/**
 * Generate a random hex value as the ID for the education.
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
 * watcher for validating - validates fields
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating() {
  if (this.editedEducation.length === 0) {
    window.EventBus.$emit('doneValidating', 'education', this.editedEducation); // emit done validating
    window.EventBus.$emit('educationStatus', 0); // emit error status
    window.EventBus.$off('doneValidatingEducation'); // emit done validating
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
      editedEducation: _.map(this.$props.model, (item) => {
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
