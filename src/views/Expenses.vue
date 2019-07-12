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
      <v-btn color="white" flat @click="clearStatus">
        Close
      </v-btn>
    </v-snackbar>
    <v-flex lg12 md12 sm12>
      <!-- <v-alert v-if="error" dismissible :value="error" color="error" icon="warning" outline>
        {{error.response.data.message}}
      </v-alert> -->
    </v-flex>
    <v-flex lg8 md12 sm12>
      <v-card>
        <v-container fluid>
          <v-card-title>
            <h2 v-if="isUser">{{ getUserName }}'s Expenses</h2>
            <h2 v-else>Expenses</h2>
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
          </v-card-title>
          <v-data-table
            :loading="loading"
            :headers="roleHeaders"
            :items="sorting"
            :search="search"
            :pagination.sync="pagination"
            :expand="expand"
            item-key="id"
            class="elevation-1"
          >
            <v-progress-linear slot="progress" color="radioactive" indeterminate></v-progress-linear>
            <template slot="headers" slot-scope="props">
              <tr style="box-shadow: 0px 1.5px #888888;">
                <th
                  class="text-xs-left"
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
              <tr v-if="!loading && (showRow(props.item) || isAdmin)" @click="props.expanded = !props.expanded">
                <td class="text-xs-left">{{ props.item.createdAt | dateFormat }}</td>
                <td v-if="isAdmin" class="text-xs-left">{{ props.item.employeeName }}</td>
                <td class="text-xs-left">{{ props.item.budgetName }}</td>
                <td class="text-xs-left">{{ (props.item.cost ? props.item.cost : 0) | moneyValue }}</td>
                <td class="text-xs-left">{{ props.item.purchaseDate | dateFormat }}</td>
                <td class="text-xs-left">{{ props.item.reimbursedDate | dateFormat }}</td>
                <td class="text-xs-left">{{ props.item.description | descriptionFilter }}</td>
                <td class="text-xs-left">
                  <attachment :expense="props.item" :mode="'expenses'"></attachment>
                </td>
              </tr>
            </template>
            <!-- end data row -->

            <!-- data row dropdown/expandable -->
            <template v-slot:expand="props">
              <v-card flat>
                <v-card-text>
                  <div>
                    <!-- notes/url button -->
                    <v-btn outline color="info" @click="viewingNotes = true">
                      <icon class="mr-1" name="sticky-note"></icon>View Notes</v-btn
                    >

                    <!-- edit button for super-admin-->
                    <v-btn
                      v-if="isSuperAdmin"
                      @click="onSelect(props.item)"
                      outline
                      color="black"
                      :disabled="isEditing()"
                    >
                      <icon class="mr-1" name="edit"></icon>Edit</v-btn
                    >

                    <!-- edit button for user/admin-->
                    <v-btn
                      v-if="!isSuperAdmin && !props.item.reimbursedDate"
                      @click="onSelect(props.item)"
                      outline
                      color="black"
                      :disabled="isEditing()"
                    >
                      <icon class="mr-1" name="edit"></icon>Edit</v-btn
                    >

                    <!-- delete button for super-admin -->
                    <v-btn
                      v-if="isSuperAdmin"
                      outline
                      color="error"
                      @click="
                        deleting = true;
                        propExpense = props.item;
                      "
                      :disabled="isEditing()"
                    >
                      <icon class="mr-1" name="trash"></icon>Delete</v-btn
                    >

                    <!-- delete button for user/admin -->
                    <v-btn
                      v-if="!isSuperAdmin && !props.item.reimbursedDate"
                      outline
                      color="error"
                      @click="
                        deleting = true;
                        propExpense = props.item;
                      "
                      :disabled="isEditing()"
                    >
                      <icon class="mr-1" name="trash"></icon>Delete</v-btn
                    >

                    <!-- unreimburse button -->
                    <v-btn
                      v-if="isSuperAdmin && props.item.reimbursedDate"
                      outline
                      color="indigo"
                      @click="
                        unreimbursing = true;
                        propExpense = props.item;
                      "
                      :disabled="isEditing()"
                    >
                      <icon class="mr-1" name="times-circle"></icon>Unremimburse</v-btn
                    >
                  </div>
                </v-card-text>
              </v-card>
              <view-notes :activate="viewingNotes" :notes="props.item.note" :url="props.item.url"></view-notes>
            </template>
            <!-- end data row dropdown/expandable -->

            <!-- no results display -->
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
              Your search for "{{ search }}" found no results.
            </v-alert>
          </v-data-table>
          <v-card-actions>
            <v-checkbox v-if="isUser" :label="'Show Reimbursed Expenses'" v-model="showReimbursed"></v-checkbox>
          </v-card-actions>
          <!-- end no results display -->

          <!-- unreimbursing button confirmation alert box -->
          <unreimburse-modal :activate="unreimbursing" :type="'expense'"></unreimburse-modal>
          <delete-modal :activate="deleting" :type="'expense'"></delete-modal>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex lg4 md12 sm12>
      <expense-form
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
import ViewNotes from '../components/ViewNotes.vue';
import UnreimburseModal from '../components/UnreimburseModal.vue';
import Attachment from '../components/Attachment.vue';
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

