<template>
  <div id="budget-table">
    <v-container fluid>
      <v-card color="blue">
        <v-card-title>
          <h4 class="white--text subheading">Remaining Balances</h4>
        </v-card-title>
        <v-divider></v-divider>
        <v-list dense>
          <v-list-tile v-for="item in employee">
            <v-list-tile-content>{{ item.expenseTypeName }}:</v-list-tile-content>
            <v-list-tile-content class="align-end">{{ remaining(item) | moneyValue }}</v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-container>
  </div>
</template>
<script>
export default {
  props: ['employee'],
  filters: {
    moneyValue: value => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    }
  },
  methods: {
    remaining(item) {
      if (item.budgetObject) {
        return item.budget - item.budgetObject.pendingAmount - item.budgetObject.reimbursedAmount;
      }
      return item.budget;
    }
  }
};
</script>
<style></style>
