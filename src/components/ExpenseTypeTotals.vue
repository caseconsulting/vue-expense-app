<template>
  <div>
    <v-card v-if="totals.length" class="slide-in-blurred-right">
      <v-card-title class="header_style">
        <h4>Reimbursements Info</h4>
      </v-card-title>
      <v-card-text class="pt-5 pb-0 black--text">
        <v-card-title class="headline">Confirm Reimbursement(s): </v-card-title>
        <v-spacer></v-spacer>
        <v-flex lg12>
          <v-btn class="ma-2" outlined color="success" @click="emit('confirm-reimburse')">Reimburse</v-btn>
        </v-flex>

        <v-divider></v-divider>

        <v-card-title class="subtitle-2">
          <v-flex lg12 class="headline">Totals:</v-flex>
          <v-flex lg12>
            <p v-for="total in totals" :key="total.id">
              <span>{{ total.name }}:</span> {{ total.costTotal | moneyValue }}
            </p>
          </v-flex>
        </v-card-title>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash';

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
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    window.EventBus.$emit(msg);
  } else {
    // data does not exist
    window.EventBus.$emit(msg);
  }
} // emit
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
async function created() {
  window.EventBus.$on('selectExpense', this.updateSelected);
  window.EventBus.$on('expenseChange', this.updateSelected);
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    totals
  },
  created,
  data() {
    return {
      selected: []
    };
  },
  filters: {
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
    updateSelected,
    emit
  }
};
</script>

<style>
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
