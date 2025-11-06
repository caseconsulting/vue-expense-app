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
                  <v-col cols="3">
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
                  <!-- End Active Filter -->
                  <!-- Status Filter -->
                  <v-col cols="3" :class="!userRoleIsAdmin() && !userRoleIsManager() ? 'ml-3' : ''">
                    <h4>Status:</h4>
                    <v-combobox
                      v-model="filter.status"
                      :items="statusFilterOptions"
                      variant="underlined"
                      hide-details
                    >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props" :title="item.title">
                        <v-list-item-title>{{ item }}</v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-combobox>
                  </v-col>
                  <!-- End Status Filter -->
                  <!-- Reimbursed Date Range Filter -->
                  <v-col cols="6" class="pa-2">
                    <h4 class="ml-0 pl-0 mb-1">Reimbursed Date Range:</h4>
                    <v-row class="ml-1">
                      <!-- Start Date Filter -->
                      <v-menu v-model="startDateFilterMenu" :close-on-content-click="false" location="start center">
                        <template #activator="{ props }">
                          <v-text-field
                            ref="formFields"
                            v-mask="'##/##/####'"
                            :model-value="format(startDateFilter, null, 'MM/DD/YYYY')"
                            :rules="getDateOptionalRules()"
                            label="Start Date"
                            variant="underlined"
                            hint="MM/DD/YYYY format"
                            prepend-icon="mdi-calendar"
                            persistent-hint
                            class="mr-5"
                            v-bind="props"
                            @update:focused="startDateFilter = parseEventDate()"
                            @click:prepend="startDateFilterMenu = true"
                            @keypress="startDateFilterMenu = false"
                          />
                        </template>
                        <v-date-picker
                          v-model="startDateFilter"
                          show-adjacent-months
                          hide-actions
                          keyboard-icon=""
                          color="#bc3825"
                          title="Start Date Filter"
                          @update:model-value="
                            startDateFilterMenu = false;
                            startDateFilter = format(startDateFilter, null, 'MM/DD/YYYY');
                          "
                        />
                      </v-menu>
                      <!-- End Start Date Filter-->

                      <!-- End Date Filter -->
                      <v-menu v-model="endDateFilterMenu" :close-on-content-click="false" location="start center">
                        <template #activator="{ props }">
                          <v-text-field
                            ref="formFields"
                            v-mask="'##/##/####'"
                            :model-value="format(endDateFilter, null, 'MM/DD/YYYY')"
                            :rules="getDateOptionalRules()"
                            label="End Date"
                            variant="underlined"
                            hint="MM/DD/YYYY format"
                            prepend-icon="mdi-calendar"
                            persistent-hint
                            class="mr-5"
                            v-bind="props"
                            @update:focused="endDateFilter = parseEventDate()"
                            @click:prepend="endDateFilterMenu = true"
                            @keypress="endDateFilterMenu = false"
                          />
                        </template>
                        <v-date-picker
                          v-model="endDateFilter"
                          show-adjacent-months
                          hide-actions
                          keyboard-icon=""
                          color="#bc3825"
                          title="Start Date Filter"
                          @update:model-value="
                            endDateFilterMenu = false;
                            endDateFilter = format(endDateFilter, null, 'MM/DD/YYYY');
                          "
                        />
                      </v-menu>
                      <!-- End End Date Filter-->
                    </v-row>
                    <!-- End Date Range Filter -->
                  </v-col>
                </v-row>
              </v-container>
            </fieldset>
            <br />
            <!-- End Filters -->

            <!-- My Expenses Data Table-->
            <v-data-table
              :sort-by="toSort"
              :headers="getRoleHeaders()"
              :items="filteredExpenses"
              :expanded="expanded"
              :loading="loading || initialPageLoading"
              :items-per-page="15"
              :row-props="rowClasses"
              :search="search"
              item-value="id"
              class="elevation-4 smaller-font"
              density="compact"
              :no-data-text="'No results :('"
              expand-on-click
            >
              <!-- State slot -->
              <template #[`item.state`]="{ item }">
                <td v-if="userRoleIsAdmin() || userRoleIsManager()">
                  <v-icon :icon="getStateIcon(item.state)" size="large" />
                  <v-tooltip activator="parent" location="right"> {{ getStateTooltip(item) }} </v-tooltip>
                </td>
              </template>
              <!-- Creation date slot -->
              <template #[`item.createdAt`]="{ item }">
                <td>{{ monthDayYearFormat(item.createdAt) }}</td>
              </template>
              <!-- Employee name slot-->
              <template #[`item.employeeName`]="{ item }">
                <td v-if="userRoleIsAdmin() || userRoleIsManager()">
                  {{ item.employeeName }}
                </td>
              </template>
              <!-- Budget Name Slot -->
              <template #[`item.budgetName`]="{ item }">
                <td>{{ item.budgetName }}</td>
              </template>
              <!-- Cost slot -->
              <template #[`item.cost`]="{ item }">
                <td>{{ convertToMoneyString(item.cost) }}</td>
              </template>
              <!-- Purchase date slot -->
              <template #[`item.purchaseDate`]="{ item }">
                <td>{{ monthDayYearFormat(item.purchaseDate) }}</td>
              </template>
              <!-- Reimburse date Slot -->
              <template #[`item.reimbursedDate`]="{ item }">
                <td>{{ monthDayYearFormat(item.reimbursedDate) }}</td>
              </template>
              <!--Action Items-->
              <template #[`item.actions`]="{ item }">
                <td class="d-flex justify-end mr-4">
                  <!-- Download Attachment Button -->
                  <attachment :mid-action="midAction" :expense="item" :mode="'expenses'" />

                  <!-- Edit Button -->
                  <v-btn
                    id="edit"
                    :disabled="
                      isEditing ||
                      midAction ||
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
                      isReimbursed(item) ||
                      isEditing ||
                      midAction ||
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
                  <!-- Unreimburse Button -->
                  <v-btn
                    v-if="userRoleIsAdmin() || userRoleIsManager()"
                    id="unreimburse"
                    :disabled="!isReimbursed(item) || isEditing || midAction"
                    variant="text"
                    icon
                    size="small"
                    @click="
                      unreimbursing = !unreimbursing;
                      midAction = true;
                      propExpense = item;
                    "
                  >
                    <v-icon size="x-large" class="case-gray" icon="mdi-currency-usd-off" />
                    <v-tooltip activator="parent" location="top"> Unreimburse </v-tooltip>
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
                          <b>Revisal Requests:</b>
                          <div v-for="(reason, i) in item.rejections.softRejections.reasons" :key="reason">
                            &nbsp;&nbsp;&nbsp;&nbsp;<b>Reason {{ i + 1 }}: </b>{{ reason }}
                          </div>
                          <div>
                            &nbsp;&nbsp;&nbsp;&nbsp;<b>Revised: </b>
                            {{ item.rejections.softRejections.revised ? 'Yes' : 'No' }}
                          </div>
                        </div>
                        <div v-if="!isEmpty(item?.rejections?.hardRejections)">
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
                :mid-action="midAction"
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
  </div>
