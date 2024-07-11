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
      <!-- Status Alert -->
      <v-snackbar
        v-model="status.statusType"
        :color="status.color"
        multi-line
        location="top right"
        :timeout="5000"
        vertical
      >
        <v-card-text headline color="white">
          <span class="text-h6 font-weight-medium">{{ status.statusMessage }}</span>
        </v-card-text>
        <v-btn color="white" variant="text" @click="clearStatus()"> Close </v-btn>
      </v-snackbar>
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
const status = ref({
  statusType: undefined,
  statusMessage: '',
  color: ''
});
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
  emitter.on('status-alert', (stat) => {
    status.value.statusType = stat.statusType;
    status.value.statusMessage = stat.statusMessage;
    status.value.color = stat.color;
  });
  emitter.on('change-timesheets-employee', (emp) => {
    employee.value = emp;
  });
}); // mounted

/**
 * before destroy lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('status-alert');
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

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  status.value.statusType = undefined;
  status.value.statusMessage = '';
  status.value.color = '';
} // clearStatus
</script>
