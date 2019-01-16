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
  <v-flex v-if="!isMobile" text-xs-center lg8 md12 sm12 pb-3>
    <h1 pb-2>Budget Statistics for {{employee.firstName}} {{employee.lastName}}</h1>
  </v-flex>
  <v-flex lg4 v-if="!isMobile">
    <v-flex>
      <v-card>
        <v-card-title>
          <div>
            <h3 pt-2>Anniversary Date: {{getAnniversary}}</h3>
            <div @mouseover="display = !display" @mouseleave="display = !display">
              <div v-if="display">
                Days Until: {{getDaysUntil}}
              </div>
              <div v-else>
                Seconds Until: {{getSecondsUntil}}
              </div>
            </div>

          </div>
        </v-card-title>
      </v-card>
    </v-flex>
  </v-flex>
  <v-flex v-if="!isMobile" xs12 sm12 md12 lg8>
    <v-flex text-xs-center>
      <budget-table v-if="!loading" :employee="expenseTypeData"></budget-table>
      <budget-chart v-if="!loading" :options="drawGraph.optionSet" :chart-data="drawGraph.dataSet"></budget-chart>
    </v-flex>
  </v-flex>
  <v-flex v-else xs12 sm12 md12 lg8>
    <v-flex text-xs-center>
      <budget-table-mobile v-if="!loading" :employee="expenseTypeData"></budget-table-mobile>
    </v-flex>
  </v-flex>
  <v-flex xs12 sm12 md12 lg4 pt-3>
    <v-flex text-xs-center lg12 md12 sm12>
      <expense-form :expense="expense" v-on:error="displayError"></expense-form>
    </v-flex>
  </v-flex>

</v-layout>
</template>

