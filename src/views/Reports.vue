<template>
  <div>
    <h1>Reports</h1>
    <employee-contract-table v-if="!loading"></employee-contract-table>
  </div>
</template>
<script>
import EmployeeContractTable from '@/components/EmployeeContractTable.vue';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

function storeIsPopulated() {
  return this.$store.getters.storeIsPopulated;
}

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
  created() {
    if (this.$store.getters.storeIsPopulated) {
      this.loading = false;
    }
  },
  data() {
    return {
      loading: true
    };
  },
  watch: {
    storeIsPopulated() {
      if (this.$store.getters.storeIsPopulated) {
        this.loading = false;
      }
    }
  }
};
</script>
