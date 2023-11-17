<template>
  <div>
    <v-row v-if="initialPageLoading">
      <v-col cols="12" lg="8">
        <div class="mt-3">
          <v-skeleton-loader type="table-heading, list-item@6"></v-skeleton-loader>
        </div>
      </v-col>
      <v-col cols="12" lg="4">
        <v-skeleton-loader class="mt-3" type="list-item@12"></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row v-else>
      <!-- Status Alert -->
      <v-snackbar
        v-model="status.statusType"
        :color="status.color"
        :multi-line="true"
        location="top right"
        :timeout="5000"
        :vertical="true"
      >
        <v-card-title headline color="white">
          <span class="text-h5">{{ status.statusMessage }}</span>
        </v-card-title>
        <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
      </v-snackbar>

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

                <v-col cols="2"></v-col>

                <!-- Employee Filter -->
                <v-col align="end" cols="4">
                  <v-autocomplete
                    v-if="userRoleIsAdmin() || userRoleIsManager()"
                    variant="underlined"
                    hide-details
                    :items="employees"
                    :customFilter="customFilter"
                    v-model.trim="employee"
                    item-title="text"
                    id="employeeIdFilter"
                    class="mr-3"
                    label="Filter by Employee"
                    clearable
                  ></v-autocomplete
                ></v-col>

                <!-- Search Bar -->
                <v-col align="end" cols="4">
                  <v-text-field
                    variant="underlined"
                    v-model="search"
                    append-inner-icon="mdi-magnify"
                    id="search"
                    label="Search"
                    single-line
                    hide-details
                  ></v-text-field>
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
                <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="6">
                  <!-- Employee Filter -->
                  <v-autocomplete
                    hide-details
                    :items="employees"
                    :customFilter="customFilter"
                    v-model.trim="employee"
                    item-title="text"
                    id="employeeIdFilter"
                    label="Filter by Employee"
                    variant="underlined"
                    clearable
                  ></v-autocomplete>
                </v-col>
                <v-col cols="6">
                  <!-- Search Bar -->
                  <v-text-field
                    v-model="search"
                    append-inner-icon="mdi-magnify"
                    id="search"
                    label="Search"
                    variant="underlined"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>

            <!-- Filters -->
            <fieldset class="filter_border">
              <legend class="legend_style">Filters</legend>

              <!-- Active Filter -->
              <div v-if="userRoleIsAdmin() || userRoleIsManager()" class="flagFilter">
                <h4>Active Expense Type:</h4>
                <v-btn-toggle class="filter_color" v-model="filter.active" text mandatory>
                  <!-- Show Active -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="active" v-bind="props" variant="text">
                        <v-icon class="mr-1">mdi-check-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Show Active</span>
                  </v-tooltip>

                  <!-- Show Inactive -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="notActive" v-bind="props" variant="text">
                        <v-icon>mdi-close-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Show Inactive</span>
                  </v-tooltip>

                  <!-- Show Active and Inactive -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="both" v-bind="props" variant="text"> BOTH </v-btn>
                    </template>
                    <span>Show All</span>
                  </v-tooltip>
                </v-btn-toggle>
              </div>
              <!-- End Active Filter -->

              <!-- Reimbursed Filter -->
              <div class="flagFilter">
                <h4>Reimbursed:</h4>
                <v-btn-toggle class="filter_color" v-model="filter.reimbursed" text mandatory>
                  <!-- Show Reimbursed -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="reimbursed" v-bind="props" variant="text">
                        <v-icon id="showReimbursed" class="mr-1">mdi-check-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Show Reimbursed</span>
                  </v-tooltip>

                  <!-- Show Pending -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="notReimbursed" v-bind="props" variant="text">
                        <v-icon id="showPending">mdi-close-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Show Pending</span>
                  </v-tooltip>

                  <!-- Show Reimbursed and Pending -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn id="bothReimbursed" value="both" v-bind="props" variant="text"> BOTH </v-btn>
                    </template>
                    <span>Show All</span>
                  </v-tooltip>
                </v-btn-toggle>
              </div>
              <!-- End Reimbursed Filter -->
              <div class="flagFilter"></div>
            </fieldset>
            <br />
            <!-- End Filters -->

            <!-- My Expenses Data Table-->
            <v-data-table
              :headers="roleHeaders"
              :items="filteredExpenses"
              :sort-by.sync="toSort"
              :expanded="expanded"
              :loading="loading || initialPageLoading"
              :items-per-page="15"
              :search="search"
              item-value="id"
              class="elevation-4 smaller-font"
              @click:row="clickedRow"
              density="compact"
              :no-data-text="`Your search for ${search} found no results.`"
            >
              <!-- Cost slot -->
              <template v-slot:[`item.cost`]="{ item }">
                <td>{{ convertToMoneyString(item.cost) }}</td>
              </template>
              <!-- Purchase date slot -->
              <template v-slot:[`item.purchaseDate`]="{ item }">
                <td>{{ monthDayYearFormat(item.purchaseDate) }}</td>
              </template>
              <!-- Reimburse date Slot -->
              <template v-slot:[`item.reimbursedDate`]="{ item }">
                <td>{{ monthDayYearFormat(item.reimbursedDate) }}</td>
              </template>
              <!-- Creation date slot -->
              <template v-slot:[`item.createdAt`]="{ item }">
                <td>{{ monthDayYearFormat(item.createdAt) }}</td>
              </template>
              <!-- Employee name slot-->
              <template v-slot:[`item.employeeName`]="{ item }">
                <td v-if="userRoleIsAdmin() || userRoleIsManager()">{{ item.employeeName }}</td>
              </template>
              <!-- Budget Name Slot -->
              <template v-slot:[`item.budgetName`]="{ item }">
                <td>{{ item.budgetName }}</td>
              </template>

              <!--Action Items-->
              <template v-slot:[`item.actions`]="{ item }">
                <td class="datatable_btn layout mr-0" @click="clickedRow(item)">
                  <!-- Download Attachment Button -->
                  <attachment :midAction="midAction" :expense="item" :mode="'expenses'"></attachment>

                  <!-- Edit Button -->
                  <v-btn
                    :disabled="
                      isEditing ||
                      (!(userRoleIsAdmin() || userRoleIsManager()) && isReimbursed(item)) ||
                      midAction ||
                      (!(userRoleIsAdmin() || userRoleIsManager()) && !canDelete(item))
                    "
                    variant="text"
                    icon
                    id="edit"
                    @click="
                      toTopOfForm();
                      onSelect(item);
                    "
                    size="small"
                  >
                    <v-icon size="x-large" class="case-gray" icon="mdi-pencil" />
                    <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                  </v-btn>
                  <!-- Delete Button -->
                  <v-btn
                    :disabled="
                      isReimbursed(item) ||
                      isEditing ||
                      midAction ||
                      (!(userRoleIsAdmin() || userRoleIsManager()) && !canDelete(item))
                    "
                    variant="text"
                    icon
                    id="delete"
                    @click="
                      deleting = true;
                      midAction = true;
                      propExpense = item;
                    "
                    size="small"
                  >
                    <v-icon size="x-large" class="case-gray" icon="mdi-delete" />
                    <v-tooltip activator="parent" location="top">Delete</v-tooltip>
                  </v-btn>
                  <!-- Unreimburse Button -->
                  <v-btn
                    v-if="userRoleIsAdmin() || userRoleIsManager()"
                    :disabled="!isReimbursed(item) || isEditing || midAction"
                    variant="text"
                    icon
                    id="unreimburse"
                    @click="
                      unreimbursing = !unreimbursing;
                      midAction = true;
                      propExpense = item;
                    "
                    size="small"
                  >
                    <v-icon size="x-large" class="case-gray" icon="mdi-currency-usd-off" />
                    <v-tooltip activator="parent" location="top">Unreimburse</v-tooltip>
                  </v-btn>
                </td>
              </template>

              <!-- Expanded slot in datatable -->
              <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length" class="pa-0">
                  <v-card text>
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
                        <p v-if="!isEmpty(item.receipt)"><b>Receipt: </b>{{ item.receipt }}</p>
                        <p v-if="!isEmpty(item.url)">
                          <b>Url: </b> <a v-if="item.url" :href="item.url" target="_blank">{{ item.url }}</a>
                        </p>
                        <p v-if="!isEmpty(item.category)"><b>Category: </b>{{ item.category }}</p>
                        <div v-if="userRoleIsAdmin() || userRoleIsManager()" class="flagExp">
                          <p>Inactive:</p>
                          <v-icon v-if="useInactiveStyle(item)" id="marks" class="mr-1 mx-3"
                            >mdi-check-circle-outline</v-icon
                          >
                          <v-icon v-else class="mr-1 mx-3" id="marks">mdi-close-circle-outline</v-icon>
                          <br />
                          <p>Show On Feed:</p>
                          <v-icon v-if="item.showOnFeed" id="marks" class="mr-1 mx-3">mdi-check-circle-outline</v-icon>
                          <v-icon v-else class="mr-1 mx-3" id="marks">mdi-close-circle-outline</v-icon>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </td>
              </template>
              <!-- End expanded slot in datatable -->

              <!-- Alert for no search results 
              <v-alert slot="no-results" :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results.
              </v-alert>-->
              <!-- End alert for no search results -->
            </v-data-table>
            <br />

            <!-- Download expense csv button -->
            <v-card-actions>
              <convert-expenses-to-csv
                v-if="userRoleIsAdmin() || userRoleIsManager()"
                :midAction="midAction"
                :expenses="filteredExpenses"
              ></convert-expenses-to-csv>
            </v-card-actions>

            <!-- Confirmation Modals -->
            <unreimburse-modal :toggleUnreimburseModal="unreimbursing"></unreimburse-modal>
            <delete-modal :toggleDeleteModal="deleting" :type="'expense'"></delete-modal>
            <!-- End Confirmation Modals -->
          </v-container>
        </v-card>
      </v-col>

      <!-- Expense Form -->
      <v-col v-if="userRoleIsAdmin() || userRoleIsManager() || !userIsInactive" cols="12" lg="4">
        <expense-form
          v-if="!initialPageLoading"
          ref="form"
          :isEdit="isEditing"
          :expense="expense"
          v-on:add="addModelToTable"
          v-on:delete="deleteModelFromTable"
          v-on:startAction="startAction"
          v-on:update="updateModelInTable"
          v-on:error="displayError"
        ></expense-form>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import Attachment from '@/components/utils/Attachment.vue';
