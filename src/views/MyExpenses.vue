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
      <v-btn color="white" text @click="clearStatus">
        Close
      </v-btn>
    </v-snackbar>

    <v-col cols="12" lg="8">
      <v-card>
        <v-container fluid>
          <!-- Title -->
          <v-card-title>
            <h2 v-if="isUser">{{ getUserName }}'s Expenses</h2>
            <h3 v-else>My Expenses</h3>
            <v-spacer></v-spacer>

            <!-- Employee Filter -->
            <v-autocomplete
              v-if="isAdmin"
              hide-details
              :items="employees"
              :filter="customFilter"
              v-model="employee"
              item-text="text"
              label="Filter by Employee"
              clearable
            ></v-autocomplete>
            <p v-if="isAdmin">&nbsp;</p>

            <!-- Search Bar -->
            <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
          </v-card-title>

          <!-- Filters -->
          <fieldset class="filter_border">
            <legend class="legend_style">Filters</legend>

            <!-- Active Filter -->
            <div v-if="isAdmin" class="flagFilter">
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
                  <span>Show Inactive</span>
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

            <!-- Reimbursed Fitler -->
            <div class="flagFilter">
              <h4>Reimbursed:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.reimbursed" text mandatory>
                <!-- Show Reimbursed -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="reimbursed" v-on="on" text>
                      <icon class="mr-1" name="regular/check-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Show Reimbursed</span>
                </v-tooltip>

                <!-- Show Pending -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="notReimbursed" v-on="on" text>
                      <icon name="regular/times-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Show Pending</span>
                </v-tooltip>

                <!-- Show Reimbursed and Pending -->
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
            <!-- End Reimbursed Filter -->
            <div class="flagFilter"></div>
          </fieldset>
          <br />
          <!-- End Filters -->

          <!-- NEW DATA TABLE-->
          <v-data-table
            :headers="roleHeaders"
            :items="filteredExpenses"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :expanded.sync="expanded"
            :loading="loading"
            :items-per-page="15"
            :search="search"
            item-key="id"
            class="elevation-4"
            @click:row="clickedRow"
          >
            <!-- Cost slot -->
            <template v-slot:item.cost="{ item }">
              <td>{{ item.cost | moneyValue }}</td>
            </template>
            <!-- Purchase date slot -->
            <template v-slot:item.purchaseDate="{ item }">
              <td>{{ item.purchaseDate | dateFormat }}</td>
            </template>
            <!-- Reimburse date Slot -->
            <template v-slot:item.reimburseDate="{ item }">
              <td>{{ item.reimbursedDate | dateFormat }}</td>
            </template>
            <!-- Creation date slot -->
            <template v-slot:item.createdAt="{ item }">
              <td>{{ item.createdAt | dateFormat }}</td>
            </template>
            <!-- Creation date slot -->
            <template v-slot:item.createdAt="{ item }">
              <td>{{ item.createdAt | dateFormat }}</td>
            </template>
            <!-- Employee name slot-->
            <template v-slot: item.employeeName="{item}">
              <td v-if="isAdmin">{{ item.employeeName }}</td>
            </template>
            <!-- Budget Name Slot -->
            <template v-slot: item.budgetName="{item}">
              <td v-if="isAdmin">{{ item.budgetName }}</td>
            </template>
            <!--Action Items-->

            <template v-slot:item.actions="{ item }">
              <!-- Download Button-->
              <td class="datatable_btn layout" @click="clickedRow(item)">
                <!-- Download Attachment Button -->
                <attachment :midAction="midAction" :expense="item" :mode="'expenses'"></attachment>

                <!-- Edit Button -->
                <v-btn
                  :disabled="isEditing() || (isUser && isReimbursed(item)) || midAction"
                  text
                  icon
                  @click="
                    toTopOfForm();
                    onSelect(item);
                  "
                >
                  <v-icon style="color: #606060;">edit</v-icon>
                </v-btn>
                <v-btn
                  :disabled="isReimbursed(item) || isEditing() || midAction"
                  text
                  icon
                  @click="
                    deleting = true;
                    midAction = true;
                    propExpense = item;
                  "
                >
                  <v-icon style="color: #606060;">
                    delete
                  </v-icon>
                </v-btn>
                <!-- Unreimburse Button -->
                <v-btn
                  :disabled="!isReimbursed(item) || isEditing() || midAction"
                  text
                  icon
                  @click="
                    unreimbursing = true;
                    midAction = true;
                    propExpense = item;
                  "
                >
                  <v-icon style="color: #606060;">
                    money_off
                  </v-icon>
                </v-btn>
              </td></template
            >

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
                      <p v-if="!isEmpty(item.note)"><b>Notes: </b>{{ item.note }}</p>
                      <p v-if="!isEmpty(item.receipt)"><b>Receipt: </b>{{ item.receipt }}</p>
                      <p v-if="!isEmpty(item.url)">
                        <b>Url: </b> <a v-if="item.url" :href="item.url">{{ item.url }}</a>
                      </p>
                      <p v-if="!isEmpty(item.category)"><b>Category: </b>{{ item.category }}</p>
                      <div v-if="isAdmin" class="flagExp">
                        <p>Inactive:</p>
                        <icon
                          v-if="useInactiveStyle(item)"
                          id="marks"
                          class="mr-1 mx-3"
                          name="regular/check-circle"
                        ></icon>
                        <icon v-else class="mr-1 mx-3" id="marks" name="regular/times-circle"></icon>
                        <br />
                        <p>Show On Feed:</p>
                        <icon v-if="item.showOnFeed" id="marks" class="mr-1 mx-3" name="regular/check-circle"></icon>
                        <icon v-else class="mr-1 mx-3" id="marks" name="regular/times-circle"></icon>
                      </div>
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

          <!-- Expense Datatable-->
          <v-data-table
            :headers="roleHeaders"
            :items="filteredExpenses"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :expanded.sync="expanded"
            :loading="loading"
            :items-per-page="15"
            :search="search"
            item-key="id"
            class="elevation-4"
          >
            <!-- Rows in datatable -->
            <template v-slot:item="{ item }">
              <tr :class="{ selectFocus: isFocus(item) }" @click="clickedRow(item)">
                <!-- Expense Information -->
                <td>{{ item.createdAt | dateFormat }}</td>
                <td v-if="isAdmin">{{ item.employeeName }}</td>
                <td>{{ item.budgetName }}</td>
                <td>{{ item.cost | moneyValue }}</td>
                <td>{{ item.purchaseDate | dateFormat }}</td>
                <td>{{ item.reimbursedDate | dateFormat }}</td>

                <!-- Action Icons -->
                <td class="datatable_btn layout" @click="clickedRow(item)">
                  <!-- Download Attachment Button -->
                  <attachment :midAction="midAction" :expense="item" :mode="'expenses'"></attachment>

                  <!-- Edit Button -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        :disabled="isEditing() || (isUser && isReimbursed(item)) || midAction"
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
                      <v-btn
                        :disabled="isReimbursed(item) || isEditing() || midAction"
                        text
                        icon
                        @click="
                          deleting = true;
                          midAction = true;
                          propExpense = item;
                        "
                        v-on="on"
                      >
                        <v-icon style="color: #606060;">
                          delete
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>

                  <!-- Unreimburse Button -->
                  <div v-if="isAdmin">
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          :disabled="!isReimbursed(item) || isEditing() || midAction"
                          text
                          icon
                          @click="
                            unreimbursing = true;
                            midAction = true;
                            propExpense = item;
                          "
                          v-on="on"
                        >
                          <v-icon style="color: #606060;">
                            money_off
                          </v-icon>
                        </v-btn>
                      </template>
                      <span>Unreimburse</span>
                    </v-tooltip>
                  </div>
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
                      <p v-if="item.description">
                        <b>Description: </b>
                        {{ item.description }}
                      </p>
                      <p v-if="!isEmpty(item.note)"><b>Notes: </b>{{ item.note }}</p>
                      <p v-if="!isEmpty(item.receipt)"><b>Receipt: </b>{{ item.receipt }}</p>
                      <p v-if="!isEmpty(item.url)">
                        <b>Url: </b> <a v-if="item.url" :href="item.url">{{ item.url }}</a>
                      </p>
                      <p v-if="!isEmpty(item.category)"><b>Category: </b>{{ item.category }}</p>
                      <div v-if="isAdmin" class="flagExp">
                        <p>Inactive:</p>
                        <icon
                          v-if="useInactiveStyle(item)"
                          id="marks"
                          class="mr-1 mx-3"
                          name="regular/check-circle"
                        ></icon>
                        <icon v-else class="mr-1 mx-3" id="marks" name="regular/times-circle"></icon>
                        <br />
                        <p>Show On Feed:</p>
                        <icon v-if="item.showOnFeed" id="marks" class="mr-1 mx-3" name="regular/check-circle"></icon>
                        <icon v-else class="mr-1 mx-3" id="marks" name="regular/times-circle"></icon>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </td>
            </template>
            <!-- End expanded slot in datatable -->
            <!-- Alert slot for no search results -->
            <template v-slot:no-results>
              <v-alert :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results
              </v-alert>
            </template>
            <!-- End alert for no search results -->
          </v-data-table>
          <!-- End Expense Datatable -->
          <br />

          <!-- Download expense csv button -->
          <v-card-actions>
            <convert-expenses-to-csv
              v-if="isAdmin"
              :midAction="midAction"
              :expenses="filteredExpenses"
            ></convert-expenses-to-csv>
          </v-card-actions>

          <!-- Confirmation Modals -->
          <unreimburse-modal :activate="unreimbursing" :expense="propExpense"></unreimburse-modal>
          <delete-modal :activate="deleting" :type="'expense'"></delete-modal>
          <!-- End Confirmation Modals -->
        </v-container>
      </v-card>
    </v-col>

    <!-- Expense Form -->
    <v-col v-if="isAdmin || !userIsInactive" cols="12" lg="4">
      <expense-form
        ref="form"
        :isEdit="isEditing()"
        :expense="expense"
        v-on:add="addModelToTable"
        v-on:delete="deleteModelFromTable"
        v-on:startAction="startAction"
        v-on:endAction="endAction"
        v-on:update="updateModelInTable"
        v-on:error="displayError"
      ></expense-form>
    </v-col>
  </v-row>
