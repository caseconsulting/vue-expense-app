<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between beta_header_style">
      <h3 class="text-white px-2">CASE Information</h3>
    </v-card-title>

    <!-- Job Role and Hire Date information -->
    <v-card-text class="pb-0">
      <div v-if="props.model.jobRole" class="">
        <h2 class="mt-4 fit-content" style="font-size: x-large">{{ props.model.jobRole }}</h2>
        <p v-if="!model.deptDate" class="info-header">Since {{ monthDayYearFormat(model.hireDate) }}</p>
        <p v-else>{{ monthDayYearFormat(model.hireDate) - monthDayYearFormat(model.deptDate) }}</p>
      </div>
      <div v-else>
        <!-- For testing beta purposes:) -->
        <h2 class="mt-4" style="font-size: x-large">Software Dev Intern</h2>
        <p v-if="!model.deptDate" class="info-header">Since {{ monthDayYearFormat(model.hireDate) }}</p>
        <p v-else>{{ monthDayYearFormat(model.hireDate) - monthDayYearFormat(model.deptDate) }}</p>
      </div>
      <v-row>
        <v-col v-if="wasIntern" class="pa-0 pt-3 ma-0">
          <div class="info-header font-weight-black">Internship date</div>
          <div class="info-div">
            {{ internshipDate }}
          </div>
        </v-col>
        <v-col>
          <div class="info-header font-weight-black">Time with CASE</div>
          <div class="info-div">{{ getYearsWith }} {{ getDaysWith }}</div>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Anniversary Card -->
    <v-card class="my-2 mx-4" elevation="4" style="background-color: #f8f8f8">
      <v-card-title class="pa-0">
        <div class="text-center">
          <p v-if="!model.hireDate" class="font-20 ma-2">0 Days until Anniversary</p>
          <p v-else class="font-20 ma-2">{{ getDaysUntil }} Days until Anniversary</p>
        </div>
      </v-card-title>
    </v-card>
  </v-card>
</template>

<script setup>
import { add, getTodaysDate, isAfter, setYear, difference, format } from '@/shared/dateUtils';
import { monthDayYearFormat } from '@/utils/utils';
import { computed, ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const wasIntern = ref(props.model.employeeRole === 'intern');
const internshipDate = ref(monthDayYearFormat(props.model.hireDate)); //temp for now

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

/**
 * Get the days since joining CASE.
 *
 * @return number - returns the number of days since joining CASE
 */
const getDaysWith = computed(() => {
  let years = Math.trunc(difference(getTodaysDate(), format(props.model.hireDate, null, 'LL'), 'years'));
  let days = Math.abs(
    Math.trunc(365 * years) - difference(getTodaysDate(), format(props.model.hireDate, null, 'LL'), 'days')
  );
  if (days > 1 || days === 0) {
    return days + ' days';
  } else if (days == 1) {
    return days + ' day';
  } else {
    return null;
  }
}); // getDaysWith

/**
 * Get the years since joining CASE.
 *
 * @return number - returns the number of years since joining CASE
 */
const getYearsWith = computed(() => {
  let years = Math.trunc(difference(getTodaysDate(), format(props.model.hireDate, null, 'LL'), 'years'));
  if (years > 1) {
    return years + ' Years and';
  } else if (years == 1) {
    return years + ' Year and';
  } else {
    return null;
  }
}); // getYearsWith
</script>

<style scoped>
.info-header {
  position: relative;
  padding-top: 5px;
  padding-left: 10px;
}
.info-div {
  position: relative;
  padding-bottom: 5px;
  padding-left: 10px;
}
</style>
