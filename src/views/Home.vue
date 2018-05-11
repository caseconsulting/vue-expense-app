<template>
  <div>
    <h1>Home</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>

    <b-row class="mt-3">
      <b-card-group deck>
        <b-card v-for="expense in expenses" :header="expense.description">
          <p class="card-text">
            <table class="table table-sm table-style">
              <tbody>
                <tr>
                  <th scope="row">Category</th>
                  <td>CATEGORY</td>
                </tr>
                <tr>
                  <th scope="row">Cost</th>
                  <td>{{ expense.cost }}</td>
                </tr>
                <tr>
                  <th scope="row">Employee</th>
                  <td>NAME</td>
                </tr>
                <tr>
                  <th scope="row">Purchase Date</th>
                  <td>{{ expense.purchaseDate }}</td>
                </tr>
              </tbody>
            </table>
          </p>
          <div slot="footer">
            <small class="text-muted">Last updated 3 mins ago</small>
          </div>
        </b-card>
      </b-card-group>
    </b-row>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import Datepicker from 'vuejs-datepicker';

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
    Datepicker
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
