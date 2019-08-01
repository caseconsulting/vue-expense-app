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
      :auto-height="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" flat @click="clearStatus">
        Close
      </v-btn>
    </v-snackbar>
    <v-flex lg12 md12 sm12> </v-flex>
    <v-flex lg8 md12 sm12>
      <v-card>
        <v-container fluid>
          <v-card-title>
            <h2 v-if="isUser">{{ getUserName }}'s Expenses</h2>
            <h2 v-else>Expenses</h2>
            <v-spacer></v-spacer>
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
            <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
          </v-card-title>

          <!-- start filters -->
          <fieldset class="filter_border">
            <legend class="legend_style">Filters</legend>

            <!-- active fitler -->
            <div v-if="isAdmin" class="flagFilter">
              <h4>Active Expense Type:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.active" flat mandatory>
                <v-tooltip top>
                  <v-btn value="active" slot="activator" flat>
                    <icon class="mr-1" name="regular/check-circle"></icon>
                  </v-btn>
                  <span>Show Active</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="notActive" slot="activator" flat>
                    <icon name="regular/times-circle"></icon>
                  </v-btn>
                  <span>Hide Active</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="both" slot="activator" flat>
                    BOTH
                  </v-btn>
                  <span>Show All</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>

            <!-- reimbursed fitler -->
            <div class="flagFilter">
              <h4>Reimbursed:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.reimbursed" flat mandatory>
                <v-tooltip top>
                  <v-btn value="reimbursed" slot="activator" flat>
                    <icon class="mr-1" name="regular/check-circle"></icon>
                  </v-btn>
                  <span>Show Reimbursed</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="notReimbursed" slot="activator" flat>
                    <icon name="regular/times-circle"></icon>
                  </v-btn>
                  <span>Hide Reimbursed</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="both" slot="activator" flat>
                    BOTH
                  </v-btn>
                  <span>Show All</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>
            <div class="flagFilter"></div>
          </fieldset>
          <br />
          <v-data-table
            :loading="loading"
            :headers="roleHeaders"
            :items="expenseList"
            :search="search"
            :pagination.sync="pagination"
            :expand="expand"
            item-key="id"
            class="elevation-4"
          >
            <v-progress-linear slot="progress" color="radioactive" indeterminate></v-progress-linear>
            <template slot="headers" slot-scope="props">
              <tr style="box-shadow: 0px 1.5px #888888;">
                <th
                  class="text-xs-left "
                  v-for="header in props.headers"
                  :key="header.text"
                  :class="[
                    'column sortable',
                    pagination.descending ? 'desc' : 'asc',
                    header.value === pagination.sortBy ? 'active' : ''
                  ]"
                  @click="changeSort(header.value)"
                >
                  {{ header.text }}
                  <v-icon small>arrow_upward</v-icon>
                </th>
              </tr>
            </template>

            <!-- data row -->
            <template slot="items" slot-scope="props">
              <tr v-if="!loading" @click="props.expanded = !props.expanded">
                <td class="text-xs-left">{{ props.item.createdAt | dateFormatCreated }}</td>
                <td v-if="isAdmin" class="text-xs-left">{{ props.item.employeeName }}</td>
                <td class="text-xs-left">{{ props.item.budgetName }}</td>
                <td class="text-xs-left">{{ (props.item.cost ? props.item.cost : 0) | moneyValue }}</td>
                <td class="text-xs-left">{{ props.item.purchaseDate | dateFormat }}</td>
                <td class="text-xs-left">{{ props.item.reimbursedDate | dateFormat }}</td>

                <!-- option buttons -->
                <td class="datatable_btn layout">
                  <!-- download attachment button -->
                  <v-tooltip top>
                    <attachment :expense="props.item" :mode="'expenses'" slot="activator"></attachment>
                    <span>Download Attachment</span>
                  </v-tooltip>

                  <!-- edit button -->
                  <v-tooltip top>
                    <v-btn
                      :disabled="props.item.reimbursedDate != null || isEditing()"
                      flat
                      icon
                      @click="onSelect(props.item)"
                      slot="activator"
                    >
                      <v-icon style="color: #606060">
                        edit
                      </v-icon>
                    </v-btn>
                    <span>Edit</span>
                  </v-tooltip>

                  <!-- delete button -->
                  <v-tooltip top>
                    <v-btn
                      :disabled="props.item.reimbursedDate != null || isEditing()"
                      flat
                      icon
                      @click="
                        deleting = true;
                        propExpense = props.item;
                      "
                      slot="activator"
                    >
                      <v-icon style="color: #606060">
                        delete
                      </v-icon>
                    </v-btn>
                    <span>Delete</span>
                  </v-tooltip>

                  <!-- unreimburse button -->
                  <!-- <div v-if="isAdmin">
                    <v-tooltip top>
                      <v-btn
                        :disabled="props.item.reimbursedDate == null || isEditing()"
                        flat
                        icon
                        @click="
                          unreimbursing = true;
                          propExpense = props.item;
                        "
                        slot="activator"
                      >
                        <v-icon style="color: #606060">
                          money_off
                        </v-icon>
                      </v-btn>
                      <span>Unreimburse</span>
                    </v-tooltip>
                  </div> -->
                </td>

                <!-- end option buttons -->
              </tr>
            </template>
            <!-- end data row -->

            <!-- data row dropdown/expandable -->
            <template v-slot:expand="props">
              <v-card flat>
                <v-card-text>
                  <div class="expandedInfo">
                    <!-- notes/url button -->
                    <p v-if="props.item.description"><b>Description: </b>{{ props.item.description }}</p>
                    <p v-if="props.item.note"><b>Notes: </b>{{ props.item.note }}</p>
                    <p v-if="props.item.receipt"><b>Receipt: </b>{{ props.item.receipt }}</p>
                    <p v-if="props.item.url">
                      <b>Url: </b> <a v-if="props.item.url" :href="props.item.url">{{ props.item.url }}</a>
                    </p>
                    <p v-if="props.item.categories && typeof props.item.categories == 'string'">
                      <b>Category: </b>{{ props.item.categories }}
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </template>

            <!-- end data row dropdown/expandable -->

            <!-- no results display -->
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
              Your search for "{{ search }}" found no results.
            </v-alert>
          </v-data-table>
          <!-- <v-card-actions>
            <v-checkbox v-if="isUser" :label="'Show Reimbursed Expenses'" v-model="showReimbursed"></v-checkbox>
          </v-card-actions> -->
          <br />
          <v-card-actions>
            <convert-expenses-to-csv v-if="isAdmin" :expenses="getExpenses()"></convert-expenses-to-csv>
          </v-card-actions>
          <!-- end no results display -->

          <!-- unreimbursing button confirmation alert box -->
          <unreimburse-modal :activate="unreimbursing" :expense="propExpense"></unreimburse-modal>
          <delete-modal :activate="deleting" :type="'expense'"></delete-modal>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex lg4 md12 sm12>
      <expense-form
        :isEdit="isEditing()"
        :expense="expense"
        v-on:add="addModelToTable"
        v-on:update="updateModelInTable"
        v-on:error="displayError"
        style="position: sticky; top: 79px;"
      ></expense-form>
    </v-flex>
  </v-layout>
