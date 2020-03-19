<template>
  <v-container fluid style="background:grey">
    <div>
      <!-- unreimburse sub-datable -->
      <v-data-table
        :headers="headers"
        :items="expenses"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :items-per-page="-1"
        class="text-center"
        item-key="id"
        show-select
        hide-default-footer
      >
        <!-- remove header check box -->
        <template v-slot:header.data-table-select></template>
        <!-- end remove header check box -->
        <!-- checkbox for items -->
        <template v-slot:item.data-table-select="{ item }">
          <v-checkbox :input-value="item.selected" primary hide-details class="ma-0"></v-checkbox>
        </template>
        <!-- end checkbox for items -->
        <!-- rows in datatable -->
        <template v-slot:item="{ item }">
          <tr @click="expenseClicked(item)">
            <!-- checkbox for individual expense -->
            <td style="width: 1px">
              <v-checkbox
                :input-value="item.selected"
                @click.stop="
                  expenseSelected(item);
                  expenseClicked(item);
                "
                primary
                hide-details
                class="ma-0"
              >
              </v-checkbox>
            </td>
            <td id="money-team">{{ item.cost | moneyValue }}</td>
            <td>{{ item.purchaseDate | dateFormat }}</td>
            <td>{{ item.description | descripFormat }}</td>
          </tr>
        </template>
        <!-- end rows in datatable -->
      </v-data-table>
      <!-- end unreimburse sub-datable -->
    </div>
  </v-container>
</template>

<script>
import moment from 'moment';

/* methods */

/*
 * Emit an event to parent that an expense was selected
 */
function expenseSelected(selectedExpense) {
  window.EventBus.$emit('selectExpense', selectedExpense);
}

/*
 * Emit an event to parent that an expense was selected
 */
function expenseClicked(clickedExpense) {
  window.EventBus.$emit('expenseClicked', clickedExpense);
}

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
      sortBy: 'purchaseDate',
      sortDesc: false,
      headers: [
        {
          text: 'Cost',
          value: 'cost',
          align: 'center'
        },
        {
          text: 'Purchase Date',
          value: 'purchaseDate',
          align: 'center'
        },
        {
          text: 'Description',
          value: 'description',
          align: 'center'
        }
      ]
    };
  },
  props: ['expenses'],
  methods: {
    expenseSelected,
    expenseClicked
  }
};
</script>
