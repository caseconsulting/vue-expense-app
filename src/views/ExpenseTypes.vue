<template>
  <v-layout row wrap>
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      :right="true"
      :timeout="5000"
      :top="true"
      :vertical="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" text @click="clearStatus">
        Close
      </v-btn>
    </v-snackbar>

    <v-flex :lg8="userIsAdmin()" :lg12="!userIsAdmin()" xl7 md12 sm12 offset-xl1>
      <v-card>
        <v-container fluid>
          <!-- Title -->
          <v-card-title>
            <h2>Expense Types</h2>
            <v-spacer></v-spacer>

            <!-- Search Bar -->
            <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
          </v-card-title>

          <!-- Filters -->
          <fieldset>
            <legend class="legend_style">Filters</legend>

            <!-- Active Filter -->
            <div class="flagFilter">
              <h4>Active Expense Type:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.active" text mandatory>
                <!-- Show Active -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="active" v-on="on" text>
                      <icon class="mr-1" name="regular/check-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Show Active</span>
                </v-tooltip>

                <!-- Show Inactive -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="notActive" v-on="on" text>
                      <icon name="regular/times-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Hide Active</span>
                </v-tooltip>

                <!-- Show Active and Inactive -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="both" v-on="on" text>
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
              <v-btn-toggle class="filter_color" v-model="filter.overdraft" text mandatory>
                <!-- Show Overdraft -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="overdraft" v-on="on" text>
                      <icon class="mr-1" name="regular/check-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Show Overdraft</span>
                </v-tooltip>

                <!-- Show No Overdraft -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="noOverdraft" v-on="on" text>
                      <icon name="regular/times-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Hide Overdraft</span>
                </v-tooltip>

                <!-- Show Overdraft and No Overdraft -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="both" v-on="on" text>
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
              <v-btn-toggle class="filter_color" v-model="filter.recurring" text mandatory>
                <!-- Show Recurring -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="recurring" v-on="on" text>
                      <icon class="mr-1" name="regular/check-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Show Recurring</span>
                </v-tooltip>

                <!-- Show Non-Recurring -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="notRecurring" v-on="on" text>
                      <icon name="regular/times-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Hide Recurring</span>
                </v-tooltip>

                <!-- Show Recurring and Non-Recurring -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="both" v-on="on" text>
                      BOTH
                    </v-btn>
                  </template>
                  <span>Show All</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>
            <!-- End Recurring Filter -->

            <!-- Receipt Fitler -->
            <div class="flagFilter">
              <h4>Receipt Required:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.receipt" text mandatory>
                <!-- Show Receipt Required -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="receipt" v-on="on" text>
                      <icon class="mr-1" name="regular/check-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Show Required Receipt</span>
                </v-tooltip>

                <!-- Show Receipt Not Required -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="noReceipt" v-on="on" text>
                      <icon name="regular/times-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Hide Required Receipt</span>
                </v-tooltip>

                <!-- Show Receipt Required and Not Required-->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="both" v-on="on" text>
                      BOTH
                    </v-btn>
                  </template>
                  <span>Show All</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>
            <!-- End Receipt Fitler -->
          </fieldset>
          <br />
          <!-- End Filters -->

          <!-- Expense Type Datatable-->
          <v-data-table
            :headers="headers"
            :items="expenseTypeList"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :expanded.sync="expanded"
            :loading="loading"
            :items-per-page.sync="itemsPerPage"
            :search="search"
            item-key="id"
            class="elevation-4"
          >
            <!-- Rows in datatable -->
            <template v-slot:item="{ item }">
              <tr :class="{ selectFocus: isFocus(item) }" @click="clickedRow(item)">
                <!-- Expense Type Information -->
                <td>{{ item.budgetName | limitedText }}</td>
                <td>{{ item.budget | moneyValue }}</td>
                <td>{{ item.startDate }}</td>
                <td>{{ item.endDate }}</td>

                <!-- Action Icons -->
                <td v-if="userIsAdmin()" class="datatable_btn layout" @click="clickedRow(item)">
                  <!-- Edit Button -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        :disabled="isEditing()"
                        text
                        icon
                        @click="
                          toTopOfForm();
                          onSelect(item);
                        "
                        v-on="on"
                      >
                        <v-icon style="color: #606060;">
                          edit
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Edit</span>
                  </v-tooltip>

                  <!-- Delete Button -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn :disabled="isEditing()" text icon @click="validateDelete(item)" v-on="on">
                        <v-icon style="color: #606060;">
                          delete
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>
                </td>
                <!-- End Action Icons -->
              </tr>
            </template>
            <!-- End rows in datatable -->

            <!-- Expanded slot in datatable -->
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" class="pa-0">
                <v-card text>
                  <v-card-text>
                    <div class="expandedInfo">
                      <!-- Description -->
                      <p v-if="item.description"><b>Description: </b>{{ item.description }}</p>

                      <!-- Category -->
                      <p v-if="item.categories && item.categories.length > 0">
                        <b>Categories: </b>{{ item.categories.join(', ') }}
                      </p>

                      <!-- Flags -->
                      <v-layout row>
                        <v-flex sm6 class="flag py-0">
                          <p>Overdraft Allowed:</p>
                          <icon v-if="item.odFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                          <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                        </v-flex>
                        <v-flex sm6 class="flag py-0">
                          <p>Recurring:</p>
                          <icon v-if="item.recurringFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                          <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                        </v-flex>
                        <v-flex sm6 class="flag py-0">
                          <p>Receipt Required:</p>
                          <icon v-if="item.requiredFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                          <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                        </v-flex>
                        <v-flex sm6 class="flag py-0">
                          <p>Inactive:</p>
                          <icon v-if="item.isInactive" id="marks" class="mr-1" name="regular/check-circle"></icon>
                          <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                        </v-flex>
                      </v-layout>
                      <!-- End Flags -->

                      <!-- Accessible By -->
                      <v-row v-if="userIsAdmin()">
                        <!-- Display number of employees accessed by -->
                        <div class="pt-2 px-3">
                          <p v-if="getAccess(item)"><b>Access:</b> {{ getAccess(item) }}</p>
                          <p v-else-if="item.accessibleBy.length == 1"><b>Access:</b> 1 Employee</p>
                          <p v-else><b>Access:</b> {{ item.accessibleBy.length }} Employees</p>
                        </div>
                        <!-- Button to view names of employees with access -->
                        <v-dialog v-model="showAccess" max-width="400px" scrollable>
                          <template v-slot:activator="{ on }">
                            <v-btn class="px-1 mt-2" x-small outlined v-on="on">view</v-btn>
                          </template>
                          <v-card color="#bc3825">
                            <!-- Dialog Title -->
                            <v-card-title>
                              <span class="headline" style="color: white;">Accessible By</span>
                            </v-card-title>
                            <v-divider color="black"></v-divider>

                            <!-- List of employee names -->
                            <v-card-text class="pb-0" style="max-height: 300px; background-color: #f0f0f0;">
                              <v-row>
                                <v-list color="#f0f0f0" width="376">
                                  <template v-for="(employee, index) in getEmployeeList(item.accessibleBy)">
                                    <v-list-item :key="employee.id">
                                      <!-- Employee Image -->
                                      <v-list-item-avatar>
                                        <img :src="employee.avatar" @error="changeAvatar(employee)" />
                                      </v-list-item-avatar>

                                      <!-- Employee Name -->
                                      <v-list-item-content>
                                        <v-list-item-title>
                                          {{ getEmployeeName(employee.id) }}
                                        </v-list-item-title>
                                      </v-list-item-content>
                                    </v-list-item>
                                    <v-divider v-if="index != showAccessLength - 1" :key="index" inset></v-divider>
                                  </template>
                                  <div v-if="showAccessLength == 0" class="noEmployees">
                                    No Employees
                                  </div>
                                </v-list>
                              </v-row>
                            </v-card-text>
                            <v-divider color="black"></v-divider>

                            <!-- Close dialog button -->
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn dark text @click="showAccess = false">Close</v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </v-row>
                      <!-- End Accessible By -->
                    </div>
                  </v-card-text>
                </v-card>
              </td>
            </template>
            <!-- End expanded slot in datatable -->

            <!-- Alert for no search results -->
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
              Your search for "{{ search }}" found no results.
            </v-alert>
            <!-- End alert for no search results -->
          </v-data-table>
          <!-- End Expense Type Datatable -->

          <!-- Confirmation Modals -->
          <delete-modal :activate="deleting" :deleteInfo="'(' + deleteType + ')'" :type="'expense-type'"></delete-modal>
          <delete-error-modal :activate="invalidDelete" type="expense type"></delete-error-modal>
          <!-- End Confirmation Modals -->
        </v-container>
      </v-card>
    </v-flex>

    <!-- Expense Type Form -->
    <v-flex v-if="userIsAdmin()" xl4 lg4 md12 sm12>
      <expense-type-form
        ref="form"
        :model="model"
        v-on:add="addModelToTable"
        v-on:update="updateModelInTable"
        v-on:error="displayError"
      ></expense-type-form>
    </v-flex>
  </v-layout>
