<template>
  <div id="budget-table">
    <v-container fluid>
      <v-data-iterator :items="employee" hide-default-footer>
        <template v-slot:default="props">
          <v-row>
            <v-col v-for="item in props.items" :key="item.name" cols="12" sm="6" lg="6">
              <v-card>
                <v-card-title class="header_style">
                  <h4 class="white--text">{{ item.expenseTypeName }}</h4>
                </v-card-title>
                <v-divider></v-divider>
                <v-list class="pt-13" dense>
                  <v-list-item>
                    <v-list-item-content>Budget:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ item.budget | moneyValue }}</div>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>Reimbursed:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ getReimbursed(item) | moneyValue }}</div>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>Pending:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ getUnreimbursed(item) | moneyValue }}</div>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content class="bold">Remaining:</v-list-item-content>
                    <v-list-item-content v-if="getRedColor(item)" class="text-right bold red--text">
                      <div>{{ remaining(item) | moneyValue }}</div>
                    </v-list-item-content>
                    <v-list-item-content v-else class="text-right bold black--text">
                      <div>{{ remaining(item) | moneyValue }}</div>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>Overdraft:</v-list-item-content>
                    <v-list-item-content class="text-right">
                      <div>{{ odFlagMessage(item) }}</div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </template>
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
