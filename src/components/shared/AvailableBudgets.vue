<template v-slot="{ active }">
  <div id="available-budgets">
    <v-card>
      <v-card-title class="d-flex align-center header_style">
        <router-link class="no-decoration" v-if="isUser" to="/myBudgets">
          <h3 id="link" class="text-white px-2">Available Budgets</h3>
        </router-link>
        <h3 v-else class="text-white px-2">Available Budgets</h3>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 text-black">
        <div v-if="loading || employeeDataLoading" class="pb-4">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <div v-else>
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
              class="px-1 py-2"
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
          </div>
        </div>
      </v-card-text>
    </v-card>
    <available-budget-summary :activator="showDialog" :selectedBudget="selectedBudget"></available-budget-summary>
  </div>
</template>

<script setup>
import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import _some from 'lodash/some';
import _forEach from 'lodash/forEach';
import _uniqBy from 'lodash/uniqBy';
import api from '@/shared/api.js';
import AvailableBudgetSummary from '@/components/shared/AvailableBudgetSummary.vue';
import { convertToMoneyString, getCurrentBudgetYear, isFullTime } from '@/utils/utils';
import { getTodaysDate, getYear, isBetween } from '@/shared/dateUtils';
import { computed, inject, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['employee', 'expenseTypes', 'accessibleBudgets', 'fiscalDateView', 'employeeDataLoading']);
const emitter = inject('emitter');
const store = useStore();

const allUserBudgets = ref([]);
const budgets = ref([]);
const currentUser = ref(null);
const date = ref('');
const hireDate = ref('');
const loading = ref(true);
const selectedBudget = ref(null);
const selectReceipt = ref(false);
const showDialog = ref(false);

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
  currentUser.value = store.getters.user;
  if (props.accessibleBudgets && props.expenseTypes) {
    await refreshEmployee();
    await refreshBudget();
  }
  loading.value = false;
}); // created

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('close-summary');
}); //beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * returns as true if the current signed in user has the same id as the employee prop
 *
 * @return boolean - current signed in user has the same id as the employee prop
 */
const isUser = computed(() => {
  return props.employee && currentUser.value && props.employee.id == currentUser.value.id;
}); // isUser

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
  if (!props.fiscalDateView || !props.employee) return;

  let budgetsVar;
  let existingBudgets;

  if (props.fiscalDateView == getCurrentBudgetYear(hireDate.value)) {
    // viewing active budget year
    budgetsVar = props.accessibleBudgets;
  } else {
    // get existing budgets for the budget year being viewed
    existingBudgets = await api.getFiscalDateViewBudgets(props.employee.id, props.fiscalDateView);
    existingBudgets = _filter(existingBudgets, (e) => !!e);
    budgetsVar = existingBudgets;
  }

  // remove inactive budgets
  budgetsVar = _filter(budgetsVar, (b) => {
    let budget = b.budgetObject;
    return !_some(
      props.expenseTypes,
      (e) =>
        e.id == b.expenseTypeId &&
        (e.isInactive ||
          !isBetween(
            getYear(props.fiscalDateView),
            getYear(budget.fiscalStartDate),
            getYear(budget.fiscalEndDate),
            'year',
            '[]'
          ))
    );
  });
  budgetsVar = _sortBy(budgetsVar, (budget) => {
    return budget.expenseTypeName;
  }); // sort by expense type name

  // prohibit overdraft if employee is not full time
  _forEach(budgetsVar, async (budget) => {
    if (!isFullTime(props.employee)) {
      budget.odFlag = false;
    }
    let bObj = budget.budgetObject;
    if (!isBetween(getTodaysDate(), bObj.fiscalStartDate, bObj.fiscalEndDate, 'day', '[]')) {
      budget.expenseTypeName += ' (inactive)';
    }
  });

  // filter out diplicate expense types
  budgetsVar = _uniqBy(budgetsVar, 'expenseTypeId');

  // remove any budgets where budget amount is 0 and 0 total expenses
  budgets.value = _filter(budgetsVar, (data) => {
    let budget = data.budgetObject;
    return budget.amount != 0 || budget.reimbursedAmount != 0 || budget.pendingAmount != 0;
  });
} // refreshBudget

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  date.value = props.fiscalDateView;
  hireDate.value = props.employee.hireDate;
  if (!date.value) {
    date.value = getCurrentBudgetYear(hireDate.value);
  }
  let [tempAllUserBudgets] = await Promise.all([api.getEmployeeBudgets(props.employee.id), refreshBudget()]);
  allUserBudgets.value = tempAllUserBudgets;
} // refreshEmployee

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
    await refreshBudget();
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
