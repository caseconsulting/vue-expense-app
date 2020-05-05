<template>
  <v-layout row wrap>
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
          <v-card-title>
            <h2>Expense Types</h2>
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
          </v-card-title>
          <!-- start filters -->
          <fieldset>
            <legend class="legend_style">Filters</legend>
            <!-- active filter -->
            <div class="flagFilter">
              <h4>Active Expense Type:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.active" text mandatory>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="active" v-on="on" text>
                      <icon class="mr-1" name="regular/check-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Show Active</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="notActive" v-on="on" text>
                      <icon name="regular/times-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Hide Active</span>
                </v-tooltip>
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
            <!-- end active filter -->
            <!-- overdraft fitler -->
            <div class="flagFilter">
              <h4>Overdraft:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.overdraft" text mandatory>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="overdraft" v-on="on" text>
                      <icon class="mr-1" name="regular/check-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Show Overdraft</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="noOverdraft" v-on="on" text>
                      <icon name="regular/times-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Hide Overdraft</span>
                </v-tooltip>
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
            <!-- end overdraft filter -->
            <!-- recurring filter -->
            <div class="flagFilter">
              <h4>Recurring:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.recurring" text mandatory>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="recurring" v-on="on" text>
                      <icon class="mr-1" name="regular/check-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Show Recurring</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="notRecurring" v-on="on" text>
                      <icon name="regular/times-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Hide Recurring</span>
                </v-tooltip>
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
            <!-- end recurring filter -->
            <!-- receipt fitler -->
            <div class="flagFilter">
              <h4>Receipt Required:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.receipt" text mandatory>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="receipt" v-on="on" text>
                      <icon class="mr-1" name="regular/check-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Show Required Receipt</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="noReceipt" v-on="on" text>
                      <icon name="regular/times-circle"></icon>
                    </v-btn>
                  </template>
                  <span>Hide Required Receipt</span>
                </v-tooltip>
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
            <!-- end receipt filter-->
          </fieldset>
          <br />
          <!-- end filters -->
          <!-- expense type datatable-->
          <v-data-table
            :headers="headers"
            :items="expenseTypeList"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :expanded.sync="expanded"
            :loading="loading"
            :items-per-page="25"
            :search="search"
            item-key="id"
            class="elevation-4"
          >
            <!-- rows in datatable -->
            <template v-slot:item="{ item }">
              <tr :class="{ selectFocus: isFocus(item) }" @click="clickedRow(item)">
                <td>{{ item.budgetName | limitedText }}</td>
                <td>{{ item.budget | moneyValue }}</td>
                <td>{{ item.startDate }}</td>
                <td>{{ item.endDate }}</td>
                <!-- action icons -->
                <td v-if="userIsAdmin()" class="datatable_btn layout" @click="clickedRow(item)">
                  <!-- edit button -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        :disabled="isEditing()"
                        text
                        icon
                        @click="
                          toForm();
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
                  <!-- end edit button -->
                  <!-- delete button -->
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
                  <!-- end delete button -->
                </td>
                <!-- end action icons -->
              </tr>
            </template>
            <!-- end rows in datatable -->
            <!-- expanded slot in datatable -->
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" class="pa-0">
                <v-card text>
                  <v-card-text>
                    <div class="expandedInfo">
                      <!-- description -->
                      <p v-if="item.description"><b>Description: </b>{{ item.description }}</p>
                      <!-- end description -->
                      <!-- categories -->
                      <p v-if="item.categories && item.categories.length > 0">
                        <b>Categories: </b>{{ item.categories.join(', ') }}
                      </p>
                      <!-- end categories -->
                      <!-- flags -->
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
                      <!-- end flags -->
                      <!-- accessible by -->
                      <v-row v-if="userIsAdmin()">
                        <!-- display number of employees accessed by -->
                        <div class="pt-2 px-3">
                          <p v-if="getAccess(item)"><b>Access:</b> {{ getAccess(item) }}</p>
                          <p v-else-if="item.accessibleBy.length == 1"><b>Access:</b> 1 Employee</p>
                          <p v-else><b>Access:</b> {{ item.accessibleBy.length }} Employees</p>
                        </div>
                        <!-- button to view names of employees with acces -->
                        <v-dialog v-model="showAccess" max-width="400px" scrollable>
                          <template v-slot:activator="{ on }">
                            <v-btn class="px-1 mt-2" x-small outlined v-on="on">view</v-btn>
                          </template>
                          <v-card color="#bc3825">
                            <!-- dialog title -->
                            <v-card-title>
                              <span class="headline" style="color: white;">Accessible By</span>
                            </v-card-title>
                            <v-divider color="black"></v-divider>
                            <!-- list of employee names -->
                            <v-card-text class="pb-0" style="max-height: 300px; background-color: #f0f0f0;">
                              <v-row>
                                <v-list color="#f0f0f0" width="376">
                                  <template v-for="(employee, index) in getEmployeeList(item.accessibleBy)">
                                    <v-list-item :key="employee.id">
                                      <!-- employee image -->
                                      <v-list-item-avatar>
                                        <img :src="employee.avatar" @error="changeAvatar(employee)" />
                                      </v-list-item-avatar>
                                      <!-- employee name -->
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
                            <!-- close dialog button -->
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn dark text @click="showAccess = false">Close</v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </v-row>
                      <!-- end accessible by -->
                    </div>
                  </v-card-text>
                </v-card>
              </td>
            </template>
            <!-- end expanded slot in datatable -->
            <!-- alert for no search results -->
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
              Your search for "{{ search }}" found no results.
            </v-alert>
            <!-- end alert for no search results -->
          </v-data-table>
          <!-- end expense type datatable -->
          <delete-modal :activate="deleting" :type="'expense-type'"></delete-modal>
          <delete-error-modal :activate="invalidDelete" type="expense type"></delete-error-modal>
        </v-container>
      </v-card>
    </v-flex>
    <!-- expense type form -->
    <v-flex v-if="userIsAdmin()" xl4 lg4 md12 sm12>
      <expense-type-form
        ref="form"
        :model="model"
        v-on:add="addModelToTable"
        v-on:update="updateModelInTable"
        v-on:error="displayError"
      ></expense-type-form>
    </v-flex>
    <!-- end expense type form -->
  </v-layout>
