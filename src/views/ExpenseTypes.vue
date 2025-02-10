<template>
  <div>
    <v-row v-if="initialPageLoading">
      <v-col cols="12" :lg="userRoleIsAdmin() ? 8 : 12">
        <div class="mt-3">
          <v-skeleton-loader type="table-heading, list-item@6" />
        </div>
      </v-col>
      <v-col v-if="userRoleIsAdmin()" cols="12" lg="4">
        <v-skeleton-loader class="mt-3" type="list-item@12" />
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" :lg="userRoleIsAdmin() ? 8 : 12">
        <v-card class="mt-3">
          <v-container fluid>
            <!-- Title -->
            <v-card-title>
              <v-row>
                <v-col cols="4">
                  <h2>Expense Types</h2>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="12" sm="4">
                  <!-- Search Bar -->
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

            <!-- Filters -->
            <fieldset>
              <legend class="legend_style">Filters</legend>
              <!-- Active Filter -->
              <div class="flagFilter">
                <h4>Active Expense Type:</h4>
                <v-btn-toggle color="primary" class="filter_color" v-model="filter.active" text mandatory>
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
                        <v-icon> mdi-close-circle{{ filter.active.includes('notActive') ? '' : '-outline' }} </v-icon>
                      </v-btn>
                    </template>
                    <span>Hide Active</span>
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
              </div>
              <!-- End Active Filter -->

              <!-- Overdraft Filter -->
              <div class="flagFilter">
                <h4>Overdraft:</h4>
                <v-btn-toggle color="primary" class="filter_color" v-model="filter.overdraft" text mandatory>
                  <!-- Show Overdraft -->
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-btn value="overdraft" v-bind="props" variant="text">
                        <v-icon class="mr-1">
                          mdi-check-circle{{ filter.overdraft.includes('overdraft') ? '' : '-outline' }}
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Show Overdraft</span>
                  </v-tooltip>

                  <!-- Show No Overdraft -->
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-btn value="noOverdraft" v-bind="props" variant="text">
                        <v-icon>
                          mdi-close-circle{{ filter.overdraft.includes('noOverdraft') ? '' : '-outline' }}
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Hide Overdraft</span>
                  </v-tooltip>

                  <!-- Show Overdraft and No Overdraft -->
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-btn
                        value="both"
                        v-bind="props"
                        variant="text"
                        :class="filter.overdraft.includes('both') ? 'font-weight-black' : ''"
                      >
                        BOTH
                      </v-btn>
                    </template>
                    <span>Show All</span>
                  </v-tooltip>
                </v-btn-toggle>
              </div>
              <!-- End Overdraft Filter -->

              <!-- Recurring Filter -->
              <div class="flagFilter">
                <h4>Recurring:</h4>
                <v-btn-toggle color="primary" class="filter_color" v-model="filter.recurring" text mandatory>
                  <!-- Show Recurring -->
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-btn value="recurring" v-bind="props" variant="text">
                        <v-icon class="mr-1">
                          mdi-check-circle{{ filter.recurring.includes('recurring') ? '' : '-outline' }}
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Show Recurring</span>
                  </v-tooltip>

                  <!-- Show Non-Recurring -->
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-btn value="notRecurring" v-bind="props" variant="text">
                        <v-icon>
                          mdi-close-circle{{ filter.recurring.includes('notRecurring') ? '' : '-outline' }}
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Hide Recurring</span>
                  </v-tooltip>

                  <!-- Show Recurring and Non-Recurring -->
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-btn
                        value="both"
                        v-bind="props"
                        variant="text"
                        :class="filter.recurring.includes('both') ? 'font-weight-black' : ''"
                      >
                        BOTH
                      </v-btn>
                    </template>
                    <span>Show All</span>
                  </v-tooltip>
                </v-btn-toggle>
              </div>
              <!-- End Recurring Filter -->
            </fieldset>
            <br />
            <!-- End Filters -->

            <!--EXPENSE TYPE DATA TABLE -->
            <v-data-table
              :sort-by="sortBy"
              :items-per-page="itemsPerPage"
              :headers="_headers"
              :items="expenseTypeList"
              :expanded="expanded"
              expand-on-click
              :loading="loading"
              :search="search"
              item-key="id"
              class="elevation-4"
              density="compact"
            >
              <!-- Budget Name slot -->
              <template #[`item.budgetName`]="{ item }">
                <p class="mb-0">
                  {{ limitedText(item.budgetName) }}
                </p>
              </template>
              <!-- Budget slot -->
              <template #[`item.budget`]="{ item }">
                <p class="mb-0">
                  {{ convertToMoneyString(item.budget) }}
                </p>
              </template>
              <!-- Budget slot -->
              <template #[`item.startDate`]="{ item }">
                <p class="mb-0">
                  {{ format(item.startDate, null, 'YYYY-MM-DD') }}
                </p>
              </template>
              <!-- Budget slot -->
              <template #[`item.endDate`]="{ item }">
                <p class="mb-0">
                  {{ format(item.endDate, null, 'YYYY-MM-DD') }}
                </p>
              </template>
              <!-- Actions -->
              <template v-if="userRoleIsAdmin()" v-slot:[`item.actions`]="{ item }">
                <div class="mr-4">
                  <v-btn
                    v-if="userRoleIsAdmin()"
                    :disabled="midAction"
                    variant="text"
                    icon
                    @click.stop="openDisableModal(item)"
                    v-tooltip="'Disable Employee Access'"
                  >
                    <v-icon icon="mdi-account-lock" class="case-gray" />
                  </v-btn>
                  <v-btn
                    v-if="userRoleIsAdmin()"
                    :disabled="midAction"
                    variant="text"
                    icon
                    @click.stop="
                      toTopOfForm();
                      onSelect(item);
                    "
                    v-tooltip="'Edit'"
                  >
                    <v-icon icon="mdi-pencil" class="case-gray" />
                  </v-btn>
                  <v-btn
                    v-if="userRoleIsAdmin()"
                    id="delete"
                    :disabled="midAction"
                    variant="text"
                    icon
                    @click.stop="validateDelete(item)"
                    v-tooltip="'Delete'"
                  >
                    <v-icon icon="mdi-delete" class="case-gray" />
                  </v-btn>
                </div>
              </template>

              <!-- Expanded slot item -->
              <template #expanded-row="{ columns, item }">
                <td :colspan="columns.length" class="pa-0">
                  <v-card>
                    <v-card-text>
                      <div class="expandedInfo">
                        <!-- Description -->
                        <v-row no-gutters>
                          <v-col cols="12">
                            <p v-if="item.description">
                              <b>Description:</b>
                              {{ item.description }}
                            </p>
                          </v-col>
                        </v-row>

                        <!-- Category -->
                        <v-row no-gutters>
                          <v-col cols="12">
                            <p>
                              <b>Categories:</b>
                              {{ categoriesToString(item.categories) }}
                            </p>
                          </v-col>
                        </v-row>

                        <v-row no-gutters>
                          <!-- Show on Feed -->
                          <v-col>
                            <div v-if="item.alwaysOnFeed">
                              <p><b>Show On Feed:</b> All Expenses</p>
                            </div>
                            <div v-else>
                              <p><b>Show On Feed:</b> {{ categoriesOnFeed(item.categories) }}</p>
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Show Require URL -->
                        <v-row no-gutters>
                          <v-col>
                            <div v-if="item.requireURL">
                              <p><b>Require URL:</b> All Expenses</p>
                            </div>
                            <div v-else>
                              <p><b>Require URL:</b> {{ categoriesReqUrl(item.categories) }}</p>
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Show Require Receipt -->
                        <v-row no-gutters>
                          <v-col>
                            <div v-if="item.requiredFlag">
                              <p><b>Require Receipt:</b> All Expenses</p>
                            </div>
                            <div v-else>
                              <p><b>Require Receipt:</b> {{ categoriesReqReceipt(item.categories) }}</p>
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Requires Recipient -->
                        <v-row no-gutters>
                          <v-col>
                            <p v-if="item.hasRecipient"><b>Requires Recipient:</b> Yes</p>
                            <p v-else><b>Requires Recipient:</b> No</p>
                          </v-col>
                        </v-row>

                        <!-- Flags -->
                        <v-row no-gutters>
                          <v-col cols="12" sm="6" md="3" class="flag">
                            <p>Pro-rated:</p>
                            <v-icon
                              v-if="item.proRated"
                              icon="mdi-check-circle-outline"
                              id="marks"
                              class="mr-1"
                              color="green"
                            />
                            <v-icon v-else icon="mdi-close-circle-outline" id="marks" class="mr-1 case-red" />
                          </v-col>
                          <v-col cols="12" sm="6" md="3" class="flag">
                            <p>Overdraft Allowed:</p>
                            <v-icon
                              v-if="item.odFlag"
                              icon="mdi-check-circle-outline"
                              id="marks"
                              class="mr-1"
                              color="green"
                            />
                            <v-icon v-else icon="mdi-close-circle-outline" id="marks" class="mr-1 case-red" />
                          </v-col>
                          <v-col cols="12" sm="6" md="3" class="flag">
                            <p>Recurring:</p>
                            <v-icon
                              v-if="item.recurringFlag"
                              icon="mdi-check-circle-outline"
                              id="marks"
                              class="mr-1"
                              color="green"
                            />
                            <v-icon v-else icon="mdi-close-circle-outline" id="marks" class="mr-1 case-red" />
                          </v-col>
                          <v-col cols="12" sm="6" md="3" class="flag">
                            <p>Inactive:</p>
                            <v-icon
                              v-if="item.isInactive"
                              icon="mdi-check-circle-outline"
                              id="marks"
                              class="mr-1"
                              color="green"
                            />
                            <v-icon v-else icon="mdi-close-circle-outline" id="marks" class="mr-1 case-red" />
                          </v-col>
                        </v-row>
                        <!-- End Flags -->

                        <!-- Accessible By -->
                        <v-row v-if="userRoleIsAdmin()" no-gutters>
                          <!-- Display number of employees accessed by -->
                          <div>
                            <p>
                              <b>Access:</b>
                              {{ getAccess(item) }}
                            </p>
                          </div>
                          <!-- Button to view names of employees with access -->
                          <v-dialog v-model="showAccess[item.id]" max-width="400px" scrollable>
                            <template #activator="{ props }">
                              <v-btn class="px-1 ml-3" size="x-small" variant="outlined" v-bind="props"> view </v-btn>
                            </template>
                            <v-card class="mt-3">
                              <!-- Dialog Title -->
                              <v-card-title class="d-flex align-center header_style">
                                <h3>Accessible By</h3>
                              </v-card-title>
                              <v-divider color="black" />
                              <!-- List of employee names/ISSUES -->
                              <v-card-text class="pb-0">
                                <v-row>
                                  <v-list color="#f0f0f0" width="376">
                                    <div v-for="employee in getEmployeeList(item.accessibleBy)" :key="employee.id">
                                      <v-list-item>
                                        <!-- Employee Image -->
                                        <template #prepend>
                                          <user-avatar :employee="employee" :image="employee.avatar" />
                                        </template>
                                        <!-- Employee Name -->
                                        <v-list-item-title>{{ getEmployeeName(employee.id) }}</v-list-item-title>
                                      </v-list-item>
                                    </div>
                                  </v-list>
                                </v-row>
                              </v-card-text>

                              <v-divider color="black" />
                              <!-- Close dialog button -->
                              <v-card-actions>
                                <v-spacer />
                                <v-btn theme="dark" variant="text" @click="showAccess[item.id] = false"> Close </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                        </v-row>
                        <!-- End Accessible By -->

                        <!-- Tag Budgets -->
                        <v-row v-if="userRoleIsAdmin() && item.tagBudgets && item.tagBudgets.length > 0" no-gutters>
                          <v-col cols="12" sm="6" md="3">
                            <div>
                              <p><b>Tag Budgets:</b></p>
                            </div>
                          </v-col>
                          <v-col class="d-flex justify-space-between flex-wrap">
                            <div v-for="(item, index) in item.tagBudgets" :key="index" class="d-flex px-2 pb-4">
                              <div class="d-flex pr-3">
                                <b>Tag(s):</b>
                                <div class="d-flex flex-column">
                                  <v-chip v-for="tagID in item.tags" size="small" :key="tagID">
                                    <v-icon icon="mdi-tag" start />{{ getTagByID(tagID).tagName }}
                                  </v-chip>
                                </div>
                              </div>
                              <div class="d-flex flex-nowrap">
                                <span>
                                  <b>Budget: </b>
                                  {{ convertToMoneyString(item.budget) }}
                                </span>
                              </div>
                            </div>
                          </v-col>
                        </v-row>
                        <!-- End Tag Budgets -->

                        <!-- Basecamp Campfire -->
                        <p v-if="getCampfire(item.campfire)">
                          <b>Basecamp Campfire: </b>
                          <a :href="getCampfire(item.campfire).url" target="blank">
                            {{ getCampfire(item.campfire).name }}
                          </a>
                        </p>
                        <!-- End Basecamp Campfire -->

                        <!-- Monthly Limit -->
                        <p v-if="item.monthlyLimit">
                          <b>Monthly Limit: </b>
                          ${{ item.monthlyLimit }}
                        </p>
                      </div>
                    </v-card-text>
                  </v-card>
                </td>
              </template>

              <!-- Alert slot for no search results -->
              <template #no-results>
                <v-alert :value="true" color="error" icon="mdi-alert">
                  Your search for "{{ search }}" found no results
                </v-alert>
              </template>
              <!-- End alert for no search results -->
            </v-data-table>
            <!-- END EXPENSE TYPE Datatable -->

            <!-- Confirmation Modals -->
            <delete-modal
              :toggle-delete-modal="deleting"
              :delete-info="'(' + deleteType + ')'"
              :type="'expense-type'"
            />
            <delete-error-modal v-model="invalidDelete" type="expense type" />
            <!-- End Confirmation Modals -->
            <!-- Other modals -->
            <disable-expense-type-for-employees-modal v-model="showDisableModal" :type="disableModalItem" />
            <!-- End Other modals -->
          </v-container>
        </v-card>
      </v-col>

      <!-- Expense Type Form -->
      <v-col v-if="userRoleIsAdmin()" cols="12" lg="4">
        <expense-type-form ref="form" :model="model" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import api from '@/shared/api.js';
