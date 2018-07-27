<template>
<v-layout row wrap justify-center>
  <v-snackbar v-model="status.statusType" :color="status.color" :multi-line="true" :right="true" :timeout="5000" :top="true" :vertical="true">
    <v-card-title headline color="white">
      <span class="headline">{{status.statusMessage}}</span>
    </v-card-title>
    <v-btn color="white" flat @click="clearStatus">
      Close
    </v-btn>
  </v-snackbar>
  <v-flex lg5 md12 sm12 pb-3>
    <h1 pb-2>Budget Statistics for {{employee.firstName}} {{employee.lastName}}</h1>
  </v-flex>


  <v-flex text-xs-center lg8 md12 sm12>
    <budget-table v-if="!loading" :employee="employee"></budget-table>
    <budget-chart v-if="!loading" :employee="employee" :budgets="budgets"></budget-chart>
  </v-flex>

  <v-flex text-xs-center lg4 md12 sm12>
    <expense-form :expense="expense" v-on:add="addModelToTable" v-on:update="updateModelInTable" v-on:delete="deleteModelFromTable" v-on:error="displayError"></expense-form>
  </v-flex>
</v-layout>
</template>

<script>
import BudgetChart from '../components/BudgetChart.vue';
import BudgetTable from '../components/BudgetTable.vue';
import ExpenseForm from '../components/ExpenseForm.vue';
import moment from 'moment';
import api from '@/shared/api.js';
import _ from 'lodash';
export default {
  filters: {
    moneyValue: value => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    },
    dateFormat: value => {
      if (value) {
        return moment(value).format('MMM Do, YYYY');
      } else {
        return '';
      }
    }
  },
  data() {
    return {
      loading: false,

      employees: [],
      employee: {},
      expenseTypeData: [],
      expenses: [],
      processedExpenses: [],
      errors: [],
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      },
      expense: {
        id: '',
        description: '',
        cost: '0',
        note: null,
        userId: '',
        expenseTypeId: '',
        purchaseDate: null,
        reimbursedDate: null,
        reciept: null,
        employeeName: '',
        budgetName: ''
      }
    };
  },
  async created() {
    this.refreshBudget();
  },
  methods: {
    clearStatus() {
      this.$set(this.status, 'statusType', undefined);
      this.$set(this.status, 'statusMessage', '');
      this.$set(this.status, 'color', '');
    },
    async displayError(err) {
      this.$set(this.status, 'statusType', 'ERROR');
      this.$set(this.status, 'statusMessage', err);
      this.$set(this.status, 'color', 'red');
    },
    async refreshBudget() {
      this.loading = true;
      let employee = await api.getUser();
      let employeeVar = await api.getItem(api.SPECIAL, employee.id);
      // console.log(employeeVar);
      // console.log(employeeVar.expenses[0]);
      this.employee = employeeVar;
      this.expenseTypeData = this.employee.expenseTypeData;
      // this.employee.expenseTypeData.map(expenseType => {
      //   let totalCost = 0;
      //   for(var i = 0; i < expenseType.expenses.length; i++) {
      //     totalCost = totalCost + expenseType.expenses[i].cost;
      //   }
      //   expenseType.totalCost = totalCost;
      //   return expenseType;
      // });
      //  console.log(this.employee.expenseTypeData);
      this.employee.expenseTypeData.map(expenseType => {
        let totalCost = 0;
        for (var i = 0; i < expenseType.expenses.length; i++) {
          totalCost = totalCost + expenseType.expenses[i].cost;
        }
        expenseType.totalCost = totalCost;
        return expenseType;
      });
      //  console.log(this.employee.expenseTypeData);

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
    updateModelInTable(updatedExpense) {
      let matchingExpensesIndex = _.findIndex(
        this.processedExpenses,
        expense => expense.id === updatedExpense.id
      );

      api.getItem(api.EMPLOYEES, updatedExpense.userId).then(employee => {
        let employeeName = `${employee.firstName} ${employee.middleName} ${
          employee.lastName
        }`;
        this.$set(updatedExpense, 'employeeName', employeeName);
      });

      api
        .getItem(api.EXPENSE_TYPES, updatedExpense.expenseTypeId)
        .then(expenseType => {
          this.$set(updatedExpense, 'budgetName', expenseType.budgetName);
        });
      this.processedExpenses.splice(matchingExpensesIndex, 1, updatedExpense);
      this.$set(this.status, 'statusType', 'SUCCESS');
      this.$set(this.status, 'statusMessage', 'Item was successfully updated!');
      this.$set(this.status, 'color', 'green');
    },
    addModelToTable(newExpense) {
      let matchingExpenses = _.filter(
        this.processedExpenses,
        expense => expense.id === newExpense.id
      );

      if (!matchingExpenses.length) {
        api.getItem(api.EMPLOYEES, newExpense.userId).then(employee => {
          let employeeName = `${employee.firstName} ${employee.middleName} ${
            employee.lastName
          }`;
          this.$set(newExpense, 'employeeName', employeeName);
        });

        api
          .getItem(api.EXPENSE_TYPES, newExpense.expenseTypeId)
          .then(expenseType => {
            this.$set(newExpense, 'budgetName', expenseType.budgetName);
          });

        this.processedExpenses.push(newExpense);
        this.$set(this.status, 'statusType', 'SUCCESS');
        this.$set(
          this.status,
          'statusMessage',
          'Item was successfully submitted!'
        );
        this.$set(this.status, 'color', 'green');
      }
    },
    deleteModelFromTable() {
      let modelIndex = _.findIndex(
        this.processedExpenses,
        expense => expense.id === this.expense.id
      );
      this.processedExpenses.splice(modelIndex, 1);
      this.$set(this.status, 'statusType', 'SUCCESS');
      this.$set(this.status, 'statusMessage', 'Item was successfully deleted!');
      this.$set(this.status, 'color', 'green');
    }
  },

  computed: {
    budgets() {
      let budgetNames = [];
      let budgetCosts = [];
      let budgetDifference = [];
      let reimbursed = [];
      let unreimbursed = [];
      if (this.employee !== undefined) {
        //Race Condition here
        let expenseTypes = this.expenseTypeData;
        for (var i = 0; i < this.expenseTypeData.length; i++) {
          budgetNames.push(expenseTypes[i].budgetName);

          if (expenseTypes[i].expenses === undefined) {
            budgetDifference.push(expenseTypes[i].budget);
            reimbursed.push(0);
            unreimbursed.push(0);
            this.employee.expenseTypeData[i].reimbursed = 0;
            this.employee.expenseTypeData[i].unreimbursed = 0;
          } else {
            let totalReimbursed = 0;
            let totalUnreimbursed = 0;
            for (var j = 0; j < expenseTypes[i].expenses.length; j++) {
              if (expenseTypes[i].expenses[j].reimbursedDate !== null) {
                let cost = expenseTypes[i].expenses[j].cost;
                totalReimbursed += cost;
              } else {
                let cost = expenseTypes[i].expenses[j].cost;
                totalUnreimbursed += cost;
              }
            }
            let totalDifference = totalReimbursed + totalUnreimbursed;
            let budgetCost = expenseTypes[i].budget - totalDifference;
            budgetDifference.push(budgetCost);
            reimbursed.push(totalReimbursed);
            unreimbursed.push(totalUnreimbursed);
            this.employee.expenseTypeData[i].reimbursed = totalReimbursed;
            this.employee.expenseTypeData[i].unreimbursed = totalUnreimbursed;
          }
        }
      }
      return {
        names: budgetNames,
        difference: budgetDifference,
        reimbursed: reimbursed,
        unreimbursed: unreimbursed
      };
    }
  },
  components: {
    BudgetChart,
    BudgetTable,
    ExpenseForm
  }
};
</script>
<style>
</style>