</template>

<script>
import api from '@/shared/api.js';
import Attachment from '@/components/Attachment.vue';
import ConvertExpensesToCsv from '@/components/ConvertExpensesToCsv.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import employeeUtils from '@/shared/employeeUtils';
import ExpenseForm from '@/components/ExpenseForm.vue';
import moment from 'moment';
import UnreimburseModal from '@/components/modals/UnreimburseModal.vue';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the full name of the user.
 *
 * @return String - user's full name
 */
function getUserName() {
  return this.expenses.length === 0 ? '' : employeeUtils.fullName(this.userInfo);
} // getUserName

/**
 * Checks if the user's role is an admin. Returns true if the user's role is an admin, otherwise returns false.
 *
 * @return boolean - user's role is an admin
 */
function isAdmin() {
  return this.userInfo ? this.userInfo.employeeRole === 'admin' : false;
} // isAdmin

/**
 * Checks if the user's role is a user. Returns true if the user's role is a user, otherwise returns false.
 *
 * @return boolean - user's role is a user
 */
function isUser() {
  return this.userInfo ? this.userInfo.employeeRole === 'user' : false;
} // isUser

/**
 * Gets the datatable headers based on user's role. Returns all the headers if the user's role is an admin, otherwise
 * returns all the headers except the 'Employee' header.
 *
 * @return Array - datatable headers
 */