import DeleteErrorModal from '@/components/modals/DeleteErrorModal.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import DisableExpenseTypeForEmployeesModal from '@/components/modals/DisableExpenseTypeForEmployeesModal.vue';
import ExpenseTypeForm from '@/components/expense-types/ExpenseTypeForm.vue';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _find from 'lodash/find';
import _sortBy from 'lodash/sortBy';
import _cloneDeep from 'lodash/cloneDeep';
import _union from 'lodash/union';
import _uniq from 'lodash/uniq';
import { convertToMoneyString, userRoleIsAdmin } from '@/utils/utils';
import {
  updateStoreExpenseTypes,
  updateStoreEmployees,
  updateStoreAvatars,
  updateStoreBudgets,
  updateStoreCampfires,
  updateStoreTags
} from '@/utils/storeUtils';
import { format } from '../shared/dateUtils';
import { onBeforeMount, onBeforeUnmount, ref, watch, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { useDisplayError, useDisplaySuccess } from '@/components/shared/StatusSnackbar.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

// items for disable modal
const showDisableModal = ref(false);
const disableModalItem = ref(null);

const campfires = ref([]); // basecamp campfires
const deleteModel = ref({ id: '' }); // expense type to delete
const deleting = ref(false); // activate delete confirmation model
const emitter = inject('emitter');
const employees = ref([]); // employees
const expanded = ref([]); // datatable expanded
const expenseTypes = ref([]); // expense types
const filter = ref({
  active: 'active',
  overdraft: 'both',
  recurring: 'both'
}); // datatable filters
const filteredExpenseTypes = ref([]); // filtered expense types
const form = ref(null);
const headers = ref([
  {
    title: 'Expense Type',
    key: 'budgetName',
    show: true
  },
  {
    title: 'Budget',
    key: 'budget',
    show: true
  },
  {
    title: 'Start Date',
    key: 'startDate',
    show: true
  },
  {
    title: 'End Date',
    key: 'endDate',
    show: true
  },
  {
    title: '',
    key: 'actions',
    sortable: false,
    show: false,
    align: 'end'
  }
]); // datatable headers
const initialPageLoading = ref(true);
const invalidDelete = ref(false); // invalid delete staus
const itemsPerPage = ref(-1); // items per datatable page
const loading = ref(true); //loading status
const midAction = ref(false);
const model = ref({
  accessibleBy: ['FullTime'],
  alwaysOnFeed: false,
  budget: 0,
  budgetName: '',
  campfire: null,
  categories: [],
  description: '',
  endDate: null,
  hasRecipient: false,
  id: '',
  isInactive: false,
  odFlag: false,
  proRated: false,
  recurringFlag: false,
  requiredFlag: true,
  requireURL: false,
  startDate: null,
  tagBudgets: []
}); // selected expense type
const search = ref(''); // query text for datatable search field
const showAccess = ref({}); // activate display for access list, object of ids to boolean
const showAccessLength = ref(0); // number of employees with access
const sortBy = ref([{ key: 'budgetName', order: 'asc' }]); // sort datatable items
const store = useStore();
const userInfo = ref(null); // user information
const deleteType = ref(''); // item.budgetName for when item is deleted

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * destroy listeners
 */
onBeforeUnmount(() => {
  emitter.off('add');
  emitter.off('startAction');
  emitter.off('endAction');
  emitter.off('update');
  emitter.off('error');
  emitter.off('canceled-delete-expense-type');
  emitter.off('confirm-delete-expense-type');
  emitter.off('refresh-expense-types');
  emitter.off('finished-editing-expense-type');
  emitter.off('editing-expense-type');
  emitter.off('invalid-expense type-delete');
}); // beforeUnmount

/**
 * Set user info, employees, and expense types. Creates event listeners.
 */
onBeforeMount(async () => {
  // expenseTypeForm listeners
  emitter.on('add', () => {
    addModelToTable();
  });
  emitter.on('startAction', () => {
    startAction();
  });
  emitter.on('endAction', () => {
    endAction();
  });
  emitter.on('update', () => {
    updateModelInTable();
  });
  emitter.on('error', (msg) => {
    expenseFormError(msg);
  });

  //no longer editing an expense (clear model and enable buttons)
  emitter.on('finished-editing-expense-type', () => {
    clearModel();
    endAction();
  });

  //when expense type is being edited buttons should be disabled
  emitter.on('editing-expense-type', () => {
    startAction();
  });

  emitter.on('canceled-delete-expense-type', () => {
    midAction.value = false;
    deleting.value = false;
  });
  emitter.on('confirm-delete-expense-type', async () => {
    deleting.value = false;
    await deleteExpenseType();
  });
  emitter.on('invalid-expense type-delete', () => {
    midAction.value = false;
  });

  // allow expense types to be refreshed by emit
  emitter.on('refresh-expense-types', async () => {
    midAction.value = true;
    await updateStoreExpenseTypes();
    await refreshExpenseTypes();
    midAction.value = false;
  });

  if (store.getters.storeIsPopulated) {
    await loadExpenseTypesData();
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * the list of expense types
 *
 * @return array - the filtered expense types
 */
const expenseTypeList = computed(() => {
  return filteredExpenseTypes.value;
}); // expenseTypeList

/**
 * Checks if the store is populated from initial page load.
 *
 * @returns boolean - True if the store is populated
 */
const storeIsPopulated = computed(() => {
  return store.getters.storeIsPopulated;
}); // storeIsPopulated

const _headers = computed(() => {
  if (userRoleIsAdmin()) {
    return headers.value;
  } else {
    return headers.value.filter((x) => x.show);
  }
}); // _headers

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Refresh and updates expense type list and displays a successful create status in the snackbar.
 */
async function addModelToTable() {
  await updateStoreExpenseTypes();
  await refreshExpenseTypes();

  useDisplaySuccess('Item was successfully submitted!');
} // addModelToTable

/**
 * Returns a string of category names.
 *
 * @param categories - the categories to stringify
 * @return string - the string of categories
 */
function categoriesToString(categories) {
  let string = '';
  for (let i = 0; i < categories.length; i++) {
    string += categories[i].name;
    if (i < categories.length - 1) {
      string += ', ';
    }
  }
  if (string.length === 0) {
    return 'None';
  }
  return string;
} // categoriesToString

/**
 * Returns a string of category names that are on the feed.
 *
 * @param categories - the categories to stringify
 * @return string - the string of categories on the feed
 */
function categoriesOnFeed(categories) {
  let string = '';
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].showOnFeed) {
      if (string.length > 0) {
        string += ', ';
      }
      string += categories[i].name;
    }
  }
  if (string.length == 0) {
    string = 'None';
  }
  return string;
} // categoriesOnFeed

/**
 * Returns a string of category names that require a url.
 *
 * @param categories - the categories to stringify
 * @return string - the string of categories that require a url
 */
function categoriesReqUrl(categories) {
  let string = '';
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].requireURL) {
      if (string.length > 0) {
        string += ', ';
      }
      string += categories[i].name;
    }
  }
  if (string.length == 0) {
    string = 'None';
  }
  return string;
} // categoriesReqUrl

