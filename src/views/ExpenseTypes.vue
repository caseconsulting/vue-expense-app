/* eslint-disable prettier/prettier */
<template>
  <v-row v-if="!initialPageLoading">
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
            <v-text-field
              v-model="search"
              id="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
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
                      <v-icon class="mr-1">mdi-check-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Show Active</span>
                </v-tooltip>

                <!-- Show Inactive -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="notActive" v-on="on" text>
                      <v-icon>mdi-close-circle-outline</v-icon>
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
                      <v-icon class="mr-1">mdi-check-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Show Overdraft</span>
                </v-tooltip>

                <!-- Show No Overdraft -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="noOverdraft" v-on="on" text>
                      <v-icon>mdi-close-circle-outline</v-icon>
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
                      <v-icon class="mr-1">mdi-check-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Show Recurring</span>
                </v-tooltip>

                <!-- Show Non-Recurring -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="notRecurring" v-on="on" text>
                      <v-icon>mdi-close-circle-outline</v-icon>
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
                      <v-icon class="mr-1">mdi-check-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Show Required Receipt</span>
                </v-tooltip>

                <!-- Show Receipt Not Required -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="noReceipt" v-on="on" text>
                      <v-icon>mdi-close-circle-outline</v-icon>
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
            :headers="_headers"
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
              <p class="mb-0">{{ convertToMoneyString(item.budget) }}</p>
            </template>
            <!-- Actions -->
            <template v-if="userIsAdmin()" v-slot:[`item.actions`]="{ item }">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-if="userIsAdmin()"
                    :disabled="midAction"
                    text
                    icon
                    @click="
                      toTopOfForm();
                      onSelect(item);
                    "
                    v-on="on"
                  >
                    <v-icon class="case-gray">edit</v-icon>
                  </v-btn>
                </template>
                <span>Edit</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-if="userIsAdmin()"
                    id="delete"
                    :disabled="midAction"
                    text
                    icon
                    @click="validateDelete(item)"
                    v-on="on"
                  >
                    <v-icon class="case-gray">delete</v-icon>
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
                          <p>Pro-rated:</p>
                          <v-icon v-if="item.proRated" id="marks" class="mr-1">mdi-check-circle-outline</v-icon>
                          <v-icon v-else class="mr-1" id="marks">mdi-close-circle-outline</v-icon>
                        </v-col>
                        <v-col cols="12" sm="6" class="flag py-0">
                          <p>Overdraft Allowed:</p>
                          <v-icon v-if="item.odFlag" id="marks" class="mr-1">mdi-check-circle-outline</v-icon>
                          <v-icon v-else class="mr-1" id="marks">mdi-close-circle-outline</v-icon>
                        </v-col>
                        <v-col cols="12" sm="6" class="flag py-0">
                          <p>Recurring:</p>
                          <v-icon v-if="item.recurringFlag" id="marks" class="mr-1">mdi-check-circle-outline</v-icon>
                          <v-icon v-else class="mr-1" id="marks">mdi-close-circle-outline</v-icon>
                        </v-col>
                        <v-col cols="12" sm="6" class="flag py-0">
                          <p>Receipt Required:</p>
                          <v-icon v-if="item.requiredFlag" id="marks" class="mr-1">mdi-check-circle-outline</v-icon>
                          <v-icon v-else class="mr-1" id="marks">mdi-close-circle-outline</v-icon>
                        </v-col>
                        <v-col cols="12" sm="6" class="flag py-0">
                          <p>Inactive:</p>
                          <v-icon v-if="item.isInactive" id="marks" class="mr-1">mdi-check-circle-outline</v-icon>
                          <v-icon v-else class="mr-1" id="marks">mdi-close-circle-outline</v-icon>
                        </v-col>
                      </v-row>
                      <!-- End Flags -->

                      <!-- Accessible By -->
                      <v-row v-if="userIsAdmin()">
                        <!-- Display number of employees accessed by -->
                        <div class="pt-2 px-3">
                          <p>
                            <b>Access:</b>
                            {{ getAccess(item) }}
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
                              <span class="headline white--text">Accessible By</span>
                            </v-card-title>
                            <v-divider color="black"></v-divider>
                            <!-- List of employee names/ISSUES -->
                            <v-card-text class="pb-0">
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
                                        <v-icon class="user-circle" name="user-circle" v-else></v-icon>
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
import { convertToMoneyString } from '@/utils/utils';
import {
  updateStoreExpenseTypes,
  updateStoreEmployees,
  updateStoreAvatars,
  updateStoreBudgets
} from '@/utils/storeUtils';

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
function expenseTypeList() {
  return this.filteredExpenseTypes;
} // expenseTypeList