</template>

<script setup>
import api from '@/shared/api.js';
import Attachment from '@/components/utils/Attachment.vue';
import ConvertExpensesToCsv from '@/components/expenses/ConvertExpensesToCsv.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import employeeUtils from '@/shared/employeeUtils';
import { isExpenseEditable } from '@/shared/expenseUtils';
import ExpenseForm from '@/components/expenses/ExpenseForm.vue';
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
import { format, isBetween } from '@/shared/dateUtils';
import { getDateOptionalRules } from '@/shared/validationUtils.js';
import { updateStoreBudgets, updateStoreExpenseTypes, updateStoreEmployees, updateStoreTags } from '@/utils/storeUtils';
import { mask } from 'vue-the-mask';
import { onBeforeMount, onBeforeUnmount, ref, watch, computed, inject } from 'vue';
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

const deleting = ref(false); // activate delete model
const expanded = ref([]); // datatable expanded
const expenses = ref([]); // all expenses
const employees = ref([]); // employee autocomplete options
const employee = ref(null); // employee autocomplete filter
const endDateFilter = ref(null);
const endDateFilterMenu = ref(null);
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
let statusFilterOptions = ref([
  'All',
  ...Object.values(EXPENSE_STATES).map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
]);
const filter = ref({
  active: 'both',
  status: 'All'//default only shows expenses that are not reimbursed
}); // datatable filters
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
const startDateFilterMenu = ref(null);
const tagsInfo = ref({
  selected: [],
  flipped: []
});
const unreimbursing = ref(false); // activate unreimburse model when value changes
const userInfo = ref(null); // user information
const vMask = mask; //custom directive

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Gets and sets user info, expense types, and expenses. Creates event listeners.
 */
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

  if (store.getters.storeIsPopulated) {
    loadMyExpensesData();
  }

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
}); // onBeforeMount

