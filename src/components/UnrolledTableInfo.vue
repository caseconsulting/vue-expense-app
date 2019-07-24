<template>
  <v-container fluid style="background:grey">
    <!-- unreimburse sub-datable -->
    <v-data-table hide-actions v-model="selected" :headers="headers" :items="expenses" select-all item-key="id">
      <!-- header for sub-datatable -->
      <template slot="headers" slot-scope="props">
        <tr>
          <th>
            <v-flex md2 class="text-xs-center">
              select
            </v-flex>
          </th>
          <th
            v-for="header in props.headers"
            :key="header.text"
            :class="['column sortable']"
            @click="changeSort(header.value)"
          >
            <v-icon small>arrow_upward</v-icon>
            {{ header.text }}
          </th>
        </tr>
      </template>
      <!-- end header for sub-datatable -->

      <!-- rows in sub-datatable -->
      <template slot="items" slot-scope="props">
        <tr
          v-if="!props.item.reimbursedDate"
          :active="props.item.selected"
          @click="
            props.selected = !props.selected;
            expenseClicked(props.item);
          "
        >
          <!-- checkbox for individual expense -->
          <td>
            <v-checkbox
              @change="theyPickedMe(props.item)"
              v-model="props.item.selected"
              primary
              hide-details
            ></v-checkbox>
          </td>

          <td class="text-xs-center">{{ props.item.cost | moneyValue }}</td>
          <td class="text-xs-center">{{ props.item.purchaseDate | dateFormat }}</td>
          <td class="text-xs-center">{{ props.item.description | descripFormat }}</td>
        </tr>
      </template>
      <!-- end rows in sub-datatable -->
    </v-data-table>
    <!-- end unreimburse sub-datable -->
  </v-container>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
export default {
  filters: {
    moneyValue: value => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    },
    dateFormat: value => {
      if (value) {
        return moment(value).format('MMM Do, YYYY');
      } else {
        return '';
      }
    },
    descripFormat: val => {
      return val.length > 250 ? val.substring(0, 250) + '...' : val;
    }
  },
  props: ['expenses', 'allSelected'],
  data: () => ({
    pagination: {
      sortBy: 'cost'
    },
    headers: [
      {
        text: 'Cost',
        value: 'cost'
      },
      {
        text: 'Purchase Date',
        value: 'purchaseDate'
      },
      {
        text: 'Description',
        value: 'description'
      }
    ],
    selected: []
  }),
  beforeUpdate() {
    this.checkAllSelected();
  },
  created() {
    if (this.allSelected) {
      this.selected = this.expenses;
    }
  },
  methods: {
    expenseClicked(clickedExpense) {
      window.EventBus.$emit('clickedExpense', clickedExpense);
    },
    theyPickedMe(item) {
      window.EventBus.$emit('expensePicked', item);
    },
    checkAllSelected() {
      let nonSelected = _.filter(this.expenses, expense => {
        if (expense.selected === false) {
          return true;
        } else {
          return false;
        }
      });
      if (nonSelected.length > 0) {
        this.$emit('changedAllSelected', false);
      } else {
        this.$emit('changedAllSelected', true);
      }
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