/**
 * Returns a string of category names that require a receipt.
 *
 * @param categories - the categories to stringify
 * @return string - the string of categories that require a receipt
 */
function categoriesReqReceipt(categories) {
  let string = '';
  //first filter out those that have a receipt required. then map each match to just it's name (now it's a list).
  //finally join the array items with a comma.
  string = _map(
    _filter(categories, (cat) => {
      return cat.requireReceipt;
    }),
    (match) => {
      return match.name;
    }
  ).join(', ');

  if (string.length == 0) {
    string = 'None';
  }
  return string;
} // categoriesReqReceipt

/**
 * Clear the selected expense type.
 */
function clearModel() {
  model.value['id'] = '';
  model.value['budget'] = 0;
  model.value['budgetName'] = '';
  model.value['description'] = '';
  model.value['odFlag'] = false;
  model.value['proRated'] = false;
  model.value['startDate'] = '';
  model.value['endDate'] = '';
  model.value['recurringFlag'] = false;
  model.value['requiredFlag'] = false;
  model.value['isInactive'] = false;
  model.value['categories'] = [];
  model.value['accessibleBy'] = ['FullTime'];
  model.value['hasRecipient'] = false;
  model.value['alwaysOnFeed'] = false;
  model.value['campfire'] = null;
  model.value['requireURL'] = false;
  model.value['tagBudgets'] = [];
} // clearModel

