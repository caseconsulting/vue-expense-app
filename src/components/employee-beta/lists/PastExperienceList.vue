<template>
  <v-list>
    <v-card-text v-if="onModal">
      <p class="ic-text mt-3 ml-7"><b>Experience in IC:</b></p>
      <p class="ic-text gray-text ml-3" align="right">{{ icExperience }}</p>
    </v-card-text>
    <v-row class="mx-12" v-if="onModal">
      <v-divider class="mt-2" />
    </v-row>
    <v-list-item v-for="(company, index) in list" :key="company.companyName + index">
      <v-list-item-title class="d-flex align-center">
        <v-icon class="mx-3">mdi-briefcase-outline</v-icon>
        <p class="mt-3">
          <b>{{ company.companyName }}</b>
        </p>
        <p class="my-2 mx-6 gray-text" v-if="company.positions.length === 1">
          {{ monthYearFormatBETA(company.positions[0].startDate) }} -
          {{ monthYearFormatBETA(company.positions[0].endDate) }}
        </p>
        <p class="my-2 mx-6 gray-text" v-else>
          {{ monthYearFormatBETA(getTotalTimeAtCompany(company)) }} - {{ monthYearFormatBETA(endDate) }}
        </p>
      </v-list-item-title>
      <div
        class="ml-12 mb-2 px-6 position-text"
        v-for="(position, posIndex) in company.positions"
        :key="position.title + posIndex"
      >
        <p class="d-inline">{{ position.title }}</p>
        <p class="my-2 mx-6 months-text">{{ getDurationOfPosition(position) }} months</p>
      </div>
      <v-row no-gutters class="mx-5">
        <v-divider v-if="index < list.length - 1" />
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { monthYearFormatBETA } from '@/utils/utils';
import { add, difference, minimum } from '@/shared/dateUtils';
import { ref } from 'vue';
import { computed } from 'vue';
import { format, getTodaysDate, isBefore, maximum } from '../../../shared/dateUtils';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['list', 'model', 'onModal']);

const earliestStartDate = ref(null);
const endDate = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFESTYLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

const icExperience = computed(() => {
  // get values from input, convert to array, and then sort them
  let givenRanges = _.mapValues(props.model.icTimeFrames, 'range');
  givenRanges = Object.values(givenRanges);
  const durations = givenRanges
    .sort((a, b) => {
      // array has text in format YYYY-MM, so reformat to YYYYMM so
      // that it can be sorted as a regular int
      format(a[0], 'YYYY-MM', 'YYYYMM') - format(b[0], 'YYYY-MM', 'YYYYMM');
    })
    .reverse();
  let ranges = [];
  let previousVal, firstStart, lastEnd;
  // combine any dates that overlap, keep separate ones that don't
  durations.forEach((d) => {
    previousVal = ranges[ranges.length - 1];
    if (ranges.length != 0 && isBefore(d[0], previousVal[1])) {
      // overlap combination
      firstStart = minimum(previousVal[0], d[0]);
      lastEnd = maximum([previousVal[1], d[1]]);
      ranges[ranges.length - 1] = [firstStart, lastEnd];
    } else {
      // no overlap
      ranges.push(d);
    }
  });

  let totalDurationMonths = 0; // total months
  // loop each reach to get total duration in months
  _.forEach(ranges, (range) => {
    let start = format(range[0], null, 'YYYY-MM');
    let end = range.length > 1 ? format(range[1], null, 'YYYY-MM') : getTodaysDate('YYYY-MM');
    let duration = difference(end, start, 'months') + 1; // calculate range duration
    totalDurationMonths += Math.max(duration, 0); // remove negative values
  });
  // set year output text
  let totalYearOutput = _.floor(totalDurationMonths / 12);
  if (totalYearOutput < 1) {
    totalYearOutput = '';
  } else if (totalYearOutput == 1) {
    totalYearOutput += ' Year';
  } else {
    totalYearOutput += ' Years';
  }
  // set month output text
  let totalMonthOutput = totalDurationMonths % 12;
  if (totalMonthOutput < 1) {
    totalMonthOutput = totalYearOutput.length > 0 ? '' : 'None';
  } else if (totalMonthOutput == 1) {
    totalMonthOutput = totalYearOutput.length > 0 ? ` and ${totalMonthOutput} Month` : `${totalMonthOutput} Month`;
  } else {
    totalMonthOutput = totalYearOutput.length > 0 ? ` and ${totalMonthOutput} Months` : `${totalMonthOutput} Months`;
  }
  // icTime.value = `${totalYearOutput}${totalMonthOutput}`;
  return `${totalYearOutput}${totalMonthOutput}`;
}); // icExperience

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function getTotalTimeAtCompany(company) {
  let totalTime = 0; // in months
  let startDates = [];

  for (let p in company.positions) {
    totalTime += difference(company.positions[p].endDate, company.positions[p].startDate, 'M');
    startDates.push(company.positions[p].startDate);
  }

  earliestStartDate.value = minimum(startDates);
  endDate.value = add(earliestStartDate.value, totalTime, 'M');

  return earliestStartDate.value;
}

function getDurationOfPosition(position) {
  let totalTime = 0;
  totalTime = Math.round(difference(position.endDate, position.startDate, 'M'));
  return totalTime;
}
</script>

<style scoped>
.gray-text {
  color: #828282;
}

.position-text {
  color: #828282;
  font-size: 15px;
}

.months-text {
  color: #828282;
  display: inline;
}

.gray-text {
  color: #828282;
}

.ic-text {
  display: inline;
  font-size: medium;
}
</style>
