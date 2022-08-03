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
    </div>
    <!-- End Loop Education -->

    <!-- Button to Add Degress -->
    <div v-if="allowAdditions" class="pt-4" align="center">
      <v-btn @click="addSchool()" elevation="2"><v-icon class="pr-1">add</v-icon>School</v-btn>
    </div>
  </div>
</template>

<script>
import UniversityForm from './education components/UniversityForm.vue';
import HighSchoolForm from './education components/HighSchoolForm.vue';
import _ from 'lodash';

export default {
  components: { UniversityForm, HighSchoolForm },
  props: ['model', 'allowAdditions', 'validating'],
  data() {
    return {
      editedEducation: _.cloneDeep(this.$props.model) // stores edited education info
    };
  }
};
</script>
