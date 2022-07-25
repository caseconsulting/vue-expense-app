<template>
  <div>
    <h1>Reports</h1>
    <employee-contract-table v-if="!loading"></employee-contract-table>
  </div>
</template>
<script>
import EmployeeContractTable from '@/components/EmployeeContractTable.vue';
import { updateStoreEmployees } from '@/utils/storeUtils';

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
  components: {
    EmployeeContractTable
  },
  computed: {
    storeIsPopulated
  },
  async created() {
    if (this.$store.getters.storeIsPopulated) {
      if (!this.$store.getters.employees) {
        await this.updateStoreEmployees();
      }
      this.loading = false;
    }
  },
  data() {
    return {
      loading: true
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
