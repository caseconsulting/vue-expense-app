<template>
  <v-container fluid class="grey-background pa-3 px-0 px-md-3">
    <div>
      <v-data-table
        :headers="headers"
        :items="expenses"
        :v-model="sortBy"
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

<script setup>
import { convertToMoneyString, monthDayYearFormat } from '@/utils/utils';
import { nicknameAndLastName } from '@/shared/employeeUtils';
import { ref, inject } from 'vue';
import store from '../../../store';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
defineProps(['expenses']); // list of expenses
const headers = ref([
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
    title: 'Approved By',
    key: 'approvedBy',
    value: (e) => getName(e.approvedBy),
    align: 'center',
    width: '10%',
    sortable: true
  },
  {
    title: 'Show on Feed',
    key: 'showOnFeed',
    align: 'center',
    width: '10%',
    sortable: false
  }
]); // data table headers
const sortBy = ref([{ key: 'purchaseDate' }]); // sort data table by

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
  emitter.emit('expenseClicked', item);
} // expenseClicked

/**
 * Emit an event to parent that an expense was selected.
 *
 * @param selectExpense - selected expense
 */
function expenseSelected(selectedExpense) {
  emitter.emit('selectExpense', selectedExpense);
} // expenseSelected

/**
 * Emit an event to parent that an expense was toggled.
 *
 * @param toggledExpense - expense toggled
 */
function expenseToggle(toggledExpense) {
  emitter.emit('toggleExpense', toggledExpense);
} // expenseToggle

/**
 * Gets the name of an employee based on their ID
 *
 * @param eId employee ID
 */
function getName(eId) {
  if (!eId) return; // no approvedBy
  let employee = store.getters.employees.find((e) => e.id == eId);
  return nicknameAndLastName(employee);
}

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
</script>

<style lang="scss" scoped>
.failed {
  background-color: #ffbaba;
}
</style>
