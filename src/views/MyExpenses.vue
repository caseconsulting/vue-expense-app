<template>
  <div>
    <v-row v-if="initialPageLoading">
      <v-col cols="12" lg="8">
        <div class="mt-3">
          <v-skeleton-loader type="table-heading, list-item@6" />
        </div>
      </v-col>
      <v-col cols="12" lg="4">
        <v-skeleton-loader class="mt-3" type="list-item@12" />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" lg="8">
        <v-card class="mt-3">
          <v-container fluid>
            <!-- Title -->
            <v-card-title v-if="!isMobile()">
              <v-row align="center" justify="center">
                <v-col cols="2">
                  <h3 v-if="(userRoleIsAdmin() || userRoleIsManager()) && !loading">All Expenses</h3>
                  <h3 v-else-if="!loading">My Expenses</h3>
                  <h3 v-else>Loading...</h3>
                </v-col>

                <v-spacer></v-spacer>

                <!-- Employee Filter -->
                <v-col align="end" cols="12" sm="4" md="3">
                  <v-autocomplete
                    v-if="userRoleIsAdmin() || userRoleIsManager()"
                    id="employeeIdFilter"
                    v-model.trim="employee"
                    variant="underlined"
                    hide-details
                    :items="employees"
                    :custom-filter="employeeFilter"
                    item-title="text"
                    label="Filter by Employee"
                    clearable
                  />
                </v-col>

                <!-- Tags filter -->
                <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="12" sm="4" md="3">
                  <tags-filter v-model="tagsInfo" @update:modelValue="filterExpenses()"></tags-filter>
                </v-col>
                <!-- End Tags Filter -->

                <!-- Search Bar -->
                <v-col align="end" cols="12" sm="4" md="3">
                  <v-text-field
                    id="search"
                    v-model="search"
                    variant="underlined"
                    append-inner-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card-title>

            <div v-else>
              <v-card-title class="px-0">
                <h3 v-if="(userRoleIsAdmin() || userRoleIsManager()) && !loading">All Expenses</h3>
                <h3 v-else-if="!loading">My Expenses</h3>
                <h3 v-else>Loading...</h3>
              </v-card-title>
              <v-row class="mb-5">
                <v-col cols="12">
                  <!-- Search Bar -->
                  <v-text-field
                    id="search"
                    v-model="search"
                    append-inner-icon="mdi-magnify"
                    label="Search"
                    variant="underlined"
                    single-line
                    hide-details
                  />
                </v-col>
                <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="12">
                  <!-- Employee Filter -->
                  <v-autocomplete
                    id="employeeIdFilter"
                    v-model.trim="employee"
                    hide-details
                    :items="employees"
                    :custom-filter="employeeFilter"
                    item-title="text"
                    label="Filter by Employee"
                    variant="underlined"
                    clearable
                  />
                </v-col>
                <!-- Tags filter -->
                <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="12">
                  <tags-filter v-model="tagsInfo" @update:modelValue="filterExpenses()"></tags-filter>
                </v-col>
                <!-- End Tags Filter -->
              </v-row>
            </div>

            <!-- Filters -->
            <fieldset>
              <legend class="legend_style">Filters</legend>
              <v-container fluid>
                <v-row class="d-flex flex-wrap">
                  <!-- Active Filter -->
                  <v-col lg="3" sm="6" cols="12">
                    <h4>Active Expense Type:</h4>
                    <v-btn-toggle
                      v-model="filter.active"
                      color="primary"
                      class="filter_color"
                      :density="isMobile() ? 'compact' : 'comfortable'"
                      mandatory
                    >
                      <!-- Show Active -->
                      <v-tooltip location="top">
                        <template #activator="{ props }">
                          <v-btn value="active" v-bind="props" variant="text">
                            <v-icon class="mr-1">
                              mdi-check-circle{{ filter.active.includes('active') ? '' : '-outline' }}
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>Show Active</span>
                      </v-tooltip>

                      <!-- Show Inactive -->
                      <v-tooltip location="top">
                        <template #activator="{ props }">
                          <v-btn value="notActive" v-bind="props" variant="text">
                            <v-icon>
                              mdi-close-circle{{ filter.active.includes('notActive') ? '' : '-outline' }}
                            </v-icon>
                          </v-btn>
                        </template>
                        <span>Show Inactive</span>
                      </v-tooltip>

                      <!-- Show Active and Inactive -->
                      <v-tooltip location="top">
                        <template #activator="{ props }">
                          <v-btn
                            value="both"
                            v-bind="props"
                            variant="text"
                            :class="filter.active.includes('both') ? 'font-weight-black' : ''"
                          >
                            BOTH
                          </v-btn>
                        </template>
                        <span>Show All</span>
                      </v-tooltip>
                    </v-btn-toggle>
                  </v-col>
                  <!-- Status Filter -->
                  <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="3" :class="!userRoleIsAdmin() && !userRoleIsManager() ? 'ml-3' : ''">
                    <h4>Status:</h4>
                    <v-select
                      density="comfortable"
                      v-model="filter.status"
                      :items="statusFilterOptions"
                      prepend-inner-icon="mdi-filter-variant"
                      variant="underlined"
                      input="hello"
                      hide-details
                      multiple
                    >
                      <template #selection="{item}">
                        {{ getStatusText(item) }}
                      </template>
                      <template v-slot:item="{ props, item }">
                        <v-list-item
                          v-bind="props"
                          :title="item.raw.title"
                        >
                        <template v-slot:prepend>
                          <v-avatar>
                            <v-icon :color="filter.status.includes(item.raw) ? 'primary' : '#111'" :icon="getStateIcon(item.raw.value)" />
                          </v-avatar>
                        </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>
                  <!-- Reimbursed Date Range Filter -->
                  <v-col cols="6" class="pa-2">
                    <h4 class="ml-0 pl-0 mb-1">Reimbursed Date Range:</h4>
                    <!-- Start Date Filter -->
                     <v-row>
                      <v-col cols="6">
                        <date-picker
                          v-model="startDateFilter"
                          label="Start Date Filter"
                          :rules="getDateOptionalRules()"
                          show-adjacent-months
                          hide-actions
                          persistent-hint
                        />
                      </v-col>
                      <!-- End Date Filter -->
                      <v-col cols="6">
                        <date-picker
                          v-model="endDateFilter"
                          label="End Date Filter"
                          :rules="getDateOptionalRules()"
                          show-adjacent-months
                          hide-actions
                          persistent-hint
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </fieldset>
            <br />

            <!-- My Expenses Data Table-->
            <v-data-table
              :sort-by="toSort"
              :headers="getRoleHeaders()"
              :items="filteredExpenses"
              :expanded="expanded"
              :loading="loading || initialPageLoading"
              :items-per-page="15"
              :row-props="rowClasses"
              item-value="id"
              class="elevation-4 smaller-font"
              density="compact"
              :no-data-text="'No results :('"
              expand-on-click
            >
              <!-- State slot, including quick menu -->
              <template #[`item.state`]="{ item }">
                <td v-if="userRoleIsAdmin() || userRoleIsManager()">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        :icon="getStateIcon(item.state)"
                        :disabled="expensesStatuses.disabled.has(item.id)"
                        :color="getStatusIconColor(item)"
                        variant="text"
                        v-bind="props"
                        density="compact"
                      />
                    </template>
                    <v-list v-if="getStatesQuickMenu(item.state).length && !expensesStatuses.errored.has(item.id)">
                      <v-list-item
                        v-for="(menuItem, idx) in getStatesQuickMenu(item.state)"
                        :no-data-text="`No actions for state ${item.state}`"
                        :key="`menu-${idx}`"
                        @click="menuItem.action(item)"
                        slim
                      >
                        <template v-slot:prepend>
                          <v-avatar>
                            <v-icon color="#111" :icon="menuItem.icon" />
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ menuItem.text }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <v-tooltip activator="parent" location="right"> {{ getStateTooltip(item) }} </v-tooltip>
                </td>
              </template>
              <!-- Creation date slot -->
              <template #[`item.createdAt`]="{ item }">
                <td :class="getPurchaseCreatedAtDateClass(item)">
                  {{ monthDayYearFormat(item.createdAt) }}
                  <v-tooltip v-if="expenseAgeOverLimit(item)" activator="parent" location="top"> Creation date is {{ expenseAgeOverLimit(item) }} days after purchase date </v-tooltip>
                </td>
              </template>
              <!-- Employee name slot-->
              <template #[`item.employeeName`]="{ item }">
                <td :class="getExpenseClass(item)" v-if="userRoleIsAdmin() || userRoleIsManager()">
                  {{ item.employeeName }}
                </td>
              </template>
              <!-- Budget Name Slot -->
              <template #[`item.budgetName`]="{ item }">
                <td :class="getExpenseClass(item)">{{ item.budgetName }}</td>
              </template>
              <!-- Cost slot -->
              <template #[`item.cost`]="{ item }">
                <td :class="getExpenseClass(item)">{{ convertToMoneyString(item.cost) }}</td>
              </template>
              <!-- Purchase date slot -->
              <template #[`item.purchaseDate`]="{ item }">
                <td :class="getPurchaseCreatedAtDateClass(item)">
                  {{ monthDayYearFormat(item.purchaseDate) }}
                  <v-tooltip v-if="expenseAgeOverLimit(item)" activator="parent" location="top"> Creation date is {{ expenseAgeOverLimit(item) }} days after purchase date </v-tooltip>
                </td>
              </template>
              <!-- Reimburse date Slot -->
              <template #[`item.reimbursedDate`]="{ item }">
                <td :class="getExpenseClass(item)">{{ monthDayYearFormat(item.reimbursedDate) }}</td>
              </template>
              <!--Action Items-->
              <template #[`item.actions`]="{ item }">
                <td class="d-flex justify-end mr-4">
                  <!-- Download Attachment Button -->
                  <attachment :mid-action="midAction || expensesStatuses.disabled.has(item.id)" :expense="item" :mode="'expenses'" />

                  <!-- Edit Button -->
                  <v-btn
                    id="edit"
                    :disabled="
                      isEditing ||
                      midAction ||
                      expensesStatuses.disabled.has(item.id) ||
                      !isExpenseEditable(store.getters.user, item) ||
                      (!(userRoleIsAdmin() || userRoleIsManager()) && !canDelete(item))
                    "
                    variant="text"
                    icon
                    size="small"
                    @click="
                      toTopOfForm();
                      onSelect(item);
                    "
                  >
                    <v-icon size="x-large" class="case-gray" icon="mdi-pencil" />
                    <v-tooltip activator="parent" location="top"> Edit </v-tooltip>
                  </v-btn>
                  <!-- Delete Button -->
                  <v-btn
                    id="delete"
                    :disabled="
                      (expense && !isEmpty(expense.reimbursedDate)) ||
                      isEditing ||
                      midAction ||
                      expensesStatuses.disabled.has(item.id) ||
                      (!(userRoleIsAdmin() || userRoleIsManager()) && !canDelete(item))
                    "
                    variant="text"
                    icon
                    size="small"
                    @click="
                      deleting = true;
                      midAction = true;
                      propExpense = item;
                    "
                  >
                    <v-icon size="x-large" class="case-gray" icon="mdi-delete" />
                    <v-tooltip activator="parent" location="top"> Delete </v-tooltip>
                  </v-btn>
                </td>
              </template>

              <!-- Expanded slot in datatable -->
              <template #expanded-row="{ columns, item }">
                <td :colspan="columns.length" class="pa-0">
                  <v-card>
                    <v-card-text>
                      <div class="expandedInfo">
                        <p v-if="item.description">
                          <b>Description: </b>
                          {{ item.description }}
                        </p>
                        <p v-if="item.recipient && !initialPageLoading">
                          <b>Recipient: </b>
                          {{ getEmployee(item.recipient) }}
                        </p>
                        <p v-if="!isEmpty(item.note)"><b>Notes: </b>{{ item.note }}</p>
                        <p v-if="!isEmpty(item.receipt)"><b>Receipt(s): </b>{{ getReceipts(item.receipt) }}</p>
                        <p v-if="!isEmpty(item.url)">
                          <b>Url: </b> <a v-if="item.url" :href="item.url" target="_blank">{{ item.url }}</a>
                        </p>
                        <p v-if="!isEmpty(item.category)"><b>Category: </b>{{ item.category }}</p>
                        <div v-if="userRoleIsAdmin() || userRoleIsManager()" class="flagExp">
                          <p>Inactive:</p>
                          <v-icon v-if="useInactiveStyle(item)" color="green" id="marks" class="mr-1 mx-3">
                            mdi-check-circle-outline
                          </v-icon>
                          <v-icon v-else class="mr-1 mx-3 case-red" id="marks"> mdi-close-circle-outline </v-icon>
                          <br />
                          <p>Show On Feed:</p>
                          <v-icon v-if="item.showOnFeed" id="marks" class="mr-1 mx-3" color="green">
                            mdi-check-circle-outline
                          </v-icon>
                          <v-icon v-else class="mr-1 mx-3 case-red" id="marks"> mdi-close-circle-outline </v-icon>
                        </div>
                        <div v-if="!isEmpty(item?.rejections?.softRejections)">
                          <b>{{ getRevisalsTitle(item) }}</b>
                          <div v-for="(reason, i) in item.rejections.softRejections.reasons" :key="reason" class="ml-4">
                            <b>{{ getReasonIntro(reason, i) }}: </b>{{ reason.text ?? reason }}
                          </div>
                          <div class="ml-4">
                            <b>Revised: </b>
                            {{ item.rejections.softRejections.revised ? 'Yes' : 'No' }}
                          </div>
                        </div>
                        <div v-if="!isEmpty(item?.rejections?.hardRejections)" class="ml-4">
                          <b>Rejection reason:</b>
                          {{ item?.rejections?.hardRejections?.reasons?.[0] }}
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </td>
              </template>
              <!-- End expanded slot in datatable -->
            </v-data-table>
            <br />

            <!-- Download expense csv button -->
            <v-card-actions>
              <convert-expenses-to-csv
                v-if="userRoleIsAdmin() || userRoleIsManager()"
                :mid-action="midAction || expensesStatuses.disabled.size > 0"
                :expenses="filteredExpenses"
              />
            </v-card-actions>

            <!-- Confirmation Modals -->
            <unreimburse-modal :toggle-unreimburse-modal="unreimbursing" />
            <delete-modal :toggle-delete-modal="deleting" :type="'expense'" />
            <!-- End Confirmation Modals -->
          </v-container>
        </v-card>
      </v-col>

      <!-- Expense Form -->
      <v-col v-if="userRoleIsAdmin() || userRoleIsManager() || !userIsInactive" cols="12" lg="4">
        <expense-form v-if="!initialPageLoading" ref="form" :is-edit="isEditing" :expense="expense" />
      </v-col>
    </v-row>

    <!-- Rejection modal -->
    <v-dialog v-model="toggleExpenseRejectionModal" persistent width="35%">
      <expense-rejection-modal :defaultType="defaultRejectionType" />
    </v-dialog>
  </div>