</template>
<script>
import api from '@/shared/api.js';
import employeeUtils from '@/shared/employeeUtils';
import ExpenseForm from '../components/ExpenseForm.vue';
import DeleteModal from '../components/DeleteModal.vue';
import UnreimburseModal from '../components/UnreimburseModal.vue';
import Attachment from '../components/Attachment.vue';
import ConvertExpensesToCsv from '../components/ConvertExpensesToCsv.vue';
import moment from 'moment';
import _ from 'lodash';
import { getRole } from '@/utils/auth';

// FILTERS
function moneyFilter(value) {
  return `${new Intl.NumberFormat('en-US', {
    style: 'decimal',
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}`;
}

// COMPUTED

function isAdmin() {
  return this.role === 'admin';
}

function isUser() {
  return this.role === 'user';
}

function roleHeaders() {
  return this.isAdmin
    ? this.headers
    : (function getUserHeaders(headers) {
        let x = headers;
        x.splice(1, 1);
        return x;
      })(this.headers);
}

function getUserName() {
  return this.processedExpenses.length === 0 ? '' : this.processedExpenses[0].employeeName;
}

// METHODS
function getExpenses() {
  return api.getItems(api.EXPENSES);
}

function constructAutoComplete(aggregatedData) {
  this.employees = _.map(aggregatedData, data => {
    if (data && data.employeeName && data.userId) {
      return {
        text: data.employeeName,
        value: data.userId
      };
    }
  }).filter(data => {
    return data != null;
  });
}

function customFilter(item, queryText) {
  const hasValue = val => (val != null ? val : '');
  const text = hasValue(item.text);
  const query = hasValue(queryText);
  return (
    text
      .toString()
      .toLowerCase()
      .indexOf(query.toString().toLowerCase()) > -1
  );
}

function clearStatus() {
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
}

async function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
}

async function getEmployeeName(expense) {
  let employee = await api.getItem(api.EMPLOYEES, expense.userId);
  expense.employeeName = employeeUtils.fullName(employee);
  return expense;
}

async function getExpenseTypeName(expense) {
  let expenseType = await api.getItem(api.EXPENSE_TYPES, expense.expenseTypeId);
  expense.budgetName = expenseType.budgetName;
  return expense;
}

