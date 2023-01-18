<template>
  <div>
    <div class="d-flex align-center">
      <h1>Reports</h1>
      <router-link class="no-decoration" to="/stats">
        <v-btn v-if="wasRedirected" elevation="2" color="#bc3825" small outlined class="ml-6">
          <v-icon left dark> mdi-arrow-left-top </v-icon>Back to Statistics</v-btn
        >
      </router-link>
    </div>
    <employee-reports-table v-if="!loading"></employee-reports-table>
  </div>
</template>
<script>
import EmployeeReportsTable from '@/components/reports/EmployeeReportsTable.vue';
import { updateStoreEmployees, updateStoreContracts } from '@/utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook.
 */
async function created() {
  if (this.$store.getters.storeIsPopulated) {
    await Promise.all([
      !this.$store.getters.employees ? this.updateStoreEmployees() : '',
      !this.$store.getters.contracts ? this.updateStoreContracts() : ''
    ]);
    this.loading = false;
  }
  if (this.$route.params.requestedFilter) {
    this.wasRedirected = true;
    window.scrollTo(0, 0);
  }
} // created

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
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  components: {
    EmployeeReportsTable
  },
  computed: {
    storeIsPopulated
  },
  data() {
    return {
      contracts: null,
      loading: true,
      wasRedirected: false
    };
  },
  methods: {
    updateStoreContracts,
    updateStoreEmployees
  },
  watch: {
    async storeIsPopulated() {
      if (this.$store.getters.storeIsPopulated) {
        await Promise.all([
          !this.$store.getters.employees ? this.updateStoreEmployees() : '',
          !this.$store.getters.contracts ? this.updateStoreContracts() : ''
        ]);
        this.loading = false;
      }
    }
  }
};
</script>
