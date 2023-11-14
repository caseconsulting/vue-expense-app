<template>
  <div>
    <v-row v-if="initialPageLoading">
      <v-col cols="12" :lg="userRoleIsAdmin() ? 8 : 12">
        <div class="mt-3">
          <v-skeleton-loader type="table-heading, list-item@6"></v-skeleton-loader>
        </div>
      </v-col>
      <v-col v-if="userRoleIsAdmin()" cols="12" lg="4">
        <v-skeleton-loader class="mt-3" type="list-item@12"></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row v-else>
      <!-- Status Alert -->
      <v-snackbar
        v-model="status.statusType"
        :color="status.color"
        :multi-line="true"
        location="right"
        :timeout="5000"
        :vertical="true"
      >
        <v-card-title headline color="white">
          <span class="text-h5">{{ status.statusMessage }}</span>
        </v-card-title>
        <v-btn color="white" variant="text" @click="clearStatus">Close</v-btn>
      </v-snackbar>

      <v-col cols="12" :lg="userRoleIsAdmin() ? 8 : 12">
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
                    <span>Hide Active</span>
                  </v-tooltip>

                  <!-- Show Active and Inactive -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="both" v-bind="props" variant="text">BOTH</v-btn>
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
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="overdraft" v-bind="props" variant="text">
                        <v-icon class="mr-1">mdi-check-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Show Overdraft</span>
                  </v-tooltip>

                  <!-- Show No Overdraft -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="noOverdraft" v-bind="props" variant="text">
                        <v-icon>mdi-close-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Hide Overdraft</span>
                  </v-tooltip>

                  <!-- Show Overdraft and No Overdraft -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="both" v-bind="props" variant="text">BOTH</v-btn>
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
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="recurring" v-bind="props" variant="text">
                        <v-icon class="mr-1">mdi-check-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Show Recurring</span>
                  </v-tooltip>

                  <!-- Show Non-Recurring -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="notRecurring" v-bind="props" variant="text">
                        <v-icon>mdi-close-circle-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>Hide Recurring</span>
                  </v-tooltip>

                  <!-- Show Recurring and Non-Recurring -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="both" v-bind="props" variant="text">BOTH</v-btn>
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
              :headers="_headers"
              :items="expenseTypeList"
              :sort-by.sync="sortBy"
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
                <td>{{ limitedText(item.budgetName) }}</td>
              </template>
              <!-- Budget slot -->
              <template v-slot:[`item.budget`]="{ item }">
                <p class="mb-0">{{ convertToMoneyString(item.budget) }}</p>
              </template>
              <!-- Actions -->
              <template v-if="userRoleIsAdmin()" v-slot:[`item.actions`]="{ item }">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-if="userRoleIsAdmin()"
                      :disabled="midAction"
                      variant="text"
                      icon
                      @click="
                        toTopOfForm();
                        onSelect(item);
                      "
                      v-bind="props"
                    >
                      <v-icon class="case-gray">edit</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit</span>
                </v-tooltip>
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-if="userRoleIsAdmin()"
                      id="delete"
                      :disabled="midAction"
                      variant="text"
                      icon
                      @click="validateDelete(item)"
                      v-bind="props"
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
                            <v-icon v-if="item.proRated" id="marks" class="mr-1">mdi-check-circle-outline</v-icon>
                            <v-icon v-else class="mr-1" id="marks">mdi-close-circle-outline</v-icon>
                          </v-col>
                          <v-col cols="12" sm="6" md="3" class="flag">
                            <p>Overdraft Allowed:</p>
                            <v-icon v-if="item.odFlag" id="marks" class="mr-1">mdi-check-circle-outline</v-icon>
                            <v-icon v-else class="mr-1" id="marks">mdi-close-circle-outline</v-icon>
                          </v-col>
                          <v-col cols="12" sm="6" md="3" class="flag">
                            <p>Recurring:</p>
                            <v-icon v-if="item.recurringFlag" id="marks" class="mr-1">mdi-check-circle-outline</v-icon>
                            <v-icon v-else class="mr-1" id="marks">mdi-close-circle-outline</v-icon>
                          </v-col>
                          <v-col cols="12" sm="6" md="3" class="flag">
                            <p>Inactive:</p>
                            <v-icon v-if="item.isInactive" id="marks" class="mr-1">mdi-check-circle-outline</v-icon>
                            <v-icon v-else class="mr-1" id="marks">mdi-close-circle-outline</v-icon>
                          </v-col>
                        </v-row>
                        <!-- End Flags -->

                        <!-- Accessible By -->
                        <v-row no-gutters v-if="userRoleIsAdmin()">
                          <!-- Display number of employees accessed by -->
                          <div>
                            <p>
                              <b>Access:</b>
                              {{ getAccess(item) }}
                            </p>
                          </div>
                          <!-- Button to view names of employees with access -->
                          <v-dialog v-model="showAccess" max-width="400px" scrollable>
                            <template v-slot:activator="{ props }">
                              <v-btn class="px-1 ml-3" size="x-small" variant="outlined" v-bind="props">view</v-btn>
                            </template>
                            <v-card color="#bc3825">
                              <!-- Dialog Title -->
                              <v-card-title>
                                <span class="text-h5 text-white">Accessible By</span>
                              </v-card-title>
                              <v-divider color="black"></v-divider>
                              <!-- List of employee names/ISSUES -->
                              <v-card-text class="pb-0">
                                <v-row>
                                  <v-list color="#f0f0f0" width="376">
                                    <div v-for="employee in getEmployeeList(item.accessibleBy)" :key="employee.id">
                                      <v-list-item>
                                        <!-- Employee Image -->
                                        <v-list-item-media>
                                          <img
                                            v-if="employee.avatar"
                                            :src="employee.avatar"
                                            @error="changeAvatar(employee)"
                                          />
                                          <v-icon class="user-circle" name="user-circle" v-else></v-icon>
                                        </v-list-item-media>

                                        <!-- Employee Name -->

                                        <v-list-item-title>{{ getEmployeeName(employee.id) }}</v-list-item-title>
                                      </v-list-item>
                                    </div>
                                  </v-list>
                                </v-row>
                              </v-card-text>

                              <v-divider color="black"></v-divider>
                              <!-- Close dialog button -->
                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn theme="dark" variant="text" @click="showAccess = false">Close</v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                        </v-row>
                        <!-- End Accessible By -->

                        <!-- Tag Budgets -->
                        <v-row no-gutters v-if="userRoleIsAdmin() && item.tagBudgets && item.tagBudgets.length > 0">
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
                                  <v-chip size="small" v-for="tagID in item.tags" :key="tagID">
                                    <v-icon start>mdi-tag</v-icon>{{ getTagByID(tagID).tagName }}</v-chip
                                  >
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
      <v-col v-if="userRoleIsAdmin()" cols="12" lg="4">
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
  </div>