/**
 * Checks if the store is populated from initial page load.
 *
 * @returns boolean - True if the store is populated
 */
function storeIsPopulated() {
  return this.$store.getters.storeIsPopulated;
} // storeIsPopulated

/**
 * returns the headers to show
 *
 * @return - headers to show
 */
function _headers() {
  if (this.userIsAdmin()) {
    return this.headers;
  } else {
    return this.headers.filter((x) => x.show);
  }
} // _headers

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Refresh and updates expense type list and displays a successful create status in the snackbar.
 */
async function addModelToTable() {
  await this.updateStoreExpenseTypes();
  await this.refreshExpenseTypes();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully submitted!');
  this.$set(this.status, 'color', 'green');
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
  this.$set(this.model, 'accessibleBy', ['FullTime']);
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
    await this.deleteModelFromTable();
  } else {
    // fails to delete expense type
    this.displayError(et.response.data.message);
  }
  this.midAction = false;
} // deleteExpenseType

/**
 * Refresh and updates expense type list and displays a successful delete status in the snackbar.
 */
async function deleteModelFromTable() {
  await this.updateStoreExpenseTypes();
  await this.refreshExpenseTypes();

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
} // endAction

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
 * Check who the expense type is accessible by. Returns a list of access types.
 *
 * @param expenseType - expesne type to check
 * @return String - accessible by description
 */
