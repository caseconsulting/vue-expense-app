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
      ></university-form>
      <high-school-form v-else-if="edu.type === 'highSchool'" :school="edu"></high-school-form>
      <military-form v-else-if="edu.type === 'military'" :service="edu"></military-form>
    </div>
    <!-- End Loop Education -->

    <!-- Button to Add Education -->
    <div class="pt-4" align="center">
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on"><v-icon class="pr-1">add</v-icon>Education</v-btn>
        </template>
        <v-list>
          <v-list-item v-for="item in eduTypes" :key="item.value">
            <v-list-item-title @click="addSchool(item.value)">{{ item.display }}</v-list-item-title>
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

export default {
  components: { UniversityForm, HighSchoolForm, MilitaryForm },
  props: ['model', 'allowAdditions', 'validating'],
  data() {
    return {
      eduTypes: [
        { display: 'University', value: 'university' },
        { display: 'Military', value: 'military' },
        { display: 'High School', value: 'highSchool' }
      ],
      editedEducation: _.cloneDeep(this.$props.model) // stores edited education info
    };
  },
  methods: {
    addSchool
  }
};
</script>
