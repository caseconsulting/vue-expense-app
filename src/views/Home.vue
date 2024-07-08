<template>
  <v-container fluid>
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      location="top right"
      :timeout="5000"
      :vertical="true"
    >
      <v-card-text color="white">
        <span class="text-h6 font-weight-medium">{{ status.statusMessage }}</span>
      </v-card-text>
      <v-btn color="white" variant="text" @click="clearStatus()"> Close </v-btn>
    </v-snackbar>
    <span v-if="loading">
      <v-row>
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0 d-flex justify-center align-center">
          <v-skeleton-loader type="text" width="80%" />
        </v-col>
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@2" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@5" />
        </v-col>
        <v-col cols="6" class="px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@5" />
        </v-col>
        <v-col cols="12" class="pb-3 px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@14" />
        </v-col>
      </v-row>
      <v-row>
        <v-col mt-0 class="pa-0 px-xl-4 px-lg-2 px-md-0">
          <v-skeleton-loader type="list-item@14" />
        </v-col>
      </v-row>
    </span>
    <span v-else>
      <v-row class="pb-3">
        <!-- Title -->
        <v-col cols="12" md="6">
          <h1 align="center" justify="center" id="home-greeting">Hello, {{ getEmployeePreferredName(employee) }}!</h1>
          <div class="text-center">
            <v-btn color="#bc3825" @click="handleProfile()" theme="dark">View Profile</v-btn>
          </div>
        </v-col>

        <!-- Anniversary Date -->
        <v-col cols="12" md="6" class="px-xl-4 px-lg-2 px-md-0">
          <anniversary-card v-if="!loading" :employee="employee" :has-budgets="true" location="home" />
        </v-col>
      </v-row>
      <v-row class="pb-3">
        <v-col wrap cols="12" lg="6" class="pa-0 px-xl-4 px-lg-2 px-md-0">
          <!-- Timesheets -->
          <div class="pb-3">
            <time-data :employee="employee" cols="12" lg="6" />
          </div>
          <!-- Available Budgets -->
          <div>
            <available-budgets
              id="home-available-budgets"
              :employee="employee"
              :expenses="expenses"
              :expense-types="expenseTypes"
              :employee-data-loading="loadingBudgets"
              :fiscal-date-view="fiscalDateView"
              :accessible-budgets="accessibleBudgets"
            />
          </div>
        </v-col>
        <!-- Activity Feed -->
        <v-col cols="12" lg="6" class="pa-0 px-xl-4 px-lg-2 px-md-0 pt-3 pt-lg-0 pt-xl-0 pt-xxl-0">
          <activity-feed id="home-activity-feed" :employee="employee" />
        </v-col>
      </v-row>
    </span>
  </v-container>
</template>

<script setup>
import ActivityFeed from '@/components/shared/activity-feed/ActivityFeed.vue';
import AvailableBudgets from '@/components/shared/AvailableBudgets.vue';
import { getCurrentBudgetYear } from '@/utils/utils';
import { updateStoreExpenseTypes, updateStoreBudgets } from '@/utils/storeUtils';
import TimeData from '@/components/shared/timesheets/TimeData';
import AnniversaryCard from '@/components/shared/AnniversaryCard';
import { ref, inject, onBeforeUnmount, onBeforeMount, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SET UP                      |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const router = useRouter();
const emitter = inject('emitter');
const accessibleBudgets = ref(null);
const employee = ref({}); // employee
const expenses = ref(null);
const expenseTypes = ref(null);
const fiscalDateView = ref(''); // current budget year view by anniversary day
const hireDate = ref(''); // employee hire date
const loading = ref(true);
const loadingBudgets = ref(true);
const status = ref({
  statusType: undefined,
  statusMessage: '',
  color: ''
});

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget information for employee. Creates event listeners.
 */
onBeforeMount(async () => {
  emitter.on('status-alert', (status) => {
    status.value = status;
  });
  if (store.getters.storeIsPopulated) {
    await loadHomePageData();
    loading.value = false;
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the store is populated from initial page load.
 *
 * @returns boolean - True if the store is populated
 */
// store.getters.storeIsPopulated = computed(() => {
//   return store.getters.storeIsPopulated;
// }); // storeIsPopulated

computed(store.getters.storeIsPopulated);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns the name of an employee based on their preference
 *
 * @input e employee object
 * @return e's preferred name
 */
function getEmployeePreferredName(e) {
  return e.nickname || e.firstName;
}

/**
 * Routes user to their employee page
 */
function handleProfile() {
  router.push(`/employee/${store.getters.employeeNumber}`);
} // handleProfile

/**
 * Loads all of the home page data concurrently upon entering the page.
 */
async function loadHomePageData() {
  await refreshEmployee();
} // loadHomePageData

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  loadingBudgets.value = true;
  employee.value = store.getters.user;
  hireDate.value = employee.value.hireDate;
  fiscalDateView.value = getCurrentBudgetYear(hireDate.value);
  await Promise.all([
    !store.getters.expenseTypes ? updateStoreExpenseTypes() : '',
    !store.getters.budgets ? updateStoreBudgets() : ''
  ]);
  expenseTypes.value = store.getters.expenseTypes;
  accessibleBudgets.value = store.getters.budgets;
  loadingBudgets.value = false;
} // refreshEmployee

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  status.value['statusType'] = undefined;
  status.value['statusMessage'] = '';
  status.value['color'] = '';
} // clearStatus

/**
 * Before destroy lifecycle hook. Destroys listeners.
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
async function watchStoreIsPopulated() {
  if (store.getters.storeIsPopulated) {
    await loadHomePageData();
    loading.value = false;
  }
} // watchStoreIsPopulated

watch(
  () => store.getters.storeIsPopulated,
  () => watchStoreIsPopulated()
);
</script>