/**
 * Delete an expense type and display status.
 */
async function deleteExpenseType() {
  let et = await api.deleteItem(api.EXPENSE_TYPES, deleteModel.value.id);
  if (et.id) {
    // successfully deletes expense type
    await deleteModelFromTable();
  } else {
    // fails to delete expense type
    useDisplayError(et.response.data.message);
  }
  midAction.value = false;
} // deleteExpenseType

/**
 * Refresh and updates expense type list and displays a successful delete status in the snackbar.
 */
async function deleteModelFromTable() {
  await updateStoreExpenseTypes();
  await refreshExpenseTypes();

  useDisplaySuccess('Item was successfully deleted!');
} // deleteModelFromTable

/**
 * Sets inAction boolean to false.
 */
function endAction() {
  midAction.value = false;
} // endAction

/** Display error from expense form */
function expenseFormError(msg) {
  useDisplayError(JSON.parse(msg));
}

/**
 * Filters expense types based on filter selections.
 */
function filterExpenseTypes() {
  filteredExpenseTypes.value = { ...expenseTypes.value };

  // filter expense types by active or inactive
  filteredExpenseTypes.value = _filter(filteredExpenseTypes.value, (expenseType) => {
    return filter.value.active == 'active'
      ? !expenseType.isInactive
      : filter.value.active == 'notActive'
        ? expenseType.isInactive
        : { ...filteredExpenseTypes.value };
  });

  // filter expense types by overdraft
  filteredExpenseTypes.value = _filter(filteredExpenseTypes.value, (expenseType) => {
    return filter.value.overdraft == 'overdraft'
      ? expenseType.odFlag
      : filter.value.overdraft == 'noOverdraft'
        ? !expenseType.odFlag
        : { ...filteredExpenseTypes.value };
  });

  // filter expense types by recurring
  filteredExpenseTypes.value = _filter(filteredExpenseTypes.value, (expenseType) => {
    return filter.value.recurring == 'recurring'
      ? expenseType.recurringFlag
      : filter.value.recurring == 'notRecurring'
        ? !expenseType.recurringFlag
        : { ...filteredExpenseTypes.value };
  });
} // filterExpenseTypes

