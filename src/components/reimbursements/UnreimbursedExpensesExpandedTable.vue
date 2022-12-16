<template>
  <v-container fluid class="grey-background">
    <div>
      <v-data-table
        :headers="headers"
        :items="expenses"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :items-per-page="-1"
        class="text-center"
        item-key="id"
        id="subInfo"
        show-select
        hide-default-footer
        @click:row="expenseClicked"
      >
        <!-- Remove Check Box in header -->
        <template v-slot:[`header.data-table-select`]="{}"></template>

        <!-- Group Checkbox -->
        <template v-slot:[`item.data-table-select`]="{ item }">
          <v-checkbox
            :input-value="item.selected"
            @click.stop="
              expenseSelected(item);
              expenseClicked(item);
            "
            primary
            hide-details
            class="ma-0"
          ></v-checkbox>
        </template>

        <!-- Item cost -->
        <template v-slot:[`item.cost`]="{ item }">
          <p id="money-team" :class="{ failed: item.failed }" class="mb-0">
            {{ convertToMoneyString(item.cost) }}
          </p>
        </template>

        <!-- Purchase Date -->
        <template v-slot:[`item.purchaseDate`]="{ item }">
          <p id="purchaseDate-team" :class="{ failed: item.failed }" class="mb-0">
            {{ monthDayYearFormat(item.purchaseDate) }}
          </p>
        </template>

        <!-- Description -->
        <template v-slot:[`item.description`]="{ item }">
          <p id="description-team" :class="{ failed: item.failed }" class="mb-0">
            {{ item.description | descriptionFormat }}
          </p>
        </template>

        <!-- Show on Feed -->
        <template v-slot:[`item.showOnFeed`]="{ item }">
          <v-switch
            :input-value="item.showOnFeed && item.selected"
            @change="expenseToggle(item)"
            :disabled="!item.selected"
          ></v-switch>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script>
import { convertToMoneyString, monthDayYearFormat } from '@/utils/utils';

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

/**
 * Emit an event to parent that an expense was toggled.
 *
 * @param toggledExpense - expense toggled
 */
function expenseToggle(toggledExpense) {
  window.EventBus.$emit('toggleExpense', toggledExpense);
} // expenseToggle

// |--------------------------------------------------|
// |                                                  |
// |                     FILTERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * filter for descriptionFormat - cuts down on length
 *
 * @param val - value to filter
 * @return string - shortened value
 */
function descriptionFormat(val) {
  // split strings that exceed 250 characters with eclipses
  return val && val.length > 250 ? val.substring(0, 250) + '...' : val;
} // descriptionFormat

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
        },
        {
          text: 'Show on Feed',
          value: 'showOnFeed',
          align: 'center',
          width: '4px',
          sortable: false
        }
      ], // data table headers
      sortBy: 'purchaseDate', // sort data table by
      sortDesc: false // sort data table in descending order
    };
  },
  filters: {
    descriptionFormat
  },
  methods: {
    convertToMoneyString,
    expenseClicked,
    expenseSelected,
    expenseToggle,
    monthDayYearFormat
  },
  props: ['expenses'] // list of expenses
};
</script>

<style lang="scss" scoped>
.failed {
  background-color: #ffbaba;
}
</style>