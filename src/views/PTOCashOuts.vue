<template>
  <v-row>
    <v-col><p-t-o-cash-outs-table /> </v-col>
  </v-row>
</template>
<script>
import PTOCashOutsTable from '@/components/shared/PTOCashOutsTable.vue';
// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    PTOCashOutsTable
  }
};
</script>