</template>

<script>
import api from '@/shared/api.js';
import caseLogo from '../assets/img/logo-big.png';
import DeleteErrorModal from '../components/DeleteErrorModal.vue';
import DeleteModal from '../components/DeleteModal.vue';
import ExpenseTypeForm from '../components/ExpenseTypeForm.vue';
import { getRole } from '@/utils/auth';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

function expenseTypeList() {
  // this commented out code does not (but should) include old expense types who the user no longer has access to
  // return _.filter(this.filteredExpenseTypes, type => {
  //   return this.userIsAdmin() || this.hasAccess(this.userInfo, type);
  // });
  return this.filteredExpenseTypes;
} // expenseTypeList

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
 * Refresh and updates expense type list and displays a successful create status in the snackbar.
 */
function addModelToTable() {
  this.refreshExpenseTypes();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully submitted!');
  this.$set(this.status, 'color', 'green');
} // addModelToTable

/**
 * Changes the employee avatar to default if it fails to display original.
 *
 * @param item - employee to check
 */
function changeAvatar(item) {
  let index = _.findIndex(this.employees, (employee) => {
    return employee.id === item.id;
  });

  let newItem = this.employees[index];

  newItem.avatar = this.caseLogo;

  this.employees.splice(index, 1, newItem);
} // changeAvatar

