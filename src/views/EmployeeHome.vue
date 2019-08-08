<template>
  <v-layout row wrap justify-center>
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      :right="true"
      :timeout="5000"
      :top="true"
      :vertical="true"
      :auto-height="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" flat @click="clearStatus">Close</v-btn>
    </v-snackbar>

    <!-- title -->
    <v-flex v-if="!isMobile" text-xs-center lg8 md12 sm12 pb-3>
      <h1 pb-2>Budget Statistics for {{ employee.firstName }} {{ employee.lastName }}</h1>
    </v-flex>

    <!-- anniversary date -->
    <v-flex lg4 v-if="!isMobile">
      <v-flex>
        <v-card>
          <v-card-title>
            <div>
              <h3 pt-2>Anniversary Date: {{ getAnniversary }}</h3>
              <div @mouseover="display = !display" @mouseleave="display = !display">
                <div v-if="display">Days Until: {{ getDaysUntil }}</div>
                <div v-else>Seconds Until: {{ getSecondsUntil }}</div>
              </div>
            </div>
          </v-card-title>
        </v-card>
      </v-flex>
    </v-flex>

    <!-- expense data -->
    <v-flex xs12 sm12 md12 lg8>
      <v-flex text-xs-center>
        <budget-table v-if="!loading" :employee="expenseTypeData"></budget-table>
        <budget-chart
          v-if="!loading && !isMobile && !adminCall"
          :options="drawGraph.optionSet"
          :chart-data="drawGraph.dataSet"
        ></budget-chart>
      </v-flex>
    </v-flex>

    <!-- expense form-->
    <v-flex v-if="employ == null" xs12 sm12 md12 lg4 pt-3>
      <v-flex text-xs-center lg12 md12 sm12>
        <expense-form :expense="expense" v-on:error="displayError"></expense-form>
      </v-flex>
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
import MobileDetect from 'mobile-detect';

/* LIFECYCLE HOOKS */
async function created() {
  window.EventBus.$on('refreshChart', this.updateData);
  this.refreshBudget();
  this.compute();
  this.addOneSecondToActualTimeEverySecond();
}

/* Methods */
function addOneSecondToActualTimeEverySecond() {
  var component = this;
  component.actualTime = moment().format('X');
  setTimeout(function() {
    component.addOneSecondToActualTimeEverySecond();
  }, 1000);
}

function getDiffInSeconds() {
  return moment('2016-10-21 22:00:00').format('X') - this.actualTime;
}

function compute() {
  var duration = moment.duration(this.getDiffInSeconds(), 'seconds');
  this.years = duration.years() > 0 ? duration.years() : 0;
  this.months = duration.months() > 0 ? duration.months() : 0;
  this.days = duration.days() > 0 ? duration.days() : 0;
  this.hours = duration.hours() > 0 ? duration.hours() : 0;
  this.minutes = duration.minutes() > 0 ? duration.minutes() : 0;
  this.seconds = duration.seconds() > 0 ? duration.seconds() : 0;
}

async function updateData() {
  this.expenseTypeData = await api.getItem(api.SPECIAL, this.employee.id);
  this.showSnackbar();
}

async function showSnackbar() {
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully submitted!');
  this.$set(this.status, 'color', 'green');
}

function clearStatus() {
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
}

async function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
}

async function refreshBudget() {
  let employee;
  this.loading = true;
  if (this.employ == null) {
    employee = await api.getUser();
  } else {
    employee = this.employ;
  }
  this.hireDate = employee.hireDate;
  let budgetsVar = await api.getItem(api.SPECIAL, employee.id);
  this.expenseTypeData = budgetsVar;
  this.employee = employee;
  this.loading = false;
}

/* Computed */
function budgets() {
  let budgetNames = [];
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
            expenseType.budget - expenseType.budgetObject.reimbursedAmount - expenseType.budgetObject.pendingAmount <
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
              expenseType.budget - expenseType.budgetObject.reimbursedAmount - expenseType.budgetObject.pendingAmount;
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
}

function drawGraph() {
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
            callback: function(value) {
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
        label: function(tooltipItem) {
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
}

function getAnniversary() {
  const [year, month, day] = this.hireDate.split('-');
  if (moment(`${month}/${day}/${year}`, 'MM/DD/YYYY', true).isValid()) {
    let now = moment();
    let hireDate = moment(this.hireDate, 'YYYY-MM-DD');

    if (now.isAfter(hireDate)) {
      let anniversary = moment([now.year(), hireDate.month(), hireDate.date()]);
      // if the employee start date is before today
      if (now.isSameOrAfter(anniversary)) {
        // if the employee's anniversary date has already occured this year
        anniversary.add(1, 'years');
        return anniversary.format('ddd. MMM D, YYYY');
      } else {
        // if the employee's anniversary date still has to happen between now and the end of year
        return anniversary.format('ddd. MMM D, YYYY');
      }
    } else {
      // if the employee's start day is in the future
      return hireDate.add(1, 'years').format('ddd. MMM D, YYYY');
    }
  } else {
    // TODO: Return something for invalid date
    return 'Ooops no anniversary, when did you start working here again? ';
  }
}

function getDaysUntil() {
  let now = moment();

  let hireDate = moment(this.hireDate, 'YYYY-MM-DD');
  let anniversary = moment([now.year(), hireDate.month(), hireDate.date()]);

  if (now.isAfter(hireDate)) {
    // if the employee start date is before today
    if (now.isSameOrAfter(anniversary)) {
      // if the employee's anniversary date has already occured this year
      anniversary.add(1, 'years');
    }
  } else {
    // if the employee's start day is in the future
    anniversary = hireDate.add(1, 'years');
  }

  return anniversary.diff(now, 'days') + 1;
}

function getSecondsUntil() {
  if (this.actualTime) {
    let now = moment();
    let year = now.year();
    let hireDate = moment(this.hireDate, 'YYYY-MM-DD');
    let anniversary = moment([year, hireDate.month(), hireDate.date()]);

    if (now.isAfter(hireDate)) {
      // if the employee start date is before today
      if (now.isSameOrAfter(anniversary)) {
        // if the employee's anniversary date has already occured this year
        anniversary.add(1, 'years');
      }
    } else {
      // if the employee's start day is in the future
      anniversary = hireDate.add(1, 'years');
    }
    return anniversary.diff(now, 'seconds');
  }
}

function isMobile() {
  let md = new MobileDetect(window.navigator.userAgent);
  return md.os() === 'AndroidOS' || md.os() === 'iOS';
}

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
  props: {
    adminCall: {
      default: null
    },
    employ: {
      default: null
    }
  },
  created,
  watch: {
    actualTime() {
      this.compute();
    }
  },
  methods: {
    addOneSecondToActualTimeEverySecond,
    getDiffInSeconds,
    compute,
    updateData,
    showSnackbar,
    clearStatus,
    displayError,
    refreshBudget
  },
  computed: {
    budgets,
    drawGraph,
    getAnniversary,
    getDaysUntil,
    getSecondsUntil,
    isMobile
  },
  components: {
    BudgetChart,
    BudgetTable,
    ExpenseForm
  }
};
</script>
<style></style>
