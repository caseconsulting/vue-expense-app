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
        <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
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
<script>
import PTOCashOutsTable from '@/components/shared/PTOCashOutsTable.vue';
import TimeData from '@/components/shared/timesheets/TimeData';

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
  this.emitter.on('change-timesheets-employee', (employee) => {
    this.employee = employee;
  });
} // mounted

/**
 * before destroy lifecycle hook
 */
function beforeUnmount() {
  this.emitter.off('status-alert');
} // beforeUnmount

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
  components: {
    PTOCashOutsTable,
    TimeData
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
  computed: {
    storeIsPopulated
  },
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  },
  beforeUnmount,
  created,
  mounted,
  methods: {
    clearStatus
  }
};
</script>
