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
      :employee="employee"
      :expenseTypes="expenseTypes"
      :expenses="expenses"></budget-table>
    </v-flex>

    <v-flex text-xs-center lg7 md6 sm6>
      <budget-chart
      :employee="employee"
      :expenseTypes="expenseTypes"
      :expenses="expenses"
      :budgetNames="budgetNames"></budget-chart>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import BudgetChart from '../components/BudgetChart.vue';
import BudgetTable from '../components/BudgetTable.vue';
import api from '@/shared/api.js';
export default {
  data() {
    return {
      loading: false,
      employee: {
        budgetName: '',
        odFlag: false,
        description: '',
        id: '',
        budget: 0,
        expenses: []
      }

    };
  },
  async created() {
    this.refreshBudget();
  },
  methods: {
    async refreshBudget() {
      this.loading = true;
      let employeeVar = await api.getItem(api.SPECIAL, "998440f3-a89d-4654-993d-08deafb47d53");
      console.log(employeeVar);
      this.employee = employeeVar;
    //  console.log(this.employee.expenses);
      this.loading = false;
    },
    // async getExpenseType(expense) {
    //   let expenseType = await api.getItem(
    //     api.EXPENSE_TYPES,
    //     expense.expenseTypeId
    //   );
    //   let found = false;
    //   for(var i = 0; (i < this.expenseTypes.length) && (!found); i++) {
    //     if(this.expenseTypes[i].id === expenseType.id) {
    //       found = true;
    //     }
    //   }
    //   if(!found) {
    //     this.expenseTypes.push(expenseType);
    //   }
    //   return expense;
    // },
    // async getExpense(expense) {
    //   let employee = await api.getItem(
    //     api.EMPLOYEES,
    //     expense.expenseTypeId
    //   );
    //   let found = false;
    //   for(var i = 0; (i < this.employees.length) && (!found); i++) {
    //     if(this.employees[i].id === employee.id) {
    //       found = true;
    //     }
    //   }
    //   if(!found) {
    //     this.employees.push(employee);
    //   }
    //   return expense;
    // },
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
