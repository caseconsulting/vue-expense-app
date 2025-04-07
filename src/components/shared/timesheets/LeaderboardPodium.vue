<template>
  <div>
    <v-row class="justify-center my-3">
      <leader v-bind:leader="first" :trophy="true" iconClass="gold" :loading="loading"></leader>
    </v-row>
    <v-row class="justify-space-around">
      <leader :leader="second" :trophy="true" iconClass="silver" :loading="loading"></leader>
      <leader :leader="third" :trophy="true" iconClass="bronze" :loading="loading"></leader>
    </v-row>
  </div>
</template>

<script setup>
import Leader from '@/components/shared/timesheets/Leader';
import { useStore } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import api from '@/shared/api';
import { updateStoreTags } from '@/utils/storeUtils';
import { nonBillableTags } from '@/utils/tags';
import { getTimesheets } from '@/utils/timesheets';
import { getTodaysDate, startOf } from '@/shared/dateUtils';
import _sortBy from 'lodash/sortBy';
import _reverse from 'lodash/reverse';
import { loadBasecampAvatars } from '@/utils/basecamp';

const LOCAL_STORAGE_KEY = 'leaderboard';

const store = useStore();
const loading = ref(true);
const first = ref(null);
const second = ref(null);
const third = ref(null);

/**
 * onBeforeMount lifecycle hook
 */
onBeforeMount(async () => {
  let localStorageData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localStorageData) {
    [first.value, second.value, third.value] = JSON.parse(localStorageData);
  } else {
    await getLeaderboardData();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([first.value, second.value, third.value]));
  }

  loading.value = false;
});

async function getLeaderboardData() {
  let employees = await api.getEmployees();
  if (!store.getters.tags) {
    await updateStoreTags();
  }
  let filteredTags = nonBillableTags(store.getters.tags);
  let nonBillableEmployeeIds = filteredTags.flatMap((tag) => tag.employees);
  let billableEmployees = employees.filter((employee) => !nonBillableEmployeeIds.includes(employee.id));

  let [start, end] = [startOf(getTodaysDate('YYYY-MM-DD'), 'year'), getTodaysDate('YYYY-MM-DD')];

  let timesheetsByEmployeeNumber = await getTimesheets(billableEmployees, start, end);

  let sortedTimesheets = _reverse(_sortBy(timesheetsByEmployeeNumber, 'billableTimesheet'));

  // setup first place
  let firstTimesheet = sortedTimesheets[0];
  let firstEmployee = employees.find((e) => e.employeeNumber == firstTimesheet?.employeeNumber);
  first.value = { ...firstEmployee, ...firstTimesheet };

  // setup second place
  let secondTimesheet = sortedTimesheets[1];
  let secondEmployee = employees.find((e) => e.employeeNumber == secondTimesheet?.employeeNumber);
  second.value = { ...secondEmployee, ...secondTimesheet };

  // setup third place
  let thirdTimesheet = sortedTimesheets[2];
  let thirdEmployee = employees.find((e) => e.employeeNumber == thirdTimesheet?.employeeNumber);
  third.value = { ...thirdEmployee, ...thirdTimesheet };
  if (!store.getters.basecampAvatars) {
    await loadBasecampAvatars(store, [first.value, second.value, third.value]);
  }
}
</script>