</template>

<script>
import _ from 'lodash';
import { getRole } from '@/utils/auth';
import api from '@/shared/api.js';
import ExpenseTypeForm from '../components/ExpenseTypeForm.vue';
import DeleteModal from '../components/DeleteModal.vue';
import DeleteErrorModal from '../components/DeleteErrorModal.vue';
let caseLogo = require('../assets/img/logo-big.png');

/* filters */

function moneyFilter(value) {
  return `${new Intl.NumberFormat('en-US', {
    style: 'decimal',
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}`;
}

/* methods */
function addModelToTable(newExpenseType) {
  let matchingExpenses = _.filter(this.expenseTypes, (expenseType) => expenseType.id === newExpenseType.id);

  if (!matchingExpenses.length) {
    if (newExpenseType.isInactive) {
      this.expenseTypes.push(newExpenseType);
    } else {
      this.filteredExpenseTypes.push(newExpenseType);
      this.expenseTypes.push(newExpenseType);
    }
    // this.expenseTypes.push(newExpenseType);
    this.$set(this.status, 'statusType', 'SUCCESS');
    this.$set(this.status, 'statusMessage', 'Item was successfully submitted!');
    this.$set(this.status, 'color', 'green');
  }
}

/*
 * Changes the employee avatar upon error displaying
 */
function changeAvatar(item) {
  let index = _.findIndex(this.employees, (employee) => {
    return employee.id === item.id;
  });

  let newItem = this.employees[index];

  newItem.avatar = this.caseLogo;

  this.employees.splice(index, 1, newItem);
}

/*
 * Add expense type to expanded row when clicked
 */
function clickedRow(value) {
  if (_.isEmpty(this.expanded) || this.expanded[0].id != value.id) {
    this.expanded = [];
    this.expanded.push(value);
  } else {
    this.expanded = [];
  }
}

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
}

