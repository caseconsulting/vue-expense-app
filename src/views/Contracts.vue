<template>
  <div>
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      location="top right"
      :timeout="5000"
      :vertical="true"
    >
      <v-card-title headline color="white">
        <span class="text-h5">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
    </v-snackbar>
    <v-card>
      <v-card color="#bc3825">
        <v-card-title headline><h2 class="text-white">Contracts</h2> </v-card-title>
      </v-card>
      <v-container fluid>
        <v-btn @click="toggleContractForm = true" :disabled="!$store.getters.contracts" class="my-2"
          >Create a contract <v-icon end> mdi-file-document-plus </v-icon></v-btn
        >
        <contracts-page-loader v-if="loading"></contracts-page-loader>
        <contracts-table v-else></contracts-table>

        <br />

        <!-- Download contracts CSV button -->
        <v-card-actions class="justify-end">
          <convert-contracts-to-csv
            :midAction="midAction"
            :contracts="$store.getters.contracts"
            :employees="$store.getters.employees"
          ></convert-contracts-to-csv>
        </v-card-actions>
      </v-container>
    </v-card>
    <ContractForm :toggleContractForm="toggleContractForm" />
  </div>
</template>
<script>
import ContractsTable from '@/components/contracts/ContractsTable.vue';
import ContractForm from '@/components/contracts/ContractForm.vue';
import ContractsPageLoader from '@/components/contracts/ContractsPageLoader.vue';

import { updateStoreContracts, updateStoreEmployees } from '@/utils/storeUtils';
import ConvertContractsToCsv from '../components/contracts/ConvertContractsToCsv.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * beforeDestroy life cycle hook
 */
function beforeDestroy() {
  this.emitter.off('canceled-contract-form');
  this.emitter.off('submitted-contract-form');
  this.emitter.off('status-alert');
} // beforeDestroy

/**
 * created life cycle hook
 */
async function created() {
  this.loading = true;
  this.emitter.on('canceled-contract-form', () => (this.toggleContractForm = false));
  this.emitter.on('submitted-contract-form', () => (this.toggleContractForm = false));
  this.emitter.on('status-alert', (status) => {
    this.status['statusType'] = status.statusType;
    this.status['statusMessage'] = status.statusMessage;
    this.status['color'] = status.color;
  });

  await Promise.all([
    !this.$store.getters.contracts ? await this.updateStoreContracts() : null,
    !this.$store.getters.employees ? await this.updateStoreEmployees() : null
  ]);
  this.loading = false;
} // created

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
  components: {
    ContractsTable,
    ContractForm,
    ContractsPageLoader,
    ConvertContractsToCsv
  },
  created,
  data() {
    return {
      midAction: false,
      loading: false,
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
    updateStoreEmployees,
    clearStatus
  }
};
</script>
