<template>
  <div>
    <v-card class="slide-in-blurred-right">
      <v-card-title class="subtitle-2">
        <v-flex lg12 class="headline">Reimbursements</v-flex>
        <v-flex lg12>
          <v-btn color="green" text @click="emit('reimburse-button-click')">Reimburse</v-btn>
        </v-flex>
      </v-card-title>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash';
/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    this.$emit(msg);
  } else {
    // data does not exist
    this.$emit(msg);
  }
} // emit

/**
 * Updates selected list and filtered list (doesn't include
 * training and high fives)
 */
function updateSelectedLists(expenses) {
  let list = _.map(expenses, (expense) => {
    if (expense.budgetName == 'Training') {
      if (
        expense.category == 'Meals' ||
        expense.category == 'Travel' ||
        expense.category == 'Transportation' ||
        expense.category == 'Lodging'
      ) {
        let obj = { id: expense.id, expenseObj: expense, showOnFeed: false };
        return obj;
      } else {
        let obj = { id: expense.id, expenseObj: expense, showOnFeed: true };
        return obj;
      }
    } else if (expense.budgetName == 'High Five') {
      let obj = { id: expense.id, expenseObj: expense, showOnFeed: true };
      return obj;
    } else {
      let obj = { id: expense.id, expenseObj: expense, showOnFeed: false };
      return obj;
    }
  });
  this.selectedList = list;
  this.filteredOutSelectedList = _.filter(this.selectedList, (expense) => {
    if (expense.expenseObj['budgetName'] == 'Training' || expense.expenseObj['budgetName'] == 'High Five') {
      return false;
    } else {
      return true;
    }
  });
}

/**
 * Gets list of selected expense IDs to show on the activity feed
 */
function getShowOnFeedList() {
  let showOnFeedList = [];
  for (let i = 0; i < this.selectedList.length; i++) {
    if (this.selectedList[i].showOnFeed) {
      showOnFeedList.push(this.selectedList[i].expenseObj.id);
    }
  }
  return showOnFeedList;
} // getShowOnFeedList

export default {
  prop: ['reimburseExpenses'],
  methods: {
    emit,
    getShowOnFeedList,
    updateSelectedLists
  },
  data() {
    return {
      filteredOutSelectedList: [],
      selectedList: []
    };
  }
};
</script>
