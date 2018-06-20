<template>
<div>
  <!-- <b-alert :show="loading" variant="info">Loading...</b-alert> -->
  <v-layout row wrap>
    <v-flex offset-lg1 offset-md2 lg9 md10 sm12>
      <unreimbursed-table></unreimbursed-table>
      <!-- <reimbursed-table></reimbursed-table> -->
    </v-flex>
    <v-flex lg2 md2 sm12>
      <expense-info></expense-info>
      <expense-type-totals></expense-type-totals>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import api from '@/shared/api.js';
import Datepicker from 'vuejs-datepicker';
import ReimbursedTable from '../components/ReimbursedTable.vue';
import UnreimbursedTable from '../components/UnreimbursedTable.vue';
import ExpenseInfo from '../components/ExpenseInfo.vue';
import ExpenseTypeTotals from '../components/ExpenseTypeTotals.vue';

export default {
  data() {
    return {
      loading: false,
      expenses: [],
      errors: [],
      model: {}
    };
  },
  components: {
    Datepicker,
    UnreimbursedTable,
    ReimbursedTable,
    ExpenseInfo,
    ExpenseTypeTotals
  },
  async created() {
    // Fetches posts when the component is created.
    this.refreshExpenses();
  },
  methods: {
    async refreshExpenses() {
      this.loading = true;
      this.expenses = await api.getItems(api.EXPENSES);
      this.loading = false;
    }
  }
};
</script>
