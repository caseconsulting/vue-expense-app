<template>
  <div class="infoTab">
    <!-- Employee has Technology Experience -->
    <div v-if="!isEmpty(model.technologies)">
      <!--Tech Filters -->
      <div class="mb-3">
        <fieldset class="filter_border">
          <legend class="legend_style">Sort By</legend>
          <v-col cols="12">
            <v-btn-toggle borderless>
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
                <span>By Date</span>
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
      <div v-for="(technology, index) in sortedTech" :key="technology.name">
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
        <p><b>Years of Experience: </b>{{ yearsOfExperience(technology) }}</p>
        <hr v-if="index < model.technologies.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Technologies -->
    </div>
    <!-- Employee does not have Technology Experience -->
    <p v-else>No Technology Information</p>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/utils';
import moment from 'moment-timezone';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Calculates years of experience for a technology based on monthsOfExperience.
 *
 * @param technology - technology object
 * @return years of expierence (decimal with 2 decimal places)
 */
function yearsOfExperience(technology) {
  let totalMonths = 0;
  //calculates total number of months
  for (let i = 0; !isEmpty(technology.dateIntervals) && i < technology.dateIntervals.length; i++) {
    totalMonths += monthsPassed(technology.dateIntervals[i].startDate, technology.dateIntervals[i].endDate);
  }

  if (totalMonths > 0) {
    let years = totalMonths / 12; //calculates years of experience
    return Math.round((years + Number.EPSILON) * 100) / 100; //rounds to 2 decimal places
  }
  return technology.years ? technology.years : 0; //if uses old technology.years then use that or set to 0
} // yearsOfExperience

/**
 * Calculates the number of months that have passed between 2 dates in YYYY-MM format.
 *
 * @param start - the time interval starting date
 * @param end - the time interval ending date
 */
function monthsPassed(start, end) {
  let startDate = start;
  let endDate = end;
  let totalTimePassed = 0;

  //if there is no end date use interval start - now
  if (isEmpty(endDate)) {
    endDate = moment().format('YYYY-MM');
  }

  //makes sure that the start and end date are both not empty
  if (!isEmpty(startDate) && !isEmpty(endDate)) {
    let monthsStart = Number(moment(startDate, 'YYYY-MM').format('MM'));
    let yearsStart = Number(moment(startDate, 'YYYY-MM').format('YYYY'));

    let monthsEnd = Number(moment(endDate, 'YYYY-MM').format('MM'));
    let yearsEnd = Number(moment(endDate, 'YYYY-MM').format('YYYY'));

    let absoluteStartMonths = monthsStart + yearsStart * 12; //calculates absolute number of months for start date
    let absoluteEndMonths = monthsEnd + yearsEnd * 12; //calculates absolute number of years for end date

    totalTimePassed = absoluteEndMonths - absoluteStartMonths; //total number of months
  }

  return totalTimePassed;
} //monthsPassed

function sortByName() {
  const iteratees = (obj) => obj.name;
  this.sortedTech = _.sortBy(this.model.technologies, iteratees);
}

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
}

function sortByDate() {
  _.forEach(this.model.technologies, (tech) => {
    let startDate = tech.dateIntervals[0].startDate;
    let endDate = tech.dateIntervals[0].endDate;
    tech.length = monthsPassed(startDate, endDate);
  });

  const iteratees = (obj) => -obj.length;
  this.sortedTech = _.sortBy(this.model.technologies, iteratees);
}

export default {
  data() {
    return {
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
    yearsOfExperience,
    sortByName,
    sortByCurrent,
    sortByDate
  },
  props: ['model']
};
</script>