function roleHeaders() {
  return this.isAdmin
    ? this.headers
    : (function getUserHeaders(headers) {
        let localHeaders = _.cloneDeep(headers); // create a local copy of all headers
        localHeaders.splice(1, 1); // remove the employee header
        return localHeaders; // return the remaining headers
      })(this.headers);
} // roleHeaders

/**
 * Checks if the user is inactive. Returns true if the user is inactive, otherwise returns false.
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
 * Refresh and updates expense list and displays a successful create status in the snackbar.
 */
function addModelToTable() {
  this.refreshExpenses();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully submitted!');
  this.$set(this.status, 'color', 'green');
} // addModelToTable

/**
 * Sets all expense attribute values to null.
 */
function clearExpense() {
  this.expense = _.mapValues(this.expense, () => {
    return null;
  });
} // clearExpense

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
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
 * Sets a mapping of employee name to employee id of an expense for the autocomplete options.
 *
 * @param aggregatedData - aggregated expenses
 */
function constructAutoComplete(aggregatedData) {
  this.employees = _.sortBy(
    _.map(aggregatedData, (data) => {
      if (data && data.employeeName && data.employeeId) {
        return {
          text: data.employeeName,
          value: data.employeeId
        };
      }
    }).filter((data) => {
      return data != null;
    }),
    (employee) => employee.text.toLowerCase()
  );
} // constructAutoComplete

