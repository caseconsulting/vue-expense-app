<template>
  <div>
    <v-row v-if="loading">
      <v-col cols="12" xl="9" lg="8">
        <div class="mt-3">
          <v-skeleton-loader type="table-heading, list-item@6"></v-skeleton-loader>
        </div>
      </v-col>
      <v-col cols="12" xl="3" lg="4" class="pl-lg-1 pl-sm-2">
        <v-skeleton-loader class="mt-3" type="list-item@12"></v-skeleton-loader>
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
        <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
      </v-snackbar>
      <v-col cols="12" xl="9" lg="8"><p-t-o-cash-outs-table /> </v-col>
      <v-col cols="12" xl="3" lg="4" class="pl-lg-1 pl-sm-2">
        <!-- Skeleton Loader-->
        <div v-if="loading">
          <v-card>
            <v-card-title class="header_style py-6">
              <h3>QuickBooks Time Data</h3>
            </v-card-title>
            <v-skeleton-loader type="article,divider,article"></v-skeleton-loader>
          </v-card>
        </div>
        <!-- QuickBooksTime -->
        <quick-books-time-data v-else :employee="employee"></quick-books-time-data>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import PTOCashOutsTable from '@/components/shared/PTOCashOutsTable.vue';
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
function beforeDestroy() {
  this.emitter.off('status-alert');
} // beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
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
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|
export default {
  beforeDestroy,
  created,
  components: {
    PTOCashOutsTable,
    QuickBooksTimeData
  },
  computed: {
    storeIsPopulated
  },
  data() {
    return {
      loading: true,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      },
      employee: null
    };
  },
  mounted,
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  },
  methods: {
    clearStatus
  }
};
</script>
