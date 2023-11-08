<template>
  <v-container fluid class="grey-background pa-3">
    <div>
      <v-data-table
        :headers="headers"
        :items="expenses"
        :sort-by.sync="sortBy"
        :items-per-page="-1"
        class="text-center"
        item-key="id"
        id="subInfo"
        select-strategy="single"
        density="compact"
        show-select
        @click:row="expenseClicked"
      >
        <!-- Group Checkbox -->
        <template v-slot:[`item.data-table-select`]="{ item }">
          <v-checkbox
            :model-value="item.selected"
            @click.stop="
              expenseSelected(item);
              expenseClicked(_, { item });
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
            {{ descriptionFormat(item.description) }}
          </p>
        </template>

        <!-- Show on Feed -->
        <template v-slot:[`item.showOnFeed`]="{ item }">
          <v-switch
            :model-value="item.showOnFeed && item.selected"
            @update:model-value="expenseToggle(item)"
            :disabled="!item.selected"
            class="d-inline-block"
            hide-details
            :color="caseGray"
          ></v-switch>
        </template>

        <template v-slot:bottom></template>
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
function expenseClicked(_, { item }) {
  this.emitter.emit('expenseClicked', item);
} // expenseClicked

/**
 * Emit an event to parent that an expense was selected.
 *
 * @param selectExpense - selected expense
 */
function expenseSelected(selectedExpense) {
  this.emitter.emit('selectExpense', selectedExpense);
} // expenseSelected

/**
 * Emit an event to parent that an expense was toggled.
 *
 * @param toggledExpense - expense toggled
 */
function expenseToggle(toggledExpense) {
  this.emitter.emit('toggleExpense', toggledExpense);
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
          title: 'Cost',
          key: 'cost',
          align: 'center'
        },
        {
          title: 'Purchase Date',
          key: 'purchaseDate',
          align: 'center'
        },
        {
          title: 'Description',
          key: 'description',
          align: 'center'
        },
        {
          title: 'Show on Feed',
          key: 'showOnFeed',
          align: 'center',
          width: '10%',
          sortable: false
        }
      ], // data table headers
      sortBy: [{ key: 'purchaseDate' }], // sort data table by
      sortDesc: false // sort data table in descending order
    };
  },
  methods: {
    convertToMoneyString,
    descriptionFormat,
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
