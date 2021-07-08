<template>
  <div>
    <bar-chart v-if="dataReceived" :options="options" :chart-data="chartData"></bar-chart>
    <v-autocomplete
      :items="allBudgetNames"
      multiple
      v-model="selectedBudgets"
      filled
      chips
      :menu-props="{ bottom: true, offsetY: true }"
      deletable-chips
      clearable
      :search-input.sync="searchString"
      @change="
        searchString = '';
        drawGraph();
      "
    />
  </div>
</template>

<script>
import api from '@/shared/api.js';
import pattern from 'patternomaly';
import _ from 'lodash';
import BarChart from '@/components/charts/baseCharts/BarChart.vue';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import { isFullTime } from '@/utils/utils';
const IsoFormat = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and calculates employee budget data. Returns multiple lists, consisting of the budgets names, remaining budget,
 * reimbursed amount, pending amount, reimbursed overdraft amount, and pending overdraft amount.
 *
 * @return Object - budget data
 */
function budgets() {
  let budgetNames = []; // budget expense type names
  let budgetDifference = []; // remaining budget amounts
  let reimbursed = []; // reimbursed amounts
  let unreimbursed = []; // pending amounts
  let odReimbursed = []; // reimbursed overdraft amount
  let odUnreimbursed = []; // pending overdraft amount
  if (this.expenseTypeData !== undefined) {
    let expenseTypes = this.expenseTypeData;
    _.forEach(expenseTypes, (expenseType) => {
      if (this.selectedBudgets.includes(expenseType.expenseTypeName)) {
        budgetNames.push(expenseType.expenseTypeName);
        let budget = expenseType.budgetObject;
        if (budget) {
          // if a current budget exists for this expense type
          if (!expenseType.odFlag) {
            // if the expense type does not allow overdraft
            reimbursed.push(budget.reimbursedAmount);
            unreimbursed.push(budget.pendingAmount);
            let difference = Math.max(budget.amount - budget.reimbursedAmount - budget.pendingAmount, 0);
            budgetDifference.push(difference);
            odReimbursed.push(0);
            odUnreimbursed.push(0);
          } else {
            if (budget.amount - budget.reimbursedAmount < 0) {
              // if the reimbursed amount is more than the adjusted expense type budget
              let difference = 0;
              reimbursed.push(budget.amount);
              budgetDifference.push(difference);
              unreimbursed.push(0);
              odReimbursed.push(budget.reimbursedAmount - budget.amount);
              odUnreimbursed.push(budget.pendingAmount);
            } else if (budget.amount - budget.reimbursedAmount - budget.pendingAmount < 0) {
              // if the reimburse + pending amount is more than the adjusted expense type budget
              let difference = 0;
              budgetDifference.push(difference);
              reimbursed.push(budget.reimbursedAmount);
              odReimbursed.push(0);
              let temp = budget.amount - budget.reimbursedAmount;
              unreimbursed.push(temp);
              odUnreimbursed.push(budget.pendingAmount - temp);
            } else {
              reimbursed.push(budget.reimbursedAmount);
              unreimbursed.push(budget.pendingAmount);
              let difference = Math.max(budget.amount - budget.reimbursedAmount - budget.pendingAmount, 0);
              budgetDifference.push(difference);
              odReimbursed.push(0);
              odUnreimbursed.push(0);
            }
          }
        } else {
          // if a current budget does not exist for this expense type
          budgetDifference.push(budget.amount);
          reimbursed.push(0);
          unreimbursed.push(0);
          odReimbursed.push(0);
          odUnreimbursed.push(0);
        }
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
} // budgets

/**
 * Format and set data options for budget chart.
 *
 * @return Object - budget chart data
 */
function drawGraph() {
  let budgets = this.budgets;
  let data = {
    labels: budgets.names,
    datasets: [
      {
        type: 'bar',
        label: 'Reimbursed',
        backgroundColor: '#2195f3',
        data: budgets.reimbursed
      },
      {
        type: 'bar',
        label: 'Pending',
        backgroundColor: '#ff6666',
        data: budgets.unreimbursed
      },
      {
        type: 'bar',
        label: 'Remaining Budget',
        backgroundColor: '#e1e7f2',
        fill: false,
        data: budgets.difference
      },
      {
        type: 'bar',
        label: 'Overdraft Reimbursed',
        backgroundColor: pattern.draw('diagonal', '#88beef'),
        data: budgets.odReimbursed
      },
      {
        type: 'bar',
        label: 'Overdraft Pending',
        backgroundColor: pattern.draw('diagonal', 'pink'),
        data: budgets.odUnreimbursed
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
            callback: function (value) {
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
          // categoryPercentage: 0.5, //Not supported by chartjs 3.x
          // barPercentage: 1, //Not supported by chartjs 3.x
          ticks: {
            autoSkip: false
          }
        }
      ]
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem) {
          return (
            '$' +
            Number(tooltipItem.yLabel)
              // toFixed sets the number of decimal points to show
              .toFixed(2)
              .replace(/./g, function (c, i, a) {
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
  this.chartData = data;
  this.options = options;
  this.dataReceived = true;
} // drawGraph

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the current active anniversary budget year starting date in isoformat.
 *
 * @return String - current active anniversary budget date (YYYY-MM-DD)
 */
function getCurrentBudgetYear() {
  let currentBudgetYear = moment(this.employee.hireDate, IsoFormat);
  if (moment().isAfter(currentBudgetYear)) {
    currentBudgetYear.year(moment().year());
    if (moment().isBefore(currentBudgetYear)) {
      currentBudgetYear = currentBudgetYear.subtract(1, 'years');
    }
  }
  return currentBudgetYear.format(IsoFormat);
} // getCurrentBudgetYear

/**
 * Refresh and sets the aggregated budgets for the employee budget year view.
 */
async function refreshBudget() {
  this.loading = true; // set loading status to true
  let budgetsVar;
  this.fiscalDateView = this.getCurrentBudgetYear();
  if (this.fiscalDateView == this.getCurrentBudgetYear()) {
    // viewing active budget year
    budgetsVar = await api.getAllActiveEmployeeBudgets(this.employee.id);
  }

  // get existing budgets for the budget year being viewed
  let existingBudgets = await api.getFiscalDateViewBudgets(this.employee.id, this.fiscalDateView);

  // append inactive tag to end of budget expense type name
  // the existing budget duplicates will later be removed (order in array comes after active budgets)
  _.forEach(existingBudgets, (budget) => {
    budget.expenseTypeName += ' (Inactive)';
  });

  budgetsVar = _.union(budgetsVar, existingBudgets); // combine existing and active budgets
  budgetsVar = _.uniqBy(budgetsVar, 'expenseTypeId'); // remove duplicate expense types
  budgetsVar = _.sortBy(budgetsVar, (budget) => {
    return budget.expenseTypeName;
  }); // sort by expense type name
  this.selectedBudgets = budgetsVar.map((a) => a.expenseTypeName);
  this.allBudgetNames = budgetsVar.map((a) => a.expenseTypeName);
  // prohibit overdraft if employee is not full time
  _.forEach(budgetsVar, async (budget) => {
    if (!isFullTime(this.employee)) {
      budget.odFlag = false;
    }
  });

  // remove any budgets where budget amount is 0 and 0 total expenses
  this.expenseTypeData = _.filter(budgetsVar, (data) => {
    let budget = data.budgetObject;
    return budget.amount != 0 || budget.reimbursedAmount != 0 || budget.pendingAmount != 0;
  });

  this.refreshBudgetYears(); // refresh the budget year view options
  this.loading = false; // set loading status to false
} // refreshBudget

/**
 * Refresh and sets the budget year view options for the employee.
 */
function refreshBudgetYears() {
  let budgetYears = [];

  // push all employee budget years
  let budgetDates = _.uniqBy(_.map(this.allUserBudgets, 'fiscalStartDate'));
  budgetDates.forEach((date) => {
    const [year] = date.split('-');
    budgetYears.push(parseInt(year));
  });

  // push active budget year
  let [currYear] = this.getCurrentBudgetYear().split('-');
  budgetYears.push(parseInt(currYear));

  // remove duplicate years and filter to include only active and previous years
  budgetYears = _.filter(_.uniqBy(budgetYears), (year) => {
    return parseInt(year) <= parseInt(currYear);
  });

  this.budgetYears = _.reverse(_.sortBy(budgetYears)); // sort budgets from current to past
} // refreshBudgetYears

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    BarChart
  },
  computed: {
    budgets
  },
  data() {
    return {
      allBudgetNames: [],
      allUserBudgets: null, // all user budgets
      budgetYears: [], // list of options for chaning budget year view
      chartData: null,
      dataReceived: false,
      options: null,
      expenseTypeData: [], // aggregated budgets for expense types
      fiscalDateView: '', // current budget year view by anniversary day
      selectedBudgets: [],
      loading: false, // loading status
      actualTime: moment().format('X'), // current time (unix ms timestamp)
      changingBudgetView: false, // change budget year view activator
      display: true, // show seconds till anniversary activator
      displayChart: false,
      expense: {
        id: '',
        purchaseDate: null,
        reimbursedDate: null,
        note: null,
        url: null,
        createdAt: null,
        receipt: null,
        cost: '',
        description: '',
        employeeId: '',
        expenseTypeId: '',
        category: null,
        showOnFeed: false,
        employeeName: null,
        budgetName: null
      }, // expense for the expense form
      searchString: '',
      seconds: 0, // seconds until next anniversary date
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      } // snackbar action status
    };
  },
  methods: {
    drawGraph,
    getCurrentBudgetYear,
    refreshBudgetYears,
    refreshBudget
  },
  async mounted() {
    await this.refreshBudget();
    this.drawGraph();
  },
  props: ['employee']
};
</script>
