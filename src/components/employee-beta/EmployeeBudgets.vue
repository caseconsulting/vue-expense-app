<template v-slot="{ active }">
  <div id="available-budgets">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between header_style">
        <h3
          v-if="budgets.length > 0 && fiscalDateView != getCurrentBudgetYear(hireDate)"
          class="text-white text-wrap px-2"
        >
          {{ viewingBudgetYear }}
        </h3>
        <router-link v-else-if="isUser" class="no-decoration" to="/myBudgets">
          <h3 id="link" class="text-white px-2">Available Budgets</h3>
        </router-link>
        <h3 v-else class="text-white px-2">Available Budgets</h3>
        <v-btn :color="caseRed" icon="" variant="flat" @click="changingBudgetView = !changingBudgetView" class="">
          <v-icon color="white" size="x-large" icon="mdi-history" />
          <v-tooltip activator="parent" location="top">View Past Budget Years</v-tooltip>
        </v-btn>
      </v-card-title>
      <v-card-text class="px-0 pt-5 pb-1 text-black">
        <div v-if="loading || employeeDataLoading" class="pb-4 px-4">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <div v-else>
          <div class="d-flex justify-center align-center">
            <router-link v-if="props.fiscalDateView" to="/myExpenses" class="no-decoration center">
              <v-btn
                variant="outlined"
                density="compact"
                class="px-2 mr-2 ml-auto mb-3"
                :color="caseRed"
                @click="selectReceipt = true"
              >
                Create an Expense
              </v-btn>
            </router-link>
          </div>
          <!-- If no avaible budgets -->
          <div v-if="budgets.length == 0" class="my-4">
            <v-row justify="center">
              <p>No available budgets</p>
            </v-row>
          </div>
          <div v-else>
            <!-- Loop all budgets -->
            <v-list-item
              v-for="budget in budgets"
              :key="budget.expenseTypeId"
              @click="selectBudget(budget)"
              class="px-7 py-2"
              density="compact"
            >
              <div class="d-flex justify-space-between">
                <span>{{ budget.expenseTypeName }}:</span>
                <v-spacer></v-spacer>
                <span>{{ convertToMoneyString(calcRemaining(budget)) }}</span>
              </div>
            </v-list-item>
            <div class="mt-2"></div>
            <!-- End Loop all budgets -->
            <v-expansion-panels v-model="budgetChartDropdown" multiple elevation="0" class="pa-0">
              <v-expansion-panel value="open" :title="dropdownTitle">
                <v-expansion-panel-text v-if="isAdmin || isUser" class="pa-0 ma-0">
                  <budget-chart
                    :refreshKey="refreshKey"
                    :employee="employee"
                    :accessible-budgets="accessibleBudgets"
                    :expenses="expenses"
                    :expense-types="expenseTypes"
                    :fiscal-date-view="fiscalDateView"
                    class="ma-0"
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <available-budget-summary :activator="showDialog" :selectedBudget="selectedBudget"></available-budget-summary>
    <budget-select-modal
      :toggleBudgetSelectModal="changingBudgetView"
      :budgetYears="budgetYears"
      :current="fiscalDateView"
      :hireDate="hireDate"
    ></budget-select-modal>
  </div>
</template>

<script setup>
import _ from 'lodash';
import api from '@/shared/api.js';
import AvailableBudgetSummary from '@/components/shared/AvailableBudgetSummary.vue';
import BudgetChart from '@/components/charts/custom-charts/BudgetChart.vue';
import BudgetSelectModal from '@/components/modals/BudgetSelectModal.vue';
import { convertToMoneyString, getCurrentBudgetYear, isFullTime } from '@/utils/utils';
import { format, getTodaysDate, getYear, isBetween, DEFAULT_ISOFORMAT } from '@/shared/dateUtils';
import { inject, onBeforeMount, onBeforeUnmount, ref, watch, computed } from 'vue';
import { useDisplay } from 'vuetify';
// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps([
  'employee',
  'expenses',
  'expenseTypes',
  'accessibleBudgets',
  'fiscalDateView',
  'employeeDataLoading',
  'refreshKey'
]);
const emitter = inject('emitter');
const { smAndDown } = useDisplay();

const isAdmin = inject('isAdmin');
const isUser = inject('isUser');
const allUserBudgets = ref([]);
const budgets = ref([]);
const budgetYears = ref([]);
const budgetChartDropdown = ref(JSON.parse(localStorage.getItem('budgetChartDropdown') ?? '[]'));
const changingBudgetView = ref(false);
const hireDate = ref('');
const loading = ref(true);
const selectedBudget = ref(null);
const selectReceipt = ref(false);
const showDialog = ref(false);

window.addEventListener('beforeunload', () => {
  localStorage.setItem('budgetChartDropdown', JSON.stringify(budgetChartDropdown.value));
});

// |--------------------------------------------------|
// |                                                  |
// |               LIFECYCLE HOOKS                    |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
onBeforeMount(async () => {
  emitter.on('close-summary', () => {
    showDialog.value = false;
  });
}); // created

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('close-summary');
  localStorage.setItem('budgetChartDropdown', JSON.stringify(budgetChartDropdown.value));
}); //beforeUnmount

// // |--------------------------------------------------|
// // |                                                  |
// // |                     COMPUTED                     |
// // |                                                  |
// // |--------------------------------------------------|

