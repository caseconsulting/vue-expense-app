<template>
  <v-card :elevation="3">
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      :right="true"
      :timeout="5000"
      :top="true"
      :vertical="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" text @click="clearStatus"> Close </v-btn>
    </v-snackbar>
    <v-card color="#bc3825">
      <v-card-title headline v-bind:class="{ 'justify-center': isMobile }">
        <h2 class="text-center white--text">Reimbursements</h2>
      </v-card-title>
    </v-card>
    <v-tabs v-model="currentTab">
      <v-tab class="ml-5" href="#expenses">Expenses</v-tab>
      <v-tab href="#ptoCashOuts">PTO Cash Outs</v-tab>
      <v-tab-item id="expenses" class="mx-2 mb-6">
        <UnreimbursedExpenses />
      </v-tab-item>
      <v-tab-item id="ptoCashOuts" class="mx-2 my-6">
        <v-row>
          <v-col cols="12" xl="9" lg="8">
            <p-t-o-cash-outs-table :unapprovedOnly="true" />
          </v-col>
          <v-col cols="12" xl="3" lg="4" class="pl-lg-1 pl-sm-2">
            <quick-books-time-data v-if="employee" :employee="employee"></quick-books-time-data>
            <v-skeleton-loader v-else class="mt-3" type="card-heading, list-item@12"></v-skeleton-loader>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs>
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
  window.EventBus.$on('status-alert', (status) => {
    this.$set(this.status, 'statusType', status.statusType);
    this.$set(this.status, 'statusMessage', status.statusMessage);
    this.$set(this.status, 'color', status.color);
  });

  window.EventBus.$on('change-quickbooks-employee', (employee) => {
    this.employee = employee;
  });
} // mounted

/**
 * before destroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('status-alert');
} // beforeDestroy

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
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
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
  created,
  beforeDestroy,
  components: {
    UnreimbursedExpenses,
    PTOCashOutsTable,
    QuickBooksTimeData
  },
  computed: {
    isMobile,
    storeIsPopulated
  },
  methods: {
    clearStatus
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
  mounted,
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  }
};
</script>
