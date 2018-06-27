<template>
  <div>
    <v-layout row wrap>
      <v-flex xl7 lg8 md12 sm12 offset-xl1>
        <v-card>
          <v-card-title>
            <h2>Expense Types</h2>
            <v-spacer></v-spacer>
            <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="expenseTypes"
            :search="search"
            item-key="name"
            class="elevation-1"
            >
            <template slot="items" slot-scope="props">
              <tr @click="onSelect(props.item)">
                <td class="text-xs-left">{{ props.item.budgetName }}</td>
                <td class="text-xs-left">{{ props.item.budget }}</td>
                <td class="text-xs-left">{{ props.item.description }}</td>
                <td class="text-xs-left">{{ props.item.odFlag }}</td>
              </tr>
            </template>
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
              Your search for "{{ search }}" found no results.
            </v-alert>
          </v-data-table>
          </v-card>
      </v-flex>
      <v-flex xl3 lg4 md12 sm12 >
        <expense-type-form :model="model" v-on:form-cleared="clearModel" v-on:update-table="refreshExpenseTypes"></expense-type-form>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import ExpenseTypeForm from '../components/ExpenseTypeForm.vue';
export default {
  data() {
    return {
      search: '',
      loading: false,
      expenseTypes: [],
      errors: [],
      headers: [
        {
          text: 'Expense Type',
          value: 'budgetName'
        },
        { text: 'Budget', value: 'budget' }, //change value to call a function
        { text: 'Description', value: 'description' },
        { text: 'Overdraft Allowed', value: 'odFlag' }
      ],
      model: {
        id: '',
        budget: '',
        budgetName: '',
        description: '',
        odFlag: false
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
      this.model = {
        id: item.id,
        budget: item.budget,
        budgetName: item.budgetName,
        description: item.description,
        odFlag: item.odFlag
      };
    },
    clearModel() {
      this.model = {
        id: '',
        budget: '',
        budgetName: '',
        description: '',
        odFlag: false
      };
    }
  }
};
</script>
