<template>
  <!--Totals Card-->
  <v-card v-if="totals.length" class="slide-in-blurred-right my-3 mr-3">
    <!--Total Card Title-->
    <v-card-title class="pb-0 headline"> Totals </v-card-title>
    <!--End of Total Card Title-->
    <v-card-text>
      <v-container class="pb-0">
        <!--List of Expense Types and Totals-->
        <v-row v-for="total in totals" :key="total.id" dense>
          <v-col class="font-weight-bold">{{ total.name }}: </v-col>
          <v-col> {{ convertToMoneyString(total.costTotal) }}</v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <!--End of Totals Card-->
</template>

<script>
import _ from 'lodash';
import { convertToMoneyString } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sets the total cost per each expense type.
 *
 * @return Array - expense type and each total
 */
function totals() {
  let totals = [];
  totals = _.map(this.selected, (item) => {
    return {
      name: item.budgetName,
      id: item.expenseTypeId,
      costTotal: 0
    };
  });
  totals = _.uniqWith(totals, _.isEqual);
  _.forEach(this.selected, (expense) => {
    _.forEach(totals, (total) => {
      if (total.id === expense.expenseTypeId) {
        total.costTotal += parseFloat(expense.cost);
      }
    });
  });

  return totals;
} // totals

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Update the expense types selected.
 *
 * @param item - expense types being added or removed
 */
function updateSelected(item) {
  if (_.isArray(item)) {
    // item is an array
    if (item.length < this.selected.length) {
      // remove items
      this.selected = _.xor(this.selected, _.xor(item, this.selected));
    } else {
      // add items
      this.selected.push(item);
      this.selected = _.flatten(this.selected);
      this.selected = _.uniqWith(this.selected, _.isEqual);
    }
  } else if (item) {
    // item is not an array
    let indexOfItem = _.indexOf(this.selected, item);
    if (indexOfItem > -1) {
      // remove item
      this.selected.splice(indexOfItem, 1);
    } else {
      // add item
      this.selected.push(item);
    }
  }
} // updateSelected

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Creates event listeners.
 */
function created() {
  this.emitter.on('selectExpense', this.updateSelected);
  this.emitter.on('expenseChange', this.updateSelected);
} // created

/**
 * beforeDestroy lifecycle hook
 */
function beforeDestroy() {
  this.emitter.off('selectExpense');
  this.emitter.off('expenseChange');
} //beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  beforeDestroy,
  computed: {
    totals
  },
  data() {
    return {
      selected: []
    };
  },
  methods: {
    convertToMoneyString,
    updateSelected
  }
};
</script>

<style scoped>
.slide-in-blurred-right {
  animation: slide-in-blurred-right 0.5s ease-in forwards;
}

/**
 * ----------------------------------------
 * animation slide-in-blurred-right
 * ----------------------------------------
 */
@keyframes slide-in-blurred-right {
  0% {
    transform: translateX(1000px) scaleX(2.5) scaleY(0.2);
    transform-origin: 0% 50%;
    filter: blur(40px);
    opacity: 0;
  }

  100% {
    transform: translateX(0) scaleY(1) scaleX(1);
    transform-origin: 50% 50%;
    filter: blur(0);
    opacity: 1;
  }
}
</style>