function clearStatus() {
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
}

async function deleteExpenseType() {
  this.deleting = false;
  let et = await api.deleteItem(api.EXPENSE_TYPES, this.deleteModel.id);
  if (et.id) {
    this.deleteModelFromTable();
  } else {
    this.displayError(et.response.data.message);
  }
}

function deleteModelFromTable() {
  let modelIndex = _.findIndex(this.expenseTypes, (expense) => expense.id === this.deleteModel.id);
  this.expenseTypes.splice(modelIndex, 1);
  modelIndex = _.findIndex(this.filteredExpenseTypes, (expense) => expense.id === this.deleteModel.id);
  this.filteredExpenseTypes.splice(modelIndex, 1);
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully deleted!');
  this.$set(this.status, 'color', 'green');
}

async function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
}

function filterExpense() {
  this.filteredExpenseTypes = this.expenseTypes;
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, (expenseType) => {
    return this.filter.active == 'active'
      ? !expenseType.isInactive
      : this.filter.active == 'notActive'
      ? expenseType.isInactive
      : this.filteredExpenseTypes;
  });
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, (expenseType) => {
    return this.filter.overdraft == 'overdraft'
      ? expenseType.odFlag
      : this.filter.overdraft == 'noOverdraft'
      ? !expenseType.odFlag
      : this.filteredExpenseTypes;
  });
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, (expenseType) => {
    return this.filter.recurring == 'recurring'
      ? expenseType.recurringFlag
      : this.filter.recurring == 'notRecurring'
      ? !expenseType.recurringFlag
      : this.filteredExpenseTypes;
  });
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, (expenseType) => {
    return this.filter.receipt == 'receipt'
      ? expenseType.requiredFlag
      : this.filter.receipt == 'noReceipt'
      ? !expenseType.requiredFlag
      : this.filteredExpenseTypes;
  });
}

function getAccess(expenseType) {
  if (expenseType.accessibleBy == 'ALL') {
    return 'All Employees';
  } else if (expenseType.accessibleBy == 'FULL TIME') {
    return 'Full Time Employees';
  } else if (expenseType.accessibleBy == 'PART TIME') {
    return 'Part Time Employees';
  } else {
    return false;
  }
}

function getEmployeeName(employeeId) {
  let localEmployee = _.find(this.employees, ['id', employeeId]);
  return `${localEmployee.firstName} ${localEmployee.lastName}`;
}

function getEmployeeList(accessibleBy) {
  let employeesList;

  if (accessibleBy === 'ALL') {
    employeesList = this.employees;
  } else if (accessibleBy === 'FULL TIME') {
    employeesList = _.filter(this.employees, (employee) => {
      return employee.workStatus == 100;
    });
  } else if (accessibleBy === 'PART TIME') {
    employeesList = _.filter(this.employees, (employee) => {
      return employee.workStatus < 100 && employee.workStatus > 0;
    });
  } else {
    employeesList = _.filter(this.employees, (employee) => {
      return accessibleBy.includes(employee.id);
    });
  }
  this.showAccessLength = employeesList.length;
  return _.sortBy(employeesList, [
    (employee) => employee.firstName.toLowerCase(),
    (employee) => employee.lastName.toLowerCase()
  ]);
}

function isEditing() {
  return !!this.model.id;
}

function isFocus(item) {
  return (!_.isEmpty(this.expanded) && item.id == this.expanded[0].id) || this.model.id == item.id;
}

function isInactive(expenseType) {
  return !expenseType.isInactive ? '' : 'Not Active';
}

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
}

async function refreshExpenseTypes() {
  this.loading = true;
  this.expenseTypes = await api.getItems(api.EXPENSE_TYPES);

  this.filterExpense();
  // this.filteredExpenseTypes = _.filter(this.expenseTypes, expenseType => {
  //   return !expenseType.isInactive;
  // });
  this.loading = false;
}

/*
 * scrolls window back to the top of the page
 */
function toForm() {
  this.$vuetify.goTo(this.$refs.form.$el.offsetTop + 50);
}

