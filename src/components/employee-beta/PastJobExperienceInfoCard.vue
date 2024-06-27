<template>
  <base-card title="Past Experience">
    <v-card-text v-if="isEmpty(pageList)" class="mt-6" style="font-size: 18px">
      <p>No past job experience to display</p>
    </v-card-text>
    <v-card-text v-else>
      <v-list-item v-for="(company, index) in pageList" :key="company.companyName + index">
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
      <div v-if="!isEmpty(model.companies) && Math.ceil(model.companies.length / 5) != 1" class="text-center">
        <v-card-actions class="d-flex justify-center">
          <v-btn @click="toggleJobExpModal()">Click To See More</v-btn>
        </v-card-actions>
      </div>
      <past-job-experience-modal v-model="toggleModal" :model="model"></past-job-experience-modal>
    </v-card-text>
  </base-card>
</template>

<script setup>
import { _ } from 'lodash';
import { monthYearFormatBETA, isEmpty } from '../../utils/utils';
import { onBeforeMount, ref } from 'vue';
import { add, difference, minimum } from '../../shared/dateUtils';
import PastJobExperienceModal from './modals/PastJobExperienceModal.vue';
import BaseCard from '@/components/employee-beta/BaseCard.vue';

const props = defineProps(['model']);

const earliestStartDate = ref(null);
const endDate = ref(null);
const filterCompanies = ref(_.cloneDeep(props.model.companies));
const pageList = ref([]);
const toggleModal = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFESTYLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
onBeforeMount(() => {
  if (!isEmpty(props.model.companies)) {
    pageList.value = filterCompanies.value.slice(0, 4);
  }
}); // created

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

function toggleJobExpModal() {
  toggleModal.value = !toggleModal.value;
}
</script>
