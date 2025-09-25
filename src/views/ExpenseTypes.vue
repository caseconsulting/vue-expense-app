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
              @click:row="clickedRow"
              :expanded="expanded"
              :loading="loading"
              :search="search"
              item-key="id"
              class="elevation-4"
              density="compact"
            >
              <!-- Budget Name slot -->
              <template #[`item.name`]="{ item }">
                <p class="mb-0">
                  {{ limitedText(item.name) }}
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
              <template v-slot:[`item.actions`]="{ item }">
                <div>
                  <v-btn
                    :disabled="midAction"
                    variant="text"
                    icon
                    @click.stop="expanded = [item.id]"
                    v-tooltip="'Show Condensed View'"
                  >
                    <v-icon icon="mdi-chevron-down" class="case-gray" />
                  </v-btn>
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
                <td :colspan="columns.length">
                  <v-card>
                    <v-card-text>
                      <div class="expandedInfo">
                        {{ limitedText(item.description, 110) }}
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
import _sortBy from 'lodash/sortBy';
import _cloneDeep from 'lodash/cloneDeep';
import _union from 'lodash/union';
import _uniq from 'lodash/uniq';
import { convertToMoneyString, userRoleIsAdmin } from '@/utils/utils';
import { updateStoreExpenseTypes, updateStoreBudgets } from '@/utils/storeUtils';
import { format } from '../shared/dateUtils';
import { onBeforeMount, onBeforeUnmount, ref, watch, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useDisplayError, useDisplaySuccess } from '@/components/shared/StatusSnackbar.vue';
import { ExpenseType } from '@/models/expenseType.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const router = useRouter();

// items for disable modal
const showDisableModal = ref(false);
const disableModalItem = ref(null);

const deleteModel = ref({ id: '' }); // expense type to delete
const deleting = ref(false); // activate delete confirmation model
const emitter = inject('emitter');
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
    key: 'name',
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
    title: 'Actions',
    key: 'actions',
    sortable: false,
    show: true,
    align: 'end'
  }
]); // datatable headers
const initialPageLoading = ref(true);
const invalidDelete = ref(false); // invalid delete staus
const itemsPerPage = ref(-1); // items per datatable page
const loading = ref(true); //loading status
const midAction = ref(false);
const model = ref(new ExpenseType({})); // selected expense type
const search = ref(''); // query text for datatable search field
const sortBy = ref([{ key: 'name', order: 'asc' }]); // sort datatable items
const store = useStore();
const userInfo = ref(null); // user information
const deleteType = ref(''); // item.name for when item is deleted

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
}

/**
 * Clear the selected expense type.
 */
function clearModel() {
  model.value = new ExpenseType({});
}

/**
 * Routes the user to the employees page and autofills the search fields.
 *
 * @param value - row clicked
 */
function clickedRow(_, rowItem) {
  router.push(`/expenseType/${rowItem.item.id}`);
}

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
}

/**
 * Refresh and updates expense type list and displays a successful delete status in the snackbar.
 */
async function deleteModelFromTable() {
  await updateStoreExpenseTypes();
  await refreshExpenseTypes();

  useDisplaySuccess('Item was successfully deleted!');
}

/**
 * Sets inAction boolean to false.
 */
function endAction() {
  midAction.value = false;
}

/** Display error from expense form */
function expenseFormError(msg) {
  useDisplayError(JSON.parse(msg));
}

/**
 * Filters expense types based on filter selections.
 */
function filterExpenseTypes() {
  filteredExpenseTypes.value = [...expenseTypes.value];

  // filter expense types by active or inactive
  filteredExpenseTypes.value = filteredExpenseTypes.value.filter((expenseType) => {
    return filter.value.active == 'active'
      ? expenseType.active
      : filter.value.active == 'notActive'
        ? !expenseType.active
        : { ...filteredExpenseTypes.value };
  });

  // filter expense types by overdraft
  filteredExpenseTypes.value = filteredExpenseTypes.value.filter((expenseType) => {
    return filter.value.overdraft == 'overdraft'
      ? expenseType.odFlag
      : filter.value.overdraft == 'noOverdraft'
        ? !expenseType.odFlag
        : { ...filteredExpenseTypes.value };
  });

  // filter expense types by recurring
  filteredExpenseTypes.value = filteredExpenseTypes.value.filter((expenseType) => {
    return filter.value.recurring == 'recurring'
      ? expenseType.recurringFlag
      : filter.value.recurring == 'notRecurring'
        ? !expenseType.recurringFlag
        : { ...filteredExpenseTypes.value };
  });
}

/**
 * Load all data required to load the page initially.
 */
async function loadExpenseTypesData() {
  initialPageLoading.value = true;
  userInfo.value = store.getters.user;
  await Promise.all([refreshExpenseTypes()]);
  expenseTypes.value = store.getters.expenseTypes.map((et) => new ExpenseType(et));
  filterExpenseTypes();
  initialPageLoading.value = false;
}

/**
 * limits the length of the text
 *
 * @param val - the string to be shortened
 * @return string - the shortened string
 */
function limitedText(val, characterLimit = 50) {
  // limits text displayed to 50 characters on table view
  return val.length > characterLimit ? `${val.substring(0, characterLimit)}...` : val;
}

/**
 * Store the attributes of a selected expense type.
 *
 * @param item - expense type selected
 */
function onSelect(item) {
  model.value = _cloneDeep(item);
}

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
    let activeExpTypes = activeBudgets.map((budget) => {
      return budget.expenseTypeId;
    });
    // map the budgets with expenses
    let budExpTypes = budgetsWithExpenses.map((budget) => {
      return budget.expenseTypeId;
    });
    // combine the two types of expenses
    expenseTypesFiltered = _union(activeExpTypes, budExpTypes);
    // get rid of duplicates
    expenseTypesFiltered = _uniq(expenseTypesFiltered);
    // set expenseTypes.value to only have those the user should see (expenseTypesFiltered)
    expenseTypes.value = expenseTypes.value.filter((expenseType) => {
      return expenseTypesFiltered.includes(expenseType.id);
    });
  }

  filterExpenseTypes();
  loading.value = false; // set loading status to false
}

/**
 * set midAction to true
 */
function startAction() {
  midAction.value = true;
}

/**
 * Scrolls window back to the top of the form.
 */
function toTopOfForm() {
  window.scrollTo(0, form.value.$el.offsetTop - 70);
}

/**
 * Refresh and updates expense type list and displays a successful update status in the snackbar.
 */
async function updateModelInTable() {
  await updateStoreExpenseTypes();
  await refreshExpenseTypes();

  useDisplaySuccess('Item was successfully updated!');
}

/**
 * Validates if an expense type can be deleted. Returns true if the expense type has no expenses, otherwise returns
 * false.
 *
 * @param item - expense type to validate
 */
async function validateDelete(item) {
  midAction.value = true;
  deleteType.value = item.name;
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
}
/**
 * Opens the modal to disable/enable budgets for people
 *
 * @param item budget item to manage
 */
function openDisableModal(item) {
  showDisableModal.value = true;
  disableModalItem.value = item;
}

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
</style>
