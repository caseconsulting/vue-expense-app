<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between beta_header_style">
      <h3>Past Experience</h3>
      <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text" icon="" class="mx-1">
        <v-tooltip activator="parent" location="top"> Edit Education </v-tooltip>
        <v-icon id="edit" color="white"> mdi-pencil </v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text v-if="isEmpty(pageList)">
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
    </v-card-text>
  </v-card>
</template>

<script setup>
import { _, isEmpty } from 'lodash';
import { monthYearFormatBETA } from '../../utils/utils';
import { onBeforeMount, ref } from 'vue';
import { add, difference, minimum } from '../../shared/dateUtils';

const props = defineProps(['isAdmin', 'isUser', 'model']);

const earliestStartDate = ref(null);
const endDate = ref(null);
const filterCompanies = ref(_.cloneDeep(props.model.companies));
const pageList = ref([]);

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
</script>