/**
 * destroy listeners
 */
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

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

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

// |--------------------------------------------------|
// |                                                  |
// |                     FILTERS                      |
// |                                                  |
// |--------------------------------------------------|

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

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the icon for the state of an expense.
 * 
 * @param state - expenses state field
 * @returns String - icon name
 */
function getStateIcon(state) {
  switch (state) {
    case EXPENSE_STATES.CREATED: return 'mdi-new-box';
    case EXPENSE_STATES.APPROVED: return 'mdi-check-decagram'; // mdi-signature-freehand
    case EXPENSE_STATES.REIMBURSED: return 'mdi-cash-check';
    case EXPENSE_STATES.REJECTED: return 'mdi-close-box';
    case EXPENSE_STATES.RETURNED: return 'mdi-arrow-u-left-top-bold';
    case EXPENSE_STATES.REVISED: return 'mdi-pencil-box';
    default: return 'mdi-help-rhombus';
  }
}

/**
 * Gets tooltip text for an expense based on its state.
 * 
 * @param state - expenses state field
 * @returns String - tooltip text
 */
function getStateTooltip(item) {
  function approvedBy() {
    let fallback = "unknown approver";
    if (!item.approvedBy) return fallback;
    let approver = employeeUtils.getEmployeeByID(item.approvedBy, store.getters.employees);
    if (!approver) return fallback;
    return employeeUtils.nicknameAndLastName(approver);
  }

  switch (item.state) {
    case EXPENSE_STATES.CREATED: return 'Created';
    case EXPENSE_STATES.APPROVED: return 'Approved by ' + approvedBy();
    case EXPENSE_STATES.REIMBURSED: return 'Reimbursed';
    case EXPENSE_STATES.REJECTED: return 'Rejected permanantly';
    case EXPENSE_STATES.RETURNED: return 'Returned for edits';
    case EXPENSE_STATES.REVISED: return 'Revised';
    default: return 'Unknown State';
  }
}
 
/**
 * Refresh and updates expense list and displays a successful
 * create status in the snackbar.
 */
async function addModelToTable() {
  await refreshExpenses();

  useDisplaySuccess('Item was successfully submitted!');
} // addModelToTable

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
} // clearExpense

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
} // constructAutoComplete

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
      await deleteModelFromTable(deletedExpense);
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
} // deleteExpense

/**
 * Refresh and updates expense list and displays a successful
 * delete status in the snackbar.
 */
async function deleteModelFromTable() {
  await refreshExpenses();

  useDisplaySuccess('Item was successfully deleted!');
} // deleteModelFromTable

/**
 * Filters expenses based on filter selections.
 */