/**
 * Check who the expense type is accessible by. Returns a list of access types.
 *
 * @param expenseType - expesne type to check
 * @return String - accessible by description
 */
function getAccess(expenseType) {
  let accessList = _filter(expenseType.accessibleBy, (accessType) => {
    return accessType == 'FullTime' || accessType == 'PartTime' || accessType == 'Intern' || accessType == 'Custom';
  });
  return accessList.join(', ');
} // getAccess

/**
 * Gets the campfire name and url for a given url.
 *
 * @param url - basecamp url String
 * @return Object - basecamp name and url data
 */
function getCampfire(url) {
  return _find(campfires.value, (campfire) => {
    return campfire.url == url;
  });
} // getCampfire

/**
 * Get the list of employees who have access to a expense type accessible by value.
 *
 * @param accessibleBy - expense type accessible by value
 * @return Array - list of employees with access
 */
function getEmployeeList(accessibleBy) {
  let employeesList = [];
  if (accessibleBy.includes('FullTime')) {
    // accessible by all employees
    employeesList = employeesList.concat(
      _filter(employees.value, (employee) => {
        return employee.workStatus == 100 && employee.employeeRole != 'intern';
      })
    );
  }
  if (accessibleBy.includes('PartTime')) {
    // accessible by full time employees only
    employeesList = employeesList.concat(
      _filter(employees.value, (employee) => {
        return employee.workStatus < 100 && employee.workStatus > 0 && employee.employeeRole != 'intern';
      })
    );
  }
  if (accessibleBy.includes('Intern')) {
    // accessible by full time employees only
    employeesList = employeesList.concat(
      _filter(employees.value, (employee) => {
        return employee.workStatus > 0 && employee.employeeRole == 'intern';
      })
    );
  }
  if (accessibleBy.includes('Custom')) {
    // custom access list
    employeesList = employeesList.concat(
      _filter(employees.value, (employee) => {
        return accessibleBy.includes(employee.id);
      })
    );
  }
  employeesList = [...new Set(employeesList)];
  showAccessLength.value = employeesList.length;
  return _sortBy(employeesList, [
    (employee) => employee.firstName.toLowerCase(),
    (employee) => employee.lastName.toLowerCase()
  ]); // sort by first name then last name
} // getEmployeeList

