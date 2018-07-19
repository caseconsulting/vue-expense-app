<template>
  <div id="expense-table">
    <v-data-table :loading="newLoad" :headers="headers" :items="processedExpenses" :search="search" :pagination.sync="pagination" class="elevation-1">
      <v-progress-linear slot="progress" color="radioactive" indeterminate></v-progress-linear>
      <template slot="headers" slot-scope="props">
        <tr>
          <th class="text-xs-left"
            v-for="header in props.headers"
            :key="header.text"
            :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
            @click="changeSort(header.value)"
          >
            {{ header.text }}
            <v-icon small>arrow_upward</v-icon>
          </th>
        </tr>
      </template>
      <template slot="items" slot-scope="props">
        <expense-row :expense="props.item" :loading="newLoad" @select-expense="selectExpense"></expense-row>
      </template>
      <v-alert slot="no-results" :value="true" color="error" icon="warning">
        Your search for "{{ search }}" found no results.
      </v-alert>
    </v-data-table>
  </div>
</template>
<script>
  import ExpenseRow from './ExpenseRow.vue';

  export default {
    props: ['loading', 'processedExpenses', 'search'],
    data() {
      return {
        headers: [
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
            value: 'defaultComparable'
          },
          {
            text: 'Reimburse Date',
            value: 'reimbursedDate'
          },
          {
            text: 'Description',
            value: 'description'
          }
        ],
        pagination: {
          sortBy: 'defaultComparable',
          descending: true,
          rowsPerPage: 15
        }
      };
    },
    methods: {
      changeSort(column) {
        if (this.pagination.sortBy === column) {
          this.pagination.descending = !this.pagination.descending;
        } else {
          this.pagination.sortBy = column;
          this.pagination.descending = false;
        }
      },
      selectExpense(item) {
        this.$emit('select-expense', item);
      }

    },
    components: {
      ExpenseRow
    },
    computed: {
      newLoad() {
        return this.loading;
      }
    }
  };

</script>