function filterExpenses() {
  filteredExpenses.value = expenses.value;

  // filter expenses by employee search
  if (employee.value) {
    filteredExpenses.value = _filter(filteredExpenses.value, (expense) => {
      return expense.employeeId === employee.value;
    });
  }

  // filter based on tags
  if (tagsInfo.value.selected?.length > 0) {
    filteredExpenses.value = _filter(filteredExpenses.value, (expense) => {
      return employeeUtils.selectedTagsHasEmployee(expense.employeeId, tagsInfo.value);
    });
  }

  // filter based on generic search
  if (search.value) {
    let headerKeys = _map(headers.value, (object) => object.key);
    filteredExpenses.value = _filter(filteredExpenses.value, (expense) => {
      return _some(Object.entries(expense), ([key, value]) => {
        return String(value)?.toLowerCase().includes(search.value?.toLowerCase()) && headerKeys?.includes(key);
      });
    });
  }

  // filter based on start and end dates
  if (startDateFilter.value && endDateFilter.value) {
    filteredExpenses.value = _filter(filteredExpenses.value, (expense) =>
      isBetween(expense.reimbursedDate, startDateFilter.value, endDateFilter.value, 'days', '[]')
    );
  }

  // filter based on reimbursement status
  if (filter.value.status !== 'All') {
    // filter expenses by reimburse date
    filteredExpenses.value = _filter(filteredExpenses.value, (expense) => {
      return expense.state.toLowerCase() === filter.value.status.toLowerCase();
    });
  }

  // filter based on expense type active
  if (filter.value.active !== 'both') {
    // filter expenses by active or inactive expense types (available to admin only)
    filteredExpenses.value = _filter(filteredExpenses.value, (expense) => {
      let expenseType = _find(expenseTypes.value, (type) => expense.expenseTypeId === type.value);
      if (filter.value.active == 'active') {
        // filter for active expenses
        return expenseType && !expenseType.isInactive;
      } else {
        // filter for inactive expenses
        return expenseType && expenseType.isInactive;
      }
    });
  }
} // filterExpenses

/**
 * Converts an employee ID into their full name.
 *
 * @param  eId - the employee id to find
 * @return string - the name of the high five recipient
 */
function getEmployee(eId) {
  let employee = _find(store.getters.employees, ['id', eId]);
  return employeeUtils.nicknameAndLastName(employee);
} // getEmployee

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
 * Checks if the expense is reimbursed. Returns true if the
 * expense is reimbursed, otherwise returns false.
 *
 * @param expense - expense to check
 * @return boolean - expense is reimbursed
 */
function isReimbursed(expense) {
  return expense && !isEmpty(expense.reimbursedDate);
} // isReimbursed

/**
 * Checks if the expense is rejected. Returns true if the
 * expense is reimbursed, otherwise returns false.
 *
 * @param expense - expense to check
 * @return boolean - expense is rejected
 */
function isRejected(expense) {
  return (
    expense?.rejections?.softRejections?.reasons?.length > 0 || expense?.rejections?.hardRejections?.reasons?.length
  );
} // isRejected

async function loadMyExpensesData() {
  initialPageLoading.value = true;
  loading.value = true;
  // get user info, defaulting to params if exists
  userInfo.value = store.getters.user; // TODO: parse localstorage into string and then parse from string
  if (localStorage.getItem('requestedFilter')) userInfo.value = JSON.parse(localStorage.getItem('requestedFilter'));
  await Promise.all([
    !store.getters.expenseTypes ? updateStoreExpenseTypes() : '',
    !store.getters.employees ? updateStoreEmployees() : '',
    !store.getters.budgets ? updateStoreBudgets() : '',
    !store.getters.tags && (userRoleIsAdmin() || userRoleIsManager()) ? updateStoreTags() : '', // tags only required for admin/manager
    refreshExpenses()
  ]);

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
} // canDelete

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
} // onSelect

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return format(event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD');
} // parseEventDate

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
} // refreshExpenses

/**
 * set midAction to true
 */
function startAction() {
  midAction.value = true;
} // startAction

/**
 * Scrolls window back to the top of the form.
 */
function toTopOfForm() {
  window.scrollTo(0, form.value.$el.offsetTop - 70);
} // toTopOfForm

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
} // rowClasses

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
} // unreimburseExpense

/**
 * Refresh and updates expense list and displays a successful
 * update status in the snackbar.
 */
async function updateModelInTable() {
  await refreshExpenses();

  useDisplaySuccess('Item was successfully updated!');
} // updateModelInTable

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
} // useInactiveStyle

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for employee, filter.active, filter.reimbursed - filters expenses
 */
watch([employee, search, filter.value, startDateFilter, endDateFilter], () => {
  filterExpenses();
}); // watchFilterExpenses

/**
 * Checks if the store is populated from initial page load.
 *
 * @returns boolean - True if the store is populated
 */
watch(storeIsPopulated, async () => {
  if (storeIsPopulated) {
    loadMyExpensesData();
  }
}); // watchStorePopulated
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
