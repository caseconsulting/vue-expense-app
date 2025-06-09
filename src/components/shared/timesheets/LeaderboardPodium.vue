<template>
  <div>
    <div class="d-flex justify-center">
      <span class="align-content-center font-weight-bold text-decoration-underline">1860 Leaderboard</span>
      <leader v-if="currentUserData" :leader="currentUserData" class="ms-2"></leader>
    </div>

    <div v-if="loading">
      <div class="text-center my-3">Loading Leaderboard...</div>
      <v-progress-linear :indeterminate="true"></v-progress-linear>
    </div>
    <v-carousel v-else hide-delimiters height="155" show-arrows="hover">
      <v-carousel-item v-for="(leaderGroup, index) in leaderGroups" :key="index">
        <div v-if="index == 0" class="mx-1">
          <v-row justify="center" class="my-3">
            <leader :leader="leaderGroup[0]"></leader>
          </v-row>
          <v-row justify="space-around">
            <leader :leader="leaderGroup[1]"></leader>
            <leader :leader="leaderGroup[2]"></leader>
          </v-row>
        </div>
        <div v-else class="ms-1">
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
const currentUserData = ref(null);
const leaderGroups = ref([]);
/**
 * onBeforeMount lifecycle hook
 */
onBeforeMount(async () => {
  let leaderboardData;
  let localStorageData = localStorage.getItem(LOCAL_STORAGE_KEY);

  // use local storage
  if (localStorageData) {
    leaderboardData = JSON.parse(localStorageData);
  } else {
    leaderboardData = await api.getLeaderboard();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leaderboardData));
  }

  // get employees data
  await getEmployees();
  await getAvatars();

  // set current user 1860 data
  if (leaderboardData.currentUserData) {
    currentUserData.value = leaderData(leaderboardData.currentUserData);
  }

  // group leader data
  groupLeaderboardData(leaderboardData.leaderboard);

  loading.value = false;
});

async function getEmployees() {
  if (!store.getters.employees) {
    await updateStoreEmployees();
  }
}

async function getAvatars() {
  if (!store.getters.basecampAvatars) {
    await loadBasecampAvatars(store, leaderGroups.value.flat());
  }
}

function groupLeaderboardData(leaderboardData) {
  let group;
  leaderboardData.forEach((leader, index) => {
    group = Math.floor((index + 1) / 4);
    leaderGroups.value[group] ||= [];
    leaderGroups.value[group].push(leaderData(leader));
  });
}

function leaderData(leader) {
  let employees = store.getters.employees;
  let employee = employees.find((e) => e.id == leader.employeeId);
  return { ...employee, ...leader };
}
</script>
