/* eslint-disable prettier/prettier */
<template>
  <v-row>
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
      <v-btn color="white" text @click="clearStatus">Close</v-btn>
    </v-snackbar>

    <v-col cols="12" :lg="userIsAdmin() ? 8 : 12">
      <v-card class="mt-3">
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
                    <v-btn value="both" v-on="on" text>BOTH</v-btn>
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
                    <v-btn value="both" v-on="on" text>BOTH</v-btn>
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
                    <v-btn value="both" v-on="on" text>BOTH</v-btn>
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
                    <v-btn value="both" v-on="on" text>BOTH</v-btn>
                  </template>
                  <span>Show All</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>
            <!-- End Receipt Fitler -->
          </fieldset>
          <br />
          <!-- End Filters -->

          <!--EXPENSE TYPE DATA TABLE -->
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
            @click:row="clickedRow"
          >
            <!-- Budget Name slot -->
            <template v-slot:[`item.budgetName`]="{ item }">
              <td>{{ item.budgetName | limitedText }}</td>
            </template>
            <!-- Budget slot -->
            <template v-slot:[`item.budget`]="{ item }">
              <p style="margin-bottom: 0px">{{ item.budget | moneyValue }}</p>
            </template>
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    :disabled="isEditing() || midAction"
                    text
                    icon
                    @click="
                      toTopOfForm();
                      onSelect(item);
                    "
                    v-on="on"
                  >
                    <v-icon style="color: #606060">edit</v-icon>
                  </v-btn>
                </template>
                <span>Edit</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn :disabled="isEditing() || midAction" text icon @click="validateDelete(item)" v-on="on">
                    <v-icon style="color: #606060">delete</v-icon>
                  </v-btn>
                </template>
                <slot>Delete</slot>
              </v-tooltip>
            </template>

            <!-- Expanded slot item -->
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" class="pa-0">
                <v-card text>
                  <v-card-text>
                    <div class="expandedInfo">
                      <!-- Description -->
                      <p v-if="item.description">
                        <b>Description:</b>
                        {{ item.description }}
                      </p>

                      <!-- Category -->
                      <p v-if="item.categories && item.categories.length > 0">
                        <b>Categories:</b>
                        {{ categoriesToString(item.categories) }}
                      </p>

                      <!-- Show on Feed -->
                      <div v-if="item.alwaysOnFeed">
                        <p><b>Show On Feed:</b> All Expenses</p>
                      </div>
                      <div v-else>
                        <p><b>Show On Feed:</b> {{ categoriesOnFeed(item.categories) }}</p>
                      </div>

                      <!-- Show Require URL -->
                      <div v-if="item.requireURL">
                        <p><b>Require URL:</b> All Expenses</p>
                      </div>
                      <div v-else>
                        <p><b>Require URL:</b> {{ categoriesReqUrl(item.categories) }}</p>
                      </div>

                      <!-- Requires Recipient -->
                      <p v-if="item.hasRecipient"><b>Requires Recipient:</b> Yes</p>
                      <p v-else><b>Requires Recipient:</b> No</p>

                      <!-- Flags -->
                      <v-row>
                        <v-col cols="12" sm="6" class="flag py-0">
                          <p>Overdraft Allowed:</p>
                          <icon v-if="item.odFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                          <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                        </v-col>
                        <v-col cols="12" sm="6" class="flag py-0">
                          <p>Recurring:</p>
                          <icon v-if="item.recurringFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                          <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                        </v-col>
                        <v-col cols="12" sm="6" class="flag py-0">
                          <p>Receipt Required:</p>
                          <icon v-if="item.requiredFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                          <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                        </v-col>
                        <v-col cols="12" sm="6" class="flag py-0">
                          <p>Inactive:</p>
                          <icon v-if="item.isInactive" id="marks" class="mr-1" name="regular/check-circle"></icon>
                          <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                        </v-col>
                      </v-row>
                      <!-- End Flags -->

                      <!-- Accessible By -->
                      <v-row v-if="userIsAdmin()">
                        <!-- Display number of employees accessed by -->
                        <div class="pt-2 px-3">
                          <p v-if="getAccess(item)">
                            <b>Access:</b>
                            {{ getAccess(item) }}
                          </p>
                          <p v-else-if="item.accessibleBy.length == 1"><b>Access:</b> 1 Employee</p>
                          <p v-else>
                            <b>Access:</b>
                            {{ item.accessibleBy.length }} Employees
                          </p>
                        </div>
                        <!-- Button to view names of employees with access -->
                        <v-dialog v-model="showAccess" max-width="400px" scrollable>
                          <template v-slot:activator="{ on }">
                            <v-btn class="px-1 mt-2" x-small outlined v-on="on">view</v-btn>
                          </template>
                          <v-card color="#bc3825">
                            <!-- Dialog Title -->
                            <v-card-title>
                              <span class="headline" style="color: white">Accessible By</span>
                            </v-card-title>
                            <v-divider color="black"></v-divider>
                            <!-- List of employee names/ISSUES -->
                            <v-card-text class="pb-0" style="max-height: 300px; background-color: #f0f0f0">
                              <v-row>
                                <v-list color="#f0f0f0" width="376">
                                  <template v-for="employee in getEmployeeList(item.accessibleBy)">
                                    <v-list-item :key="employee.id">
                                      <!-- Employee Image -->
                                      <v-list-item-avatar>
                                        <img
                                          v-if="employee.avatar"
                                          :src="employee.avatar"
                                          @error="changeAvatar(employee)"
                                        />
                                        <icon class="user-circle" name="user-circle" v-else></icon>
                                      </v-list-item-avatar>

                                      <!-- Employee Name -->
                                      <v-list-item-content>
                                        <v-list-item-title>{{ getEmployeeName(employee.id) }}</v-list-item-title>
                                      </v-list-item-content>
                                    </v-list-item>
                                    <!-- <v-divider v-if="index != showAccessLength - 1" :key="index" inset></v-divider> -->
                                  </template>
                                  <!-- <div v-if="showAccessLength == 0" class="noEmployees">No Employees</div> -->
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

                      <!-- Basecamp Campfire -->
                      <p v-if="getCampfire(item.campfire)">
                        <b>Basecamp Campfire:</b>
                        <a :href="getCampfire(item.campfire).url" target="blank">
                          {{ getCampfire(item.campfire).name }}
                        </a>
                      </p>
                      <!-- End Basecamp Campfire -->
                    </div>
                  </v-card-text>
                </v-card>
              </td>
            </template>

            <!-- Alert slot for no search results -->
            <template v-slot:no-results>
              <v-alert :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results
              </v-alert>
            </template>
            <!-- End alert for no search results -->
          </v-data-table>
          <!-- END EXPENSE TYPE Datatable -->

          <!-- Confirmation Modals -->
          <delete-modal
            :toggleDeleteModal="deleting"
            :deleteInfo="'(' + deleteType + ')'"
            :type="'expense-type'"
          ></delete-modal>
          <delete-error-modal :toggleDeleteErrorModal="invalidDelete" type="expense type"></delete-error-modal>
          <!-- End Confirmation Modals -->
        </v-container>
      </v-card>
    </v-col>

    <!-- Expense Type Form -->
    <v-col v-if="userIsAdmin()" cols="12" lg="4">
      <expense-type-form
        ref="form"
        :model="model"
        v-on:add="addModelToTable"
        v-on:startAction="startAction"
        v-on:endAction="endAction"
        v-on:update="updateModelInTable"
        v-on:error="displayError"
      ></expense-type-form>
    </v-col>
  </v-row>
