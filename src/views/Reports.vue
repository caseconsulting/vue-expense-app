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
    <employee-reports-table v-if="!loading" :contracts="contracts"></employee-reports-table>
  </div>
</template>
<script>
import api from '@/shared/api';
import EmployeeReportsTable from '@/components/reports/EmployeeReportsTable.vue';
import { updateStoreEmployees } from '@/utils/storeUtils';

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
    if (!this.$store.getters.employees) {
      await this.updateStoreEmployees();
    }
  }
  if (this.$route.params.requestedFilter) {
    this.wasRedirected = true;
    window.scrollTo(0, 0);
  }
  this.contracts = await api.getItems(api.CONTRACTS);
  this.loading = false;
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
    updateStoreEmployees
  },
  watch: {
    async storeIsPopulated() {
      if (this.$store.getters.storeIsPopulated) {
        if (!this.$store.getters.employees) {
          await this.updateStoreEmployees();
        }
        this.loading = false;
      }
    }
  }
};
</script>
