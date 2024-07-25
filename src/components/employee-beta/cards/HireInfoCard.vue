<template>
  <v-card elevation="4" width="170px" rounded="1">
    <span style="background-color: red"></span>
    <div class="info-header font-weight-black" style="padding-top: 5px">Hire date</div>
    <div class="info-div">{{ monthDayYearFormat(model.hireDate) || 'No hire date 😫' }}</div>
    <div v-if="wasIntern" class="info-header font-weight-black">Internship date</div>
    <div v-if="wasIntern" class="info-div">
      {{ internshipDate }}
    </div>
    <div class="info-header font-weight-black">Time with CASE</div>
    <div class="info-div">{{ getYearsWith }} {{ getDaysWith }}</div>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { monthDayYearFormat } from '@/utils/utils';
import { difference, format, getTodaysDate } from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const wasIntern = ref(props.model.employeeRole === 'intern');
const internshipDate = ref(monthDayYearFormat(props.model.hireDate)); //temp for now

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

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
  padding-left: 10px;
}
.info-div {
  position: relative;
  padding-bottom: 5px;
  padding-left: 10px;
}
</style>