import ConvertExpensesToCsv from '@/components/expenses/ConvertExpensesToCsv.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import employeeUtils from '@/shared/employeeUtils';
import ExpenseForm from '@/components/expenses/ExpenseForm.vue';
import UnreimburseModal from '@/components/modals/UnreimburseModal.vue';
import _ from 'lodash';
import {
  isEmpty,
  monthDayYearFormat,
  convertToMoneyString,
  isMobile,
  userRoleIsAdmin,
  userRoleIsManager
} from '@/utils/utils';
import { updateStoreBudgets, updateStoreExpenseTypes, updateStoreEmployees } from '@/utils/storeUtils';

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
function roleHeaders() {
  return userRoleIsAdmin() || userRoleIsManager()
    ? this.headers
    : (function getUserHeaders(headers) {
        let localHeaders = _.cloneDeep(headers); // create a local copy of all headers
        localHeaders.splice(1, 1); // remove the employee header
        return localHeaders; // return the remaining headers
      })(this.headers);
} // roleHeaders

/**
 * Computed property for storeIsPopulated.
 */
function storeIsPopulated() {
  return this.$store.getters.storeIsPopulated;
} // storeIsPopulated

/**
 * Checks if the user is inactive. Returns true if the user is
 * inactive, otherwise returns false.
 *
 * @return boolean - whether or not the user is inactive
 */
