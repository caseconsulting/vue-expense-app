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
              <tr
                :class="{ inactiveStyle: props.item.isInactive }"
                @click="
                  onSelect(props.item);
                  props.expanded = !props.expanded;
                "
              >
                <td class="text-xs-left">{{ props.item.budgetName | limitedText }}</td>
                <td class="text-xs-left">{{ props.item.budget | moneyValue }}</td>
                <td class="text-xs-left">{{ props.item.description | limitedText }}</td>
                <td class="text-xs-left">{{ props.item.startDate }}</td>
                <td class="text-xs-left">{{ props.item.endDate }}</td>
                <td class="text-xs-center">
                  <icon v-if="props.item.odFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                  <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                </td>
                <td class="text-xs-center">
                  <icon v-if="props.item.recurringFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                  <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                </td>
                <td class="text-xs-center">
                  <icon v-if="!props.item.requiredFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                  <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                </td>
                <td class="text-xs-left">{{ isInactive(props.item) }}</td>
              </tr>
            </template>
            <!-- end data row -->

            <!-- data row dropdown/expandable -->
            <template v-slot:expand="props">
              <v-card flat>
                <v-card-text>
                  <div class="expandedInfo">
                    <p v-if="props.item.description"><b>Description: </b>{{ props.item.description }}</p>

                    <p v-if="props.item.categories.length > 0">
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
                      <icon v-if="!props.item.requiredFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
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
          <v-card-actions>
            <v-checkbox :label="'Show Inactive Expense Types'" v-model="showAll"></v-checkbox>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xl4 lg4 md12 sm12>
      <expense-type-form
        :model="model"
        v-on:add="addModelToTable"
        v-on:update="updateModelInTable"
        v-on:delete="deleteModelFromTable"
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

function moneyFilter(value) {
  return `${new Intl.NumberFormat('en-US', {
    style: 'decimal',
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}`;
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
      showAll: false, //used to show all expenseTypes (even inactive)
      search: '',
      loading: false,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      },
      expenseTypes: [],
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
        }, //change value to call a function
        {
          text: 'Description',
          value: 'description'
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
          text: 'Overdraft Allowed',
          value: 'odFlag',
          sortable: false
        },
        {
          text: 'Recurring',
          value: 'recurringFlag',
          sortable: false
        },
        {
          text: 'Receipt Required',
          value: 'requiredFlag',
          sortable: false
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
        requiredFlag: false,
        isInactive: false,
        categories: []
      },
      expand: false
    };
  },
  components: {
    ExpenseTypeForm
  },
  async created() {
    this.refreshExpenseTypes();
  },
  computed: {
    expenseTypeList() {
      return this.showAll ? this.expenseTypes : this.filteredExpenseTypes;
    }
  },
  methods: {
    isInactive(expenseType) {
      return !expenseType.isInactive ? '' : 'Not Active';
    },
    clearStatus() {
      this.$set(this.status, 'statusType', undefined);
      this.$set(this.status, 'statusMessage', '');
      this.$set(this.status, 'color', '');
    },
    async displayError(err) {
      this.$set(this.status, 'statusType', 'ERROR');
      this.$set(this.status, 'statusMessage', err);
      this.$set(this.status, 'color', 'red');
    },
    async refreshExpenseTypes() {
      this.loading = true;
      this.expenseTypes = await api.getItems(api.EXPENSE_TYPES);

      this.filteredExpenseTypes = _.filter(this.expenseTypes, expenseType => {
        return !expenseType.isInactive;
      });
      this.loading = false;
    },
    onSelect(item) {
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
    },
    clearModel() {
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
    },
    updateModelInTable(updatedExpenseType) {
      let matchingExpensesIndex = _.findIndex(
        this.expenseTypes,
        expenseType => expenseType.id === updatedExpenseType.id
      );
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
    },
    addModelToTable(newExpenseType) {
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
    },
    deleteModelFromTable() {
      let modelIndex = _.findIndex(this.expenseTypes, expense => expense.id === this.model.id);
      this.expenseTypes.splice(modelIndex, 1);
      modelIndex = _.findIndex(this.filteredExpenseTypes, expense => expense.id === this.model.id);
      this.filteredExpenseTypes.splice(modelIndex, 1);
      this.$set(this.status, 'statusType', 'SUCCESS');
      this.$set(this.status, 'statusMessage', 'Item was successfully deleted!');
      this.$set(this.status, 'color', 'green');
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    }
  }
};
</script>
<style>
#marks {
  width: auto;
  height: 1.5em;
}

.inactiveStyle {
  background-color: #bdbbbb;
}

.flag {
}

.flag p {
  font-weight: bold;
  width: 150px;
  display: inline-block;
}

.flag svg {
  margin-top: 5px;
}
</style>