/**
 * Filters autocomplete options for items that have a value.
 *
 * @param item - autocomplete object
 * @param queryText - query text string
 * @return boolean - value exists
 */
function customFilter(item, queryText) {
  const hasValue = (val) => (val != null ? val : '');
  const text = hasValue(item.text);
  const query = hasValue(queryText);
  return text.toString().toLowerCase().indexOf(query.toString().toLowerCase()) > -1;
} // customFilter

/**
 * Delete a selected expense.
 */
async function deleteExpense() {
  this.deleting = false; // collapse delete confirmation model
  this.loading = true; // set loading status to true
  if (this.propExpense.id) {
    // expense is selected
    let deletedExpense = this.propExpense;
    let deleted = await api.deleteItem(api.EXPENSES, this.propExpense.id);
    if (deleted.id) {
      // successfully deletes expense
      this.deleteModelFromTable(deletedExpense);
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
    this.midAction = false;
  }
  this.loading = false; // set loading status to false
} // deleteExpense

/**
 * Refresh and updates expense list and displays a successful delete status in the snackbar.
 */
function deleteModelFromTable() {
  this.refreshExpenses();

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
 * set midAction to false
 */
function endAction() {
  this.midAction = false;
}
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
        return !isReimbursed(expense);
      } else {
        // filter for reimbursed expenses
        return isReimbursed(expense);
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
 * Checks if expense type has recipient.
 */
function hasRecipient(expense) {
  let expenseType = _.find(this.expenseTypes, (type) => expense.expenseTypeId === type.value);
  return !isEmpty(expenseType.hasRecipient) && expenseType.hasRecipient;
}

/**
 * Checks if an expense is being edited.
 *
 * @return boolean - an expense is being edited
 */
function isEditing() {
  return !!this.expense.id;
} // isEditing

/**
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0);
} // isEmpty

/**
 * Checks to see if an expense is expanded in the datatable.
 *
 * @param item - expense to check
 * @return boolean - the expense is expanded
 */
function isFocus(item) {
  return (!_.isEmpty(this.expanded) && item.id == this.expanded[0].id) || this.expense.id == item.id;
} // isFocus

/**
 * Checks if the expense is reimbursed. Returns true if the expense is reimbursed, otherwise returns false.
 *
 * @param expense - expense to check
 * @return boolean - expense is reimbursed
 */
function isReimbursed(expense) {
  return expense && !isEmpty(expense.reimbursedDate);
} // isReimbursed

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

  this.$set(this.expense, 'cost', moneyFilter(item.cost));
} // onSelect

/**
 * Refresh expense data and filters expenses.
 */
async function refreshExpenses() {
  this.loading = true; // set loading status to true

  if (this.isAdmin || this.isUser) {
    // load expenses if employee role is user or admin
    this.expenses = await api.getAllAggregateExpenses();
  }

  this.filterExpenses(); // filter expenses

  this.loading = false; // set loading status to false
} // refreshExpenses

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
  this.$vuetify.goTo(this.$refs.form.$el.offsetTop + 50);
} // toTopOfForm

/**
 * Unreimburse an expense.
 */