function getAccess(expenseType) {
  let accessList = _.filter(expenseType.accessibleBy, (accessType) => {
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
  let employeesList = [];
  if (accessibleBy.includes('FullTime')) {
    // accessible by all employees
    employeesList = employeesList.concat(
      _.filter(this.employees, (employee) => {
        return employee.workStatus == 100 && employee.employeeRole != 'intern';
      })
    );
  }
  if (accessibleBy.includes('PartTime')) {
    // accessible by full time employees only
    employeesList = employeesList.concat(
      _.filter(this.employees, (employee) => {
        return employee.workStatus < 100 && employee.workStatus > 0 && employee.employeeRole != 'intern';
      })
    );
  }
  if (accessibleBy.includes('Intern')) {
    // accessible by full time employees only
    employeesList = employeesList.concat(
      _.filter(this.employees, (employee) => {
        return employee.workStatus > 0 && employee.employeeRole == 'intern';
      })
    );
  }
  if (accessibleBy.includes('Custom')) {
    // custom access list
    employeesList = employeesList.concat(
      _.filter(this.employees, (employee) => {
        return accessibleBy.includes(employee.id);
      })
    );
  }
  employeesList = [...new Set(employeesList)];
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
  let result = false;
  if (employee.workStatus == 0) {
    result = false;
  } else if (expenseType.accessibleBy.includes('Intern') && employee.employeeRole == 'intern') {
    result = true;
  } else if (
    expenseType.accessibleBy.includes('FullTime') &&
    employee.employeeRole != 'intern' &&
    employee.workStatus == 100
  ) {
    result = true;
  } else if (
    expenseType.accessibleBy.includes('PartTime') &&
    employee.employeeRole != 'intern' &&
    employee.workStatus < 100
  ) {
    result = true;
  } else {
    result = expenseType.accessibleBy.includes(employee.id);
  }

  return result;
} // hasAccess

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

async function loadExpenseTypesData() {
  this.initialPageLoading = true;
  this.userInfo = this.$store.getters.user;
  [this.campfires] = await Promise.all([
    api.getBasecampCampfires(),
    this.userInfo.employeeRole === 'admin' && !this.$store.getters.employees ? this.updateStoreEmployees() : '',
    this.updateStoreAvatars(),
    this.refreshExpenseTypes()
  ]);
  this.employees = this.$store.getters.employees;

  // set employee avatar
  let avatars = this.$store.getters.basecampAvatars;
  _.map(this.employees, (employee) => {
    let avatar = _.find(avatars, ['email_address', employee.email]);
    let avatarUrl = avatar ? avatar.avatar_url : null;
    employee.avatar = avatarUrl;
    return employee;
  });
  this.initialPageLoading = false;
}

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
  let budgetsWithExpenses;
  [budgetsWithExpenses] = await Promise.all([
    !this.userIsAdmin() ? api.getEmployeeBudgets(this.userInfo.id) : '',
    !this.userIsAdmin() && !this.$store.getters.budgets ? this.updateStoreBudgets() : '',
    !this.$store.getters.expenseTypes ? this.updateStoreExpenseTypes() : ''
  ]);
  this.expenseTypes = this.$store.getters.expenseTypes;

  // filter expense types for the user
  if (!this.userIsAdmin()) {
    // create an array for the user expense types
    let expenseTypesFiltered = [];
    // get the active budgets for the employee
    let activeBudgets = this.$store.getters.budgets;
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
} // startAction

/**
 * Scrolls window back to the top of the form.
 */
function toTopOfForm() {
  this.$vuetify.goTo(this.$refs.form.$el.offsetTop + 100);
} // toTopOfForm

/**
 * Refresh and updates expense type list and displays a successful update status in the snackbar.
 */
async function updateModelInTable() {
  await this.updateStoreExpenseTypes();
  await this.refreshExpenseTypes();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully updated!');
  this.$set(this.status, 'color', 'green');
} // updateModelInTable

/**
 * Checks if the user is an admin. Returns true if the role is 'admin', otherwise returns false.
 *
 * @return boolean - whether the user is an admin
 */
function userIsAdmin() {
  return this.getRole() === 'admin';
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
  try {
    let expenses = await api.getAllExpenseTypeExpenses(item.id);
    if (expenses.length <= 0) {
      this.$set(this.deleteModel, 'id', item.id);
      this.deleting = !this.deleting;
    } else {
      this.invalidDelete = !this.invalidDelete;
    }
  } catch (err) {
    this.displayError(err);
  }
} // validateDelete

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * destroy listeners
 */
function beforeDestroy() {
  window.EventBus.$off('canceled-delete-expense-type');
  window.EventBus.$off('confirm-delete-expense-type');
  window.EventBus.$off('finished-editing-expense-type');
  window.EventBus.$off('editing-expense-type');
  window.EventBus.$off('invalid-expense type-delete');
} // beforeDestroy

/**
 * Set user info, employees, and expense types. Creates event listeners.
 */
async function created() {
  //no longer editing an expense (clear model and enable buttons)
  window.EventBus.$on('finished-editing-expense-type', () => {
    this.clearModel();
    this.endAction();
  });

  //when expense type is being edited buttons should be disabled
  window.EventBus.$on('editing-expense-type', () => {
    this.startAction();
  });

  window.EventBus.$on('canceled-delete-expense-type', () => {
    this.midAction = false;
  });
  window.EventBus.$on('confirm-delete-expense-type', async () => {
    await this.deleteExpenseType();
  });
  window.EventBus.$on('invalid-expense type-delete', () => {
    this.midAction = false;
  });

  if (this.$store.getters.storeIsPopulated) {
    this.loadExpenseTypesData();
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for filter.active, filter.receipt, filter.recurring, filter.overdraft
 */
function watchFilterExpenseTypes() {
  this.filterExpenseTypes();
} // watchFilterExpenseTypes

// |--------------------------------------------------|
// |                                                  |
// |                     FILTERS                      |
// |                                                  |
// |--------------------------------------------------|

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

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy,
  components: {
    DeleteErrorModal,
    DeleteModal,
    ExpenseTypeForm
  },
  computed: {
    expenseTypeList,
    storeIsPopulated,
    _headers
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
          value: 'budgetName',
          show: true
        },
        {
          text: 'Budget',
          value: 'budget',
          show: true
        },
        {
          text: 'Start Date',
          value: 'startDate',
          show: true
        },
        {
          text: 'End Date',
          value: 'endDate',
          show: true
        },
        {
          value: 'actions',
          sortable: false,
          show: false
        }
      ], // datatable headers
      initialPageLoading: true,
      invalidDelete: false, // invalid delete status
      midAction: false,
      itemsPerPage: -1, // items per datatable page
      loading: true, // loading status
      model: {
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
    limitedText
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
    convertToMoneyString,
    deleteExpenseType,
    deleteModelFromTable,
    displayError,
    endAction,
    filterExpenseTypes,
    getAccess,
    getCampfire,
    getEmployeeList,
    getEmployeeName,
    getRole,
    hasAccess,
    isInactive,
    loadExpenseTypesData,
    onSelect,
    refreshExpenseTypes,
    startAction,
    toTopOfForm,
    twoDecimals,
    updateModelInTable,
    userIsAdmin,
    validateDelete,
    updateStoreAvatars,
    updateStoreBudgets,
    updateStoreEmployees,
    updateStoreExpenseTypes
  },
  watch: {
    'filter.active': watchFilterExpenseTypes,
    'filter.receipt': watchFilterExpenseTypes,
    'filter.recurring': watchFilterExpenseTypes,
    'filter.overdraft': watchFilterExpenseTypes,
    storeIsPopulated: loadExpenseTypesData
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
