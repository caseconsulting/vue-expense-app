<template>
  <div>
    <div v-if="loading">
      <div class="text-center my-3">Loading 1860 Leaderboard...</div>
      <v-progress-linear :indeterminate="true"></v-progress-linear>
    </div>
    <v-carousel v-else hide-delimiters height="155" show-arrows="hover">
      <v-carousel-item v-for="(leaderGroup, index) in leaderGroups" :key="index">
        <div v-if="index == 0" class="mx-1">
          <v-row justify="center" class="my-3">
            <leader :leader="leaderGroup[0]" iconClass="gold"></leader>
          </v-row>
          <v-row justify="space-around">
            <leader :leader="leaderGroup[1]" iconClass="silver"></leader>
            <leader :leader="leaderGroup[2]" iconClass="bronze"></leader>
          </v-row>
        </div>
        <div v-else class="ms-8">
          <v-row justify="space-around" class="my-3 me-4">
            <div>
              <leader :leader="leaderGroup[0]"></leader>
              <leader :leader="leaderGroup[1]"></leader>
            </div>
            <div>
              <leader :leader="leaderGroup[2]"></leader>
              <leader :leader="leaderGroup[3]"></leader>
            </div>
          </v-row>
        </div>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script setup>
import Leader from '@/components/shared/timesheets/Leader';
import { useStore } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import { updateStoreEmployees, updateStoreTags } from '@/utils/storeUtils';
import { nonBillableTags } from '@/utils/tags';
import { getTimesheets } from '@/utils/timesheets';
import { getTodaysDate, startOf } from '@/shared/dateUtils';
import _sortBy from 'lodash/sortBy';
import _reverse from 'lodash/reverse';
import { loadBasecampAvatars } from '@/utils/basecamp';

const LOCAL_STORAGE_KEY = `leaderboard-${getTodaysDate()}`;

const store = useStore();
const loading = ref(true);
const leaderGroups = ref([]);

/**
 * onBeforeMount lifecycle hook
 */
onBeforeMount(async () => {
  let localStorageData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localStorageData) {
    leaderGroups.value = JSON.parse(localStorageData);
  } else {
    await getLeaderboardData();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leaderGroups.value));
  }

  loading.value = false;
});

async function getLeaderboardData() {
  await Promise.all([
    store.getters.employees ? '' : updateStoreEmployees(),
    store.getters.tags ? '' : updateStoreTags()
  ]);

  let filteredTags = nonBillableTags(store.getters.tags);
  let nonBillableEmployeeIds = filteredTags.flatMap((tag) => tag.employees);
  let billableEmployees = store.getters.employees.filter((employee) => !nonBillableEmployeeIds.includes(employee.id));

  let [start, end] = [startOf(getTodaysDate('YYYY-MM-DD'), 'year'), getTodaysDate('YYYY-MM-DD')];

  let timesheets = await getTimesheets(billableEmployees, start, end);
  let sortedTimesheets = _reverse(_sortBy(timesheets, 'billableTimesheet')).slice(0, 23);

  let employee, group;
  sortedTimesheets.forEach((timesheet, index) => {
    group = Math.floor((index + 1) / 4);
    employee = billableEmployees.find((e) => e.employeeNumber == timesheet.employeeNumber);
    leaderGroups.value[group] ||= [];
    leaderGroups.value[group].push({ ...employee, ...timesheet });
  });

  if (!store.getters.basecampAvatars) {
    await loadBasecampAvatars(store, leaderGroups.value.flat());
  }
}
</script>
