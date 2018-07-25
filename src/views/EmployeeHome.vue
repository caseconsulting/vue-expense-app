<template>
<v-container fill-height>
  <v-layout row wrap align-center justify-center>
    <v-flex text-xs-center lg5 md3 sm3 pb-5>
    <v-select
       :items="employees"
       :v-model="employee"
       label="Temporary Employee Select">
     </v-select>
    </v-flex>


    <v-flex text-xs-center lg10 md6 sm6 pb-5>
      <budget-table
      :employee="employee"></budget-table>
    </v-flex>

    <v-flex text-xs-center lg7 md6 sm6>
      <budget-chart
      :employee="employee"
      :budgets="budgets"></budget-chart>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import BudgetChart from '../components/BudgetChart.vue';
import BudgetTable from '../components/BudgetTable.vue';
import api from '@/shared/api.js';
import _ from 'lodash';
export default {
  data() {
    return {
      loading: false,
      employee: {

      }

    };
  },
  async created() {
    this.refreshBudget();
  },
  methods: {
    async refreshBudget() {
      this.loading = true;
      let employeeVar = await api.getSpecial();
      // console.log(employeeVar);
      // console.log(employeeVar.expenses[0]);
      this.employee = employeeVar;
      this.employee.expenses.map(expenseType => {
        let totalCost = 0;
        for(var i = 0; i < expenseType.expenses.length; i++) {
          totalCost = totalCost + expenseType.expenses[i].cost;
        }
        expenseType.totalCost = totalCost;
        return expenseType;
      });
    //  console.log(this.employee.expenses);
      this.loading = false;
    },
    onSelect() {
      this.model = {
        id: item.id,
        firstName: item.firstName,
        middleName: item.middleName,
        lastName: item.lastName,
        empId: item.empId,
        hireDate: item.hireDate
      };
    },
    addModelToTable() {

    },
    deleteModelFromTable(){

    },
    updateModelInTable() {

    }
  },
  computed: {
    // budgets() {
    //   let budgetNames = [];
    //   let budgetCosts = [];
    //    let expenseTypes = this.employee.expenses;
    //    for(var i = 0; i < expenseTypes.length; i++) {
    //      budgetCosts.push(expenseTypes[i].budget);
    //      budgetNames.push(expenseTypes[i].budgetName);
    //    }
    //   return { budgets: budgetCosts, budgetNames: budgetNames};
    // },
    budgets() {
      let budgetNames = [];
      let budgetCosts = [];
      let budgetDifference = [];
      let reimbursed = [];
      let unreimbursed = [];
      let expenseTypes = this.employee.expenses;
      for(var i = 0; i < expenseTypes.length; i++) {
        budgetNames.push(expenseTypes[i].budgetName);

        if(expenseTypes[i].expenses.length === 0){
          budgetDifference.push(expenseTypes[i].budget);
          reimbursed.push(0);
          unreimbursed.push(0);
        }
        else{
          let totalReimbursed = 0;
          let totalUnreimbursed = 0;
          for(var j = 0; j < expenseTypes[i].expenses.length; j++){
            if(expenseTypes[i].expenses[j].reimbursedDate !== null)
            {
              let cost = expenseTypes[i].expenses[j].cost;
              totalReimbursed += cost;
            }
            else {
              let cost = expenseTypes[i].expenses[j].cost;
              totalUnreimbursed += cost;
            }
          }
          let totalDifference = totalReimbursed + totalUnreimbursed;
          console.log(totalDifference);
          console.log('budget:' + expenseTypes[i].budget);
          let budgetCost = expenseTypes[i].budget - totalDifference;
          budgetDifference.push(budgetCost);
          reimbursed.push(totalReimbursed);
          unreimbursed.push(totalUnreimbursed);
      }
    }
      return {
        names: budgetNames,

        difference: budgetDifference,
        reimbursed: reimbursed,
        unreimbursed: unreimbursed
      };


    }

    // remainingBudgets() {
    //   let remainders = [];
    //   let unlinkedExpenses = this.expenses;
    //
    //   for(var i = 0; i < this.expenseTypes.length; i++) {
    //     for(var k = 0; k < this.expenseType)
    //     if(remainder.id === unlinkedExpenses.expenseTypeId) {
    //
    //     }
    //   }
    //   return remainders;
    // }
  },
  components: {
    BudgetChart,
    BudgetTable
  }
};
</script>
<style>
</style>