</template>

<script setup>

/**
 * TODO:
 * - [x] Reorganize code to by logic, not type
 * - [ ] Add partial approval to filter
 * - [ ] Add partial approval as a tag
 * - [ ] Add partial approval to quick actions
 * - [ ] Differentiate between admin/HR/Finance approval based on tag
 * - [ ] Get rid of lodash
 */

import api from '@/shared/api.js';
import { AxiosError } from 'axios';
import Attachment from '@/components/utils/Attachment.vue';
import ConvertExpensesToCsv from '@/components/expenses/ConvertExpensesToCsv.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import ExpenseRejectionModal from '@/components/modals/ExpenseRejectionModal.vue';
import employeeUtils from '@/shared/employeeUtils';
import { isExpenseEditable, EMPTY_APPROVAL } from '@/shared/expenseUtils';
import ExpenseForm from '@/components/expenses/ExpenseForm.vue';
import DatePicker from '@/components/shared/DatePicker.vue';
import TagsFilter from '@/components/shared/TagsFilter.vue';
import UnreimburseModal from '@/components/modals/UnreimburseModal.vue';
import _isEmpty from 'lodash/isEmpty';
import _cloneDeep from 'lodash/cloneDeep';
import _mapValues from 'lodash/mapValues';
import _sortBy from 'lodash/sortBy';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _some from 'lodash/some';
import _find from 'lodash/find';
import _mergeWith from 'lodash/mergeWith';
import _isNil from 'lodash/isNil';
import {
  isEmpty,
  monthDayYearFormat,
  convertToMoneyString,
  isMobile,
  userRoleIsAdmin,
  userRoleIsManager
} from '@/utils/utils';
import { employeeFilter } from '@/shared/filterUtils';
import { format, isBetween, difference, getTodaysDate } from '@/shared/dateUtils';
import { getDateOptionalRules } from '@/shared/validationUtils.js';
import { updateStoreBudgets, updateStoreExpenseTypes, updateStoreEmployees, updateStoreTags } from '@/utils/storeUtils';
import { mask } from 'vue-the-mask';
import { onBeforeMount, onMounted, onBeforeUnmount, ref, watch, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { storeIsPopulated } from '@/utils/utils.js';
import { useDisplayError, useDisplaySuccess } from '@/components/shared/StatusSnackbar.vue';
import { EXPENSE_STATES } from '@/shared/expenseUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const store = useStore();
const vMask = mask; //custom directive
const EXPENSE_STATES_NAMES = {
  CREATED: 'Created',
  APPROVED: 'Approved',
  // PART_APPROVED: 'Approved (Partial)', real value in DB
  APPROVED_HRE: 'Approved (HR)', // split up HR
  APPROVED_FIN: 'Approved (Finance)', // split up Finance
  EXT_PROC: 'External Processing',
  REIMBURSED: 'Reimbursed',
  REJECTED: 'Rejected',
  RETURNED: 'Returned',
  REVISED: 'Revised'
}

const deleting = ref(false); // activate delete model
const expanded = ref([]); // datatable expanded
const expenses = ref([]); // all expenses
const employees = ref([]); // employee autocomplete options
const employee = ref(null); // employee autocomplete filter
const endDateFilter = ref(null);
const expense = ref({
  id: null,
  purchaseDate: null,
  reimbursedDate: null,
  note: null,
  url: null,
  createdAt: null,
  receipt: [],
  cost: null,
  description: null,
  employeeId: null,
  expenseTypeId: null,
  category: null,
  showOnFeed: null,
  employeeName: null,
  budgetName: null,
  recipient: null
}); // selected expense
const expenseTypes = ref([]); // expense types
let statusFilterOptions = ref(
  Object.entries(EXPENSE_STATES_NAMES).map(([k, v]) => ({ value: k, title: v }))
); // status filter dropdown options
const filter = ref({
  active: 'both',
  status: [EXPENSE_STATES.CREATED]
}); // forms to filter table
const filteredExpenses = ref([]); // filtered expenses
const form = ref(null);
const headers = ref([
  {
    title: '',
    key: 'state'
  },
  {
    title: 'Creation Date',
    key: 'createdAt'
  },
  {
    title: 'Employee',
    key: 'employeeName'
  },
  {
    title: 'Expense Type',
    key: 'budgetName'
  },
  {
    title: 'Cost',
    key: 'cost'
  },
  {
    title: 'Purchase Date',
    key: 'purchaseDate'
  },
  {
    title: 'Reimburse Date',
    key: 'reimbursedDate'
  },
  {
    key: 'actions',
    width: '25%',
    align: 'end',
    sortable: false
  }
]); // datatable headers
const isEditing = ref(false); // whether or not an expense is being edited
const loading = ref(true); // loading status
const initialPageLoading = ref(true); // loading page at startup
const defaultRejectionType = ref('soft'); // rejection modald default
const rejectingExpense = ref(null); // for rejection modal
const expensesStatuses = ref({
  successes: new Set(), // expenses that succeeded API call
  disabled: new Set(), // expenses in middle of API call
  errored: new Set()  // expenses that errored on API call
});
const midAction = ref(false);
const propExpense = ref({
  id: null,
  createdAt: null,
  employeeId: null,
  employeeName: null,
  expenseTypeId: null,
  budgetName: null,
  category: null,
  cost: 0,
  description: null,
  purchaseDate: null,
  reimbursedDate: null,
  note: null,
  receipt: [],
  recipient: null,
  url: null,
  showOnFeed: null
}); // expense to edit
const search = ref(null); // query text for datatable search field
const toSort = ref([{ key: 'createdAt', order: 'desc' }]); // default sort datatable items
const startDateFilter = ref(null);
const tagsInfo = ref({
  selected: [],
  flipped: []
});
const toggleExpenseRejectionModal = ref(false);
const unreimbursing = ref(false); // activate unreimburse model when value changes
const userInfo = ref(null); // user information
let userApproverType = null; // HRE vs FIN vs ADM
let approverTypes = {
  'HR': 'HRE',
  'Finance': 'FIN',
  'Admin': 'ADM'
}; // tag name to approver type

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(async () => {
  // expense form listeners
  emitter.on('add', () => {
    addModelToTable();
  });
  emitter.on('delete', () => {
    deleteModelFromTable();
  });
  emitter.on('startAction', () => {
    startAction();
  });
  emitter.on('update', () => {
    updateModelInTable();
  });
  emitter.on('error', (msg) => {
    useDisplayError(msg);
  });

  //no longer editing an expense (clear model and enable buttons)
  emitter.on('finished-editing-expense', () => {
    clearExpense();
    isEditing.value = false;
  });

  emitter.on('endAction', () => {
    midAction.value = false;
  });

  //when expense type is being edited buttons should be disabled
  emitter.on('editing-expense', () => {
    isEditing.value = true;
  });

  emitter.on('canceled-unreimburse-expense', () => {
    midAction.value = false;
  });
  emitter.on('confirm-unreimburse-expense', async () => {
    await unreimburseExpense();
  });

  emitter.on('canceled-delete-expense', () => {
    midAction.value = false;
    deleting.value = false;
  });
  emitter.on('confirm-delete-expense', async () => {
    deleting.value = false;
    await deleteExpense();
  });

  // expense rejection modal
  emitter.on('close-expenses-rejection', async () => {
    defaultRejectionType.value = 'soft';
    toggleExpenseRejectionModal.value = false;
    rejectingExpense.value = null;
  });
  emitter.on('confirm-expenses-rejection', async ({ field, text }) => {
    let rejType = field.split('.')[1];
    let isHard = field.includes('hard');

    // update expense with new rejection
    rejectingExpense.value.rejections ??= {};
    rejectingExpense.value.rejections[rejType] ??= { reasons: [], revised: false };
    rejectingExpense.value.rejections[rejType].reasons.push({ text, date: getTodaysDate('YYYY-MM-DD') });
    rejectingExpense.value.state = isHard ? EXPENSE_STATES.REJECTED : EXPENSE_STATES.RETURNED;

    // submit (expense is set to null in close-expenses-rejection)
    await updateExpense(rejectingExpense.value);
  });

  // if coming from budgets chart scroll to top and fill in filter data
  if (!_isEmpty(localStorage.getItem('requestedFilter'))) {
    window.scrollTo(0, 0);
    let storedInfo = JSON.parse(localStorage.getItem('requestedFilter'));
    [search.value, filter.value.reimbursed, employee.value] = [
      storedInfo.defaultSearch,
      storedInfo.defaultFilterReimbursed,
      storedInfo.defaultEmployee
    ];
    localStorage.removeItem('requestedFilter');
  }
});

onMounted(() => {
  if (!userRoleIsAdmin() && !userRoleIsManager()) filter.value.status = [];
})

onBeforeUnmount(() => {
  emitter.off('add');
  emitter.off('delete');
  emitter.off('startAction');
  emitter.off('update');
  emitter.off('error');
  emitter.off('canceled-delete-expense');
  emitter.off('confirm-delete-expense');
  emitter.off('finished-editing-expense');
  emitter.off('editing-expense');
  emitter.off('confirm-unreimburse-expense');
  emitter.off('canceled-unreimburse-expense');
}); // onBeforeUnmount

/**
 * Runs initializing actions when store is populated.
 */
watch(storeIsPopulated, async () => {
  if (!storeIsPopulated) return;
  initialPageLoading.value = true;
  loading.value = true;
  // get user info, defaulting to params if exists
  userInfo.value = store.getters.user; // TODO: parse localstorage into string and then parse from string

  await Promise.all([
    !store.getters.expenseTypes ? updateStoreExpenseTypes() : '',
    !store.getters.employees ? updateStoreEmployees() : '',
    !store.getters.budgets ? updateStoreBudgets() : '',
    !store.getters.tags && (userRoleIsAdmin() || userRoleIsManager()) ? updateStoreTags() : '', // tags only required for admin/manager
    refreshExpenses()
  ]);

  // get approver type for admins
  if (userRoleIsAdmin() || userRoleIsManager()) {
    for (let tag of store.getters.tags) {
      if (approverTypes[tag.tagName] && tag.employees?.includes(userInfo.value.id)) {
        userApproverType = approverTypes[tag.tagName];
      }
    }
  }
  
  if (localStorage.getItem('requestedFilter')) userInfo.value = JSON.parse(localStorage.getItem('requestedFilter'));
  // get expense types
  let temporaryExpenseTypes = store.getters.expenseTypes;
  expenseTypes.value = _map(temporaryExpenseTypes, (expenseType) => {
    return {
      /* beautify preserve:start */
      text: `${expenseType.budgetName} - $${expenseType.budget}`,
      startDate: expenseType.startDate,
      endDate: expenseType.endDate,
      /* beautify preserve:end */
      budgetName: expenseType.budgetName,
      value: expenseType.id,
      budget: expenseType.budget,
      odFlag: expenseType.odFlag,
      requireReceipt: expenseType.requireReceipt,
      recurringFlag: expenseType.recurringFlag,
      isInactive: expenseType.isInactive,
      categories: expenseType.categories,
      accessibleBy: expenseType.accessibleBy,
      hasRecipient: expenseType.hasRecipient,
      showOnFeed: expenseType.showOnFeed
    };
  });
  loading.value = false;
  initialPageLoading.value = false;
});

// |--------------------------------------------------|
// |                                                  |
// |                EMITTER FUNCTIONS                 |
// |                                                  |
// |--------------------------------------------------|

/**
 * Refresh and updates expense list and displays a successful
 * create status in the snackbar.
 */
async function addModelToTable() {
  await refreshExpenses();
  useDisplaySuccess('Item was successfully submitted!');
}

/**
 * Refresh and updates expense list and displays a successful
 * delete status in the snackbar.
 */
async function deleteModelFromTable() {
  await refreshExpenses();
  useDisplaySuccess('Item was successfully deleted!');
}

/**
 * set midAction to true
 */
function startAction() {
  midAction.value = true;
}

/**
 * Refresh and updates expense list and displays a successful
 * update status in the snackbar.
 */
async function updateModelInTable() {
  await refreshExpenses();
  useDisplaySuccess('Item was successfully updated!');
}

/**
 * Delete a selected expense.
 */
async function deleteExpense() {
  loading.value = true; // set loading status to true
  if (propExpense.value.id) {
    // expense is selected
    let deletedExpense = propExpense.value;
    let deleted = await api.deleteItem(api.EXPENSES, propExpense.value.id);
    if (deleted.id) {
      // successfully deletes expense
      await deleteModelFromTable();
      if (!isEmpty(deletedExpense.receipt)) {
        // delete attachment from s3 if deleted expense has a receipt
        let deletedAttachment = await api.deleteAttachment(deleted);
        if (deletedAttachment.code) {
          // emit alert if error deleting file
          useDisplayError(`Error Deleting Receipt: ${deletedAttachment.message}`);
        }
      }
    } else {
      // fails to delete expense
      useDisplayError('Error Deleting Expense');
    }
    // update budgets in store
    await updateStoreBudgets();

    midAction.value = false;
  }
  loading.value = false; // set loading status to false
}

/**
 * Unreimburse an expense.
 */
async function unreimburseExpense() {
  loading.value = true; // set loading status to true

  propExpense.value.reimbursedDate = null; // clear reimburse date field
  let updatedExpense = await api.updateItem(api.EXPENSES, propExpense.value);

  if (updatedExpense.id) {
    // successfully unreimburses expense
    useDisplaySuccess('Item was successfully unreimbursed!');
  } else {
    // fails to unreimburse expense
    useDisplayError('Error Unreimburseing Expense');
  }

  await refreshExpenses();
  loading.value = false; // set loading status to false
  midAction.value = false;
}

// |--------------------------------------------------|
// |                                                  |
// |              HELPERS AND API CALLS               |
// |                                                  |
// |--------------------------------------------------|

/**
 * Helper to update an expense through API
 * @param newExpense new expense object (ID matches to old expense)
 */
async function updateExpense(newExpense) {
  let { id } = newExpense;

  // set expense to loading and make API call
  expensesStatuses.value.errored.delete(id);
  expensesStatuses.value.disabled.add(id);
  let resp = await api.updateItem(api.EXPENSES, newExpense);

  // respond to API call results
  if (resp instanceof AxiosError) {
    expensesStatuses.value.errored.add(id);
  } else {
    expensesStatuses.value.successes.add(id);
    await setTimeout(() => { expensesStatuses.value.successes.delete(id) }, 2000);
  }
  expensesStatuses.value.disabled.delete(id);
}

/**
 * Clear the selected expense by setting all values to null and
 * if user sets employeeId and employeeName.
 */
function clearExpense() {
  expense.value['description'] = null;
  expense.value = _mapValues(expense.value, () => {
    return null;
  });
  expense.value['employeeId'] = null;
  expense.value['employeeName'] = null;
}

/**
 * Converts an employee ID into their full name.
 *
 * @param  eId - the employee id to find
 * @return string - the name of the high five recipient
 */
function getEmployee(eId) {
  let employee = _find(store.getters.employees, ['id', eId]);
  return employeeUtils.nicknameAndLastName(employee);
}

/**
 * Sets a mapping of employee name to employee id of an expense for
 * the autocomplete options.
 *
 * @param aggregatedData - aggregated expenses
 */
function constructAutoComplete(aggregatedData) {
  let seenEmployees = new Set(); // used to not add duplicates
  employees.value = _sortBy(
    _map(aggregatedData, (data) => {
      if (data && data.employeeName && data.employeeId && !seenEmployees.has(data.employeeId)) {
        seenEmployees.add(data.employeeId);
        return {
          text: `${data.nickname || data.firstName} ${data.lastName}`,
          value: data.employeeId,
          nickname: data.nickname,
          firstName: data.firstName,
          lastName: data.lastName
        };
      }
    }).filter((data) => {
      return data != null;
    }),
    (employee) => employee.text.toLowerCase()
  );
}

/**
 * Refresh expense data and filters expenses.
 */
async function refreshExpenses() {
  loading.value = true; // set loading status to true
  // load expenses if employee role is user or admin
  expenses.value = await api.getAllAggregateExpenses();
  constructAutoComplete(expenses.value); // set autocomplete options

  filterExpenses(); // filter expenses

  loading.value = false; // set loading status to false
}

/**
 * Scrolls window back to the top of the form.
 */
function toTopOfForm() {
  window.scrollTo(0, form.value.$el.offsetTop - 70);
}

// |--------------------------------------------------|
// |                                                  |
// |               SEARCHING / FILTERS                |
// |                                                  |
// |--------------------------------------------------|

/**
 * Filters expenses based on filter selections.
 */
function filterExpenses() {
  filteredExpenses.value = [];

  for (let expense of expenses.value) {
    // filter expenses by employee search
    if (employee.value) {
      if (expense.employeeId !== employee.value) continue;
    }

    // filter based on tags
    if (tagsInfo.value.selected?.length > 0) {
      if (!employeeUtils.selectedTagsHasEmployee(expense.employeeId, tagsInfo.value)) continue;
    }

    // filter based on generic search
    if (search.value) {
      let matched = false;
      // let headerKeys = _map(headers.value, (object) => object.key);
      for (let [key, value] of Object.entries(expense)) {
        let data = value; // allow modification
        if (!data || data === '') continue; // skip empty data
        if (typeof data === 'number') data = data.toFixed(2); // support money
        if (key === 'receipt') data = data.join?.(' ') || data; // support receipt names
        if (key === 'rejections') { // support rejection reasons
          let rejData = '';
          if (data.hardRejections?.reasons) rejData += data.hardRejections.reasons.join(' ');
          if (data.softRejections?.reasons) rejData += data.softRejections.reasons.join(' ');
          data = rejData;
        }
        // search if data is a string by now
        if (typeof data !== 'string') continue;
        if (['id', 'expenseTypeId', 'employeeId'].includes(key)) {
          if (data === search.value) {
            matched = true;
            break;
          }
        } else if (data.toLowerCase().includes(search.value.toLowerCase())) {
          matched = true;
          break;
        }
      }
      if (!matched) continue;
    }

    // filter based on start and end dates
    if (startDateFilter.value || endDateFilter.value) {
      let start = startDateFilter.value || '1900-01-01';
      let end = endDateFilter.value || '9999-12-31';
      if (!isBetween(expense.reimbursedDate, start, end, 'days', '[]')) continue;
    }

    // filter based on status
    let status = filter.value.status.map((s) => s.toLowerCase());
    if (status.length > 0) {
      let approvedBy = {
        HRE: expense.approved?.by?.HRE ?? false,
        FIN: expense.approved?.by?.FIN ?? false
      };
      if (
        !status.includes(expense.state.toLowerCase()) && // exact state match
        !(status.includes('APPROVED_HRE') && approvedBy.HRE) && // HR approval
        !(status.includes('APPROVED_FIN') && approvedBy.FIN) // Finance approval
      ) continue;
    }

    // filter based on expense type active
    if (filter.value.active !== 'both') {
      let expenseType = _find(expenseTypes.value, (type) => expense.expenseTypeId === type.value);
      let etActive = expenseType && !expenseType.isInactive;
      let filterActive = filter.value.status === 'active';
      if (filterActive !== etActive) continue;
    }

    // passed all filters, add it
    filteredExpenses.value.push(expense);
  }
}

/**
 * Returns text to show in the status filter when not clicked in.
 * 
 * @param item item of input
 */
function getStatusText(item) {
  let s = filter.value.status;
  let once = (text) => item.value === s[0] ? text : null;
  switch (s.length) {
    case 1:
      return item.title;
    case statusFilterOptions.value.length - 1:
      let except = statusFilterOptions.value.find((opt) => !s.includes(opt.value));
      return once(`All except ${except.title.toLowerCase()}`);
    case statusFilterOptions.value.length:
      return once("All");
    default:
      return once(`${s.length} selected`);
  }
}

/**
 * Gets tooltip text for an expense based on its state.
 * 
 * item.approvals.[ADM|HRE|FIN].[by|date]
 * 
 * @param state - expenses state field
 * @returns String - tooltip text
 */
function getStateTooltip(item) {
  function approvedBy() {
    let fallback = "unknown approver";

    let { ADM, HRE, FIN } = item.approvals || {};
    if (!ADM && !HRE && !FIN) return fallback;

    let approvers = [];
    for (let [appr, type] of [[ADM, 'Admin'], [HRE, 'HR'], [FIN, 'Finance']]) {
      if (appr) {
        let user = employeeUtils.getEmployeeByID(appr.by, store.getters.employees);
        let name = employeeUtils.nicknameAndLastName(user);
        approvers.push(`${name} (${type})`);
      }
    }

    if (approvers.length === 0) return fallback;
    return approvers.join(', ');
  }

  switch (item.state) {
    case EXPENSE_STATES.CREATED: return 'Created';
    case EXPENSE_STATES.APPROVED_HRE:
    case EXPENSE_STATES.APPROVED_FIN:
    case EXPENSE_STATES.APPROVED: return 'Approved by ' + approvedBy();
    case EXPENSE_STATES.EXT_PROC: return 'Procesing in external system';
    case EXPENSE_STATES.REIMBURSED: return 'Reimbursed';
    case EXPENSE_STATES.REJECTED: return 'Rejected permanantly';
    case EXPENSE_STATES.RETURNED: return 'Returned for edits';
    case EXPENSE_STATES.REVISED: return 'Revised';
    default: return 'Unknown State';
  }
}

/**
 * Gets the icon for the state of an expense.
 * 
 * @param state - expenses state field
 * @returns String - icon name
 */
function getStateIcon(state) {
  switch (state) {
    case 'ALL': return 'mdi-check-all'; // special case for filter 
    case EXPENSE_STATES.CREATED: return 'mdi-new-box';
    case EXPENSE_STATES.APPROVED_FIN: // same as below;
    case EXPENSE_STATES.APPROVED_HRE: return 'mdi-decagram-outline';
    case EXPENSE_STATES.APPROVED: return 'mdi-check-decagram';
    case EXPENSE_STATES.EXT_PROC: return 'mdi-progress-clock';
    case EXPENSE_STATES.REIMBURSED: return 'mdi-cash-check';
    case EXPENSE_STATES.REJECTED: return 'mdi-close-box';
    case EXPENSE_STATES.RETURNED: return 'mdi-arrow-u-left-top-bold';
    case EXPENSE_STATES.REVISED: return 'mdi-pencil-box';
    default: return 'mdi-help-rhombus';
  }
}

/**
 * Quick expense modifiers, to be used in quick actions menu
 */
async function quickApprove(exp) {
  const stateRules = {
    ADM: () => EXPENSE_STATES.APPROVED,
    HRE: () => exp.state === EXPENSE_STATES.APPROVED_FIN
      ? EXPENSE_STATES.APPROVED
      : EXPENSE_STATES.APPROVED_HRE,
    FIN: () => exp.state === EXPENSE_STATES.APPROVED_HRE
      ? EXPENSE_STATES.APPROVED
      : EXPENSE_STATES.APPROVED_FIN,
  };
  exp.state = stateRules[userApproverType]();
  exp.approvals ??= {};
  exp.approvals[userApproverType] = {
    by: userInfo.value.id,
    date: getTodaysDate('YYYY-MM-DD')
  };
  await updateExpense(exp);
  return exp;
}
async function quickUnapprove(exp) {
  exp.state = EXPENSE_STATES.CREATED;
  exp.approvals = EMPTY_APPROVAL;
  await updateExpense(exp);
}
async function quickRejectReturn(exp) {
  rejectingExpense.value = exp;
  toggleExpenseRejectionModal.value = true;
}
async function quickReject(exp) {
  defaultRejectionType.value = 'hard';
  rejectingExpense.value = exp;
  toggleExpenseRejectionModal.value = true;
}
async function quickRemoveRejection(exp) {
  if (exp.state === EXPENSE_STATES.REJECTED) {
    exp.rejections.hardRejections = null;
  }
  if (exp.rejections.softRejections) {
    exp.rejections.softRejections.reasons.pop();
    exp.rejections.softRejections.revised = true;
    if (exp.rejections.softRejections.reasons.length === 0) delete exp.rejections;
  }
  exp.state = EXPENSE_STATES.CREATED;
  await updateExpense(exp);
}
async function quickReimburse(exp) {
  exp.state = EXPENSE_STATES.REIMBURSED;
  exp.reimbursedDate = getTodaysDate('YYYY-MM-DD');
  await updateExpense(exp);
}
async function quickUnreimburse(exp) {
  exp.state = EXPENSE_STATES.APPROVED;
  exp.reimbursedDate = null;
  await updateExpense(e);
}

/**
 * Gets the state quick-menu for a specified state
 * 
 * @param state current state of the expense
 */
function getStatesQuickMenu(state) {
  let actions;

  switch (state) {
    case EXPENSE_STATES.CREATED:
    case EXPENSE_STATES.REVISED:
      return [
        {
          action: quickApprove,
          icon: getStateIcon(EXPENSE_STATES.APPROVED),
          text: 'Approve'
        },
        {
          action: quickRejectReturn,
          icon: getStateIcon(EXPENSE_STATES.RETURNED),
          text: 'Reject or Return'
        }
      ];
    case EXPENSE_STATES.REJECTED:
      return [
        {
          action: quickRemoveRejection,
          icon: getStateIcon(EXPENSE_STATES.CREATED),
          text: 'Remove rejection'
        }
      ];
    case EXPENSE_STATES.RETURNED:
      return [
        {
          action: quickRemoveRejection,
          icon: getStateIcon(EXPENSE_STATES.CREATED),
          text: 'Remove revisal'
        },
        {
          action: quickReject,
          icon: getStateIcon(EXPENSE_STATES.REJECTED),
          text: 'Reject'
        }
      ];
    case EXPENSE_STATES.APPROVED:
      return [
        {
          action: quickReimburse,
          icon: getStateIcon(EXPENSE_STATES.REIMBURSED),
          text: 'Reimburse (as of today)'
        },
        {
          action: quickUnapprove,
          icon: getStateIcon(EXPENSE_STATES.CREATED),
          text: 'Remove approval'
        }
      ];
    case EXPENSE_STATES.APPROVED_FIN:
      actions = [
        {
          action: quickRejectReturn,
          icon: getStateIcon(EXPENSE_STATES.RETURNED),
          text: 'Reject or Return'
        },
      ];
      switch (userApproverType) {
        case 'ADM':
          actions.push({
            action: quickApprove,
            icon: getStateIcon(EXPENSE_STATES.APPROVED),
            text: 'Approve as Admin'
          });
          break;
        case 'HRE':
          actions.push({
            action: quickApprove,
            icon: getStateIcon(EXPENSE_STATES.APPROVED_HRE),
            text: 'Approve as HR'
          });
          break;
        case 'FIN':
          actions.push({
            action: quickUnapprove,
            icon: getStateIcon(EXPENSE_STATES.CREATED),
            text: 'Remove approval'
          });
          break;
      }
      return actions;
    case EXPENSE_STATES.APPROVED_HRE:
      actions = [
        {
          action: quickRejectReturn,
          icon: getStateIcon(EXPENSE_STATES.RETURNED),
          text: 'Reject or Return'
        },
      ];
      switch (userApproverType) {
        case 'ADM':
          actions.push({
            action: quickApprove,
            icon: getStateIcon(EXPENSE_STATES.APPROVED),
            text: 'Approve as Admin'
          });
          break;
        case 'FIN':
          actions.push({
            action: quickApprove,
            icon: getStateIcon(EXPENSE_STATES.APPROVED_FIN),
            text: 'Approve as Finance'
          });
          break;
        case 'HRE':
          actions.push({
            action: quickUnapprove,
            icon: getStateIcon(EXPENSE_STATES.CREATED),
            text: 'Remove approval'
          });
          break;
      }
      return actions;
    case EXPENSE_STATES.REIMBURSED:
      return [
        {
          action: quickUnreimburse,
          icon: getStateIcon(EXPENSE_STATES.APPROVED),
          text: 'Remove reimbursement'
        }
      ];
    default:
      console.log(state);
      return [];
  }
}

/**
 * watcher for employee, filter.active, filter.reimbursed - filters expenses
 */
watch([employee, search, filter.value, startDateFilter, endDateFilter], () => {
  filterExpenses();
});

// |--------------------------------------------------|
// |                                                  |
// |                DATA TABLE GENERAL                |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sets the class for a row in the data table.
 *
 * @param item - The row item
 * @returns Object - The row class
 */
function rowClasses({ item }) {
  if (item?.rejections?.hardRejections?.reasons?.length > 0) {
    return { class: 'rejected-expense-row' };
  } else if (item?.rejections?.softRejections?.reasons?.length > 0 && !item?.rejections?.softRejections?.revised) {
    return { class: 'revised-expense-row' };
  }
}

/**
 * Gets the datatable headers based on user's role. Returns all
 * the headers if the user's role is an admin, otherwise
 * returns all the headers except the 'Employee' header.
 *
 * @return Array - datatable headers
 */
function getRoleHeaders() {
  if (userRoleIsAdmin() || userRoleIsManager()) return headers.value;
  let toRemove = ['state', 'employeeName'];
  return headers.value.filter((h) => !toRemove.includes(h.key));
}

// |--------------------------------------------------|
// |                                                  |
// |                  DATA TABLE ROW                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets reason text formatted with date if available
 */
function getReasonIntro(reason, index) {
  if (reason.date) return format(reason.date, null, 'MM/DD/YYYY');
  return `Reason ${index + 1}`;
}

/**
 * Returns 0 if an expense is not over the age limit, otherwise returns the age that the expense is.
 * @param expense expense to check
 * @returns expense age, or 0 if within limit
 */
function expenseAgeOverLimit(expense) {
  let limit = 45;
  let diff = difference(expense.createdAt, expense.purchaseDate, 'day');
  if (diff <= limit) return 0;
  return diff;
}

/**
 * Gets the status icon color for status icon on expense row
 * 
 * @param expense expense of the row to get status for
 */
const successColor = 'green-darken-2';
const pendingColor = 'grey';
const errorColor = 'red-darken-2';
function getStatusIconColor(expense) {
  if (expensesStatuses.value.successes.has(expense.id)) return successColor;
  if (expensesStatuses.value.errored.has(expense.id)) return errorColor;
  if (expensesStatuses.value.disabled.has(expense.id)) return pendingColor;
}

/**
 * Get CSS class for text of expense row
 * @param expense 
 */
function getExpenseClass(expense) {
  if (expensesStatuses.value.successes.has(expense.id)) return 'text-' + successColor;
  if (expensesStatuses.value.errored.has(expense.id)) return `text-${errorColor} font-weight-bold`;
  if (expensesStatuses.value.disabled.has(expense.id)) return 'text-' + pendingColor;
}

/**
 * Get CSS class for purchase date and created at for expense row
 * @param expense 
 */
function getPurchaseCreatedAtDateClass(expense) {
  let classes = [];
  if (expensesStatuses.value.successes.has(expense.id)) classes.push('text-' + successColor);
  else if (expensesStatuses.value.errored.has(expense.id)) classes.push(`text-${errorColor} font-weight-bold`);
  else if (expensesStatuses.value.disabled.has(expense.id)) classes.push('text-' + pendingColor);
  if (expenseAgeOverLimit(expense)) classes.push('text-' + errorColor);
  return classes.join(' ');
}

/**
 * Converts receipts array to a string of all the receipts
 *
 * @param receipts - the receipts of the expense
 * @return string - the list of all the receipts in the expense
 */
function getReceipts(receipts) {
  let stringifyReceipts = '';
  if (Array.isArray(receipts)) {
    //For all new expenses which are in arrays
    for (let r in receipts) {
      stringifyReceipts = stringifyReceipts + ' ' + receipts[r];
      if (r < receipts.length - 1) {
        stringifyReceipts = stringifyReceipts + ', ';
      }
    }
  } else {
    //For any old expense that is still of type String
    stringifyReceipts = receipts;
  }

  return stringifyReceipts;
}

/**
 * Checks the canDelete optional boolean and if it exists and is true returns true
 *
 * @param expense - expense to check
 * @return boolean - disables the delete and edit button if false
 */
function canDelete(expense) {
  return (
    (expense.canDelete === undefined || expense.canDelete === null || expense.canDelete) &&
    !expense.rejections?.hardRejections?.reasons
  );
}

/**
 * Returns a number with two decimal point precision as a string.
 *
 * @param value - number to filter
 * @return String - number with two decimal points
 */
function moneyFilter(value) {
  return `${new Intl.NumberFormat('en-US', {
    style: 'decimal',
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}`;
}

/**
 * Store the attributes of a selected expense.
 *
 * @param item - expense selected
 */
function onSelect(item) {
  clearExpense();
  expense.value = _mergeWith(expense.value, item, (expenseValue, itemValue) => {
    return _isNil(itemValue) ? expenseValue : itemValue;
  });
  isEditing.value = true;
  expense.value.edit = true;
  expense.value['cost'] = moneyFilter(item.cost);
}

// |--------------------------------------------------|
// |                                                  |
// |              DATA TABLE EXPANDED ROW             |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets number of revisal requests for an expense
 */
function getRevisalsTitle(expense) {
  let length = expense.rejections.softRejections.reasons.length;
  return `Revisal Request${length === 1 ? '' : 's'} (${length}):`
}

/**
 * Checks if an inactive style shoud be applied for an expense. Returns
 * true if the user is an admin and the expense is inactive, otherwise returns false.
 *
 * @param expense - expense to check
 * @return boolean - user inactive styling
 */
function useInactiveStyle(expense) {
  if (userRoleIsAdmin() || userRoleIsManager()) {
    // admin view
    let expenseType = _find(expenseTypes.value, (type) => expense.expenseTypeId === type.value);
    return expenseType && expenseType.isInactive;
  }

  return false;
}

// |--------------------------------------------------|
// |                                                  |
// |                   EXPENSE FORM                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the user is inactive. Returns true if the user is
 * inactive, otherwise returns false.
 *
 * @return boolean - whether or not the user is inactive
 */
const userIsInactive = computed(() => {
  if (userInfo.value == null) {
    return false;
  }
  return userInfo.value.workStatus == 0;
});
</script>

<style>
.case-red {
  color: #bc3825;
}

.expandedInfo {
  border: 1px solid black;
  background-color: #f0f0f0;
  font-size: 14px;
  padding: 20px;
}

.expandedInfo a {
  font-size: 14px;
  color: blue;
}

.expandedInfo a:hover {
  color: #0cf;
}

.flag svg {
  margin-top: 5px;
}

.flagExp p {
  font-weight: bold;
  display: inline-block;
}

td,
v-data-table-header__content {
  font-size: 0.93em !important;
}

.rejected-expense-row {
  background-color: rgb(255, 146, 146);
}

.revised-expense-row {
  background-color: rgb(247, 247, 164);
}

.v-data-table-header__content {
  font-size: 13px;
  font-weight: bold;
}
</style>