/**
 * NOTE: Unused?
 *
 * Clear the selected expense type.
 */
function clearModel() {
  this.$set(this.model, 'id', '');
  this.$set(this.model, 'budget', 0);
  this.$set(this.model, 'budgetName', '');
  this.$set(this.model, 'description', '');
  this.$set(this.model, 'odFlag', false);
  this.$set(this.model, 'startDate', '');
  this.$set(this.model, 'endDate', '');
  this.$set(this.model, 'recurringFlag', false);
  this.$set(this.model, 'requiredFlag', false);
  this.$set(this.model, 'isInactive', false);
  this.$set(this.model, 'categories', []);
  this.$set(this.model, 'accessibleBy', 'ALL');
} // clearModel

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
} // clearStatus

/**
 * Add expense type to expanded row when clicked.
 *
 * @param value - expense type to add
 */
function clickedRow(value) {
  if (_.isEmpty(this.expanded) || this.expanded[0].id != value.id) {
    // expand the selected expense type if the selected expense type is not already expanded
    this.expanded = [];
    this.expanded.push(value);
  } else {
    // collapse the expense type if the selected expense type is already expanded
    this.expanded = [];
  }
} // clickedRow

/**
 * Delete an expense type and display status.
 */
async function deleteExpenseType() {
  this.deleting = false; // collapse delete confirmation model
  let et = await api.deleteItem(api.EXPENSE_TYPES, this.deleteModel.id);
  if (et.id) {
    // successfully deletes expense type
    this.deleteModelFromTable();
  } else {
    // fails to delete expense type
    this.displayError(et.response.data.message);
  }
} // deleteExpenseType

/**
 * Refresh and updates expense type list and displays a successful delete status in the snackbar.
 */
