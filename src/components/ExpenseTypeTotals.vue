<template>
  <div>
    <v-card v-if="totals.length" class="slide-in-blurred-right">
      <v-card-title class="subtitle-2">
        <v-flex lg12 class="headline">Totals</v-flex>
        <v-flex lg12>
          <p v-for="total in totals" :key="total.id">
            <span>{{ total.name }}:</span> {{ total.costTotal | moneyValue }}
          </p>
        </v-flex>
      </v-card-title>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash';

/* methods */

function updateSelected(item) {
  if (_.isArray(item)) {
    if (item.length < this.selected.length) {
      //removed item
      this.selected = _.xor(this.selected, _.xor(item, this.selected));
    } else {
      //first time
      this.selected.push(item);
      this.selected = _.flatten(this.selected);
      this.selected = _.uniqWith(this.selected, _.isEqual);
    }
    this.oldPassedItem = item;
  } else if (item) {
    let indexOfItem = _.indexOf(this.selected, item);
    if (indexOfItem > -1) {
      this.selected.splice(indexOfItem, 1);
    } else {
      this.selected.push(item);
    }
  }
}

/* LIFECYCLE HOOKS */

async function created() {
  window.EventBus.$on('selectExpense', this.updateSelected);
  window.EventBus.$on('expenseChange', this.updateSelected);
}

export default {
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
  data() {
    return {
      //test
      selected: [],
      oldPassedItem: null
    };
  },
  created,
  methods: {
    updateSelected
  },
  computed: {
    totals: function () {
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
    }
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
