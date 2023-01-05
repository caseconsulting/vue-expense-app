<template>
  <div>
    <v-card>
      <v-card color="#bc3825">
        <v-card-title headline><h2 class="white--text">Contracts</h2> </v-card-title>
      </v-card>
      <v-container fluid>
        <v-btn @click="toggleContractForm = true"
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

function created() {
  window.EventBus.$on('canceled-contract-form', () => (this.toggleContractForm = false));
}

export default {
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
