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
      <v-btn color="white" variant="text" @click="clearStatus()"> Close </v-btn>
    </v-snackbar>
    <v-card>
      <v-card color="#bc3825">
        <v-card-title class="d-flex align-center header_style">
          <h2 class="text-white">Contracts</h2>
        </v-card-title>
      </v-card>
      <v-container fluid class="px-0 px-md-4">
        <v-btn
          :disabled="!store.getters.contracts"
          :size="isMobile() ? 'small' : 'default'"
          class="my-2 mr-2"
          @click="toggleContractForm = true"
        >
          Create a contract <v-icon end> mdi-file-document-plus </v-icon>
        </v-btn>
        <!-- Download contracts CSV button -->
        <convert-contracts-to-csv
          :mid-action="midAction"
          :contracts="store.getters.contracts"
          :employees="store.getters.employees"
        />

        <contracts-page-loader v-if="loading" />
        <contracts-table v-else />

        <br />
      </v-container>
    </v-card>
    <ContractForm :toggle-contract-form="toggleContractForm" />
  </div>
</template>
<script setup>
import ContractsTable from '@/components/contracts/ContractsTable.vue';
import ContractForm from '@/components/contracts/ContractForm.vue';
import ContractsPageLoader from '@/components/contracts/ContractsPageLoader.vue';
import { ref, inject, onBeforeMount, onBeforeUnmount, computed } from 'vue';
import { useStore } from 'vuex';
import { isMobile } from '@/utils/utils';
import { updateStoreContracts, updateStoreEmployees } from '@/utils/storeUtils';
import ConvertContractsToCsv from '../components/contracts/ConvertContractsToCsv.vue';

// |--------------------------------------------------|
// |                                                  |
// |                     SET UP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const emitter = inject('emitter');
const midAction = ref(false);
const loading = ref(false);
const toggleContractForm = ref(false);
const status = ref({
  statusType: undefined,
  statusMessage: '',
  color: ''
});

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * beforeUnmount life cycle hook
 */
onBeforeUnmount(() => {
  emitter.off('canceled-contract-form');
  emitter.off('submitted-contract-form');
  emitter.off('status-alert');
}); // beforeUnmount

/**
 * created life cycle hook
 */
onBeforeMount(async () => {
  loading.value = true;
  emitter.on('canceled-contract-form', () => (toggleContractForm.value = false));
  emitter.on('submitted-contract-form', () => (toggleContractForm.value = false));
  emitter.on('status-alert', (status) => {
    status.value['statusType'] = status.statusType;
    status.value['statusMessage'] = status.statusMessage;
    status.value['color'] = status.color;
  });

  await Promise.all([
    !store.getters.contracts ? await updateStoreContracts() : null,
    !store.getters.employees ? await updateStoreEmployees() : null
  ]);
  loading.value = false;
}); // created

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  status.value['statusType'] = undefined;
  status.value['statusMessage'] = '';
  status.value['color'] = '';
} // clearStatus

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

computed(isMobile());
</script>
