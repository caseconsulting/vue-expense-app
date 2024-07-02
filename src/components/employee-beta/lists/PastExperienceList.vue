<template>
  <v-list>
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

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

defineProps({
  list: {
    type: Array,
    required: true
  }
});

const earliestStartDate = ref(null);
const endDate = ref(null);

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
</style>
