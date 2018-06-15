<template>
<div>
  <b-alert :show="loading" variant="info">Loading...</b-alert>
  <b-row>
    <b-col offset-lg="1" offset-md="2" lg="9" md="12" sm="12">
      <unreimbursed-table></unreimbursed-table>
      <reimbursed-table></reimbursed-table>
    </b-col>
    <b-col lg="2" md="12" sm="12">
      <expense-info></expense-info>
      <expense-type-totals></expense-type-totals>
    </b-col>
  </b-row>
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
