<template>
  <div class="infoTab">
    <!-- Employee has Education -->
    <div v-if="!isEmpty(this.filteredList)">
      <!-- Loop Education -->
      <div class="edu" v-for="(edu, index) in this.filteredList" :key="index">
        <!-- Loop University Degrees -->
        <div class="ml-4" v-if="edu.type === 'university'">
          <p class="mb-0"><b>Type: </b>University</p>
          <p class="mb-0" v-if="edu.name"><b>School: </b>{{ edu.name }}</p>

          <p class="my-0" v-if="edu.degrees.length > 1"><b>Degrees: </b></p>
          <p class="my-0" v-else><b>Degree: </b></p>

          <ul>
            <li v-for="(degree, index) in edu.degrees" :key="degree + index" class="mb-2">
              <b>{{ degree.degreeType }}</b>
              <ul>
                <li><b>Completion Date: </b>{{ monthYearFormat(degree.completionDate) }}</li>
                <li v-if="degree.majors.length > 1">
                  <p class="mb-0"><b>Majors:</b></p>
                  <ul class="mb-0">
                    <li v-for="(major, majorIndex) in degree.majors" :key="majorIndex">
                      {{ major }}
                    </li>
                  </ul>
                </li>
                <li class="mb-0" v-else-if="degree.majors.length === 1"><b>Major: </b>{{ degree.majors[0] }}</li>
                <li v-if="degree.minors.length > 1">
                  <p class="mb-0"><b>Minors:</b></p>
                  <ul class="mb-0">
                    <li v-for="(minor, minorIndex) in degree.minors" :key="minorIndex">
                      {{ minor }}
                    </li>
                  </ul>
                </li>
                <li v-else-if="degree.minors.length === 1" class="mb-0"><b>Minor: </b>{{ degree.minors[0] }}</li>
                <li v-if="degree.concentrations.length > 1">
                  <p class="mb-0"><b>Concentrations:</b></p>
                  <ul class="mb-0">
                    <li
                      v-for="(concentration, concentrationsIndex) in degree.concentrations"
                      :key="concentrationsIndex"
                    >
                      {{ concentration }}
                    </li>
                  </ul>
                </li>
                <li v-else-if="degree.concentrations.length === 1" class="mb-0">
                  <b>Concentration: </b>{{ degree.concentrations[0] }}
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <!-- End University Degrees Loop -->

        <!-- Loop Military Services -->
        <div class="ml-4" v-if="edu.type === 'military'">
          <p class="mb-0"><b>Type: </b>Military</p>
          <p class="my-0"><b>Branch: </b>{{ edu.branch }}</p>
          <p class="my-0"><b>Start Date: </b>{{ monthYearFormat(edu.startDate) }}</p>
          <p class="my-0" v-if="edu.completeDate"><b>Completion Date: </b>{{ monthYearFormat(edu.completeDate) }}</p>
        </div>
        <!-- End Military Services Loop -->

        <!-- Loop High Schools -->
        <div class="ml-4" v-if="edu.type === 'highSchool'">
          <p class="mb-0"><b>Type: </b>High School</p>
          <p class="my-0"><b>School: </b>{{ edu.name }}</p>
          <p class="my-0" v-if="edu.gradDate"><b>Graduation Date: </b>{{ monthYearFormat(edu.gradDate) }}</p>
        </div>
        <!-- End High Schools Loop -->
      </div>
      <!-- End Loop Schools -->
      <!-- Pagination -->
      <div v-if="!isEmpty(this.model.education) && Math.ceil(model.education.length / 4) != 1" class="text-center">
        <v-pagination
          v-model="page"
          :length="Math.ceil(model.education.length / 4)"
          :total-visible="8"
          @input="onPageChange"
        ></v-pagination>
      </div>
    </div>
    <!-- Employee does not have Degrees -->
    <p v-else>No Education Information</p>
  </div>
</template>

<script>
import { isEmpty, monthYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!this.isEmpty(this.model.education)) {
    this.filteredList = this.model.education.slice(0, 4);
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * When the page is changed, grab the corresponding entries based on the page
 * number.
 */
function onPageChange() {
  var startIndex = 4 * (this.page - 1); //each page contains 4 education entries
  var endIndex = startIndex + 4;
  this.filteredList = this.model.education.slice(startIndex, endIndex);
} // onPageChange

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for model
 *
 * @param val - param to watch
 */
function watchModel(val) {
  if (!this.isEmpty(val)) {
    this.filteredList = val.education.slice(0, 4);
  }
} // watchModel

export default {
  created,
  data() {
    return {
      filteredList: [],
      page: 1
    };
  },
  methods: {
    isEmpty,
    monthYearFormat,
    onPageChange
  },
  props: ['model'],
  watch: {
    model: watchModel
  }
};
</script>

<style>
.edu:not(:last-of-type) {
  border-bottom: 1px solid grey;
  margin-bottom: 12px;
  padding-bottom: 12px;
}
</style>
