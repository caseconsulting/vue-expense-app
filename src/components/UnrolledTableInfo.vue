<template>
  <v-container fluid style="background: grey;">
    <div>
      <!-- Unreimburse Sub-Datable -->
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
        <!-- Remove check box in header-->
        <template v-slot:header.data-table-select></template>

        <!-- Group Checkbox -->
        <template v-slot:item.data-table-select="{ item }">
          <v-checkbox :input-value="item.selected" primary hide-details class="ma-0"></v-checkbox>
        </template>

        <!-- Rows in datatable -->
        <template v-slot:item="{ item }">
          <tr @click="expenseClicked(item)">
            <!-- Expense Check Box -->
            <td style="width: 1px;" :class="{ failed: item.failed }">
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

            <!-- Cost -->
            <td id="money-team" :class="{ failed: item.failed }">{{ item.cost | moneyValue }}</td>

            <!-- Purchase Date -->
            <td :class="{ failed: item.failed }">{{ item.purchaseDate | dateFormat }}</td>

            <!-- Description -->
            <td :class="{ failed: item.failed }">{{ item.description | descripFormat }}</td>
          </tr>
        </template>
        <!-- End rows in datatable -->
      </v-data-table>
      <!-- End Unreimburse Sub-Datable -->
    </div>
  </v-container>
</template>

<script>
import moment from 'moment';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emit an event to parent that an expense was clicked
 *
 * @param clickedExpense - expense clicked
 */
function expenseClicked(clickedExpense) {
  window.EventBus.$emit('expenseClicked', clickedExpense);
} // expenseClicked

/**
 * Emit an event to parent that an expense was selected.
 *
 * @param selectExpense - selected expense
 */
function expenseSelected(selectedExpense) {
  window.EventBus.$emit('selectExpense', selectedExpense);
} // expenseSelected

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
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
      ],
      sortBy: 'purchaseDate',
      sortDesc: false
    };
  },
  filters: {
    dateFormat: (value) => {
      if (value) {
        // date exists
        return moment(value).format('MMM Do, YYYY');
      } else {
        // date does not exist
        return '';
      }
    },
    descripFormat: (val) => {
      // split strings that exceed 250 characters with eclipses
      return val.length > 250 ? val.substring(0, 250) + '...' : val;
    },
    moneyValue: (value) => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    }
  },
  methods: {
    expenseClicked,
    expenseSelected
  },
  props: ['expenses'] // list of expenses
};
</script>

<style lang="scss">
@import 'src/assets/styles/styles.scss';

.failed {
  background-color: #ffbaba;
}
</style>
