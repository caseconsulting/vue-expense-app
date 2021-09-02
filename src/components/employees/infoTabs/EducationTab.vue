<template>
  <div class="infoTab">
    <!-- Employee has Degrees -->
    <div v-if="!isEmpty(this.filteredList)">
      <!-- Loop Degrees -->
      <div v-for="(school, index) in this.filteredList" :key="school.name + index">
        <p class="mb-0"><b>School: </b>{{ school.name }}</p>
        <div class="ml-4" v-if="school.degrees.length > 1">
          <p class="my-0"><b>Degrees: </b></p>
          <ul>
            <li v-for="(degree, index) in school.degrees" :key="degree + index" class="mb-2">
              <b>{{ degree.degreeType }}</b>
              <ul>
                <li><b>Completion Date: </b>{{ degree.completionDate | monthYearFormat }}</li>
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
          <hr v-if="index < filteredList.length - 1" class="mt-3 mb-3" />
        </div>
        <!-- End Loop Degrees -->
        <div class="ml-4" v-else>
          <p class="my-0"><b>Degree: </b>{{ school.degrees[0].degreeType }}</p>
          <ul>
            <li><b>Completion Date:</b> {{ school.degrees[0].completionDate | monthYearFormat }}</li>
            <li v-if="school.degrees[0].majors.length > 1">
              <p class="mb-0"><b>Majors:</b></p>
              <ul class="mb-0">
                <li v-for="(major, majorIndex) in school.degrees[0].majors" :key="majorIndex">
                  {{ major }}
                </li>
              </ul>
            </li>
            <li class="mb-0" v-else-if="school.degrees[0].majors.length === 1">
              <b>Major: </b>{{ school.degrees[0].majors[0] }}
            </li>
            <li v-if="school.degrees[0].minors.length > 1">
              <p class="mb-0"><b>Minors:</b></p>
              <ul class="mb-0">
                <li v-for="(minor, minorIndex) in school.degrees[0].minors" :key="minorIndex">
                  {{ minor }}
                </li>
              </ul>
            </li>
            <li v-else-if="school.degrees[0].minors.length === 1" class="mb-0">
              <b>Minor: </b>{{ school.degrees[0].minors[0] }}
            </li>
            <li v-if="school.degrees[0].concentrations.length > 1">
              <p class="mb-0"><b>Concentrations:</b></p>
              <ul class="mb-0">
                <li
                  v-for="(concentration, concentrationsIndex) in school.degrees[0].concentrations"
                  :key="concentrationsIndex"
                >
                  {{ concentration }}
                </li>
              </ul>
            </li>
            <li v-else-if="school.degrees[0].concentrations.length === 1" class="mb-0">
              <b>Concentration: </b>{{ school.degrees[0].concentrations[0] }}
            </li>
          </ul>
          <hr v-if="index < filteredList.length - 1" class="mt-3 mb-3" />
        </div>
        <!-- End Loop Degrees -->
      </div>
      <!-- End Loop Schools -->
      <!-- Pagination -->
      <div v-if="!isEmpty(this.model.schools) && Math.ceil(model.schools.length / 4) != 1" class="text-center">
        <v-pagination
          v-model="page"
          :length="Math.ceil(model.schools.length / 4)"
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
  if (!this.isEmpty(this.model.schools)) {
    this.filteredList = this.model.schools.slice(0, 4);
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
  this.filteredList = this.model.schools.slice(startIndex, endIndex);
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
 */
function watchModel(val) {
  if (!this.isEmpty(val)) {
    this.filteredList = val.schools.slice(0, 4);
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
  filters: {
    monthYearFormat
  },
  methods: {
    isEmpty,
    onPageChange
  },
  props: ['model'],
  watch: {
    model: watchModel
  }
};
</script>
