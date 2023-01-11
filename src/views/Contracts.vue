<template>
  <div>
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
    <v-card>
      <v-card color="#bc3825">
        <v-card-title headline><h2 class="white--text">Contracts</h2> </v-card-title>
      </v-card>
      <v-container fluid>
        <v-btn @click="toggleContractForm = true" :disabled="!$store.getters.contracts" class="my-2"
          >Create a contract <v-icon right> mdi-file-document-plus </v-icon></v-btn
        >
        <contracts-table v-if="$store.getters.contracts"></contracts-table>
      </v-container>
    </v-card>
    <ContractForm :toggleContractForm="toggleContractForm" />
  </div>
</template>
<script>
import ContractsTable from '@/components/contracts/ContractsTable.vue';
import ContractForm from '@/components/contracts/ContractForm.vue';

import { updateStoreContracts } from '@/utils/storeUtils';

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
async function created() {
  window.EventBus.$on('canceled-contract-form', () => (this.toggleContractForm = false));
  window.EventBus.$on('submitted-contract-form', () => (this.toggleContractForm = false));
  window.EventBus.$on('status-alert', (status) => {
    this.$set(this.status, 'statusType', status.statusType);
    this.$set(this.status, 'statusMessage', status.statusMessage);
    this.$set(this.status, 'color', status.color);
  });

  !this.$store.getters.contracts ? await this.updateStoreContracts() : null;
} // created

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
  components: {
    ContractsTable,
    ContractForm
  },
  created,
  data() {
    return {
      toggleContractForm: false,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }
    };
  },
  methods: {
    updateStoreContracts,
    clearStatus
  }
};
</script>