</template>

<script>
import api from '@/shared/api.js';
import DeleteErrorModal from '@/components/modals/DeleteErrorModal.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import ExpenseTypeForm from '@/components/ExpenseTypeForm.vue';
import { getRole } from '@/utils/auth';
import _ from 'lodash';
import { moneyValue } from '@/utils/utils';

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
 * Returns a string of category names.
 */
function categoriesToString(categories) {
  let string = '';
  for (let i = 0; i < categories.length; i++) {
    string += categories[i].name;
    if (i < categories.length - 1) {
      string += ', ';
    }
  }
  return string;
} // categoriesToString

/**
 * Returns a string of category names that are on the feed.
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
 * Changes the employee avatar to default if it fails to display original.
 *
 * @param item - employee to check
 */
function changeAvatar(item) {
  let index = _.findIndex(this.employees, (employee) => {
    return employee.id === item.id;
  });

  let newItem = this.employees[index];

  newItem.avatar = null;

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
  this.$set(this.model, 'hasRecipient', false);
  this.$set(this.model, 'alwaysOnFeed', false);
  this.$set(this.model, 'campfire', null);
  this.$set(this.model, 'requireURL', false);
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
  let et = await api.deleteItem(api.EXPENSE_TYPES, this.deleteModel.id);
  if (et.id) {
    // successfully deletes expense type
    this.deleteModelFromTable();
  } else {
    // fails to delete expense type
    this.displayError(et.response.data.message);
  }
  this.midAction = false;
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
 * Sets inAction boolean to false.
 */
function endAction() {
  this.midAction = false;
}

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
    return 'Full - 100% of budget';
  } else if (expenseType.accessibleBy == 'FULL TIME') {
    return 'Full Time Employees';
  } else {
    return false;
  }
} // getAccess

