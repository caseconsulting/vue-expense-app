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
import { getTodaysDate } from '@/shared/dateUtils';
import { useStore } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import { updateStoreEmployees } from '@/utils/storeUtils';
import api from '@/shared/api';
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
  if (!store.getters.employees) {
    await updateStoreEmployees();
  }
  let leaderboardData = await api.getLeaderboard();
  groupLeaderboardData(leaderboardData, store.getters.employees);
  if (!store.getters.basecampAvatars) {
    await loadBasecampAvatars(store, leaderGroups.value.flat());
  }
}
function groupLeaderboardData(leaderboardData, employees) {
  let employee, group;
  leaderboardData.forEach((leader, index) => {
    group = Math.floor((index + 1) / 4);
    employee = employees.find((e) => e.id == leader.employeeId);
    leaderGroups.value[group] ||= [];
    leaderGroups.value[group].push({ ...employee, ...leader });
  });
}
</script>
