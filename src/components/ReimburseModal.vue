<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Are you sure you want to reimburse the following expense(s)?</v-card-title>
        <v-card-actions>
          <v-container>
            <v-layout row>
              <v-spacer></v-spacer>
              <v-btn color="info" text @click.native="emit(`canceled-reimburse`)">No</v-btn>
              <v-spacer></v-spacer>
              <v-btn color="green" text @click.native="emit(`confirm-reimburse`, getShowOnFeedList())">Reimburse</v-btn>
              <v-spacer></v-spacer>
              <v-flex px-4 pt-3>
                <v-card flat>Do you want to add the following expense(s) to the activity fee?</v-card>
              </v-flex>
              <v-flex px-4>
                <v-switch
                  v-if="filteredOutSelectedList.length == 1"
                  :label="filteredOutSelectedList[0].expenseObj.description"
                  v-model="filteredOutSelectedList[0].showOnFeed"
                ></v-switch>
                <div v-else>
                  <v-switch
                    v-for="(expense, i) in filteredOutSelectedList"
                    v-bind:key="i"
                    :label="expense.expenseObj.description"
                    v-model="expense.showOnFeed"
                  ></v-switch>
                </div>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import _ from 'lodash';

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
    this.$emit(msg, data);
  } else {
    // data does not exist
    window.EventBus.$emit(msg);
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

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  props: ['activate', 'selectedReimbursements'], // dialog activator
  methods: {
    emit,
    updateSelectedLists,
    getShowOnFeedList
  },
  data() {
    return {
      filteredOutSelectedList: [],
      selectedList: []
    };
  },
  watch: {
    selectedReimbursements: function () {
      this.updateSelectedLists(this.selectedReimbursements);
    }
  }
};
</script>
