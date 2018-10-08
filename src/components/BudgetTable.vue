<template>
<div id="budget-table">
  <v-container fluid grid-list-md>


    <v-data-iterator :items="employee" content-tag="v-layout" hide-actions row wrap>
      <v-flex slot="item" slot-scope="props" xs12 sm6 md4 lg3>
        <v-container fluid>
          <v-card color="blue">
            <v-card-title>
              <h4 class="white--text subheading">{{ props.item.expenseTypeName }}</h4>
            </v-card-title>
            <v-divider></v-divider>
            <v-list dense>
              <v-list-tile>
                <v-list-tile-content>Budget:</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ props.item.budget | moneyValue }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Reimbursed:</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ getReimbursed(props.item) | moneyValue }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Unreimbursed:</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ getUnreimbursed(props.item) | moneyValue }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content class="bold">Remaining:</v-list-tile-content>
                <v-list-tile-content v-if="getRedColor(props.item)" class="align-end bold red--text">{{ remaining(props.item)| moneyValue }}</v-list-tile-content>
                <v-list-tile-content v-else class="align-end bold black--text">{{ remaining(props.item)| moneyValue }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Overdraft:</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ odFlagMessage(props.item) }}</v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-container>
      </v-flex>

    </v-data-iterator>
  </v-container>
</div>
</template>
<script>
export default {
  props: ['employee'],
  data: () => ({
    rowsPerPageItems: [1, 4, 8, 12],
    pagination: {
      rowsPerPage: 4
    }
  }),
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
    odFlagMessage(expenseType) {
      let isOverdraftAllowed = expenseType.odFlag;
      return isOverdraftAllowed ? 'Allowed' : 'Not Allowed';
    },
    getRedColor(expenseType) {
      return this.remaining(expenseType) <= 0 && !expenseType.odFlag;
    },
    remaining(item) {
      if (item.budgetObject) {
        return item.budget - item.budgetObject.pendingAmount - item.budgetObject.reimbursedAmount;
      }
      return item.budget;
    },
    getReimbursed(item) {
      if (item.budgetObject) {
        return item.budgetObject.reimbursedAmount;
      }
      return 0;
    },
    getUnreimbursed(item) {
      if (item.budgetObject) {
        return item.budgetObject.pendingAmount;
      }
      return 0;
    }
  },
  computed: {}
};
</script>
<style>
.bold {
  font-weight: 900;
}
</style>
