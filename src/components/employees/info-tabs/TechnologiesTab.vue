<template>
  <div class="infoTab">
    <!-- Employee has Technology Experience -->
    <div v-if="!isEmpty(model.technologies)">
      <!--Tech Filters -->
      <div class="mb-3">
        <fieldset class="filter_border">
          <legend class="legend_style">Sort By</legend>
          <v-col cols="12">
            <v-btn-toggle color="primary" v-model="sortFunction" density="compact">
              <v-btn value="current" @click="sortByCurrent">
                <v-tooltip activator="parent" location="top">Current</v-tooltip>
                <v-icon size="x-large">mdi-check{{ sortFunction === 'current' ? '-bold' : '' }}</v-icon>
              </v-btn>

              <v-btn value="date" @click="sortByDate">
                <v-tooltip activator="parent" location="top">Years of Experience</v-tooltip>
                <v-icon size="x-large">mdi-calendar-multiple{{ sortFunction === 'date' ? '-check' : '' }}</v-icon>
              </v-btn>

              <v-btn value="name" @click="sortByName">
                <v-tooltip activator="parent" location="top">Alphabetical</v-tooltip>
                <v-icon size="x-large">mdi-sort-alphabetical-descending-variant</v-icon>
              </v-btn>
            </v-btn-toggle>
          </v-col>
        </fieldset>
      </div>
      <!-- End of Sort Filters -->
      <!-- Loop Technologies -->
      <div v-for="(technology, index) in this.pageList" :key="technology.name + index">
        <v-row>
          <v-col>
            <p><b>Technology: </b>{{ technology.name }}</p>
          </v-col>
          <v-col>
            <span v-if="technology.current">
              <v-icon>mdi-check</v-icon>
              <v-tooltip activator="parent" location="right">Current Skill</v-tooltip>
            </span>
          </v-col>
        </v-row>
        <p><b>Experience: </b>{{ Number(technology.years).toFixed(1) }} years</p>
        <hr v-if="index < pageList.length - 1" class="my-3" />
      </div>
      <!-- End Loop Technologies -->
      <div v-if="!isEmpty(this.sortedTech) && Math.ceil(this.sortedTech.length / 5) != 1" class="text-center">
        <v-pagination
          v-model="page"
          :length="Math.ceil(this.sortedTech.length / 5)"
          :total-visible="8"
          @update:model-value="onPageChange"
        ></v-pagination>
      </div>
    </div>
    <!-- Employee does not have Technology Experience -->
    <p v-else>No Technologies or Skills Information</p>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/utils';
import _sortBy from 'lodash/sortBy';
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!this.isEmpty(this.model.technologies)) {
    this.pageList = this.sortedTech.slice(0, 5);
  }
} //created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |---------------------------------------------------
/**
 * When the page is changed, grab the corresponding entries based on the page
 * number.
 */
function onPageChange() {
  var startIndex = 5 * (this.page - 1); //each page contains 5 tech entries
  var endIndex = startIndex + 5;
  this.pageList = this.sortedTech.slice(startIndex, endIndex);
} //onPageChange

/**
 * Sorts technology entries alphabetically by name.
 */
function sortByName() {
  const iteratees = (obj) => obj.name;
  this.sortedTech = _sortBy(this.model.technologies, iteratees);
  this.page = 1;
  this.pageList = this.sortedTech.slice(0, 5);
} //sortByName

/**
 * Sorts technology so that the current entries are on top.
 */
function sortByCurrent() {
  this.sortedTech.sort((a, b) => {
    if (a.current === b.current) {
      return 0;
    }

    if (a.current) {
      return -1;
    }

    if (b.current) {
      return 1;
    }
  });
  this.page = 1;
  this.pageList = this.sortedTech.slice(0, 5);
} //sortByCurrent

/**
 * Sorts technology by years of experience in descending order.
 */
function sortByDate() {
  const iteratees = (obj) => -obj.years;
  this.sortedTech = _sortBy(this.model.technologies, iteratees);

  this.page = 1;
  this.pageList = this.sortedTech.slice(0, 5);
} //sortByDate

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for model - chooses what to sort by.
 *
 * @param val - model
 */
function watchModel(val) {
  if (!this.isEmpty(val.technologies)) {
    this.sortedTech = val.technologies;
    if (this.sortFunction == 0) {
      this.sortByCurrent();
    } else if (this.sortFunction == 1) {
      this.sortByDate();
    } else if (this.sortFunction == 2) {
      this.sortByName();
    }
    this.pageList = this.sortedTech.slice(0, 5);
  }
} // watchModel

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      page: 1,
      pageList: [],
      sortFunction: undefined,
      sortedTech: this.model.technologies
    };
  },
  methods: {
    isEmpty,
    onPageChange,
    sortByName,
    sortByCurrent,
    sortByDate
  },
  props: ['model'],
  watch: {
    model: watchModel
  }
};
</script>

<style scoped>
p {
  margin-bottom: 12px;
}
</style>
