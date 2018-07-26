<template>
<div id="budget-table">
  <v-container fluid grid-list-md>


    <v-data-iterator :items="employee.expenseTypeData" content-tag="v-layout" hide-actions row wrap>

      <v-flex slot="item" slot-scope="props" xs12 sm6 md4 lg3>
        <v-card>
          <v-card-title>
            <h4>{{ props.item.budgetName }}</h4></v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-tile>
              <v-list-tile-content>Budget:</v-list-tile-content>
              <v-list-tile-content class="align-end">{{ props.item.budget }}</v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
              <div>
                <v-list-tile-content>Reimbursed:</v-list-tile-content>
              </div>
              <div>
                <v-list-tile-content class="align-end">{{ props.item.reimbursed }}</v-list-tile-content>
              </div>
            </v-list-tile>
            <v-list-tile>
              <div>
                <v-list-tile-content>Unreimbursed:</v-list-tile-content>
              </div>
              <div>
                <v-list-tile-content class="align-end">{{ props.item.unreimbursed }}</v-list-tile-content>
              </div>
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
    },


    // expenseTypes: [
    //   {
    //     value: 'total',
    //     budget: 60000,
    //     budgetName: 'Overall',
    //     description: "Overall budget of all of the employee's expenses.",
    //     odFlag: true
    //   },
    //   {
    //     value: 'training',
    //     budget: 500,
    //     budgetName: 'Training',
    //     description: "Training in new technologies",
    //     odFlag: true
    //
    //   },
    //   {
    //     value: 'total',
    //     budget: 60000,
    //     budgetName: 'Overall',
    //     description: "Overall budget of all of the employee's expenses.",
    //     odFlag: true
    //
    //   },
    //   {
    //     value: 'total',
    //     budget: 60000,
    //     budgetName: 'Overall',
    //     description: "Overall budget of all of the employee's expenses.",
    //     odFlag: true
    //
    //   },
    //   {
    //     value: 'total',
    //     budget: 60000,
    //     budgetName: 'Overall',
    //     description: "Overall budget of all of the employee's expenses.",
    //     odFlag: true
    //
    //   },
    //   {
    //     value: 'total',
    //     budget: 60000,
    //     budgetName: 'Overall',
    //     description: "Overall budget of all of the employee's expenses.",
    //     odFlag: true
    //
    //   }
    // ]
  }),
  methods: {

    odFlagMessage(expenseType) {
      return (expenseType.odFlag ? "Allowed" : "Not Allowed");
    },
    setColor(expenseType) {
      return (expenseType.value ? "Allowed" : "Not Allowed");
    }
  }
}
</script>
