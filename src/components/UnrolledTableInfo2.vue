<template>
  <v-container fluid style="background:grey">
    <div>
      <!-- unreimburse sub-datable -->
      <v-data-table
        hide-actions
        v-model="selected"
        :headers="headers"
        :items="expenses"
        :pagination.sync="pagination"
        select-all
        item-key="id"
      >
        <!-- header for sub-datatable -->

        <template v-slot:headers="props">
          <tr>
            <th>
              <!-- <v-checkbox
                :input-value="props.all"
                :indeterminate="props.indeterminate"
                primary
                hide-details
              ></v-checkbox> -->
            </th>
            <th
              v-for="header in props.headers"
              :key="header.text"
              :class="[
                'column sortable',
                pagination.descending ? 'desc' : 'asc',
                header.value === pagination.sortBy ? 'active' : ''
              ]"
              @click="changeSort(header.value)"
            >
              <v-icon small>arrow_upward</v-icon>
              {{ header.text }}
            </th>
          </tr>
        </template>
        <!-- end header for sub-datatable -->

        <!-- rows in sub-datatable -->
        <template v-slot:items="props">
          <tr :active="props.selected" @click="props.selected = !props.selected">
            <!-- checkbox for individual expense -->
            <td>
              <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>
            </td>
            <td class="text-xs-center">{{ props.item.cost | moneyValue }}</td>
            <td class="text-xs-center">{{ props.item.purchaseDate | dateFormat }}</td>
            <td class="text-xs-center">{{ props.item.description | descripFormat }}</td>
          </tr>
        </template>
        <!-- end rows in sub-datatable -->
      </v-data-table>
      <!-- end unreimburse sub-datable -->
    </div>
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
  data() {
    return {
      pagination: {
        sortBy: 'cost'
      },
      loadedChecks: false,
      numExpenses: 0,
      selected: [],
      checkBox: { indeterminate: false, all: false },
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
      ]
    };
  },
  props: ['expenses', 'budgetId', 'headBox', 'savedChecked'],
  methods: {
    toggleAll() {
      if (!this.headBox.all && !this.headBox.indeterminate) {
        this.selected = [];

        // this.selected.forEach(e => {
        //   window.EventBus.$emit('expensePicked', e);
        // });
        // this.selected = [];
      } else if (this.headBox.all) {
        this.selected = this.expenses.slice();
        // let notIn = _.differenceWith(this.expenses, this.selected);
        // notIn.forEach(e => {
        //   window.EventBus.$emit('expensePicked', e);
        // });
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
  },
  watch: {
    'headBox.all': function() {
      this.toggleAll();
    },
    selected: function(newSelect, oldSelect) {
      if (this.loadedChecks) {
        if (this.numExpenses === this.expenses.length) {
          this.checkBox.all = this.selected.length === this.expenses.length;
          this.checkBox.indeterminate = !this.checkBox.all && this.selected.length > 0;
          window.EventBus.$emit('allCheckBoxChange', this.checkBox);

          if (newSelect.length > oldSelect.length) {
            let notIn = _.differenceWith(newSelect, oldSelect);
            notIn.forEach(e => {
              window.EventBus.$emit('expensePicked', e);
            });
          } else {
            let notIn = _.differenceWith(oldSelect, newSelect);
            notIn.forEach(e => {
              window.EventBus.$emit('expensePicked', e);
            });
          }
        }
      } else {
        this.loadedChecks = true;
      }
      this.numExpenses = this.expenses.length;
    }
  },
  created() {
    this.checkBox.b_id = this.budgetId;
    let shared = _.intersection(this.savedChecked, this.expenses);
    this.selected = shared;
    this.numExpenses = this.expenses.length;
  }
};
</script>
