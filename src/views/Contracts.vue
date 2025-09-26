<template>
  <div>
    <v-card>
      <v-card color="#bc3825">
        <v-card-title class="d-flex align-center header_style">
          <h2 class="text-white">Contracts</h2>
          <v-spacer />
          <v-btn class="mr-3" :disabled="!store.getters.contracts" @click="toggleContractForm = true">
            add contract <v-icon end> mdi-file-document-plus </v-icon>
          </v-btn>
          <!-- Download contracts CSV button -->
          <convert-contracts-to-csv
            :mid-action="midAction"
            :contracts="store.getters.contracts"
            :employees="store.getters.employees"
          />
        </v-card-title>
      </v-card>
      <v-container fluid class="px-0 px-md-2">
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
}); // beforeUnmount

/**
 * created life cycle hook
 */
onBeforeMount(async () => {
  loading.value = true;
  emitter.on('canceled-contract-form', () => (toggleContractForm.value = false));
  emitter.on('submitted-contract-form', () => (toggleContractForm.value = false));

  await Promise.all([
    !store.getters.contracts ? await updateStoreContracts() : null,
    !store.getters.employees ? await updateStoreEmployees() : null
  ]);
  loading.value = false;
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

computed(isMobile());
</script>