function updateModelInTable() {
  this.refreshExpenseTypes();
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully updated!');
  this.$set(this.status, 'color', 'green');
}

function userIsAdmin() {
  return getRole() === 'admin';
}

async function validateDelete(item) {
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
}

function hasAccess(employee, expenseType) {
  if (employee.workStatus == 0) {
    return false;
  } else if (expenseType.accessibleBy == 'ALL') {
    return true;
  } else if (expenseType.accessibleBy == 'FULL TIME') {
    return employee.workStatus == 100;
  } else if (expenseType.accessibleBy == 'PART TIME') {
    return employee.workStatus > 0 && employee.workStatus < 100;
  } else {
    return expenseType.accessibleBy.includes(employee.id);
  }
}

/* computed */
function expenseTypeList() {
  // TODO: filter out expense types that the user does not have access to
  // this commented out code does not (but should) include old expense types who the user no longer has access to
  // return _.filter(this.filteredExpenseTypes, type => {
  //   return this.userIsAdmin() || this.hasAccess(this.userInfo, type);
  // });
  return this.filteredExpenseTypes;
}

/* created */
async function created() {
  this.refreshExpenseTypes();

  window.EventBus.$on('canceled-delete-expense-type', () => (this.deleting = false));
  window.EventBus.$on('confirm-delete-expense-type', this.deleteExpenseType);

  window.EventBus.$on('invalid-expense type-delete', () => (this.invalidDelete = false));

  this.userInfo = await api.getUser();
  this.employees = await api.getItems(api.EMPLOYEES);

  // temporary code until employee has avatar field
  _.forEach(this.employees, (employee) => {
    if (!employee.avatar) {
      employee.avatar = 'email profile pic';
    }
  });
}

export default {
  filters: {
    moneyValue: (value) => {
      return `$` + moneyFilter(value);
    },
    limitedText: (val) => {
      //limits text to 50 characters on table view
      return val.length > 50 ? val.substring(0, 50) + '...' : val;
    }
  },
  data() {
    return {
      caseLogo: caseLogo,
      deleteModel: {
        id: ''
      },
      deleting: false, // activate delete model
      showAccess: false,
      showAccessLength: 0,
      employees: [],
      errors: [],
      expanded: [], // database expanded
      expenseTypes: [],
      filter: {
        active: 'active',
        overdraft: 'both',
        recurring: 'both',
        receipt: 'both'
      },
      filteredExpenseTypes: [],
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
      ],
      invalidDelete: false,
      loading: false,
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
        typeExpenses: '',
        accessibleBy: []
      },
      search: '', // query text for datatable search field
      sortBy: 'budgetName', // sort datatable items
      sortDesc: false, // sort datatable items
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      },
      typeExpenses: '',
      userInfo: null
    };
  },
  components: {
    DeleteErrorModal,
    DeleteModal,
    ExpenseTypeForm
  },
  computed: {
    expenseTypeList
  },
  watch: {
    'filter.active': function () {
      this.filterExpense();
    },
    'filter.receipt': function () {
      this.filterExpense();
    },
    'filter.recurring': function () {
      this.filterExpense();
    },
    'filter.overdraft': function () {
      this.filterExpense();
    }
  },
  methods: {
    addModelToTable,
    changeAvatar,
    clearModel,
    clearStatus,
    clickedRow,
    deleteExpenseType,
    deleteModelFromTable,
    displayError,
    filterExpense,
    getAccess,
    getEmployeeList,
    getEmployeeName,
    hasAccess,
    isEditing,
    isFocus,
    isInactive,
    onSelect,
    refreshExpenseTypes,
    toForm,
    updateModelInTable,
    userIsAdmin,
    validateDelete
  },
  created
};
</script>

<style>
#marks {
  width: auto;
  height: 1.5em;
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

fieldset {
  border: 1.5px solid #cccc;
}

fieldset legend {
  font-size: 16px;
  font-weight: bold;
  margin-left: 20px;
  padding: 10px;
}

.noEmployees {
  text-align: center;
  font-size: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
