<template>
  <v-row>
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
    <v-col cols="12" xl="9" lg="8"><p-t-o-cash-outs-table /> </v-col>
    <v-col cols="12" xl="3" lg="4" class="pl-lg-1 pl-sm-2 mt-3">
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
  window.EventBus.$on('status-alert', (status) => {
    this.$set(this.status, 'statusType', status.statusType);
    this.$set(this.status, 'statusMessage', status.statusMessage);
    this.$set(this.status, 'color', status.color);
  });
  if (this.$store.getters.storeIsPopulated) {
    this.employee = this.$store.getters.user;
    this.loading = false;
  }
} // created

/**
 * before destroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('status-alert');
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
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
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
  created,
  data() {
    return {
      loading: true,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }
    };
  },
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  },
  methods: {
    clearStatus
  }
};
</script>
