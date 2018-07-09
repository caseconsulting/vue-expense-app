<template>
<div>
  <v-card>
    <v-card-title>
      <v-flex lg12 class="headline">Totals</v-flex>

      <v-flex lg12>
        <p v-for="total in totals" :key="total.id">
          <span>{{total.name}}:</span> {{total.costTotal}}
        </p>
      </v-flex>
      <!-- <ul>
        <p v-for="total in totals" :key="total.id">
          <h4>{{total.name}}: {{total.costTotal}}</h4>
        </p>
      </ul> -->
    </v-card-title>

  </v-card>
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


        if (item.length < this.selected.length) { //removed item
          this.selected = _.xor(this.selected, _.xor(item, this.selected));
        } else { //first time
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