/**
 * Get the employee name of an employee id.
 *
 * @param employeeId - employee id
 * @return String - employee full name
 */
function getEmployeeName(employeeId) {
  let localEmployee = _find(employees.value, ['id', employeeId]);
  return `${localEmployee.firstName} ${localEmployee.lastName}`;
} // getEmployeeName

/**
 * Load all data required to load the page initially.
 */
async function loadExpenseTypesData() {
  initialPageLoading.value = true;
  userInfo.value = store.getters.user;
  [campfires.value] = await Promise.all([
    userRoleIsAdmin() ? api.getBasecampCampfires() : '',
    userRoleIsAdmin() && !store.getters.tags ? updateStoreTags() : _find && _map,
    userRoleIsAdmin() && !store.getters.employees ? updateStoreEmployees() : _find && _map,
    userRoleIsAdmin() && !store.getters.avatars ? updateStoreAvatars() : _find && _map,
    refreshExpenseTypes(),
    updateStoreCampfires()
  ]);
  expenseTypes.value = store.getters.expenseTypes;
  filterExpenseTypes();
  if (userRoleIsAdmin()) {
    employees.value = store.getters.employees;
    // set employee avatar
    let avatars = store.getters.basecampAvatars;
    _map(employees.value, (employee) => {
      let avatar = _find(avatars, ['email_address', employee.email]);
      let avatarUrl = avatar ? avatar.avatar_url : null;
      employee.avatar = avatarUrl;
      return employee;
    });
  }
  initialPageLoading.value = false;
} // loadExpenseTypesData

