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
    <budget-table v-if="!loading" :employee="getBudgets"></budget-table>
    <budget-chart v-if="!loading" :options="drawGraph.optionSet" :chart-data="drawGraph.dataSet" @add="addModelToTable"></budget-chart>
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
import pattern from 'patternomaly';
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
    EventBus.$on("refreshChart", this.updateData);
    this.refreshBudget();
  },
  methods: {
    updateData(newData) {
      this.expenseTypeData = _.map(this.expenseTypeData, (data) => {
        if (newData.expenseTypeId === data.id) {
          data.expenses.push(newData)
        }
        return data;
      })
    },
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
      this.employee = employeeVar;
      this.expenseTypeData = _.map(this.employee.expenseTypeData, expenseType => {
        expenseType.textColor = 'black';
        return expenseType;
      });
      this.employee.expenseTypeData.map(expenseType => {
        let totalCost = 0;
        for (var i = 0; i < expenseType.expenses.length; i++) {
          totalCost = totalCost + expenseType.expenses[i].cost;
        }
        expenseType.totalCost = totalCost;
        return expenseType;
      });
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
    },
    getTotals(expenseType) {
      let totalReimbursed = 0;
      let totalUnreimbursed = 0;
      let totalOdReimbursed = 0;
      let totalOdUnreimbursed = 0;
      let totalDifference = expenseType.budget;
      let isOverdraft = expenseType.odFlag;
      let i = expenseType.expenses.length;
      let owed = 0;
      for (let j = 0; j < i; j++) {
        let expense = expenseType.expenses[j];
        let cost = expense.cost;
        let isReimbursed = expense.reimbursedDate;
        totalDifference = totalDifference - cost;
        if (totalDifference >= 0) {
          if (isReimbursed) {
            totalReimbursed += cost;
          } else {
            totalUnreimbursed += cost;
          }
        } else {
          if (isReimbursed) {
            owed = -totalDifference;
            totalOdReimbursed += owed;
            totalReimbursed += cost - owed;
            totalDifference = 0;
          } else {
            owed = -totalDifference;
            totalOdUnreimbursed += owed;
            totalUnreimbursed += cost - owed;
            totalDifference = 0;
          }
        }

      }

      return {
        reimbursed: totalReimbursed,
        unreimbursed: totalUnreimbursed,
        odReimbursed: totalOdReimbursed,
        odUnreimbursed: totalOdUnreimbursed,
        difference: totalDifference
      };
    }
  },

  computed: {
    budgets() {
      let budgetNames = [];
      let budgetCosts = [];
      let budgetDifference = [];
      let reimbursed = [];
      let unreimbursed = [];
      let odReimbursed = [];
      let odUnreimbursed = [];
      if (this.employee !== undefined) {
        //Race Condition here
        let expenseTypes = this.expenseTypeData;
        for (var i = 0; i < this.expenseTypeData.length; i++) {
          budgetNames.push(expenseTypes[i].budgetName);
          let total = this.getTotals(expenseTypes[i]);
          budgetDifference.push(total.difference);
          reimbursed.push(total.reimbursed);
          unreimbursed.push(total.unreimbursed);
          odReimbursed.push(total.odReimbursed);
          odUnreimbursed.push(total.odUnreimbursed);
          this.employee.expenseTypeData[i].reimbursed = total.reimbursed + total.odReimbursed; //For BudgetTable
          this.employee.expenseTypeData[i].unreimbursed = total.unreimbursed + total.odUnreimbursed; //For BudgetTable
        }
      }

      return {
        names: budgetNames,
        difference: budgetDifference,
        reimbursed: reimbursed,
        unreimbursed: unreimbursed,
        odReimbursed: odReimbursed,
        odUnreimbursed: odUnreimbursed
      };
    },
    drawGraph() {
      // Overwriting base render method with actual data.
      let data = {
        labels: this.budgets.names,
        datasets: [{
            type: 'bar',
            label: 'Reimbursed',
            backgroundColor: '#2195f3',
            data: this.budgets.reimbursed
          },
          {
            type: 'bar',
            label: 'Unreimbursed',
            backgroundColor: '#ff6666',
            data: this.budgets.unreimbursed
          },
          {
            type: 'bar',
            label: 'Remaining Budget',
            backgroundColor: '#e1e7f2',
            fill: false,
            data: this.budgets.difference

          },
          {
            type: 'bar',
            label: 'Overdraft Reimbursed',
            backgroundColor: pattern.draw('diagonal', '#88beef'),
            data: this.budgets.odReimbursed
          },
          {
            type: 'bar',
            label: 'Overdraft Unreimbursed',
            backgroundColor: pattern.draw('diagonal', 'pink'),
            data: this.budgets.odUnreimbursed
          }
        ]
      }

      let options = {
        scales: {
          yAxes: [{
            stacked: true,
            ticks: {
              beginAtZero: true,
              callback: function(value, index, values) {
                return value.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                });
              }
            }
          }],
          xAxes: [{
            stacked: true,
            categoryPercentage: 0.5,
            barPercentage: 1,
            ticks: {
              autoSkip: false
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return (
                "$" +
                Number(tooltipItem.yLabel)
                .toFixed(0)
                .replace(/./g, function(c, i, a) {
                  return i > 0 && c !== '.' && (a.length - i) % 3 === 0 ?
                    ',' + c :
                    c;
                })
              );
            }
          }
        },
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      }

      return {
        dataSet: data,
        optionSet: options
      };
    },
    getBudgets() {
      return this.expenseTypeData;
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
