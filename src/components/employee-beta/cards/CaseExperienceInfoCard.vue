<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between beta_header_style">
      <h3 class="text-white px-2">CASE Information</h3>
    </v-card-title>

    <!-- Job Role and Hire Date information -->
    <v-card-text>
      <h2 class="mt-4" style="font-size: x-large" v-if="props.model.jobRole">{{ props.model.jobRole }}</h2>
      <!-- For testing beta purposes:) -->
      <h2 class="mt-4" style="font-size: x-large" v-else>Software Dev Intern</h2>
      <p v-if="!model.deptDate">Since {{ monthDayYearFormat(model.hireDate) }}</p>
      <p v-else>{{ monthDayYearFormat(model.hireDate) - monthDayYearFormat(model.deptDate) }}</p>
    </v-card-text>

    <!-- Anniversary Card -->
    <v-card class="ma-8" elevation="4" style="background-color: #f8f8f8">
      <v-row no-gutters class="pa-4">
        <v-card-title class="pa-0">
          <p v-if="!model.hireDate">0 Days until Anniversary</p>
          <p v-else class="font-20">{{ getDaysUntil }} Days until Anniversary</p>
        </v-card-title>
      </v-row>
    </v-card>
  </v-card>
</template>

<script setup>
import { add, getTodaysDate, isAfter, setYear, difference } from '@/shared/dateUtils';
import { monthDayYearFormat } from '@/utils/utils';
import { computed } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);

// |--------------------------------------------------|
// |                                                  |
// |                   COMPUTED                       |
// |                                                  |
// |--------------------------------------------------|

const getDaysUntil = computed(() => {
  let now = getTodaysDate();
  let curYear = now.split('-')[0];

  let anniversary = setYear(props.model.hireDate, curYear);

  if (isAfter(now, props.model.hireDate)) {
    // employee's hire date is before today
    if (isAfter(add(now, 1, 'd'), anniversary)) {
      // employee's anniversary date has already occured this year
      anniversary = add(anniversary, 1, 'y');
    }
  } else {
    // employee's hire date is in the future
    anniversary = add(props.model.hireDate, 1, 'y');
  }

  return difference(anniversary, now, 'd');
}); // getDaysUntil
</script>