</template>

<script>
import api from '@/shared/api.js';
import DeleteErrorModal from '@/components/modals/DeleteErrorModal.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import ExpenseTypeForm from '@/components/expense-types/ExpenseTypeForm.vue';
import _ from 'lodash';
import { convertToMoneyString, userRoleIsAdmin } from '@/utils/utils';
import {
  updateStoreExpenseTypes,
  updateStoreEmployees,
  updateStoreAvatars,
  updateStoreBudgets,
  updateStoreCampfires,
  updateStoreTags
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
  if (this.userRoleIsAdmin()) {
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

  this.status['statusType'] = 'SUCCESS';
  this.status['statusMessage'] = 'Item was successfully submitted!';
  this.status['color'] = 'green';
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
  string = _.map(
    _.filter(categories, (cat) => {
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
  this.model['id'] = '';
  this.model['budget'] = 0;
  this.model['budgetName'] = '';
  this.model['description'] = '';
  this.model['odFlag'] = false;
  this.model['proRated'] = false;
  this.model['startDate'] = '';
  this.model['endDate'] = '';
  this.model['recurringFlag'] = false;
  this.model['requiredFlag'] = false;
  this.model['isInactive'] = false;
  this.model['categories'] = [];
  this.model['accessibleBy'] = ['FullTime'];
  this.model['hasRecipient'] = false;
  this.model['alwaysOnFeed'] = false;
  this.model['campfire'] = null;
  this.model['requireURL'] = false;
  this.model['tagBudgets'] = [];
} // clearModel

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.status['statusType'] = undefined;
  this.status['statusMessage'] = '';
  this.status['color'] = '';
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

/**
 * Load all data required to load the page initially.
 */
async function loadExpenseTypesData() {
  this.initialPageLoading = true;
  this.userInfo = this.$store.getters.user;
  [this.campfires] = await Promise.all([
    this.userRoleIsAdmin() ? api.getBasecampCampfires() : '',
    this.userRoleIsAdmin() && !this.$store.getters.tags ? this.updateStoreTags() : _,
    this.userRoleIsAdmin() && !this.$store.getters.employees ? this.updateStoreEmployees() : _,
    this.userRoleIsAdmin() && !this.$store.getters.avatars ? this.updateStoreAvatars() : _,
    this.refreshExpenseTypes(),
    this.updateStoreCampfires()
  ]);

  if (this.userRoleIsAdmin()) {
    this.employees = this.$store.getters.employees;
    // set employee avatar
    let avatars = this.$store.getters.basecampAvatars;
    _.map(this.employees, (employee) => {
      let avatar = _.find(avatars, ['email_address', employee.email]);
      let avatarUrl = avatar ? avatar.avatar_url : null;
      employee.avatar = avatarUrl;
      return employee;
    });
  }
  this.initialPageLoading = false;
} // loadExpenseTypesData

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
  this.model = _.cloneDeep(item);
} // onSelect

/**
 * Refresh expense type data and filters expense types.
 */
async function refreshExpenseTypes() {
  this.loading = true; // set loading status to true
  let budgetsWithExpenses;
  [budgetsWithExpenses] = await Promise.all([
    !this.userRoleIsAdmin() ? api.getEmployeeBudgets(this.userInfo.id) : '',
    !this.userRoleIsAdmin() && !this.$store.getters.budgets ? this.updateStoreBudgets() : '',
    !this.$store.getters.expenseTypes ? this.updateStoreExpenseTypes() : ''
  ]);
  this.expenseTypes = this.$store.getters.expenseTypes;

  // filter expense types for the user
  if (!this.userRoleIsAdmin()) {
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

  this.status['statusType'] = 'SUCCESS';
  this.status['statusMessage'] = 'Item was successfully updated!';
  this.status['color'] = 'green';
} // updateModelInTable

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
      this.deleteModel['id'] = item.id;
      this.deleting = true;
    } else {
      this.invalidDelete = true;
    }
  } catch (err) {
    this.displayError(err);
  }
} // validateDelete

/**
 * Gets tag object given id
 * @param id id of tag to find
 */
function getTagByID(id) {
  return this.$store.getters.tags.find((t) => t.id === id);
} // getTagByID

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * destroy listeners
 */
function beforeDestroy() {
  this.emitter.off('canceled-delete-expense-type');
  this.emitter.off('confirm-delete-expense-type');
  this.emitter.off('finished-editing-expense-type');
  this.emitter.off('editing-expense-type');
  this.emitter.off('invalid-expense type-delete');
} // beforeDestroy

/**
 * Set user info, employees, and expense types. Creates event listeners.
 */
async function created() {
  //no longer editing an expense (clear model and enable buttons)
  this.emitter.on('finished-editing-expense-type', () => {
    this.clearModel();
    this.endAction();
  });

  //when expense type is being edited buttons should be disabled
  this.emitter.on('editing-expense-type', () => {
    this.startAction();
  });

  this.emitter.on('canceled-delete-expense-type', () => {
    this.midAction = false;
    this.deleting = false;
  });
  this.emitter.on('confirm-delete-expense-type', async () => {
    this.deleting = false;
    await this.deleteExpenseType();
  });
  this.emitter.on('invalid-expense type-delete', () => {
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
 * watcher for filter.active, filter.recurring, filter.overdraft
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
        recurring: 'both'
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
        proRated: false,
        recurringFlag: false,
        requiredFlag: true,
        requireURL: false,
        startDate: null,
        tagBudgets: []
      }, // selected expense type
      search: '', // query text for datatable search field
      sortBy: [{ key: 'budgetName', order: 'asc' }], // sort datatable items
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }, // snakcbar action status
      tags: [],
      userInfo: null, // user information
      deleteType: '' //item.budgetName for when item is deleted
    };
  },
  methods: {
    addModelToTable,
    categoriesToString,
    categoriesOnFeed,
    categoriesReqUrl,
    categoriesReqReceipt,
    changeAvatar,
    clearModel, // NOTE: Unused?
    clearStatus,
    clickedRow,
    convertToMoneyString,
    deleteExpenseType,
    deleteModelFromTable,
    displayError,
    endAction,
    limitedText,
    filterExpenseTypes,
    getAccess,
    getCampfire,
    getEmployeeList,
    getEmployeeName,
    getTagByID,
    hasAccess,
    isInactive,
    loadExpenseTypesData,
    onSelect,
    refreshExpenseTypes,
    startAction,
    toTopOfForm,
    twoDecimals,
    updateModelInTable,
    userRoleIsAdmin,
    validateDelete,
    updateStoreAvatars,
    updateStoreBudgets,
    updateStoreEmployees,
    updateStoreExpenseTypes,
    updateStoreCampfires,
    updateStoreTags
  },
  watch: {
    'filter.active': watchFilterExpenseTypes,
    'filter.recurring': watchFilterExpenseTypes,
    'filter.overdraft': watchFilterExpenseTypes,
    storeIsPopulated: loadExpenseTypesData
  }
};
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
