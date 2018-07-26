<template>
<div id="budget-table">
  <v-container fluid grid-list-md>


    <v-data-iterator :items="employee.expenseTypeData" content-tag="v-layout" hide-actions row wrap>


        <v-flex
          slot="item"
          slot-scope="props"
          xs12
          sm6
          md4
          lg3
        >
          <v-card color="blue">
            <v-card-title><h4>{{ props.item.budgetName }}</h4></v-card-title>
            <v-divider></v-divider>
            <v-list dense>
              <v-list-tile>
                <v-list-tile-content>Budget:</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ props.item.budget | moneyValue }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Reimbursed:</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ props.item.reimbursed | moneyValue }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                  <v-list-tile-content>Unreimbursed:</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ props.item.unreimbursed | moneyValue }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                  <v-list-tile-content>Remaining Amount:</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ remaining(props.item)| moneyValue }}</v-list-tile-content>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-content>Overdraft:</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ odFlagMessage(props.item) }}</v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
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
       return (expenseType.odFlag ? "Allowed" : "Not Allowed");
     },
     setColor(expenseType) {
       return (expenseType.value ? "Allowed" : "Not Allowed");
     },
     remaining(item) {
       return item.budget - item.reimbursed - item.unreimbursed;
     }
   }
  }
}
</script>
