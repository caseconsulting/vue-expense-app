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
    <v-flex xl7 lg8 md12 sm12 offset-xl1>
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

            <!-- active fitler -->
            <div class="flagFilter">
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

            <!-- overdraft fitler -->
            <div class="flagFilter">
              <h4>Overdraft:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.overdraft" flat mandatory>
                <v-tooltip top>
                  <v-btn value="overdraft" slot="activator" flat>
                    <icon class="mr-1" name="regular/check-circle"></icon>
                  </v-btn>
                  <span>Show Overdraft</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="noOverdraft" slot="activator" flat>
                    <icon name="regular/times-circle"></icon>
                  </v-btn>
                  <span>Hide Overdraft</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="both" slot="activator" flat>
                    BOTH
                  </v-btn>
                  <span>Show All</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>

            <!-- recurring filter -->
            <div class="flagFilter">
              <h4>Recurring:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.recurring" flat mandatory>
                <v-tooltip top>
                  <v-btn value="recurring" slot="activator" flat>
                    <icon class="mr-1" name="regular/check-circle"></icon>
                  </v-btn>
                  <span>Show Recurring</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="notRecurring" slot="activator" flat>
                    <icon name="regular/times-circle"></icon>
                  </v-btn>
                  <span>Hide Recurring</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="both" slot="activator" flat>
                    BOTH
                  </v-btn>
                  <span>Show All</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>

            <!-- receipt fitler -->
            <div class="flagFilter">
              <h4>Receipt Required:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.receipt" flat mandatory>
                <v-tooltip top>
                  <v-btn value="receipt" slot="activator" flat>
                    <icon class="mr-1" name="regular/check-circle"></icon>
                  </v-btn>
                  <span>Show Required Receipt</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="noReceipt" slot="activator" flat>
                    <icon name="regular/times-circle"></icon>
                  </v-btn>
                  <span>Hide Required Receipt</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="both" slot="activator" flat>
                    BOTH
                  </v-btn>
                  <span>Show All</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>
          </fieldset>
          <br />

          <!-- end filters -->

          <!-- start datatable -->
          <v-data-table
            :headers="headers"
            :items="expenseTypeList"
            :search="search"
            :pagination.sync="pagination"
            :expand="expand"
            item-key="budgetName"
            class="elevation-1"
          >
            <template slot="headers" slot-scope="props">
              <tr style="box-shadow: 0px 1.5px #888888;">
                <th
                  v-for="header in props.headers"
                  :key="header.text"
                  :class="[
                    'column sortable',
                    pagination.descending ? 'desc' : 'asc',
                    header.value === pagination.sortBy ? 'active' : '',
                    header.value === 'odFlag' ? 'text-xs-center' : 'text-xs-left'
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
              <tr :class="{ inactiveStyle: props.item.isInactive }" @click="props.expanded = !props.expanded">
                <td class="text-xs-left">{{ props.item.budgetName | limitedText }}</td>
                <td class="text-xs-left">{{ props.item.budget | moneyValue }}</td>
                <!-- <td class="text-xs-left">{{ props.item.description | limitedText }}</td> -->
                <td class="text-xs-left">{{ props.item.startDate }}</td>
                <td class="text-xs-left">{{ props.item.endDate }}</td>

                <!-- action icons -->
                <td class="datatable_btn layout">
                  <!-- edit button -->
                  <v-tooltip top>
                    <v-btn :disabled="isEditing()" flat icon @click="onSelect(props.item)" slot="activator">
                      <v-icon style="color: #606060">
                        edit
                      </v-icon>
                    </v-btn>
                    <span>Edit</span>
                  </v-tooltip>

                  <!-- delete button -->
                  <v-tooltip top>
                    <v-btn :disabled="isEditing()" flat icon @click="validateDelete(props.item)" slot="activator">
                      <v-icon style="color: #606060">
                        delete
                      </v-icon>
                    </v-btn>
                    <span>Delete</span>
                  </v-tooltip>
                </td>
                <!-- end action icons -->
              </tr>
            </template>

            <!-- end data row -->

            <!-- data row dropdown/expandable -->
            <template v-slot:expand="props">
              <v-card flat>
                <v-card-text>
                  <div class="expandedInfo">
                    <p v-if="props.item.description"><b>Description: </b>{{ props.item.description }}</p>

                    <p v-if="props.item.categories && props.item.categories.length > 0">
                      <b>Categories: </b>{{ props.item.categories.join(', ') }}
                    </p>

                    <div class="flag">
                      <p>Overdraft Allowed:</p>
                      <icon v-if="props.item.odFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                      <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                    </div>
                    <div class="flag">
                      <p>Recurring:</p>
                      <icon v-if="props.item.recurringFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                      <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                    </div>
                    <div class="flag">
                      <p>Receipt Required:</p>
                      <icon v-if="props.item.requiredFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                      <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                    </div>
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
            <v-checkbox :label="'Show Inactive Expense Types'" v-model="showInactive"></v-checkbox>
          </v-card-actions> -->

          <delete-modal :activate="deleting" :type="'expense-type'"></delete-modal>
          <delete-error-modal :activate="invalidDelete" type="expense type"></delete-error-modal>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xl4 lg4 md12 sm12>
      <expense-type-form
        :model="model"
        v-on:add="addModelToTable"
        v-on:update="updateModelInTable"
        v-on:error="displayError"
        style="position: sticky; top: 79px;"
      ></expense-type-form>
    </v-flex>
  </v-layout>
