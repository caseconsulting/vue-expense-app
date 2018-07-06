<template>
<div>
  <h3>Totals</h3>
  <ul>
    <li v-for="total in totals" :key="total.id">
      <h4>{{total.name}}: {{total.costTotal}}</h4>
    </li>
  </ul>

</div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';

export default {
  data() {
    return {
      selected: [],
      oldPassedItem: null
    };
  },
  created() {
    EventBus.$on('expensePicked', this.updateSelected);
  },
  methods: {
    updateSelected(item) {
      if (_.isArray(item)) {
        if (!this.oldPassedItem) {
          this.oldPassedItem = item;
        }
        if (item.length < this.oldPassedItem.length) { //removed item
          this.selected = _.indexOf(this.selected, _.xor(item, oldPassedItem));
        } else { //first time
          this.selected.push(item);
          this.selected = _.flatten(this.selected);
        }
        let intersection = _.intersection(this.selected, item);

      } else if (item) {
        let indexOfItem = _.indexOf(this.selected, item);
        console.log('index', indexOfItem);
        if (indexOfItem > -1) {
          this.selected.splice(indexOfItem, 1);
        } else {
          this.selected.push(item);
        }
      }
    }
  },
  computed: {
    totals: function() {
      let totals = [];
      totals = _.map(this.selected, (item) => {
        return {
          name: item.budgetName,
          id: item.expenseTypeId,
          costTotal: 0
        }
      });
      totals = _.uniqWith(totals, _.isEqual);
      _.forEach(this.selected, (expense) => {
        _.forEach(totals, (total) => {
          if (total.id === expense.expenseTypeId) {
            total.costTotal += parseInt(expense.cost, 10);
          }
        })
      })

      return totals;
    }
  }
}
</script>
<style></style>