function deleteModelFromTable() {
  this.refreshExpenseTypes();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully deleted!');
  this.$set(this.status, 'color', 'green');
} // deleteModelFromTable

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err - String error message
 */
function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
} // displayError

/**
 * Filters expense types based on filter selections.
 */
function filterExpenseTypes() {
  this.filteredExpenseTypes = this.expenseTypes;

  // filter expense types by active or inactive
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, (expenseType) => {
    return this.filter.active == 'active'
      ? !expenseType.isInactive
      : this.filter.active == 'notActive'
      ? expenseType.isInactive
      : this.filteredExpenseTypes;
  });

  // filter expense types by overdraft
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, (expenseType) => {
    return this.filter.overdraft == 'overdraft'
      ? expenseType.odFlag
      : this.filter.overdraft == 'noOverdraft'
      ? !expenseType.odFlag
      : this.filteredExpenseTypes;
  });

  // filter expense types by recurring
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, (expenseType) => {
    return this.filter.recurring == 'recurring'
      ? expenseType.recurringFlag
      : this.filter.recurring == 'notRecurring'
      ? !expenseType.recurringFlag
      : this.filteredExpenseTypes;
  });

  // filter expense types by receipt required
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, (expenseType) => {
    return this.filter.receipt == 'receipt'
      ? expenseType.requiredFlag
      : this.filter.receipt == 'noReceipt'
      ? !expenseType.requiredFlag
      : this.filteredExpenseTypes;
  });
} // filterExpenseTypes

/**
 * Check who the expense type is accessible by. Returns a string description if the expense type is accessible by
 * 'ALL', 'FULL', or 'FULL TIME', otherwise returns false.
 *
 * @param expenseType - expesne type to check
 * @return String - accessible by description
 */
function getAccess(expenseType) {
  if (expenseType.accessibleBy == 'ALL') {
    return 'All Employees';
  } else if (expenseType.accessibleBy == 'FULL') {
    return 'All Employees (100%)';
  } else if (expenseType.accessibleBy == 'FULL TIME') {
    return 'Full Time Employees';
  } else {
    return false;
  }
} // getAccess

/**
 * Get the list of employees who have access to a expense type accessible by value.
 *
 * @param accessibleBy - expense type accessible by value
 * @return Array - list of employees with access
 */
