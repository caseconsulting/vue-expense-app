<template>
  <base-info-modal title="Past Job Experience">
    <v-card-text class="px-7 pt-5 pb-1 text-black"> </v-card-text>
    <div v-if="!isEmpty(filteredList)">
      <v-list-item v-for="(company, index) in filteredList" :key="company.companyName + index">
        <v-list-item-title class="d-flex align-center">
          <v-icon class="mx-3">mdi-briefcase-outline</v-icon>
          <p class="mt-3">
            <b>{{ company.companyName }}</b>
          </p>
          <p class="ma-2 px-6" style="color: #828282" v-if="company.positions.length === 1">
            {{ monthYearFormatBETA(company.positions[0].startDate) }} -
            {{ monthYearFormatBETA(company.positions[0].endDate) }}
          </p>
          <p class="ma-2 px-6" style="color: #828282" v-else>
            {{ monthYearFormatBETA(getTotalTimeAtCompany(company)) }} - {{ monthYearFormatBETA(endDate) }}
          </p>
        </v-list-item-title>
        <div
          class="ml-12 px-6"
          style="color: #828282; font-size: 15px"
          v-for="(position, posIndex) in company.positions"
          :key="position.title + posIndex"
        >
          <p style="display: inline">{{ position.title }}</p>
          <p class="ma-2 px-6" style="color: #828282; display: inline">{{ getDurationOfPosition(position) }} months</p>
        </div>
      </v-list-item>
    </div>
    <div v-if="!isEmpty(model.companies) && Math.ceil(model.companies.length / 5) != 1" class="text-center">
      <v-pagination v-model="page" :length="Math.ceil(model.companies.length / 5)" :total-visible="8"></v-pagination>
    </div>
  </base-info-modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseInfoModal from './BaseInfoModal.vue';
import { add, difference, minimum } from '../../../shared/dateUtils';
import { monthYearFormatBETA, isEmpty } from '../../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const earliestStartDate = ref(null);
const endDate = ref(null);
const props = defineProps(['model']);
const page = ref(1);

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = (page.value - 1) * 5; //each page contains 5 job entries
  const endIndex = startIndex + 5;
  if (!isEmpty(props.model.companies)) {
    return props.model.companies.slice(startIndex, endIndex);
  }
  return [];
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function getDurationOfPosition(position) {
  let totalTime = 0;

  totalTime = Math.round(difference(position.endDate, position.startDate, 'M'));

  return totalTime;
}

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
</script>