/**
 * Gets the campfire name and url for a given url.
 *
 * @param url - basecamp url String
 * @return Object - basecamp name and url data
 */
function getCampfire(url) {
  return _.find(this.campfires, (campfire) => {
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
 * Returns a number with two decimal point precision as a string.
 *
 * @param value - number to filter
 * @return String - number with two decimal points
 */
function twoDecimals(value) {
  return `${new Intl.NumberFormat('en-US', {
    style: 'decimal',
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}`;
} // twoDecimals

/**
 * Store the attributes of a selected expense type.
 *
 * @param item - expense type selected
 */
function onSelect(item) {
  this.$set(this.model, 'id', item.id);
  this.$set(this.model, 'budget', twoDecimals(item.budget));
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
  this.$set(this.model, 'hasRecipient', item.hasRecipient);
  this.$set(this.model, 'alwaysOnFeed', item.alwaysOnFeed);
  this.$set(this.model, 'campfire', item.campfire);
  this.$set(this.model, 'requireURL', item.requireURL);
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
    this.expenseTypes = _.filter(this.expenseTypes, (expenseType) => {
      return expenseTypesFiltered.includes(expenseType.id);
    });
  }

  this.filterExpenseTypes();

  this.loading = false; // set loading status to false
} // refreshExpenseTypes

/**
 * set midAction to true
 */
function startAction() {
  this.midAction = true;
}

/**
 * Scrolls window back to the top of the form.
 */
function toTopOfForm() {
  this.$vuetify.goTo(this.$refs.form.$el.offsetTop + 100);
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
  this.midAction = true;
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
    this.deleting = !this.deleting;
  } else {
    this.invalidDelete = !this.invalidDelete;
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
  window.EventBus.$on('canceled-delete-expense-type', () => {
    this.midAction = false;
  });
  window.EventBus.$on('confirm-delete-expense-type', this.deleteExpenseType);
  window.EventBus.$on('invalid-expense type-delete', () => {
    this.midAction = false;
  });

  this.userInfo = await api.getUser();
  this.employees = await api.getItems(api.EMPLOYEES);

  this.refreshExpenseTypes();

  // set employee avatar
  let avatars = await api.getBasecampAvatars();
  _.map(this.employees, (employee) => {
    let avatar = _.find(avatars, ['email_address', employee.email]);
    let avatarUrl = avatar ? avatar.avatar_url : null;
    employee.avatar = avatarUrl;
    return employee;
  });

  this.campfires = await api.getBasecampCampfires();
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
      campfires: [], // basecamp campfires
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
      midAction: false,
      itemsPerPage: -1, // items per datatable page
      loading: false, // loading status
      model: {
        accessibleBy: [],
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
        recurringFlag: false,
        requiredFlag: true,
        requireURL: false,
        startDate: null
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
    limitedText: (val) => {
      // limits text displayed to 50 characters on table view
      return val.length > 50 ? `${val.substring(0, 50)}...` : val;
    },
    moneyValue
  },
  methods: {
    addModelToTable,
    categoriesToString,
    categoriesOnFeed,
    categoriesReqUrl,
    changeAvatar,
    clearModel, // NOTE: Unused?
    clearStatus,
    clickedRow,
    deleteExpenseType,
    deleteModelFromTable,
    displayError,
    endAction,
    filterExpenseTypes,
    getAccess,
    getCampfire,
    getEmployeeList,
    getEmployeeName,
    hasAccess,
    isEditing,
    isFocus,
    isInactive,
    onSelect,
    refreshExpenseTypes,
    startAction,
    toTopOfForm,
    twoDecimals,
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

<style scoped>
.noEmployees {
  text-align: center;
  font-size: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
}

a {
  color: black !important;
  text-decoration: none;
}

a:hover {
  color: blue !important;
  text-decoration: none;
}
</style>
