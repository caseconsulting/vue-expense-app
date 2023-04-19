<template>
  <v-row>
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

function created() {
  if (this.$store.getters.storeIsPopulated) {
    this.employee = this.$store.getters.user;
    this.loading = false;
  }
}

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
    PTOCashOutsTable,
    QuickBooksTimeData
  },
  computed: {
    storeIsPopulated
  },
  created,
  data() {
    return {
      loading: true
    };
  },
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  }
};
</script>