function userIsInactive() {
  if (this.userInfo == null) {
    return false;
  }
  return this.userInfo.workStatus == 0;
} // userIsInactive

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
} // moneyFilter

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Refresh and updates expense list and displays a successful
 * create status in the snackbar.
 */
async function addModelToTable() {
  await this.refreshExpenses();

  this.status['statusType'] = 'SUCCESS';
  this.status['statusMessage'] = 'Item was successfully submitted!';
  this.status['color'] = 'green';
} // addModelToTable

/**
 * Clear the selected expense by setting all values to null and
 * if user sets employeeId and employeeName.
 */
function clearExpense() {
  this.expense['description'] = null;
  this.expense = _.mapValues(this.expense, () => {
    return null;
  });
  if (this.asUser) {
    // creating or updating an expense as a user
    this.expense['employeeId'] = this.userInfo.id;
    this.expense['employeeName'] = this.userInfo.id;
  } else {
    this.expense['employeeId'] = null;
    this.expense['employeeName'] = null;
  }
} // clearExpense

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.status['statusType'] = undefined;
  this.status['statusMessage'] = '';
  this.status['color'] = '';
} // clearStatus

/**
 * Add expense to expanded row when clicked.
 *
 * @param value - expense to add
 */
function clickedRow(value) {
  if (_.isEmpty(this.expanded) || this.expanded[0].id != value.id) {
    // expand the selected expense if the selected expense is not already expanded
    this.expanded = [];
    this.expanded.push(value);
  } else {
    // collapse the expense if the selected expense is already expanded
    this.expanded = [];
  }
} // clickedRow

