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
      <v-card-text color="white">
        <span class="text-h6 font-weight-medium">{{ status.statusMessage }}</span>
      </v-card-text>
      <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
    </v-snackbar>
    <v-card>
      <v-card color="#bc3825">
        <v-card-title class="d-flex align-center header_style">
          <h2 class="text-white">Contracts</h2>
        </v-card-title>
      </v-card>
      <v-container fluid class="px-0 px-md-4">
        <v-btn
          :disabled="!$store.getters.contracts"
          :size="isMobile ? 'small' : 'default'"
          class="my-2 mr-2"
          @click="toggleContractForm = true"
        >
          Create a contract <v-icon end> mdi-file-document-plus </v-icon>
        </v-btn>
        <!-- Download contracts CSV button -->

        <convert-contracts-to-csv
          :mid-action="midAction"
          :contracts="$store.getters.contracts"
          :employees="$store.getters.employees"
        />

        <contracts-page-loader v-if="loading" />
        <contracts-table v-else />

        <br />
      </v-container>
    </v-card>
    <ContractForm :toggle-contract-form="toggleContractForm" />
  </div>
</template>
<script>
import ContractsTable from '@/components/contracts/ContractsTable.vue';
import ContractForm from '@/components/contracts/ContractForm.vue';
import ContractsPageLoader from '@/components/contracts/ContractsPageLoader.vue';

import { isMobile } from '@/utils/utils';
import { updateStoreContracts, updateStoreEmployees } from '@/utils/storeUtils';
import ConvertContractsToCsv from '../components/contracts/ConvertContractsToCsv.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * beforeUnmount life cycle hook
 */
function beforeUnmount() {
  this.emitter.off('canceled-contract-form');
  this.emitter.off('submitted-contract-form');
  this.emitter.off('status-alert');
} // beforeUnmount

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
  components: {
    ContractsTable,
    ContractForm,
    ContractsPageLoader,
    ConvertContractsToCsv
  },
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
  computed: {
    isMobile
  },
  beforeUnmount,
  created,
  methods: {
    updateStoreContracts,
    updateStoreEmployees,
    clearStatus
  }
};
</script>