async function refreshExpenses() {
  let aggregatedData = [];
  if (this.isAdmin || this.isUser) {
    aggregatedData = await api.getAggregate();
  }
  this.processedExpenses = aggregatedData;
  this.filteredExpenses = this.processedExpenses;
  this.filterExpense();

  // this.filteredExpenses = _.filter(this.processedExpenses, expense => {
  //   //gets the expense type for expense to look up inactive
  //   let expenseType = _.find(this.expenseTypes, type => expense.expenseTypeId === type.value);
  //   return expenseType && !expenseType.isInactive;
  // });

  // console.log('refresh');
  // console.log(this.filteredExpenses);
  this.loading = false;
}

function onSelect(item) {
  this.isEdit = true;
  this.$set(this.expense, 'budgetName', item.budgetName);
  this.$set(this.expense, 'id', item.id);
  this.$set(this.expense, 'purchaseDate', item.purchaseDate);
  this.$set(this.expense, 'reimbursedDate', item.reimbursedDate);
  this.$set(this.expense, 'employeeName', item.employeeName);
  this.$set(this.expense, 'description', item.description);
  this.$set(this.expense, 'cost', moneyFilter(item.cost));
  this.$set(this.expense, 'userId', item.userId);
  this.$set(this.expense, 'expenseTypeId', item.expenseTypeId);
  this.$set(this.expense, 'note', item.note);
  this.$set(this.expense, 'receipt', item.receipt);
  this.$set(this.expense, 'createdAt', item.createdAt);
  this.$set(this.expense, 'url', item.url);
  this.$set(this.expense, 'categories', item.categories);
}

function updateModelInTable(updatedExpense) {
  let matchingExpensesIndex = _.findIndex(this.processedExpenses, expense => expense.id === updatedExpense.id);
  let employeeName = '';
  if (this.isAdmin) {
    api.getItem(api.EMPLOYEES, updatedExpense.userId).then(employee => {
      employeeName = employeeUtils.fullName(employee);
      this.$set(updatedExpense, 'employeeName', employeeName);
    });
  } else {
    employeeName = this.processedExpenses[matchingExpensesIndex].employeeName;
    this.$set(updatedExpense, 'employeeName', employeeName);
  }
  api.getItem(api.EXPENSE_TYPES, updatedExpense.expenseTypeId).then(expenseType => {
    this.$set(updatedExpense, 'budgetName', expenseType.budgetName);
  });
  this.processedExpenses.splice(matchingExpensesIndex, 1, updatedExpense);

  //filters expenses after update
  this.filterExpense();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully updated!');
  this.$set(this.status, 'color', 'green');
}

function addModelToTable(newExpense) {
  let matchingExpenses = _.filter(this.processedExpenses, expense => expense.id === newExpense.id);

  if (!matchingExpenses.length) {
    if (this.isAdmin) {
      api
        .getItem(api.EMPLOYEES, newExpense.userId)
        .then(employee => {
          let employeeName = employeeUtils.fullName(employee);
          this.$set(newExpense, 'employeeName', employeeName);
        })
        .catch(err => console.log(err));
    }
    api.getItem(api.EXPENSE_TYPES, newExpense.expenseTypeId).then(expenseType => {
      this.$set(newExpense, 'budgetName', expenseType.budgetName);
    });

    this.processedExpenses.push(newExpense);

    //filters expenses after adding new expense
    this.filterExpense();

    this.$set(this.status, 'statusType', 'SUCCESS');
    this.$set(this.status, 'statusMessage', 'Item was successfully submitted!');
    this.$set(this.status, 'color', 'green');
  }
}

function deleteModelFromTable(deletedExpense) {
  let modelIndex = _.findIndex(this.processedExpenses, expense => {
    return expense.id === deletedExpense.id;
  });
  this.processedExpenses.splice(modelIndex, 1);

  //filters expenses after delete
  this.filterExpense();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully deleted!');
  this.$set(this.status, 'color', 'green');
}

function changeSort(column) {
  if (this.pagination.sortBy === column) {
    this.pagination.descending = !this.pagination.descending;
  } else {
    this.pagination.sortBy = column;
    this.pagination.descending = false;
  }
}

function isEditing() {
  return !!this.expense.id;
}

/**
 * Creates a new negative expense for the reimbursed expense selected
 */
async function unreimburseExpense() {
  this.loading = true;
  this.unreimbursing = false;

  this.loading = false;
}

async function deleteExpense() {
  this.deleting = false;
  if (this.propExpense.id) {
    let deletedExpense = this.propExpense;
    let deleted = await api.deleteItem(api.EXPENSES, this.propExpense.id);
    if (deleted) {
      this.deleteModelFromTable(deletedExpense);
    }
  }
}

