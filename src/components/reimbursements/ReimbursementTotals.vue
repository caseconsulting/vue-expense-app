<template>
  <!--Totals Card-->
  <v-card v-if="totals.length" class="slide-in-blurred-right my-3 mr-3">
    <!--Total Card Title-->
    <v-card-title class="pb-0 text-h5"> Totals </v-card-title>
    <!--End of Total Card Title-->
    <v-card-text>
      <v-container class="pb-0 px-0 px-md-4">
        <!--List of Expense Types and Totals-->
        <v-row v-for="total in totals" :key="total.id" dense>
          <v-col class="font-weight-bold">{{ total.name }}: </v-col>
          <v-col> {{ convertToMoneyString(total.costTotal) }}</v-col>
        </v-row>
      </v-container>
      <!-- Generate gift card checkbox -->
      <v-checkbox
        v-if="totals && totals.find((t) => t.name === 'High Five')"
        v-model="isGeneratingGiftCard"
        label="Generate Amazon Gift Card(s)"
        :color="caseGray"
        density="comfortable"
        hide-details
      >
        <template v-slot:label="{ label }">
          <span class="checkbox-label">{{ label }}</span>
        </template>
      </v-checkbox>
      <v-row class="mt-5">
        <v-col cols="12" lg="8" class="px-2">
          <!-- Reimburse Button -->
          <v-btn
            @click="emitter.emit('reimburse-expenses', isGeneratingGiftCard)"
            class="reimburse_button"
            variant="text"
            block
          >
            <template v-slot:prepend><v-icon>mdi-currency-usd</v-icon></template>
            Reimburse
          </v-btn>
        </v-col>
        <v-col cols="12" lg="4" class="px-2">
          <!-- Revise Button -->
          <v-btn @click="toggleExpenseRejectionModal = true" class="reimburse_button" variant="text" block>
            <template v-slot:prepend><v-icon>mdi-receipt-text-remove</v-icon></template>
            Reject
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <v-dialog v-model="toggleExpenseRejectionModal" persistent width="35%">
      <expense-rejection-modal :expenses="selected"></expense-rejection-modal>
    </v-dialog>
  </v-card>
  <!--End of Totals Card-->
</template>

<script>
import _ from 'lodash';
import { convertToMoneyString } from '@/utils/utils';
import ExpenseRejectionModal from '@/components/modals/ExpenseRejectionModal.vue';

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
  this.emitter.on('close-expenses-rejection', () => (this.toggleExpenseRejectionModal = false));
} // created

/**
 * beforeUnmount lifecycle hook
 */
function beforeUnmount() {
  this.emitter.off('selectExpense');
  this.emitter.off('expenseChange');
  this.emitter.off('close-expenses-rejection');
} //beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    ExpenseRejectionModal
  },
  created,
  beforeUnmount,
  computed: {
    totals
  },
  data() {
    return {
      isGeneratingGiftCard: true,
      selected: [],
      toggleExpenseRejectionModal: false,
      reimbursing: false
    };
  },
  methods: {
    convertToMoneyString,
    updateSelected
  }
};
</script>

<style scoped>
.checkbox-label {
  font-size: 14px !important;
  font-weight: bold !important;
  color: black !important;
}
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