async function unreimburseExpense() {
  this.loading = true; // set loading status to true
  this.unreimbursing = false; // collapse unreimburse confirmation modal

  this.propExpense.reimbursedDate = null; // clear reimburse date field
  let updatedExpense = await api.updateItem(api.EXPENSES, this.propExpense);

  if (updatedExpense.id) {
    // successfully unreimburses expense
    this.$set(this.status, 'statusType', 'SUCCESS');
    this.$set(this.status, 'statusMessage', 'Item was successfully unreimbursed!');
    this.$set(this.status, 'color', 'green');
  } else {
    // fails to unreimburse expense
    this.displayError('Error Unreimburseing Expense');
  }

  this.refreshExpenses();
  this.loading = false; // set loading status to false
  this.midAction = false;
} // unreimburseExpense

/**
 * Refresh and updates expense list and displays a successful update status in the snackbar.
 */
function updateModelInTable() {
  this.refreshExpenses();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully updated!');
  this.$set(this.status, 'color', 'green');
} // updateModelInTable

/**
 * Checks if an inactive style shoud be applied for an expense. Returns true if the user is an admin and the expense
 * is inactive, otherwise returns false.
 *
 * @param expense - expense to check
 * @return boolean - user inactive styling
 */
function useInactiveStyle(expense) {
  if (this.isAdmin) {
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
  window.EventBus.$on('canceled-unreimburse-expense', () => {
    this.unreimbursing = false;
    this.midAction = false;
  });
  window.EventBus.$on('confirm-unreimburse-expense', this.unreimburseExpense);

  window.EventBus.$on('canceled-delete-expense', () => {
    this.deleting = false;
    this.midAction = false;
  });
  window.EventBus.$on('confirm-delete-expense', this.deleteExpense);

  // get user info
  this.userInfo = await api.getUser();

  // get expense types
  let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
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

  this.refreshExpenses(); // refresh and update expenses

  let aggregatedExpenses = await api.getAllAggregateExpenses(); // get aggregate expenses
  this.constructAutoComplete(aggregatedExpenses); // set autocomplete options
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    Attachment,
    ConvertExpensesToCsv,
    DeleteModal,
    ExpenseForm,
    UnreimburseModal
  },
  computed: {
    getUserName,
    isAdmin,
    isUser,
    roleHeaders,
    userIsInactive
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
          text: 'Creation Date',
          value: 'createdAt'
        },
        {
          text: 'Employee',
          value: 'employeeName'
        },
        {
          text: 'Expense Type',
          value: 'budgetName'
        },
        {
          text: 'Cost',
          value: 'cost'
        },
        {
          text: 'Purchase Date',
          value: 'purchaseDate'
        },
        {
          text: 'Reimburse Date',
          value: 'reimbursedDate'
        },
        {
          value: 'actions',
          sortable: false
        }
      ], // datatable headers
      loading: true, // loading status
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
      search: '', // query text for datatable search field
      sortBy: 'createdAt', // sort datatable items
      sortDesc: true, // sort datatable items
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }, // snackbar action status
      unreimbursing: false, // activate unreimburse model
      userInfo: null // user information
    };
  },
  filters: {
    dateFormat: (value) => {
      // formats a date by month, day, year (e.g. Aug 18th, 2020)
      if (!isEmpty(value)) {
        return moment(value, 'YYYY-MM-DD').format('MMM Do, YYYY');
      } else {
        return '';
      }
    },
    moneyValue: (value) => {
      // formats a value as US currency with cents (e.g. $100.00)
      return `$${moneyFilter(value)}`;
    }
  },
  methods: {
    addModelToTable,
    clearExpense,
    clearStatus,
    clickedRow,
    constructAutoComplete,
    customFilter,
    deleteExpense,
    deleteModelFromTable,
    displayError,
    endAction,
    filterExpenses,
    hasRecipient,
    isEditing,
    isEmpty,
    isFocus,
    isReimbursed,
    onSelect,
    refreshExpenses,
    startAction,
    toTopOfForm,
    unreimburseExpense,
    updateModelInTable,
    useInactiveStyle
  },
  watch: {
    employee: function () {
      this.filterExpenses();
    },
    'filter.active': function () {
      this.filterExpenses();
    },
    'filter.reimbursed': function () {
      this.filterExpenses();
    }
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
</style>