// LIFECYCLE HOOKS
async function created() {
  this.role = getRole();

  let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
  this.expenseTypes = _.map(expenseTypes, expenseType => {
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
      categories: expenseType.categories
    };
  });

  this.refreshExpenses();

  let aggregatedData = await api.getAggregate(); //autocomplete
  this.constructAutoComplete(aggregatedData); //autocomplete

  window.EventBus.$on('canceled-unreimburse-expense', () => (this.unreimbursing = false));
  window.EventBus.$on('confirm-unreimburse-expense', this.unreimburseExpense);

  window.EventBus.$on('canceled-delete-expense', () => (this.deleting = false));
  window.EventBus.$on('confirm-delete-expense', this.deleteExpense);

  console.log('created');
  console.log(this.expenseTypes);
}

function filterExpense() {
  this.filteredExpenses = this.processedExpenses;

  if (this.employee) {
    this.filteredExpenses = _.filter(this.filteredExpenses, expense => {
      return expense.userId === this.employee;
    });
  }

  //filter for reimbursed
  if (this.filter.reimbursed !== 'both') {
    this.filteredExpenses = _.filter(this.filteredExpenses, expense => {
      if (this.filter.reimbursed == 'notReimbursed') {
        return !expense.reimbursedDate;
      } else {
        return expense.reimbursedDate;
      }
    });
  }

  //filter for Active Expense Types (available to admin only)
  if (this.filter.active !== 'both') {
    this.filteredExpenses = _.filter(this.filteredExpenses, expense => {
      //gets the expense type for expense to look up inactive
      let expenseType = _.find(this.expenseTypes, type => expense.expenseTypeId === type.value);
      if (this.filter.active == 'active') {
        return expenseType && !expenseType.isInactive;
      } else {
        return expenseType && expenseType.isInactive;
      }
    });
  }
}

function expenseList() {
  return this.filteredExpenses;
}

export default {
  filters: {
    moneyValue: value => {
      return `$` + moneyFilter(value);
    },
    dateFormat: value => {
      if (value) {
        // return moment(value, 'h:mm:ss ddd MMM DD YYYY GMT-0400').format('MMM Do, YYYY');
        return moment(value, 'YYYY-MM-DD').format('MMM Do, YYYY');
      } else {
        return '';
      }
    },
    dateFormatCreated: value => {
      if (value) {
        return moment(value, 'MM-DD-YYYY').format('MMM Do, YYYY');
      } else {
        return '';
      }
    }
  },
  data() {
    return {
      employees: [], //autocomplete
      employee: null, //autocomplete
      isEdit: false,
      role: '',
      loading: true,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      },
      userFirstName: '',
      expense: {
        id: '',
        description: '',
        cost: '',
        note: null,
        userId: '',
        expenseTypeId: '',
        purchaseDate: null,
        reimbursedDate: null,
        receipt: null,
        employeeName: '',
        budgetName: '',
        createdAt: null,
        categories: []
      },
      propExpense: {
        id: '',
        description: '',
        cost: '',
        note: null,
        userId: '',
        expenseTypeId: '',
        purchaseDate: null,
        reimbursedDate: null,
        receipt: null,
        employeeName: '',
        budgetName: '',
        createdAt: null,
        categories: []
      },
      search: '',
      expenses: [],
      filteredExpenses: [], //mine
      expenseTypes: [], //mine
      processedExpenses: [],
      // showReimbursed: false,
      deleting: false,
      unreimbursing: false,
      errors: [],
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
        }, //change value to call a function
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
        }
      ],
      filter: {
        active: 'both',
        reimbursed: 'notReimbursed' //default only shows expenses that are not reimbursed
      },
      pagination: {
        sortBy: 'purchaseDate',
        rowsPerPage: 25
      },
      expand: false
    };
  },
  computed: {
    isAdmin,
    isUser,
    roleHeaders,
    getUserName,
    expenseList
  },
  components: {
    ExpenseForm,
    Attachment,
    DeleteModal,
    UnreimburseModal,
    ConvertExpensesToCsv
  },
  watch: {
    'filter.active': function() {
      this.filterExpense();
    },
    'filter.reimbursed': function() {
      this.filterExpense();
    },
    employee: function() {
      this.filterExpense();
    }
  },
  methods: {
    constructAutoComplete,
    customFilter,
    clearStatus,
    displayError,
    getEmployeeName,
    getExpenseTypeName,
    refreshExpenses,
    onSelect,
    updateModelInTable,
    addModelToTable,
    deleteModelFromTable,
    changeSort,
    isEditing,
    deleteExpense,
    unreimburseExpense,
    filterExpense,
    getExpenses
  },
  created
};
</script>

<style>
.datatable_btn .v-btn {
  margin: 6px -2px;
}

.expandedInfo {
  border: 1px solid black;
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
</style>
