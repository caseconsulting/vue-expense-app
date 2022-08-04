Education
<template>
  <div>
    <!-- Loop Education -->
    <div class="gray-border ma-0 py-3 px-5" v-for="(edu, index) in editedEducation" :key="index">
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

  window.EventBus.$on('doneValidatingEducation', (content, index) => {
    this.editedEducation[index] = content;
    this.eduCount++;

    if (this.eduCount % this.editedEducation.length === 0) {
      console.log(this.editedEducation);
      window.EventBus.$emit('doneValidating', 'education', this.editedEducation); // emit done validating
      window.EventBus.$emit('educationStatus', 0); // emit error status
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
        branch: '',
        startDate: null,
        completionDate: null
      });
      break;
    case 'highSchool':
      this.editedEducation.push({
        type: type,
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
  console.log(this.editedEducation);
} // deleteSchool

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
      editedEducation: _.cloneDeep(this.$props.model) // stores edited education info
    };
  },
  methods: {
    addSchool,
    deleteEducation
  }
};
</script>

<style>
.eduSelector:hover {
  background-color: lightgray;
}
</style>
