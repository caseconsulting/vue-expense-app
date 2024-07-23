<template>
  <v-card :elevation="3">
    <v-card color="#bc3825">
      <v-card-title class="d-flex align-center header_style" v-bind:class="{ 'justify-center': isMobile() }">
        <h2 class="text-center text-white">Reimbursements</h2>
      </v-card-title>
    </v-card>
    <v-tabs v-model="currentTab">
      <v-tab class="ml-5" value="expenses"> Expenses </v-tab>
      <v-tab value="ptoCashOuts"> PTO Cash Outs </v-tab>
    </v-tabs>
    <v-window v-model="currentTab">
      <v-window-item value="expenses" class="mx-2 mb-6">
        <UnreimbursedExpenses />
      </v-window-item>
      <v-window-item value="ptoCashOuts" class="mx-2 my-6">
        <v-row>
          <v-col cols="12" xl="8" lg="7">
            <p-t-o-cash-outs-table :unapproved-only="true" />
          </v-col>
          <v-col cols="12" xl="4" lg="5" class="pl-lg-1 pl-sm-2">
            <time-data :key="employee.id" :employee="employee" />
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup>
import UnreimbursedExpenses from '@/components/reimbursements/UnreimbursedExpenses.vue';
import { isMobile } from '@/utils/utils';
import PTOCashOutsTable from '../components/shared/PTOCashOutsTable.vue';
import TimeData from '@/components/shared/timesheets/TimeData';
import { onBeforeMount, onMounted, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { storeIsPopulated } from '../utils/utils';
// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const store = useStore();

const currentTab = ref('expenses'); // default page
const employee = ref(null);
const loading = ref(true);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
onBeforeMount(() => {
  if (store.getters.storeIsPopulated) {
    employee.value = store.getters.user;
    loading.value = false;
  }
}); // created

/**
 * Mounted lifecycle hook
 */
onMounted(() => {
  emitter.on('change-timesheets-employee', (emp) => {
    employee.value = emp;
  });
}); // mounted

/**
 * before destroy lifecycle hook
 */
onBeforeMount(() => {
  emitter.off('change-timesheets-employee');
}); // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * A watcher for when the vuex store is populated with necessary data.
 */
watch(storeIsPopulated, async () => {
  if (storeIsPopulated) {
    employee.value = store.getters.user;
    loading.value = false;
  }
}); // watchStoreIsPopulated
</script>