/**
 * limits the length of the text
 *
 * @param val - the string to be shortened
 * @return string - the shortened string
 */
function limitedText(val) {
  // limits text displayed to 50 characters on table view
  return val.length > 50 ? `${val.substring(0, 50)}...` : val;
} // limitedText

/**
 * Store the attributes of a selected expense type.
 *
 * @param item - expense type selected
 */
function onSelect(item) {
  model.value = _cloneDeep(item);
} // onSelect

/**
 * Refresh expense type data and filters expense types.
 */
async function refreshExpenseTypes() {
  loading.value = true; // set loading status to true
  let budgetsWithExpenses;
  [budgetsWithExpenses] = await Promise.all([
    !userRoleIsAdmin() ? api.getEmployeeBudgets(userInfo.value.id) : '',
    !userRoleIsAdmin() && !store.getters.budgets ? updateStoreBudgets() : '',
    !store.getters.expenseTypes ? updateStoreExpenseTypes() : ''
  ]);
  expenseTypes.value = store.getters.expenseTypes;

  // filter expense types for the user
  if (!userRoleIsAdmin()) {
    // create an array for the user expense types
    let expenseTypesFiltered = [];
    // get the active budgets for the employee
    let activeBudgets = store.getters.budgets;
    // map the active budgets
    let activeExpTypes = _map(activeBudgets, (budget) => {
      return budget.expenseTypeId;
    });
    // map the budgets with expenses
    let budExpTypes = _map(budgetsWithExpenses, (budget) => {
      return budget.expenseTypeId;
    });
    // combine the two types of expenses
    expenseTypesFiltered = _union(activeExpTypes, budExpTypes);
    // get rid of duplicates
    expenseTypesFiltered = _uniq(expenseTypesFiltered);
    // set expenseTypes.value to only have those the user should see (expenseTypesFiltered)
    expenseTypes.value = _filter(expenseTypes.value, (expenseType) => {
      return expenseTypesFiltered.includes(expenseType.id);
    });
  }

  filterExpenseTypes();
  loading.value = false; // set loading status to false
} // refreshExpenseTypes

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
 * Refresh and updates expense type list and displays a successful update status in the snackbar.
 */
