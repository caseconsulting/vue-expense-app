<template>
  <v-data-table
    v-model="selected"
    :headers="headers"
    :items="expenses"
    :pagination.sync="pagination"
    select-all
    item-key="name"
    class="elevation-1"
  >
    <template slot="headers" slot-scope="props">
      <tr>
        <th>
          <v-checkbox
            :input-value="props.all"
            :indeterminate="props.indeterminate"
            primary
            hide-details
            @click.native="toggleAll"
          ></v-checkbox>
        </th>
        <th
          v-for="header in props.headers"
          :key="header.text"
          :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
          @click="changeSort(header.value)"
        >
          <v-icon small>arrow_upward</v-icon>
          {{ header.text }}
        </th>
      </tr>
    </template>
    <template slot="items" slot-scope="props">
      <tr :active="props.selected" @click="props.selected = !props.selected">
        <td>
          <v-checkbox
            :input-value="props.selected"
            primary
            hide-details
          ></v-checkbox>
        </td>
        <data-cell :id=props.item.userId APIType="employees"></data-cell>
        <!-- <td class="text-xs-right" v-if="getEmployeeName(props.item)">{{ props.item.userName }}</td> -->
        <!-- <td class="text-xs-right">{{ props.item.expenseTypeId }}</td> -->
        <data-cell :id=props.item.expenseTypeId APIType="expense-types"></data-cell>
        <td class="text-xs-right">{{ props.item.cost }}</td>
        <td class="text-xs-right">{{ props.item.purchaseDate }}</td>
        <td class="text-xs-right">{{ props.item.description }}</td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
import api from '@/shared/api.js';
import DataCell from './DataCell.vue';
export default {
  data: () => ({
    expenses: [],
    pagination: {
      sortBy: 'userId'
    },
    selected: [],
    headers: [
      {
        text: 'User',
        value: 'userId'
      },
      { text: 'Expense Type', value: 'expenseTypeId' }, //change value to call a function
      { text: 'Cost', value: 'cost' },
      { text: 'Purchase Date', value: 'purchaseDate' },
      { text: 'Description', value: 'description' }
    ]
  }),
  async created() {
    this.expenses = await api.getItems(api.EXPENSES);
    console.log(this.expenses);
  },
  watch: {
    expenses: {
      handler: () => {
        console.log('A thing changed');
      },
      deep: true
    }
  },
  components: {
    DataCell
  },
  methods: {
    toggleAll() {
      if (this.selected.length) this.selected = [];
      else this.selected = this.expenses.slice();
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    },
    async getEmployeeName(employee) {
      let employeeName = await api.getItem(api.EMPLOYEES, employee.userId);
      employee.userName = await `${employeeName.firstName} ${
        employeeName.middleName
      } ${employeeName.lastName}`;
    }
  }
};
</script>
<style>
</style>
