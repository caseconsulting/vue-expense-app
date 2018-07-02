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
  props: ['selected'],
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