async function updateModelInTable() {
  await updateStoreExpenseTypes();
  await refreshExpenseTypes();

  useDisplaySuccess('Item was successfully updated!');
} // updateModelInTable

/**
 * Validates if an expense type can be deleted. Returns true if the expense type has no expenses, otherwise returns
 * false.
 *
 * @param item - expense type to validate
 */
async function validateDelete(item) {
  midAction.value = true;
  deleteType.value = item.budgetName;
  try {
    let expenses = await api.getAllExpenseTypeExpenses(item.id);
    if (expenses.length <= 0) {
      deleteModel.value['id'] = item.id;
      deleting.value = true;
    } else {
      // tells DeleteErrorModal to appear
      invalidDelete.value = true;
    }
  } catch (err) {
    useDisplayError(err);
  }
} // validateDelete

/**
 * Gets tag object given id
 * @param id id of tag to find
 */
function getTagByID(id) {
  return store.getters.tags.find((t) => t.id === id);
} // getTagByID

/**
 * Opens the modal to disable/enable budgets for people
 *
 * @param item budget item to manage
 */
function openDisableModal(item) {
  showDisableModal.value = true;
  disableModalItem.value = item;
} // openDisableModal

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for filter.active, filter.recurring, filter.overdraft
 */
watch(
  () => [filter.value.active, filter.value.recurring, filter.value.overdraft],
  () => {
    filterExpenseTypes();
  }
); // watchFilterExpenseTypes

/**
 * Watcher for storeIsPopulated
 */
watch(storeIsPopulated, async (newValue) => {
  if (newValue) {
    await loadExpenseTypesData();
  }
});
</script>

<style scoped>
a {
  color: black !important;
  text-decoration: none;
}

a:hover {
  color: blue !important;
  text-decoration: none;
}

.case-red {
  color: #bc3825;
}
</style>
