<template>
<div>
  <h1>Expense App</h1>
  <b-alert :show="loading" variant="info">Loading...</b-alert>
  <unreimbursed-table></unreimbursed-table>
  <reimbursed-table></reimbursed-table>
</div>
</template>

<script>
import api from '@/shared/api.js';
import Datepicker from 'vuejs-datepicker';
import ReimbursedTable from '../components/ReimbursedTable.vue';
import UnreimbursedTable from '../components/UnreimbursedTable.vue';

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
    ReimbursedTable

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