function descriptionFilter(val) {
  if (val.length > 15) {
    return `${val.substring(0, 15)}...`;
  } else return val;
}

// COMPUTED
function sorting() {
  return this.processedExpenses;
}

function isAdmin() {
  return this.role === 'admin' || this.role === 'super-admin';
}

function isUser() {
  return this.role === 'user';
}

function isSuperAdmin() {
  return this.role === 'super-admin';
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
  this.loading = false;
}

function showRow(expense) {
  return this.showReimbursed || !expense.reimbursedDate;
}

function onSelect(item) {
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

async function unreimburseExpense() {
  this.loading = true;
  this.unreimbursing = false;

  if (this.propExpense.id) {
    console.log('made it into the if thix.expense.id');
    console.log('before exp change');
    console.log(this.propExpense.reimbursedDate);
    this.propExpense.reimbursedDate = null;
    // this.$set(this.expense, 'receipt', this.file.name); //stores file name for lookup later
    let updatedExpense = await api.updateItem(api.EXPENSES, this.propExpense.id, this.propExpense);
    console.log('after exp change');

    console.log(this.propExpense);
    if (updatedExpense.id) {
      // submit attachment
      // let attachment = await api.createAttachment(this.expense, this.file);
      // console.log('attachment', attachment);
      // console.log('loading' + this.loading);
      console.log('success updated expense id');
      this.$emit('unreimburse', unreimbursedExpense);
    } else {
      console.log('error');
      this.$emit('error', updatedExpense.response.data.message);
    }
  }
  //  else {
  //   this.$set(this.expense, 'createdAt', moment().format('MM-DD-YYYY'));
  //   if (this.file) {
  //     this.$set(this.expense, 'receipt', this.file.name); //stores file name for lookup later
  //   }
  //   let newExpense = await api.createItem(api.EXPENSES, this.expense);
  //   console.log(newExpense.id);
  //   if (newExpense.id) {
  //     // submit attachment
  //     let attachment = await api.createAttachment(newExpense, this.file);
  //     console.log('attachment', attachment);
  //     this.$set(this.expense, 'id', newExpense.id);
  //     this.$emit('add', newExpense);
  //     EventBus.$emit('showSnackbar', newExpense);
  //     EventBus.$emit('refreshChart', newExpense);
  //     this.clearForm();
  //   } else {
  //     this.$emit('error', newExpense.response.data.message);
  //   }
  // }
  console.log('made it to the end of the method');
  this.loading = false;
}

async function deleteExpense() {
  this.deleting = false;
  if (this.propExpense.id) {
    let deletedExpense = this.propExpense;
    await api.deleteItem(api.EXPENSES, this.propExpense.id);
    this.deleteModelFromTable(deletedExpense);
  }
}

// LIFECYCLE HOOKS
async function created() {
  this.role = getRole();
  this.refreshExpenses();

  EventBus.$on('canceled-unreimburse-expense', () => (this.unreimbursing = false));
  EventBus.$on('confirm-unreimburse-expense', this.unreimburseExpense);

  EventBus.$on('canceled-delete-expense', () => (this.deleting = false));
  EventBus.$on('confirm-delete-expense', this.deleteExpense);

  EventBus.$on('close-notes', () => (this.viewingNotes = false));
}

export default {
  filters: {
    moneyValue: value => {
      return `$` + moneyFilter(value);
    },
    dateFormat: value => {
      if (value) {
        return moment(value).format('MMM Do, YYYY');
      } else {
        return '';
      }
    },
    descriptionFilter
  },
  data() {
    return {
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
        createdAt: null
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
        createdAt: null
      },
      search: '',
      expenses: [],
      processedExpenses: [],
      showReimbursed: false,
      deleting: false,
      unreimbursing: false,
      viewingNotes: false,
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
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: '',
          sortable: false
        }
      ],
      pagination: {
        sortBy: 'purchaseDate',
        rowsPerPage: 25
      },
      expand: false
    };
  },
  computed: {
    sorting,
    isAdmin,
    isUser,
    isSuperAdmin,
    roleHeaders,
    getUserName
  },
  components: {
    ExpenseForm,
    Attachment,
    DeleteModal,
    ViewNotes,
    UnreimburseModal
  },
  methods: {
    clearStatus,
    displayError,
    getEmployeeName,
    getExpenseTypeName,
    refreshExpenses,
    showRow,
    onSelect,
    updateModelInTable,
    addModelToTable,
    deleteModelFromTable,
    changeSort,
    isEditing,
    deleteExpense,
    unreimburseExpense
  },
  created
};
</script>
