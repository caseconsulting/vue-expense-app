<template>
  <v-container fluid>
    <v-row>
      <!-- Title -->
      <v-col cols="12" lg="8" class="d-flex justify-center align-center">
        <div v-if="!loading" :class="isMobile ? 'center' : ''">
          <h1 v-if="hasAccessToBudgets">My Budgets</h1>
          <h1 v-else>No Budgets Available for {{ employee.nickname || employee.firstName }} {{ employee.lastName }}</h1>
        </div>
        <v-skeleton-loader v-else-if="loading && !isMobile" type="text" width="90%" />
      </v-col>

      <!-- Anniversary Date -->
      <v-col cols="12" lg="4">
        <div v-if="!loading && !isMobile">
          <anniversary-card :employee="employee" emit-catcher="my-budgets" :has-budgets="hasAccessToBudgets" />
        </div>
        <div v-else-if="loading && !isMobile">
          <!-- This has to be in a v-col because of padding that comes from the anniversary card v-col. Without the v-col, the loader is off-->
          <v-skeleton-loader type="list-item" />
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Budget Cards -->
      <v-col cols="12" lg="8">
        <div v-if="loading">
          <v-row>
            <v-col v-for="index in 4" :key="index" cols="12" sm="6" lg="6">
              <v-skeleton-loader type="list-item@6" />
            </v-col>
          </v-row>
        </div>
        <div v-if="!loading" text-center class="pt-0 font-13">
          <budget-table
            :employee="employee"
            :accessible-budgets="accessibleBudgets"
            :expenses="expenses"
            :expense-types="expenseTypes"
            :fiscal-date-view="fiscalDateView"
          />
        </div>
      </v-col>
      <!-- Expense Form-->
      <v-col cols="12" lg="4">
        <div v-if="loading">
          <v-skeleton-loader type="list-item@12" />
        </div>
        <div v-else-if="!loading && viewingCurrentBudgetYear">
          <expense-form :expense="expense" />
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <div v-if="loading">
          <v-skeleton-loader type="list-item@3" />
        </div>
        <div v-if="!isMobile && hasAccessToBudgets">
          <budget-chart
            :accessible-budgets="accessibleBudgets"
            :employee="employee"
            :expenses="expenses"
            :expense-types="expenseTypes"
            :fiscal-date-view="fiscalDateView"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import BudgetChart from '@/components/charts/custom-charts/BudgetChart.vue';
import BudgetTable from '@/components/budgets/BudgetTable.vue';
import ExpenseForm from '@/components/expenses/ExpenseForm.vue';
import AnniversaryCard from '@/components/shared/AnniversaryCard.vue';
import api from '@/shared/api.js';
import { updateStoreBudgets, updateStoreEmployees, updateStoreExpenseTypes } from '@/utils/storeUtils';
import { getCurrentBudgetYear, isMobile } from '@/utils/utils';
import { computed, inject, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useDisplayError, useDisplaySuccess } from '@/components/shared/StatusSnackbar.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps({
  employ: {
    default: null
  } // employee (admin employee view)
});
const store = useStore();
const emitter = inject('emitter');

const displayChart = ref(false);
const employee = ref(null); // employee
const accessibleBudgets = ref(null);
const expense = ref({
  id: null,
  purchaseDate: null,
  reimbursedDate: null,
  note: null,
  url: null,
  createdAt: null,
  receipt: null,
  cost: null,
  description: null,
  employeeId: null,
  expenseTypeId: null,
  category: null,
  showOnFeed: false,
  employeeName: null,
  budgetName: null
}); // blank expense for the expense form
const expenses = ref(null);
const expenseTypes = ref(null);
const fiscalDateView = ref(''); // current budget year view by anniversary day
const hasAccessToBudgets = ref(false); // user has access to one or more budgets
const hireDate = ref(''); // employee hire date
const loading = ref(true); // loading status

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

// Set budget charts and information for employee. Creates event listeners.
onBeforeMount(async () => {
  if (store.getters.storeIsPopulated) {
    await refreshEmployee();
  }

  emitter.on('error', (msg) => {
    useDisplayError(msg);
  });

  emitter.on('updateData', async () => {
    await updateData();
  });

  emitter.on('change-budget-year-my-budgets', (date) => {
    if (date != fiscalDateView.value) {
      fiscalDateView.value = date;
    }
  });
});

// Removes event listeners
onBeforeUnmount(() => {
  emitter.off('updateData');
  emitter.off('change-budget-year-my-budgets');
  emitter.off('error');
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Whether the store is populated from initial page load
 */
const storeIsPopulated = computed(() => store.getters.storeIsPopulated);

/**
 * Whether the budget year being viwed is todays budget.
 */
const viewingCurrentBudgetYear = computed(() => fiscalDateView.value == getCurrentBudgetYear(hireDate.value));

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => props.employ,
  async () => {
    await refreshEmployee();
  }
);

watch(storeIsPopulated, async () => {
  if (store.getters.storeIsPopulated) {
    await refreshEmployee();
  }
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Refresh and sets employee information.
 */
async function refreshEmployee() {
  loading.value = true;
  employee.value = store.getters.user;
  [expenses.value] = await Promise.all([
    api.getAllEmployeeExpenses(employee.value.id),
    !store.getters.budgets ? updateStoreBudgets() : '',
    !store.getters.expenseTypes ? updateStoreExpenseTypes() : '',
    !store.getters.employees ? updateStoreEmployees() : ''
  ]);
  accessibleBudgets.value = store.getters.budgets;
  expenseTypes.value = store.getters.expenseTypes;

  hireDate.value = employee.value.hireDate;
  fiscalDateView.value = getCurrentBudgetYear(hireDate.value);

  // does not have access to any budgets disable budget chart
  accessibleBudgets.value.length > 0 ? (hasAccessToBudgets.value = true) : '';
  loading.value = false;
} // refreshEmployee

/**
 * Updates the budget data and display a successful submit.
 */
async function updateData() {
  displayChart.value = false;
  await refreshEmployee();
  useDisplaySuccess('Item was successfully submitted!');
} // updateData
</script>
