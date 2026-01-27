<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between beta_header_style">
      <h3 class="text-white">CASE Information</h3>
    </v-card-title>

    <!-- Job Role and Hire Date information -->
    <v-card-text class="pb-0">
      <div>
        <h2 class="mt-4 fit-content" style="font-size: large">{{ props.model.jobRole || 'No Job Role' }}</h2>
        <p v-if="!model.deptDate" class="mb-1 info-header">Since {{ monthDayYearFormat(model.hireDate) }}</p>
        <p class="mb-1 info-header" v-else>Departed {{ monthDayYearFormat(model.deptDate) }}</p>
      </div>

      <div v-if="internshipDate">
        <h2 class="fit-content" style="font-size: large">Internship date</h2>
        <div class="info-div">
          {{ internshipDate }}
        </div>
      </div>

      <div>
        <h2 class="fit-content" style="font-size: large">Time with CASE</h2>
        <div class="info-div">{{ getYearsWith }} {{ getDaysWith }}</div>
      </div>

      <div>
        <h2 class="fit-content" style="font-size: large">Anniversary Countdown</h2>
        <p class="info-div" v-if="!model.hireDate">It's your Anniversary!</p>
        <p class="info-div mb-0" v-else>{{ getDaysUntil }} Days until Anniversary</p>
      </div>

      <!-- Access Control stuff -->
       <div>
        <h2 class="fit-content" style="font-size: large">Reports To</h2>
        <div class="info-div" v-if="accessControlUsers.length">
          <p v-for="{ name, position } of accessControlUsers" :key="name" class="my-0">{{ position }}: {{ name }}</p>
        </div>
        <div v-else class="info-div">Nobody</div>
       </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { add, getTodaysDate, isAfter, setYear, difference, format } from '@/shared/dateUtils';
import { monthDayYearFormat } from '@/utils/utils';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model', 'accessControl']);
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                   COMPUTED                       |
// |                                                  |
// |--------------------------------------------------|

const accessControlUsers = computed(() => {
  let items = [];
  console.log(props.accessControl);
  for (let position of Object.keys(props.accessControl ?? {})) {
    for (let id of props.accessControl[position]) {
      let emp = store.getters.employees.find((e) => e.id === id);
      items.push({ position, name: `${emp.nickname || emp.firstName} ${emp.lastName}` });
    }
  }
  console.log(items);
  return items;
});

const internshipDate = computed(() => {
  return format(props.model.internshipDate, null, 'MMMM YYYY');
});

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
