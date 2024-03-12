<template>
  <div>
    <h3 class="d-flex align-center">
      <v-icon class="mr-2">mdi-briefcase-outline</v-icon> {{ isMonthly ? 'Monthly' : 'Yearly' }} Job Codes
      <v-avatar
        v-if="!isMonthly"
        @click="
          openLink(
            'https://3.basecamp.com/3097063/buckets/4708396/messages/7069270310#:~:text=New%20Bonus%20Opportunity'
          )
        "
        class="ml-2 nudge-up"
        size="x-small"
        density="compact"
      >
        <v-tooltip activator="parent" location="top">Click for more information</v-tooltip>
        <v-icon size="x-small" color="#3f51b5">mdi-information</v-icon>
      </v-avatar>
    </h3>
    <div v-if="Object.entries(timeData || {})?.length === 0" class="my-3">No job codes for this time period</div>
    <div v-else>
      <div v-for="(duration, jobcode) in timeData" :key="jobcode">
        <div
          v-if="
            isMonthly || showNonBillables || (!showNonBillables && !supplementalData.nonBillables.includes(jobcode))
          "
          :class="!isMonthly && supplementalData.nonBillables.includes(jobcode) ? 'text-grey' : ''"
          class="d-flex justify-space-between my-3"
        >
          <div class="mr-3">{{ jobcode }}</div>
          <div class="dotted-line"></div>
          <div class="ml-3">{{ formatNumber(duration / 60 / 60) }}h</div>
        </div>
      </div>
      <v-span
        v-if="!isMonthly && hasNonBillables()"
        @click="showNonBillables = !showNonBillables"
        class="pointer text-blue"
      >
        {{ showNonBillables ? 'Hide non-billables' : 'Show non-billables' }}
        <v-icon>{{ showNonBillables ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-span>
    </div>
  </div>
</template>

<script>
import { formatNumber, openLink } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Whether or not the employee has non-billables entered in their timesheets within the set time period.
 *
 * @returns Boolean - True if the employee has non-billable jobcodes in their timesheets within the time period
 */
function hasNonBillables() {
  let hasNonBillable = false;
  let jobcodes = Object.keys(this.timeData || {});
  for (let i = 0; i < jobcodes.length && !hasNonBillable; i++) {
    if (this.supplementalData.nonBillables?.includes(jobcodes[i])) hasNonBillable = true;
  }
  return hasNonBillable;
} // hasNonBillables

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      showNonBillables: false
    };
  },
  methods: {
    formatNumber,
    hasNonBillables,
    openLink
  },
  props: ['isMonthly', 'supplementalData', 'timeData']
};
</script>

<style scoped>
.dotted-line {
  height: 0.8em;
  background-image: linear-gradient(to right, rgb(210, 210, 210) 33%, rgba(184, 184, 184, 0) 0%);
  background-position: bottom;
  background-size: 7px 1px;
  background-repeat: repeat-x;
  flex-grow: 2;
}
</style>
