<template>
  <v-card>
    <v-card color="#bc3825">
      <v-card-title headline><h2 class="white--text">Contracts</h2> </v-card-title>
    </v-card>
    <v-container fluid>
      <contracts-table></contracts-table>
    </v-container>
  </v-card>
</template>
<script>
import ContractsTable from '@/components/contracts/ContractsTable.vue';

export default { components: { ContractsTable } };
</script>
