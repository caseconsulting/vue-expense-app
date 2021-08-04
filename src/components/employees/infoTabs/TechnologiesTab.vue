<template>
  <div class="infoTab">
    <!-- Employee has Technology Experience -->
    <div v-if="!isEmpty(model.technologies)">
      <!--Tech Filters -->
      <div class="mb-3">
        <fieldset class="filter_border">
          <legend class="legend_style">Sort By</legend>
          <v-col cols="12">
            <v-btn-toggle v-model="sortFunction" borderless>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" @click="sortByCurrent">
                    <v-icon>check</v-icon>
                  </v-btn>
                </template>
                <span>Current</span>
              </v-tooltip>

              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" @click="sortByDate">
                    <icon name="calendar-day"></icon>
                  </v-btn>
                </template>
                <span>Years of Experience</span>
              </v-tooltip>

              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" @click="sortByName">
                    <icon name="sort-alpha-down"></icon>
                  </v-btn>
                </template>
                <span>Alphabetical</span>
              </v-tooltip>
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
            <v-tooltip v-if="technology.current" right>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">check</v-icon>
              </template>
              <span>Current Skill</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <p><b>Years of Experience: </b>{{ Number(technology.years) }}</p>
        <hr v-if="index < pageList.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Technologies -->
      <div v-if="!isEmpty(this.sortedTech) && Math.ceil(this.sortedTech.length / 5) != 1" class="text-center">
        <v-pagination
          v-model="page"
          :length="Math.ceil(this.sortedTech.length / 5)"
          :total-visible="8"
          @input="onPageChange"
        ></v-pagination>
      </div>
    </div>
    <!-- Employee does not have Technology Experience -->
    <p v-else>No Technology Information</p>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/utils';
import _ from 'lodash';
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!isEmpty(this.model.technologies)) {
    this.pageList = this.sortedTech.slice(0, 5);
  }
}

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
 * Sorts technology entries alphabetically by name
 */
function sortByName() {
  const iteratees = (obj) => obj.name;
  this.sortedTech = _.sortBy(this.model.technologies, iteratees);
  this.page = 1;
  this.pageList = this.sortedTech.slice(0, 5);
} //sortByName

/**
 * Sorts technology so that the current entries are on top
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
 * Sorts technology by years of experience in descending order
 */
function sortByDate() {
  const iteratees = (obj) => -obj.years;
  this.sortedTech = _.sortBy(this.model.technologies, iteratees);

  this.page = 1;
  this.pageList = this.sortedTech.slice(0, 5);
} //sortByDate

export default {
  created,
  data() {
    return {
      page: 1,
      pageList: [],
      sortFunction: null,
      sortedTech: this.model.technologies
    };
  },
  filters: {
    current: (value) => {
      return value ? 'Yes' : 'No';
    }
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
    model: function (val) {
      if (!isEmpty(val.technologies)) {
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
    }
  }
};
</script>
