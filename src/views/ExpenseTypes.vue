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
                        <v-icon style="color: #606060">
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
                        <v-icon style="color: #606060">
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
                      <p v-if="item.description"><b>Description: </b>{{ item.description }}</p>

                      <p v-if="item.categories && item.categories.length > 0">
                        <b>Categories: </b>{{ item.categories.join(', ') }}
                      </p>

                      <div class="flag">
                        <p>Overdraft Allowed:</p>
                        <icon v-if="item.odFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                        <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                      </div>
                      <div class="flag">
                        <p>Recurring:</p>
                        <icon v-if="item.recurringFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                        <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                      </div>
                      <div class="flag">
                        <p>Receipt Required:</p>
                        <icon v-if="item.requiredFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                        <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                      </div>
                      <div class="flag">
                        <p>Inactive:</p>
                        <icon v-if="item.isInactive" id="marks" class="mr-1" name="regular/check-circle"></icon>
                        <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                      </div>
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
import _ from 'lodash';
import { getRole } from '@/utils/auth';
import api from '@/shared/api.js';
import ExpenseTypeForm from '../components/ExpenseTypeForm.vue';
import DeleteModal from '../components/DeleteModal.vue';
import DeleteErrorModal from '../components/DeleteErrorModal.vue';

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
  let matchingExpenses = _.filter(this.expenseTypes, expenseType => expenseType.id === newExpenseType.id);

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
  let modelIndex = _.findIndex(this.expenseTypes, expense => expense.id === this.deleteModel.id);
  this.expenseTypes.splice(modelIndex, 1);
  modelIndex = _.findIndex(this.filteredExpenseTypes, expense => expense.id === this.deleteModel.id);
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
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, expenseType => {
    return this.filter.active == 'active'
      ? !expenseType.isInactive
      : this.filter.active == 'notActive'
      ? expenseType.isInactive
      : this.filteredExpenseTypes;
  });
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, expenseType => {
    return this.filter.overdraft == 'overdraft'
      ? expenseType.odFlag
      : this.filter.overdraft == 'noOverdraft'
      ? !expenseType.odFlag
      : this.filteredExpenseTypes;
  });
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, expenseType => {
    return this.filter.recurring == 'recurring'
      ? expenseType.recurringFlag
      : this.filter.recurring == 'notRecurring'
      ? !expenseType.recurringFlag
      : this.filteredExpenseTypes;
  });
  this.filteredExpenseTypes = _.filter(this.filteredExpenseTypes, expenseType => {
    return this.filter.receipt == 'receipt'
      ? expenseType.requiredFlag
      : this.filter.receipt == 'noReceipt'
      ? !expenseType.requiredFlag
      : this.filteredExpenseTypes;
  });
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
    .then(result => {
      return result.length <= 0;
    })
    .catch(err => {
      console.log(err);
    });
  if (x) {
    this.$set(this.deleteModel, 'id', item.id);
    this.deleting = true;
  } else {
    this.invalidDelete = true;
  }
}

/* computed */
function expenseTypeList() {
  return this.filteredExpenseTypes;
}

/* created */
async function created() {
  this.refreshExpenseTypes();

  window.EventBus.$on('canceled-delete-expense-type', () => (this.deleting = false));
  window.EventBus.$on('confirm-delete-expense-type', this.deleteExpenseType);

  window.EventBus.$on('invalid-expense type-delete', () => (this.invalidDelete = false));
}

export default {
  filters: {
    moneyValue: value => {
      return `$` + moneyFilter(value);
    },
    limitedText: val => {
      //limits text to 50 characters on table view
      return val.length > 50 ? val.substring(0, 50) + '...' : val;
    }
  },
  data() {
    return {
      deleteModel: {
        id: ''
      },
      deleting: false, // activate delete model
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
        typeExpenses: ''
      },
      search: '', // query text for datatable search field
      sortBy: 'budgetName', // sort datatable items
      sortDesc: false, // sort datatable items
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      },
      typeExpenses: ''
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
    'filter.active': function() {
      this.filterExpense();
    },
    'filter.receipt': function() {
      this.filterExpense();
    },
    'filter.recurring': function() {
      this.filterExpense();
    },
    'filter.overdraft': function() {
      this.filterExpense();
    }
  },
  methods: {
    addModelToTable,
    clearModel,
    clearStatus,
    clickedRow,
    deleteExpenseType,
    deleteModelFromTable,
    displayError,
    filterExpense,
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
</style>
