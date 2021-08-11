<template>
  <div class="infoTab">
    <!-- Employee has Degrees -->
    <div v-if="!isEmpty(this.filteredList)">
      <!-- Loop Degrees -->
      <div v-for="(degree, index) in this.filteredList" :key="degree.name + index">
        <p><b>Degree: </b>{{ degree.name }}</p>
        <p><b>School: </b>{{ degree.school }}</p>
        <p><b>Completion Date: </b>{{ degree.date | monthYearFormat }}</p>

        <!-- Majors -->
        <div v-if="degree.majors.length > 1">
          <p class="mb-2"><b>Majors: </b></p>
          <ul class="mb-2">
            <li v-for="(major, majorIndex) in degree.majors" :key="majorIndex">
              {{ major }}
            </li>
          </ul>
        </div>
        <p class="mb-2" v-else-if="degree.majors.length === 1"><b>Major: </b> {{ degree.majors[0] }}</p>

        <!-- Minors -->
        <div v-if="degree.minors.length > 1">
          <p class="mb-2"><b>Minors: </b></p>
          <ul class="mb-2">
            <li v-for="(minor, minorIndex) in degree.minors" :key="minorIndex">
              {{ minor }}
            </li>
          </ul>
        </div>
        <p v-else-if="degree.minors.length === 1" class="mb-2"><b>Minor: </b> {{ degree.minors[0] }}</p>

        <!-- Concentrations -->
        <div v-if="degree.concentrations.length > 1">
          <p class="mb-2"><b>Concentrations: </b></p>
          <ul class="mb-2">
            <li v-for="(concentration, concentrationsIndex) in degree.concentrations" :key="concentrationsIndex">
              {{ concentration }}
            </li>
          </ul>
        </div>
        <p v-else-if="degree.concentrations.length === 1" class="mb-2">
          <b>Concentration:</b> {{ degree.concentrations[0] }}
        </p>

        <hr v-if="index < filteredList.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Degrees -->
    </div>
    <!-- Employee does not have Degrees -->
    <p v-else>No Education Information</p>
    <!-- Pagination -->
    <div v-if="!isEmpty(this.model.degrees) && Math.ceil(model.degrees.length / 4) != 1" class="text-center">
      <v-pagination
        v-model="page"
        :length="Math.ceil(model.degrees.length / 4)"
        :total-visible="8"
        @input="onPageChange"
      ></v-pagination>
    </div>
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
  if (!isEmpty(this.model.degrees)) {
    this.filteredList = this.model.degrees.slice(0, 4);
  }
}

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
  this.filteredList = this.model.degrees.slice(startIndex, endIndex);
}

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
    model: function (val) {
      if (!isEmpty(val)) {
        this.filteredList = val.degrees.slice(0, 4);
      }
    }
  }
};
</script>
