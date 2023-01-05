<template>
  <div>
    <v-card>
      <v-card color="#bc3825">
        <v-card-title headline><h2 class="white--text">Contracts</h2> </v-card-title>
      </v-card>
      <v-container fluid>
        <v-btn @click="toggleContractForm = true" class="my-2"
          >Create a contract <v-icon right> mdi-file-document-plus </v-icon></v-btn
        >
        <contracts-table></contracts-table>
      </v-container>
    </v-card>
    <ContractForm :toggleContractForm="toggleContractForm" />
  </div>
</template>
<script>
import ContractsTable from '@/components/contracts/ContractsTable.vue';
import ContractForm from '@/components/contracts/ContractForm.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * beforeDestroy life cycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('submitted-contract-form');
} // beforeDestroy

/**
 * created life cycle hook
 */
function created() {
  window.EventBus.$on('canceled-contract-form', () => (this.toggleContractForm = false));
  window.EventBus.$on('submitted-contract-form', () => (this.toggleContractForm = false));
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy,
  components: {
    ContractsTable,
    ContractForm
  },
  created,
  data() {
    return {
      toggleContractForm: false
    };
  }
};
</script>
