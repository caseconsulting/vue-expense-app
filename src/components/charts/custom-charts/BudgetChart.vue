<template>
  <div v-if="dataReceived">
    <v-card class="px-10 pt-5 my-7 pointer">
      <bar-chart
        ref="barChart"
        :key="chartKey"
        chartId="budget-chart"
        :options="option"
        :chart-data="chartData"
      ></bar-chart>

      <v-autocomplete
        :items="allBudgetNames"
        multiple
        v-model="selectedBudgets"
        variant="filled"
        chips
        v-if="!loading"
        :menu-props="{ bottom: true, offsetY: true }"
        closable-chips
        clearable
        :search="searchString"
        @update:model-value="
          searchString = '';
          drawGraph();
        "
      />
    </v-card>
  </div>
  <v-card v-else class="px-10 pt-5 my-7">
    <v-skeleton-loader type="table-tbody"></v-skeleton-loader>
  </v-card>
</template>

<script setup>
import api from '@/shared/api.js';
import pattern from 'patternomaly';
import _forEach from 'lodash/forEach';
import _some from 'lodash/some';
import _filter from 'lodash/filter';
import _first from 'lodash/first';
import _isEmpty from 'lodash/isEmpty';
import BarChart from '@/components/charts/base-charts/BarChart.vue';
import { isFullTime, getCurrentBudgetYear } from '@/utils/utils';
import { getYear, isBetween } from '@/shared/dateUtils';
import { onMounted, ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const allBudgetNames = ref([]);
const chartKey = ref(0);
const chartData = ref(null);
const dataReceived = ref(false);
const expenseTypeData = ref([]); // aggregated budgets for expense types
const selectedBudgets = ref([]);
const loading = ref(false); // loading status
const option = ref(null);
const props = defineProps(['employee', 'accessibleBudgets', 'fiscalDateView', 'expenses', 'expenseTypes']);
const router = useRouter();
const searchString = ref('');

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
onMounted(async () => {
  await refreshBudgets();
  drawGraph();
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and calculates employee budget data. Returns multiple lists,
 * consisting of the budgets names, remaining budget, reimbursed amount,
 * pending amount, reimbursed overdraft amount, and pending overdraft amount.
 *
 * @return Object - budget data
 */
const budget = computed(() => {
  let budgetNames = []; // budget expense type names
  let budgetDifference = []; // remaining budget amounts
  let reimbursed = []; // reimbursed amounts
  let unreimbursed = []; // pending amounts
  let odReimbursed = []; // reimbursed overdraft amount
  let odUnreimbursed = []; // pending overdraft amount
  if (expenseTypeData.value !== undefined) {
    let expenseTypes = expenseTypeData.value;
    _forEach(expenseTypes, (expenseType) => {
      if (selectedBudgets.value.includes(expenseType.expenseTypeName)) {
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
});

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Format and set data options for budget chart.
 *
 * @return Object - budget chart data
 */
function drawGraph() {
  selectedBudgets.value = expenseTypeData.value
    .filter((a) => selectedBudgets.value.includes(a.expenseTypeName))
    .map((a) => a.expenseTypeName);

  let budgets = getFinalBudgetsData(budget.value);
  let bars = [
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
  ];
  let data = {
    labels: budgets.names,
    datasets: bars
  };

  let [year] = props.fiscalDateView.split('-');
  const employee = props.employee;
  let options = {
    scales: {
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            });
          }
        }
      },
      x: {
        stacked: true,
        ticks: {
          autoSkip: false
        }
      }
    },
    onClick: (x, y) => {
      if (_first(y)) {
        let index = _first(y).index;
        // redirect to expenses page
        localStorage.setItem(
          'requestedFilter',
          JSON.stringify({
            defaultEmployee: employee.id,
            defaultFilterReimbursed: 'both',
            defaultSearch: chartData.value.labels[index]
          })
        );
        router.push({
          name: 'expenses'
        });
      } else {
        localStorage.setItem(
          'requestedFilter',
          JSON.stringify({
            defaultEmployee: employee.id,
            defaultFilterReimbursed: 'both'
          })
        );
        router.push({
          name: 'expenses'
        });
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Budget Overview For Fiscal Year ' + year + '-' + (Number(year) + 1),
        fontSize: 20
      },
      subtitle: {
        display: true,
        text: '*Click on a bar to see expenses',
        font: {
          style: 'italic'
        }
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return (
              '$' +
              Number(tooltipItem.raw)
                // toFixed sets the number of decimal points to show
                .toFixed(2)
                .replace(/./g, function (c, i, a) {
                  return i > 0 && c !== '.' && (a.length - i) % 3 === 0 ? ',' + c : c;
                })
            );
          }
        }
      }
    },
    maintainAspectRatio: false
  };
  chartData.value = data;
  option.value = options;
  chartKey.value++; // rerenders the chart
  dataReceived.value = true;
} // drawGraph