const dropdownTitle = computed(
  () => `Budget Chart for ${props.fiscalDateView.split('-')[0]} - ${Number(props.fiscalDateView.split('-')[0]) + 1}`
);

/**
 * Title string for budgets based on budget year selected.
 */
const viewingBudgetYear = computed(() => {
  const getFiscalYearView = parseInt(props.fiscalDateView.split('-')[0]);
  if (props.fiscalDateView != getCurrentBudgetYear(hireDate.value)) {
    if (smAndDown.value) {
      return `${getFiscalYearView}-${getFiscalYearView + 1} Budgets`;
    }
    return `Viewing inactive budgets from ${getFiscalYearView} - ${getFiscalYearView + 1}`;
  } else return 'Available Budgets';
});
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Calculates how much of a budget is remaining. Returns the remaining amount if it exists. Returns zero if the budget
 * itself does not exist.
 *
 * @param budget - aggregate budget
 * @return int - remaining budget
 */
function calcRemaining(budget) {
  if (budget.budgetObject) {
    return Math.max(
      budget.budgetObject.amount - budget.budgetObject.pendingAmount - budget.budgetObject.reimbursedAmount,
      0
    );
  }
  return 0;
} // calcRemaining

/**
 * Refresh and sets the aggregated budgets for the employee budget year view.
 */
async function refreshBudget() {
  if (!props.employee) return;
  let date = props.fiscalDateView ? props.fiscalDateView : getCurrentBudgetYear(hireDate.value);
  let budgetsVar;
  let existingBudgets;

  if (date == getCurrentBudgetYear(hireDate.value)) {
    // viewing active budget year
    budgetsVar = props.accessibleBudgets;
  } else {
    // get existing budgets for the budget year being viewed
    existingBudgets = await api.getFiscalDateViewBudgets(props.employee.id, date);
    existingBudgets = _.filter(existingBudgets, (e) => !!e);
    budgetsVar = existingBudgets;
  }

  // remove inactive budgets
  budgetsVar = _.filter(budgetsVar, (b) => {
    let budget = b.budgetObject;
    return !_.some(
      props.expenseTypes,
      (e) =>
        e.id == b.expenseTypeId &&
        (e.isInactive ||
          !isBetween(getYear(date), getYear(budget.fiscalStartDate), getYear(budget.fiscalEndDate), 'year', '[]'))
    );
  });
  budgetsVar = _.sortBy(budgetsVar, (budget) => {
    return budget.expenseTypeName;
  }); // sort by expense type name

  // prohibit overdraft if employee is not full time
  _.forEach(budgetsVar, async (budget) => {
    if (!isFullTime(props.employee)) {
      budget.odFlag = false;
    }
    let bObj = budget.budgetObject;
    if (!isBetween(getTodaysDate(), bObj.fiscalStartDate, bObj.fiscalEndDate, 'day', '[]')) {
      budget.expenseTypeName += ' (inactive)';
    }
  });

  // filter out diplicate expense types
  budgetsVar = _.uniqBy(budgetsVar, 'expenseTypeId');

  // remove any budgets where budget amount is 0 and 0 total expenses
  budgets.value = _.filter(budgetsVar, (data) => {
    let budget = data.budgetObject;
    return budget.amount != 0 || budget.reimbursedAmount != 0 || budget.pendingAmount != 0;
  });
} // refreshBudget

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  loading.value = true;
  hireDate.value = format(props.employee.hireDate, null, DEFAULT_ISOFORMAT);
  let [tempAllUserBudgets] = await Promise.all([api.getEmployeeBudgets(props.employee.id), refreshBudget()]);
  allUserBudgets.value = tempAllUserBudgets;
  refreshBudgetYears();
  loading.value = false;
} // refreshEmployee

/**
 * Refresh and sets the budget year view options for the employee.
 */
function refreshBudgetYears() {
  let tempBudgetYears = [];
  // push all employee budget years
  let budgetDates = _.uniqBy(_.map(allUserBudgets.value, 'fiscalStartDate'));
  budgetDates.forEach((date) => {
    const [year] = date.split('-');
    tempBudgetYears.push(parseInt(year));
  });
  // push active budget year
  let [currYear] = getCurrentBudgetYear(hireDate.value).split('-');
  tempBudgetYears.push(parseInt(currYear));
  // remove duplicate years and filter to include only active and previous years
  tempBudgetYears = _.filter(_.uniqBy(tempBudgetYears), (year) => {
    return parseInt(year) <= parseInt(currYear);
  });
  budgetYears.value = _.reverse(_.sortBy(tempBudgetYears)); // sort budgets from current to past
} // refreshBudgetYears

/**
 * Selects the budget for the dialog box.
 *
 * @param budget - budget
 */
function selectBudget(budget) {
  selectedBudget.value = budget;
  showDialog.value = true;
} // selectBudget

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * When the accessible budgets change refresh to employee to show changes.
 */
watch(
  () => props.accessibleBudgets,
  async () => {
    await refreshEmployee();
  }
); // watchAccessibleBudgets

/**
 * watcher for fiscalDateView - refresh budgets and draw graph
 */
watch(
  () => props.fiscalDateView,
  async () => {
    //only refresh if done initial load
    if (!loading.value) {
      await refreshBudget();
    }
  }
); // watchFiscalDateView
</script>

<style scoped>
#link::after {
  content: '';
  display: block;
  width: 0;
  height: 1px;
  background: #fff;
  transition: width 0.3s ease-in;
}

#link:hover::after {
  width: 100%;
}
</style>
