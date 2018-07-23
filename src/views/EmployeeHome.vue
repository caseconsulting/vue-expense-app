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
      :budgetNames="budgetNames"></budget-chart>
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
    budgetNames() {
      let budgets = [];
       let expenseTypes = this.employee.expenses;
       console.log(expenseTypes.length);
       for(var i = 0; i < expenseTypes.length; i++) {
         budgets.push(expenseTypes[i].budgetName);
       }
      return budgets;
    },
    budgets() {
      let budgetCosts = [];
       let expenseTypes = this.employee.expenses;
       for(var i = 0; i < expenseTypes.length; i++) {
         budgetCosts.push(expenseTypes[i].budget);
       }
      return budgetCosts;
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