<script>
import BudgetChart from '../components/BudgetChart.vue';
import BudgetTable from '../components/BudgetTable.vue';
import BudgetTableMobile from '../components/BudgetTableMobile.vue';
import ExpenseForm from '../components/ExpenseForm.vue';
import moment from 'moment';
import api from '@/shared/api.js';
import _ from 'lodash';
import pattern from 'patternomaly';
import MobileDetect from 'mobile-detect';
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
      hireDate: '',
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
        cost: '',
        note: null,
        userId: '',
        expenseTypeId: '',
        purchaseDate: null,
        reimbursedDate: null,
        reciept: null,
        employeeName: '',
        budgetName: ''
      },
      display: true,
      actualTime: moment().format('X'),
      seconds: 0
    };
  },
  async created() {
    EventBus.$on('refreshChart', this.updateData);
    this.refreshBudget();
    this.compute();
    this.addOneSecondToActualTimeEverySecond();
  },
  watch: {
    actualTime(val, oldVal) {
      this.compute();
    }
  },
  methods: {
    addOneSecondToActualTimeEverySecond() {
      var component = this;
      component.actualTime = moment().format('X');
      setTimeout(function() {
        component.addOneSecondToActualTimeEverySecond();
      }, 1000);
    },
    getDiffInSeconds() {
      return moment('2016-10-21 22:00:00').format('X') - this.actualTime;
    },
    compute() {
      var duration = moment.duration(this.getDiffInSeconds(), 'seconds');
      this.years = duration.years() > 0 ? duration.years() : 0;
      this.months = duration.months() > 0 ? duration.months() : 0;
      this.days = duration.days() > 0 ? duration.days() : 0;
      this.hours = duration.hours() > 0 ? duration.hours() : 0;
      this.minutes = duration.minutes() > 0 ? duration.minutes() : 0;
      this.seconds = duration.seconds() > 0 ? duration.seconds() : 0;
    },
    async updateData(newData) {
      this.expenseTypeData = await api.getItem(api.SPECIAL, this.employee.id);
      this.showSnackbar();
    },

    async showSnackbar(newData) {
      this.$set(this.status, 'statusType', 'SUCCESS');
      this.$set(this.status, 'statusMessage', 'Item was successfully submitted!');
      this.$set(this.status, 'color', 'green');
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
      this.hireDate = employee.hireDate;
      let budgetsVar = await api.getItem(api.SPECIAL, employee.id);
      this.expenseTypeData = budgetsVar;
      this.employee = employee;
      this.loading = false;
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
      if (this.expenseTypeData !== undefined) {
        let expenseTypes = this.expenseTypeData;
        _.forEach(expenseTypes, expenseType => {
          budgetNames.push(expenseType.expenseTypeName);
          if (expenseType.budgetObject) {
            if (!expenseType.odFlag) {
              reimbursed.push(expenseType.budgetObject.reimbursedAmount);
              unreimbursed.push(expenseType.budgetObject.pendingAmount);
              let difference =
                expenseType.budget - expenseType.budgetObject.reimbursedAmount - expenseType.budgetObject.pendingAmount;
              budgetDifference.push(difference);
              odReimbursed.push(0);
              odUnreimbursed.push(0);
            } else {
              if (expenseType.budget - expenseType.budgetObject.reimbursedAmount < 0) {
                let difference = 0;
                reimbursed.push(expenseType.budget);
                budgetDifference.push(difference);
                unreimbursed.push(0);
                odReimbursed.push(expenseType.budgetObject.reimbursedAmount - expenseType.budget);
                odUnreimbursed.push(expenseType.budgetObject.pendingAmount);
              } else if (
                expenseType.budget -
                  expenseType.budgetObject.reimbursedAmount -
                  expenseType.budgetObject.pendingAmount <
                0
              ) {
                let difference = 0;
                budgetDifference.push(difference);
                reimbursed.push(expenseType.budgetObject.reimbursedAmount);
                odReimbursed.push(0);
                let temp = expenseType.budget - expenseType.budgetObject.reimbursedAmount;
                unreimbursed.push(temp);
                odUnreimbursed.push(expenseType.budgetObject.pendingAmount - temp);
              } else {
                reimbursed.push(expenseType.budgetObject.reimbursedAmount);
                unreimbursed.push(expenseType.budgetObject.pendingAmount);
                let difference =
                  expenseType.budget -
                  expenseType.budgetObject.reimbursedAmount -
                  expenseType.budgetObject.pendingAmount;
                budgetDifference.push(difference);
                odReimbursed.push(0);
                odUnreimbursed.push(0);
              }
            }
          } else {
            budgetDifference.push(expenseType.budget);
            reimbursed.push(0);
            unreimbursed.push(0);
            odReimbursed.push(0);
            odUnreimbursed.push(0);
          }
        });
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
        datasets: [
          {
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
      };

      let options = {
        scales: {
          yAxes: [
            {
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
            }
          ],
          xAxes: [
            {
              stacked: true,
              categoryPercentage: 0.5,
              barPercentage: 1,
              ticks: {
                autoSkip: false
              }
            }
          ]
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return (
                '$' +
                Number(tooltipItem.yLabel)
                  // toFixed sets the number of decimal points to show
                  .toFixed(2)
                  .replace(/./g, function(c, i, a) {
                    return i > 0 && c !== '.' && (a.length - i) % 3 === 0 ? ',' + c : c;
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
      };

      return {
        dataSet: data,
        optionSet: options
      };
    },
    getAnniversary() {
      const [year, month, day] = this.hireDate.split('-');
      if (moment(`${month}/${day}/${year}`, 'MM/DD/YYYY', true).isValid()) {
        let now = moment();
        let year = now.year();
        let anniversary = moment(this.hireDate, 'YYYY-MM-DD');
        anniversary = anniversary.year(year);
        if (now.isAfter(anniversary)) {
          anniversary.add(1, 'years');
          return anniversary.format('ddd. MMM D, YYYY');
        } else {
          return anniversary.format('ddd. MMM D, YYYY');
        }
      }
    },
    getDaysUntil() {
      let now = moment();
      let year = now.year();
      let anniversary = moment(this.hireDate, 'YYYY-MM-DD');
      anniversary = anniversary.year(year);
      if (now.isAfter(anniversary)) {
        anniversary.add(1, 'years');
        let days = anniversary.diff(now, 'days');
        return anniversary.diff(now, 'days') + 1;
      } else {
        let days = anniversary.diff(now, 'days');
        return anniversary.diff(now, 'days') + 1;
      }
    },
    getSecondsUntil() {
      let update = this.actualTime;
      let now = moment();
      let year = now.year();
      let anniversary = moment(this.hireDate, 'YYYY-MM-DD');
      anniversary = anniversary.year(year);
      if (now.isAfter(anniversary)) {
        anniversary.add(1, 'years');
        let days = anniversary.diff(now, 'seconds');
        return anniversary.diff(now, 'seconds');
      } else {
        let days = anniversary.diff(now, 'seconds');
        return anniversary.diff(now, 'seconds');
      }
    },
    isMobile() {
      let md = new MobileDetect(window.navigator.userAgent);
      return md.is('iPhone') || md.is('Android');
    }
  },
  components: {
    BudgetChart,
    BudgetTable,
    ExpenseForm,
    BudgetTableMobile
  }
};
</script>
<style>
</style>
