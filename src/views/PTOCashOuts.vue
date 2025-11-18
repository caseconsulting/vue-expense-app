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
        <time-data v-if="employee" :employee="employee" :title="timeDataTitle" :key="employee.id" />
        <div v-else> 
            <div id="t-sheets-data">
              <v-card density="compact">
                <v-card-title class="header_style d-flex align-center py-0 relative">
                  <h3>Time Data</h3>
                </v-card-title>
                <v-card-text class="mt-3 px-7 text-center">
                  <br v-for="i in 10" :key="i" />
                  <v-icon icon="mdi-information" />
                  <p class="mt-4 font-weight-bold">Select an employee to view their time data</p>
                  <br v-for="i in 10" :key="i" />
                </v-card-text>
              </v-card>
            </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
<script setup>
import PTOCashOutsTable from '@/components/shared/PTOCashOutsTable.vue';
import TimeData from '@/components/shared/timesheets/TimeData';
import { onBeforeUnmount, onMounted, inject, watch, computed, ref } from 'vue';
import { storeIsPopulated } from '../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');

const loading = ref(false);
const employee = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|
/**
 * Mounted lifecycle hook
 */
onMounted(() => {
  loading.value = !storeIsPopulated;

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
  if (storeIsPopulated) loading.value = false;
}); // watchStoreIsPopulated

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const timeDataTitle = computed(() => `${employee.value.nickname ?? employee.value.firstName} ${employee.value.lastName}'s Time Data`)
</script>
