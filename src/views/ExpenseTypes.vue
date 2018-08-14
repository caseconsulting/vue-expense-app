<template>
<v-layout row wrap>
  <v-flex xl7 lg8 md12 sm12 offset-xl1>
    <v-card>
      <v-container fluid>
        <v-card-title>
          <h2>Expense Types</h2>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="expenseTypes" :search="search" :pagination.sync="pagination" item-key="budgetName" class="elevation-1">
          <template slot="headers" slot-scope="props">
            <tr>
              <th
                v-for="header in props.headers"
                :key="header.text"
                :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '',header.value === 'odFlag' ? 'text-xs-center' : 'text-xs-left']"
                @click="changeSort(header.value)"
              >
                {{ header.text }}
                <v-icon small>arrow_upward</v-icon>
              </th>
            </tr>
          </template>
          <template slot="items" slot-scope="props">
              <tr @click="onSelect(props.item)">
                <td class="text-xs-left">{{ props.item.budgetName }}</td>
                <td class="text-xs-left">{{ props.item.budget | moneyValue}}</td>
                <td class="text-xs-left">{{ props.item.description }}</td>
                <td class="text-xs-center">
                  <icon v-if="props.item.odFlag" id="marks" class="mr-1" name="regular/check-circle"></icon>
                  <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                </td>
              </tr>
            </template>
          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-container>
    </v-card>
  </v-flex>
  <v-flex xl4 lg4 md12 sm12>
    <expense-type-form :model="model" v-on:add="addModelToTable" v-on:update="updateModelInTable" v-on:delete="deleteModelFromTable"></expense-type-form>
  </v-flex>
</v-layout>
</template>

<script>
import api from '@/shared/api.js';
import ExpenseTypeForm from '../components/ExpenseTypeForm.vue';
export default {
  filters: {
    moneyValue: value => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    }
  },
  data() {
    return {
      search: '',
      loading: false,
      expenseTypes: [],
      errors: [],
      headers: [{
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
          text: 'Overdraft Allowed',
          value: 'odFlag',
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
        recurringFlag: false
      }
    };
  },
  components: {
    ExpenseTypeForm
  },
  async created() {
    this.refreshExpenseTypes();
  },
  methods: {
    async refreshExpenseTypes() {
      this.loading = true;
      this.expenseTypes = await api.getItems(api.EXPENSE_TYPES);
      this.loading = false;
    },

    onSelect(item) {
      this.$set(this.model, 'id', item.id);
      this.$set(this.model, 'budget', item.budget);
      this.$set(this.model, 'budgetName', item.budgetName);
      this.$set(this.model, 'description', item.description);
      this.$set(this.model, 'odFlag', item.odFlag);
      this.$set(this.model, 'startDate', item.startDate);
      this.$set(this.model, 'endDate', item.endDate);
      this.$set(this.model, 'recurringFlag', item.recurringFlag);
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
    },
    updateModelInTable(updatedExpenseType) {
      let matchingExpensesIndex = _.findIndex(
        this.expenseTypes,
        expenseType => expenseType.id === updatedExpenseType.id
      );
      this.expenseTypes.splice(matchingExpensesIndex, 1, updatedExpenseType);
    },
    addModelToTable(newExpenseType) {
      let matchingExpenses = _.filter(
        this.expenseTypes,
        expenseType => expenseType.id === newExpenseType.id
      );

      if (!matchingExpenses.length) {
        this.expenseTypes.push(newExpenseType);
      }
    },
    deleteModelFromTable() {
      let modelIndex = _.findIndex(
        this.expenseTypes,
        expense => expense.id === this.model.id
      );
      this.expenseTypes.splice(modelIndex, 1);
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
</style>