</template>

<script>
import _ from 'lodash';
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

function isInactive(expenseType) {
  return !expenseType.isInactive ? '' : 'Not Active';
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

async function refreshExpenseTypes() {
  this.loading = true;
  this.expenseTypes = await api.getItems(api.EXPENSE_TYPES);

  this.filteredExpenseTypes = _.filter(this.expenseTypes, expenseType => {
    return !expenseType.isInactive;
  });
  this.loading = false;
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

function updateModelInTable(updatedExpenseType) {
  let matchingExpensesIndex = _.findIndex(this.expenseTypes, expenseType => expenseType.id === updatedExpenseType.id);
  this.expenseTypes.splice(matchingExpensesIndex, 1, updatedExpenseType);

  if (!updatedExpenseType.isInactive) {
    matchingExpensesIndex = _.findIndex(
      this.filteredExpenseTypes,
      expenseType => expenseType.id === updatedExpenseType.id
    );
    this.filteredExpenseTypes.splice(matchingExpensesIndex, 1, updatedExpenseType);
  } else {
    this.filteredExpenseTypes = _.remove(
      this.filteredExpenseTypes,
      expenseType => expenseType.id !== updatedExpenseType.id
    );
  }

  //       if (!updatedEmployee.isInactive) {
  //   matchingEmployeeIndex = _.findIndex(this.filteredEmployees, employee => employee.id === updatedEmployee.id);
  //   this.filteredEmployees.splice(matchingEmployeeIndex, 1, updatedEmployee);
  // } else {
  //   this.filteredEmployees = _.remove(this.filteredEmployees, employee => employee.id !== updatedEmployee.id);
  // }

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Item was successfully updated!');
  this.$set(this.status, 'color', 'green');
}

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

function deleteModelFromTable() {
  let modelIndex = _.findIndex(this.expenseTypes, expense => expense.id === this.deleteModel.id);
  this.expenseTypes.splice(modelIndex, 1);
  modelIndex = _.findIndex(this.filteredExpenseTypes, expense => expense.id === this.deleteModel.id);
  this.filteredExpenseTypes.splice(modelIndex, 1);
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

function isEditing() {
  return !!this.model.id;
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
      //showInactive: false, //used to show all expenseTypes (even inactive)
      search: '',
      loading: false,
      deleting: false,
      invalidDelete: false,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      },
      expenseTypes: [],
      typeExpenses: '',
      filteredExpenseTypes: [],
      errors: [],
      headers: [
        {
          text: 'Expense Type',
          value: 'budgetName',
          sortable: false
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
        }
      ],
      pagination: {
        sortBy: 'budgetName',
        rowsPerPage: 10
      },
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
      deleteModel: {
        id: ''
      },
      filter: {
        active: 'active',
        overdraft: 'both',
        recurring: 'both',
        receipt: 'both'
      },
      expand: false
    };
  },
  components: {
    ExpenseTypeForm,
    DeleteModal,
    DeleteErrorModal
  },
  computed: {
    expenseTypeList
  },
  watch: {
    'filter.active': function() {
      this.filterExpense();
    },
    'filter.overdraft': function() {
      this.filterExpense();
    },
    'filter.recurring': function() {
      this.filterExpense();
    },
    'filter.receipt': function() {
      this.filterExpense();
    }
  },
  methods: {
    isInactive,
    clearStatus,
    displayError,
    refreshExpenseTypes,
    onSelect,
    clearModel,
    updateModelInTable,
    addModelToTable,
    deleteModelFromTable,
    changeSort,
    filterExpense,
    validateDelete,
    isEditing,
    deleteExpenseType
  },
  created
};
</script>

<style>
#marks {
  width: auto;
  height: 1.5em;
}

/* .inactiveStyle {
  background-color: #bdbbbb;
} */

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
