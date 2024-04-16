<template>
  <v-card :elevation="3">
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
      <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
    </v-snackbar>
    <v-card color="#bc3825">
      <v-card-title class="d-flex align-center header_style" v-bind:class="{ 'justify-center': isMobile }">
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
            <quick-books-time-data :key="employee.id" :employee="employee" />
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script>
import UnreimbursedExpenses from '@/components/reimbursements/UnreimbursedExpenses.vue';
import { isMobile } from '@/utils/utils';
import PTOCashOutsTable from '../components/shared/PTOCashOutsTable.vue';
import QuickBooksTimeData from '@/components/shared/quickbooks/QuickBooksTimeData';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
function created() {
  if (this.$store.getters.storeIsPopulated) {
    this.employee = this.$store.getters.user;
    this.loading = false;
  }
} // created

/**
 * Mounted lifecycle hook
 */
function mounted() {
  this.emitter.on('status-alert', (status) => {
    this.status['statusType'] = status.statusType;
    this.status['statusMessage'] = status.statusMessage;
    this.status['color'] = status.color;
  });

  this.emitter.on('change-quickbooks-employee', (employee) => {
    this.employee = employee;
  });
} // mounted

/**
 * before destroy lifecycle hook
 */
function beforeUnmount() {
  this.emitter.off('status-alert');
  this.emitter.off('change-quickbooks-employee');
} // beforeUnmount

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
function storeIsPopulated() {
  return this.$store.getters.storeIsPopulated;
} // storeIsPopulated

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.status['statusType'] = undefined;
  this.status['statusMessage'] = '';
  this.status['color'] = '';
} // clearStatus

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * A watcher for when the vuex store is populated with necessary data.
 */
async function watchStoreIsPopulated() {
  if (this.$store.getters.storeIsPopulated) {
    this.employee = this.$store.getters.user;
    this.loading = false;
  }
} // watchStoreIsPopulated

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    UnreimbursedExpenses,
    PTOCashOutsTable,
    QuickBooksTimeData
  },
  data() {
    return {
      currentTab: 'expenses',
      employee: null,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }
    };
  },
  computed: {
    isMobile,
    storeIsPopulated
  },
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  },
  created,
  beforeUnmount,
  mounted,
  methods: {
    clearStatus
  }
};
</script>