function getEmployeeList(accessibleBy) {
  let employeesList;

  if (accessibleBy === 'ALL' || accessibleBy === 'FULL') {
    // accessible by all employees
    employeesList = this.employees;
  } else if (accessibleBy === 'FULL TIME') {
    // accessible by full time employees only
    employeesList = _.filter(this.employees, (employee) => {
      return employee.workStatus == 100;
    });
  } else {
    // custom access list
    employeesList = _.filter(this.employees, (employee) => {
      return accessibleBy.includes(employee.id);
    });
  }

  this.showAccessLength = employeesList.length;
  return _.sortBy(employeesList, [
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
  let localEmployee = _.find(this.employees, ['id', employeeId]);
  return `${localEmployee.firstName} ${localEmployee.lastName}`;
} // getEmployeeName

/**
 * Check if an employee has access to an expense type. Returns true if employee has access, otherwise returns false.
 *
 * @param employee - Employee to access
 * @param expenseType - ExpenseType to be accessed
 * @return Boolean - employee has access to expense type
 */
function hasAccess(employee, expenseType) {
  if (expenseType.accessibleBy == 'ALL' || expenseType.accessibleBy == 'FULL') {
    return true;
  } else if (expenseType.accessibleBy == 'FULL TIME') {
    return employee.workStatus == 100;
  } else {
    return expenseType.accessibleBy.includes(employee.id);
  }
} // hasAccess

/**
 * Checks if an expense is being edited.
 *
 * @return boolean - an expense is being edited
 */
function isEditing() {
  return !!this.model.id;
} // isEditing

/**
 * Checks to see if an expense type is expanded in the datatable.
 *
 * @param item - expense type to check
 * @return boolean - the expense type is expanded
 */
function isFocus(item) {
  return (!_.isEmpty(this.expanded) && item.id == this.expanded[0].id) || this.model.id == item.id;
} // isFocus

/**
 * Check if an expense type is inactive. Returns 'Not Active' if the expense type is not active, otherwise returns an
 * empty String.
 *
 * @param expenseType - expense type to check
 * @return String - expense type is inactive string
 */
function isInactive(expenseType) {
  return !expenseType.isInactive ? '' : 'Not Active';
} // isInactive

/**
 * Store the attributes of a selected expense type.
 *
 * @param item - expense type selected
 */
function onSelect(item) {
  this.$set(this.model, 'id', item.id);
  this.$set(this.model, 'budget', moneyFilter(item.budget));
  this.$set(this.model, 'budgetName', item.budgetName);
  this.$set(this.model, 'description', item.description);
  this.$set(this.model, 'odFlag', item.odFlag);
  this.$set(this.model, 'startDate', item.startDate);
  this.$set(this.model, 'endDate', item.endDate);
  this.$set(this.model, 'recurringFlag', item.recurringFlag);
  this.$set(this.model, 'requiredFlag', item.requiredFlag);
  this.$set(this.model, 'isInactive', item.isInactive);
  this.$set(this.model, 'categories', item.categories);
  this.$set(this.model, 'accessibleBy', item.accessibleBy);
} // onSelect

/**
 * Refresh expense type data and filters expense types.
 */
async function refreshExpenseTypes() {
  this.loading = true; // set loading status to true
  this.expenseTypes = await api.getItems(api.EXPENSE_TYPES);

  // filter expense types for the user
  if (!this.userIsAdmin()) {
    // create an array for the user expense types
    let expenseTypesFiltered = [];
    // get the employees budgets that have expenses
    let budgetsWithExpenses = await api.getEmployeeBudgets(this.userInfo.id);
    // get the active budgets for the employee
    let activeBudgets = await api.getAllActiveEmployeeBudgets(this.userInfo.id);
    // map the active budgets
    let activeExpTypes = _.map(activeBudgets, (budget) => {
      return budget.expenseTypeId;
    });
    // map the budgets with expenses
    let budExpTypes = _.map(budgetsWithExpenses, (budget) => {
      return budget.expenseTypeId;
    });
    // combine the two types of expenses
    expenseTypesFiltered = _.union(activeExpTypes, budExpTypes);
    // get rid of duplicates
    expenseTypesFiltered = _.uniq(expenseTypesFiltered);
    // set this.expenseTypes to only have those the user should see (expenseTypesFiltered)
    this.expenseTypes = _.filter(this.expenseTypes, expenseType => {
      return expenseTypesFiltered.includes(expenseType.id);
    });
  }

  this.filterExpenseTypes();

  this.loading = false; // set loading status to false
} // refreshExpenseTypes

/**
 * Scrolls window back to the top of the form.
 */
function toTopOfForm() {
  this.$vuetify.goTo(this.$refs.form.$el.offsetTop + 50);
} // toTopOfForm

/**
 * Refresh and updates expense type list and displays a successful update status in the snackbar.
 */
function updateModelInTable() {
  this.refreshExpenseTypes();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully updated!');
  this.$set(this.status, 'color', 'green');
} // updateModelInTable

/**
 * Checks if the user is an admin. Returns true if the role is 'admin', otherwise returns false.
 */
function userIsAdmin() {
  return getRole() === 'admin';
} // userIsAdmin

/**
 * Validates if an expense type can be deleted. Returns true if the expense type has no expenses, otherwise returns
 * false.
 *
 * @param item - expense type to validate
 */
async function validateDelete(item) {
  this.deleteType = item.budgetName;
  let x = await api
    .getAllExpenseTypeExpenses(item.id)
    .then((result) => {
      return result.length <= 0;
    })
    .catch((err) => {
      this.displayError(err);
    });
  if (x) {
    this.$set(this.deleteModel, 'id', item.id);
    this.deleting = true;
  } else {
    this.invalidDelete = true;
  }
} // validateDelete

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Set user info, employees, and expense types. Creates event listeners.
 */
async function created() {
  window.EventBus.$on('canceled-delete-expense-type', () => (this.deleting = false));
  window.EventBus.$on('confirm-delete-expense-type', this.deleteExpenseType);
  window.EventBus.$on('invalid-expense type-delete', () => (this.invalidDelete = false));

  this.userInfo = await api.getUser();
  this.employees = await api.getItems(api.EMPLOYEES);

  this.refreshExpenseTypes();

  // temporary code until employee has avatar field
  _.forEach(this.employees, (employee) => {
    if (!employee.avatar) {
      employee.avatar = 'google profile pic';
    }
  });
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    DeleteErrorModal,
    DeleteModal,
    ExpenseTypeForm
  },
  computed: {
    expenseTypeList
  },
  created,
  data() {
    return {
      caseLogo: caseLogo, // case logo for employee avatars
      deleteModel: {
        id: ''
      }, // expense type to delete
      deleting: false, // activate delete confirmation model
      showAccess: false, // activate display for access list
      showAccessLength: 0, // number of employees with access
      employees: [], // employees
      expanded: [], // datatable expanded
      expenseTypes: [], // expense types
      filter: {
        active: 'active',
        overdraft: 'both',
        recurring: 'both',
        receipt: 'both'
      }, // databale filters
      filteredExpenseTypes: [], // filtered expense types
      headers: [
        {
          text: 'Expense Type',
          value: 'budgetName'
        },
        {
          text: 'Budget',
          value: 'budget'
        },
        {
          text: 'Start Date',
          value: 'startDate'
        },
        {
          text: 'End Date',
          value: 'endDate'
        },
        {
          value: 'actions',
          sortable: false
        }
      ], // datatable headers
      invalidDelete: false, // invalid delete status
      itemsPerPage: -1, // items per datatable page
      loading: false, // loading status
      model: {
        id: '',
        budget: 0,
        budgetName: '',
        description: '',
        odFlag: false,
        startDate: null,
        endDate: null,
        recurringFlag: false,
        requiredFlag: true,
        isInactive: false,
        categories: [],
        accessibleBy: []
      }, // selected expense type
      search: '', // query text for datatable search field
      sortBy: 'budgetName', // sort datatable items
      sortDesc: false, // sort datatable items
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }, // snakcbar action status
      userInfo: null, // user information
      deleteType: '' //item.budgetName for when item is deleted
    };
  },
  filters: {
    moneyValue: (value) => {
      // formats a value as US currency with cents (e.g. $100.00)
      return `$${moneyFilter(value)}`;
    },
    limitedText: (val) => {
      // limits text displayed to 50 characters on table view
      return val.length > 50 ? `${val.substring(0, 50)}...` : val;
    }
  },
  methods: {
    addModelToTable,
    changeAvatar,
    clearModel, // NOTE: Unused?
    clearStatus,
    clickedRow,
    deleteExpenseType,
    deleteModelFromTable,
    displayError,
    filterExpenseTypes,
    getAccess,
    getEmployeeList,
    getEmployeeName,
    hasAccess,
    isEditing,
    isFocus,
    isInactive,
    onSelect,
    refreshExpenseTypes,
    toTopOfForm,
    updateModelInTable,
    userIsAdmin,
    validateDelete
  },
  watch: {
    'filter.active': function () {
      this.filterExpenseTypes();
    },
    'filter.receipt': function () {
      this.filterExpenseTypes();
    },
    'filter.recurring': function () {
      this.filterExpenseTypes();
    },
    'filter.overdraft': function () {
      this.filterExpenseTypes();
    },
    deleteInfo: function () {
      return;
    }
  }
};
</script>

<style>
fieldset {
  border: 1.5px solid #cccc;
}

fieldset legend {
  font-size: 16px;
  font-weight: bold;
  margin-left: 20px;
  padding: 10px;
}

.flag p {
  font-weight: bold;
  width: 150px;
  display: inline-block;
}

.flag svg {
  margin-top: 5px;
}

.flagFilter {
  display: inline-block;
  margin: 20px;
}

#marks {
  width: auto;
  height: 1.5em;
}

.noEmployees {
  text-align: center;
  font-size: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