/**
 * Checks if there are any negative values in each budget data
 * to make sure the graph does not show negative values.
 *
 * @param budgets - The user's budgets
 * @return array - the budget data
 */
function getFinalBudgetsData(budgets) {
  Object.keys(budgets).forEach((budget) => {
    budgets[budget] = budgets[budget].map((item) => {
      if (!isNaN(item) && item < 0) {
        return 0;
      } else {
        return item;
      }
    });
  });
  return budgets;
} // getFinalBudgetsData

/**
 * Refresh and sets the aggregated budgets to draw the graph
 */
async function refreshBudgets() {
  if (!props.accessibleBudgets || !props.fiscalDateView) return;

  loading.value = true; // set loading status to true
  let budgetsVar;
  if (props.fiscalDateView == getCurrentBudgetYear(props.employee.hireDate)) {
    // viewing active budget year
    budgetsVar = props.accessibleBudgets;
  } else {
    // get existing budgets for the budget year being viewed
    let existingBudgets = await api.getFiscalDateViewBudgets(props.employee.id, props.fiscalDateView);
    existingBudgets = _filter(existingBudgets, (e) => !!e);

    budgetsVar = existingBudgets;
  }
  // remove inactive budgets (exception: there contains a pending expense under that budget)
  budgetsVar = _filter(budgetsVar, (b) => {
    let budget = b.budgetObject;
    return (
      !_some(
        props.expenseTypes,
        (e) =>
          e.id == budget.expenseTypeId &&
          (e.isInactive ||
            !isBetween(
              getYear(props.fiscalDateView),
              getYear(budget.fiscalStartDate),
              getYear(budget.fiscalEndDate),
              'year',
              '[]'
            ))
      ) || _some(props.expenses, (e) => e.expenseTypeId == budget.expenseTypeId && _isEmpty(e.reimbursedDate))
    );
  });

  // prohibit overdraft if employee is not full time
  _forEach(budgetsVar, async (budget) => {
    if (!isFullTime(props.employee)) {
      budget.odFlag = false;
    }
  });

  // remove any budgets where budget amount is 0 and 0 total expenses
  expenseTypeData.value = _filter(budgetsVar, (data) => {
    let budget = data.budgetObject;
    return budget.amount != 0 || budget.reimbursedAmount != 0 || budget.pendingAmount != 0;
  });

  // reset chart to initial state
  allBudgetNames.value = expenseTypeData.value.map((e) => e.expenseTypeName); // sets dropdown options
  selectedBudgets.value = expenseTypeData.value.map((e) => e.expenseTypeName); // selects all budgets to display at initial state
  loading.value = false; // set loading status to false
} // refreshBudgets

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for fiscalDateView - refresh budgets and draw graph.
 */
watch(
  () => props.fiscalDateView,
  async () => {
    await refreshBudgets();
    drawGraph();
  }
); // watchFiscalDateView

/**
 * Watcher for accessibleBudgets - refresh budgets and draw graph.
 */
watch(
  () => props.accessibleBudgets,
  async () => {
    await refreshBudgets();
    drawGraph();
  }
); // watchAccessibleBudgets
</script>
