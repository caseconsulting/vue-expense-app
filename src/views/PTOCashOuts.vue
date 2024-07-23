<template>
  <div>
    <v-row v-if="loading">
      <v-col cols="12" xl="9" lg="8">
        <div class="mt-3">
          <v-skeleton-loader type="table-heading, list-item@6" />
        </div>
      </v-col>
      <v-col cols="12" xl="3" lg="4" class="pl-lg-1 pl-sm-2">
        <v-skeleton-loader class="mt-3" type="list-item@12" />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" xl="8" lg="7">
        <p-t-o-cash-outs-table />
      </v-col>
      <v-col cols="12" xl="4" lg="5" class="pl-lg-1 pl-sm-2">
        <!-- Timesheets -->
        <time-data :key="employee.id" :employee="employee" />
      </v-col>
    </v-row>
  </div>
</template>
<script setup>
import PTOCashOutsTable from '@/components/shared/PTOCashOutsTable.vue';
import TimeData from '@/components/shared/timesheets/TimeData';
import { onBeforeMount, onBeforeUnmount, onMounted, inject, watch, ref } from 'vue';
import { useStore } from 'vuex';
import { storeIsPopulated } from '../utils/utils';
// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const store = useStore();

const loading = ref(true);
const employee = ref(null);

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
onBeforeUnmount(() => {
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
