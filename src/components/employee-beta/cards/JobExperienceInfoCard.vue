<template>
  <base-card title="Job Experience">
    <v-card-text>
      <p class="ic-text mt-3 ml-7"><b>Experience in IC:</b></p>
      <p class="ic-text gray-text ml-3" align="right">{{ icExperience }}</p>
    </v-card-text>
    <v-row class="mx-12">
      <v-divider class="mt-2" />
    </v-row>
    <v-card-text v-if="isEmpty(pageList)" class="mt-3" style="text-align: center; font-size: medium">
      <p>No Past Job Experience Information</p>
    </v-card-text>
    <v-card-text v-else>
      <job-experience-list :list="pageList"></job-experience-list>
      <div v-if="!isEmpty(model.companies)" class="text-center">
        <v-card-actions class="d-flex justify-center">
          <v-btn variant="flat" color="#F3F3F3" @click="toggleJobExpModal()"
            >View All {{ filterCompanies.length }} Past Jobs</v-btn
          >
        </v-card-actions>
      </div>
      <job-experience-modal v-model="toggleModal" :model="model" :onModal="onModal"></job-experience-modal>
    </v-card-text>
  </base-card>
</template>

<script setup>
import { _ } from 'lodash';
import { isEmpty } from '@/utils/utils';
import { computed, ref } from 'vue';
import BaseCard from './BaseCard.vue';
import JobExperienceList from '../lists/JobExperienceList.vue';
import JobExperienceModal from '../modals/JobExperienceModal.vue';
import { difference, format, getTodaysDate, isBefore, maximum, minimum } from '../../../shared/dateUtils';

const props = defineProps(['model']);

const onModal = ref(false);
const toggleModal = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
const pageList = computed(() => {
  if (!isEmpty(props.model.companies)) {
    return filterCompanies.value.slice(0, 2);
  }
  return [];
});

const filterCompanies = computed(() => {
  return _.cloneDeep(props.model.companies);
});

const icExperience = computed(() => {
  // get values from input, convert to array, and then sort them
  let givenRanges = _.mapValues(props.model.icTimeFrames, 'range');
  givenRanges = Object.values(givenRanges);
  const durations = givenRanges
    .sort((a, b) => {
      // array has text in format YYYY-MM, so reformat to YYYYMM so
      // that it can be sorted as a regular int
      return format(a[0], 'YYYY-MM', 'YYYYMM') - format(b[0], 'YYYY-MM', 'YYYYMM');
    })
    .reverse();
  let ranges = [];
  let previousVal, firstStart, lastEnd;
  // combine any dates that overlap, keep separate ones that don't
  durations.forEach((d) => {
    previousVal = ranges[ranges.length - 1];
    if (ranges.length != 0 && isBefore(d[0], previousVal[1])) {
      // overlap combination
      firstStart = minimum([previousVal[0], d[0]]);
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
  return `${totalYearOutput}${totalMonthOutput}`;
}); // icExperience

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function toggleJobExpModal() {
  toggleModal.value = !toggleModal.value;
  onModal.value = true;
}
</script>

<style scoped>
.gray-text {
  color: #828282;
}

.ic-text {
  display: inline;
  font-size: medium;
}
</style>