/**
 * Sets a mapping of employee name to employee id of an expense for
 * the autocomplete options.
 *
 * @param aggregatedData - aggregated expenses
 */
function constructAutoComplete(aggregatedData) {
  let seenEmployees = new Set(); // used to not add duplicates
  this.employees = _.sortBy(
    _.map(aggregatedData, (data) => {
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
 * Custom filter for employee autocomplete options.
 *
 * @param _ - unused
 * @param queryText - text used for filtering
 * @param item - employee
 * @return string - filtered employee name
 */
function customFilter(_, queryText, item) {
  item = item.raw;

  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase());
  const queryFirstName = firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase());

  if (queryNickName >= 0) return queryNickName;
  if (queryFirstName >= 0) return item.nickname ? true : queryFirstName;
  return false;
} // customFilter

/**
 * Delete a selected expense.
 */
async function deleteExpense() {
  this.loading = true; // set loading status to true
  if (this.propExpense.id) {
    // expense is selected
    let deletedExpense = this.propExpense;
    let deleted = await api.deleteItem(api.EXPENSES, this.propExpense.id);
    if (deleted.id) {
      // successfully deletes expense
      await this.deleteModelFromTable(deletedExpense);
      if (!this.isEmpty(deletedExpense.receipt)) {
        // delete attachment from s3 if deleted expense has a receipt
        let deletedAttachment = await api.deleteAttachment(deleted);
        if (deletedAttachment.code) {
          // emit alert if error deleting file
          this.displayError(`Error Deleting Receipt: ${deletedAttachment.message}`);
        }
      }
    } else {
      // fails to delete expense
      this.displayError('Error Deleting Expense');
    }
    // update budgets in store
    await this.updateStoreBudgets();

    this.midAction = false;
  }
  this.loading = false; // set loading status to false
} // deleteExpense

/**
 * Refresh and updates expense list and displays a successful
 * delete status in the snackbar.
 */
async function deleteModelFromTable() {
  await this.refreshExpenses();

  this.status['statusType'] = 'SUCCESS';
  this.status['statusMessage'] = 'Item was successfully deleted!';
  this.status['color'] = 'green';
} // deleteModelFromTable

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err - String error message
 */
function displayError(err) {
  this.status['statusType'] = 'ERROR';
  this.status['statusMessage'] = err;
  this.status['color'] = 'red';
} // displayError

/**
 * Filters expenses based on filter selections.
 */
function filterExpenses() {
  this.filteredExpenses = this.expenses;

  if (this.employee) {
    // filter expenses by employee
    this.filteredExpenses = _.filter(this.filteredExpenses, (expense) => {
      return expense.employeeId === this.employee;
    });
  }

  if (this.filter.reimbursed !== 'both') {
    // filter expenses by reimburse date
    this.filteredExpenses = _.filter(this.filteredExpenses, (expense) => {
      if (this.filter.reimbursed == 'notReimbursed') {
        // filter for pending expenses
        return !this.isReimbursed(expense);
      } else {
        // filter for reimbursed expenses
        return this.isReimbursed(expense);
      }
    });
  }

  if (this.filter.active !== 'both') {
    // filter expenses by active or inactive expense types (available to admin only)
    this.filteredExpenses = _.filter(this.filteredExpenses, (expense) => {
      let expenseType = _.find(this.expenseTypes, (type) => expense.expenseTypeId === type.value);
      if (this.filter.active == 'active') {
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
  let employee = _.find(this.$store.getters.employees, ['id', eId]);
  return employeeUtils.nicknameAndLastName(employee);
} // getEmployee

/**
 * Checks if expense type has recipient.
 *
 * @param expense - the expense object
 * @return boolean - whether the expense has a recipient
 */
function hasRecipient(expense) {
  let expenseType = _.find(this.expenseTypes, (type) => expense.expenseTypeId === type.value);
  return !this.isEmpty(expenseType.hasRecipient) && expenseType.hasRecipient;
} // hasRecipient

/**
 * Checks if the expense is reimbursed. Returns true if the
 * expense is reimbursed, otherwise returns false.
 *
 * @param expense - expense to check
 * @return boolean - expense is reimbursed
 */
function isReimbursed(expense) {
  return expense && !this.isEmpty(expense.reimbursedDate);
} // isReimbursed

async function loadMyExpensesData() {
  this.initialPageLoading = true;
  this.loading = true;
  // get user info, defaulting to params if exists
  this.userInfo = JSON.parse(localStorage.getItem('requestedFilter')) || this.$store.getters.user; // TODO parse localstorage into string and then parse from string
  await Promise.all([
    !this.$store.getters.expenseTypes ? this.updateStoreExpenseTypes() : '',
    !this.$store.getters.employees ? this.updateStoreEmployees() : '',
    !this.$store.getters.budgets ? this.updateStoreBudgets() : '',
    this.refreshExpenses()
  ]);

  // get expense types
  let expenseTypes = this.$store.getters.expenseTypes;
  this.expenseTypes = _.map(expenseTypes, (expenseType) => {
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
      requiredFlag: expenseType.requiredFlag,
      recurringFlag: expenseType.recurringFlag,
      isInactive: expenseType.isInactive,
      categories: expenseType.categories,
      accessibleBy: expenseType.accessibleBy,
      hasRecipient: expenseType.hasRecipient,
      alwaysOnFeed: expenseType.alwaysOnFeed
    };
  });
  this.loading = false;
  this.initialPageLoading = false;
}

/**
 * Checks the canDelete optional boolean and if it exists and is true returns true
 *
 * @param expense - expense to check
 * @return boolean - disables the delete and edit button if false
 */
function canDelete(expense) {
  if (expense.canDelete !== undefined && expense.canDelete !== null && !expense.canDelete) {
    //canDelete is present and equals false
    return false;
  } else {
    return true;
  }
} // canDelete

/**
 * Store the attributes of a selected expense.
 *
 * @param item - expense selected
 */
function onSelect(item) {
  this.clearExpense();
  this.expense = _.mergeWith(this.expense, item, (expenseValue, itemValue) => {
    return _.isNil(itemValue) ? expenseValue : itemValue;
  });
  this.isEditing = true;
  this.expense.edit = true;
  this.expense['cost'] = moneyFilter(item.cost);
} // onSelect

/**
 * Refresh expense data and filters expenses.
 */
async function refreshExpenses() {
  this.loading = true; // set loading status to true
  // load expenses if employee role is user or admin
  this.expenses = await api.getAllAggregateExpenses();
  this.constructAutoComplete(this.expenses); // set autocomplete options

  this.filterExpenses(); // filter expenses

  this.loading = false; // set loading status to false
} // refreshExpenses

/**
 * set midAction to true
 */
function startAction() {
  this.midAction = true;
} // startAction

/**
 * Scrolls window back to the top of the form.
 */
function toTopOfForm() {
  window.scrollTo(0, this.$refs.form.$el.offsetTop - 70);
} // toTopOfForm

/**
 * Unreimburse an expense.
 */
async function unreimburseExpense() {
  this.loading = true; // set loading status to true

  this.propExpense.reimbursedDate = null; // clear reimburse date field
  let updatedExpense = await api.updateItem(api.EXPENSES, this.propExpense);

  if (updatedExpense.id) {
    // successfully unreimburses expense
    this.status['statusType'] = 'SUCCESS';
    this.status['statusMessage'] = 'Item was successfully unreimbursed!';
    this.status['color'] = 'green';
  } else {
    // fails to unreimburse expense
    this.displayError('Error Unreimburseing Expense');
  }

  await this.refreshExpenses();
  this.loading = false; // set loading status to false
  this.midAction = false;
} // unreimburseExpense

/**
 * Refresh and updates expense list and displays a successful
 * update status in the snackbar.
 */
async function updateModelInTable() {
  await this.refreshExpenses();

  this.status['statusType'] = 'SUCCESS';
  this.status['statusMessage'] = 'Item was successfully updated!';
  this.status['color'] = 'green';
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
    let expenseType = _.find(this.expenseTypes, (type) => expense.expenseTypeId === type.value);
    return expenseType && expenseType.isInactive;
  }

  return false;
} // useInactiveStyle

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Gets and sets user info, expense types, and expenses. Creates event listeners.
 */
async function created() {
  //no longer editing an expense (clear model and enable buttons)
  this.emitter.on('finished-editing-expense', () => {
    this.clearExpense();
    this.isEditing = false;
  });

  this.emitter.on('endAction', () => {
    this.midAction = false;
  });

  //when expense type is being edited buttons should be disabled
  this.emitter.on('editing-expense', () => {
    this.isEditing = true;
  });

  this.emitter.on('canceled-unreimburse-expense', () => {
    this.midAction = false;
  });
  this.emitter.on('confirm-unreimburse-expense', async () => {
    await this.unreimburseExpense();
  });

  this.emitter.on('canceled-delete-expense', () => {
    this.midAction = false;
    this.deleting = false;
  });
  this.emitter.on('confirm-delete-expense', async () => {
    this.deleting = false;
    await this.deleteExpense();
  });

  if (this.$store.getters.storeIsPopulated) {
    this.loadMyExpensesData();
  }

  // if coming from budgets chart scroll to top and fill in filter data
  if (JSON.parse(localStorage.getItem('requestedFilter'))) {
    window.scrollTo(0, 0);
    let storedInfo = JSON.parse(localStorage.getItem('requestedFilter'));
    [this.search, this.filter.reimbursed, this.employee] = [
      storedInfo.defaultSearch,
      storedInfo.defaultFilterReimbursed,
      storedInfo.defaultEmployee
    ];
    localStorage.removeItem('requestedFilter');
  }
} // created

/**
 * destroy listeners
 */
function beforeDestroy() {
  this.emitter.off('canceled-delete-expense');
  this.emitter.off('confirm-delete-expense');
  this.emitter.off('finished-editing-expense');
  this.emitter.off('editing-expense');
  this.emitter.off('confirm-unreimburse-expense');
  this.emitter.off('canceled-unreimburse-expense');
} // beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for employee, filter.active, filter.reimbursed - filters expenses
 */
function watchFilterExpenses() {
  this.filterExpenses();
} // watchFilterExpenses

/**
 * Checks if the store is populated from initial page load.
 *
 * @returns boolean - True if the store is populated
 */
async function watchStorePopulated() {
  if (this.$store.getters.storeIsPopulated) {
    this.loadMyExpensesData();
  }
} // watchStorePopulated

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy,
  components: {
    Attachment,
    ConvertExpensesToCsv,
    DeleteModal,
    ExpenseForm,
    UnreimburseModal
  },
  computed: {
    roleHeaders,
    userIsInactive,
    storeIsPopulated
  },
  created,
  data() {
    return {
      deleting: false, // activate delete model
      expanded: [], // datatable expanded
      expenses: [], // all expenses
      employees: [], // employee autocomplete options
      employee: null, // employee autocomplete filter
      expense: {
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
        showOnFeed: null,
        employeeName: null,
        budgetName: null,
        recipient: null
      }, // selected expense
      expenseTypes: [], // expense types
      filter: {
        active: 'both',
        reimbursed: 'notReimbursed' //default only shows expenses that are not reimbursed
      }, // datatable filters
      filteredExpenses: [], // filtered expenses
      headers: [
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
          sortable: false
        }
      ], // datatable headers
      isEditing: false, //whether or not an expense is being edited
      loading: true, // loading status
      initialPageLoading: true, // loading the page on startup
      midAction: false,
      propExpense: {
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
        receipt: null,
        recipient: null,
        url: null,
        showOnFeed: null
      }, // expense to edit
      search: null, // query text for datatable search field
      toSort: [{ key: 'createdAt', order: 'desc' }], // default sort datatable items
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }, // snackbar action status
      unreimbursing: false, // activate unreimburse model when value changes
      userInfo: null // user information
    };
  },
  methods: {
    addModelToTable,
    canDelete,
    clearExpense,
    clearStatus,
    clickedRow,
    constructAutoComplete,
    convertToMoneyString,
    customFilter,
    deleteExpense,
    deleteModelFromTable,
    displayError,
    filterExpenses,
    getEmployee,
    hasRecipient,
    isEmpty,
    userRoleIsAdmin,
    userRoleIsManager,
    isMobile,
    isReimbursed,
    loadMyExpensesData,
    monthDayYearFormat,
    onSelect,
    refreshExpenses,
    startAction,
    toTopOfForm,
    unreimburseExpense,
    updateModelInTable,
    updateStoreEmployees,
    updateStoreBudgets,
    updateStoreExpenseTypes,
    useInactiveStyle
  },
  watch: {
    employee: watchFilterExpenses,
    'filter.active': watchFilterExpenses,
    'filter.reimbursed': watchFilterExpenses,
    storeIsPopulated: watchStorePopulated
  }
};
</script>

<style>
.datatable_btn .v-btn {
  margin: 6px -2px;
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

.v-data-table-header__content {
  font-size: 13px;
  font-weight: bold;
}
</style>
