<template>
  <v-card v-if="expense" id="reimbursement-expense-details" class="mr-3 my-3 slide-in-blurred-right">
    <v-card-title primary-title class="pb-0 text-h5"> Expense Details </v-card-title>
    <v-card-text>
      <v-container fluid class="px-0 px-md-2 pb-0">
        <v-row dense>
          <v-col cols="5"> <b>Description:</b></v-col>
          <v-col cols="7"> {{ expense.description }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="5"> <b>Employee:</b></v-col>
          <v-col cols="7">{{ expense.employeeName }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="5"><b>Budget:</b></v-col>
          <v-col cols="7">{{ expense.budgetName }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="5"><b>Cost:</b></v-col>
          <v-col cols="7">{{ convertToMoneyString(expense.cost) }}</v-col>
        </v-row>
        <v-dialog v-model="showExchangeCalculator" :width="isMobile ? '100%' : '50%'" persistent>
          <ExchangeTrainingHoursCalculatorReverse :cost="expense.cost" />
        </v-dialog>
        <v-row dense v-if="expense.category === 'Exchange for training hours'">
          <v-col cols="5"><b>Hours exchange:</b></v-col>
          <v-col cols="7"
            ><a class="text-blue-darken-2 pointer" @click.stop="showExchangeCalculator = true">Calculate</a></v-col
          >
        </v-row>
        <v-row dense>
          <v-col cols="5"><b>Purchased On:</b></v-col>
          <v-col cols="7"> {{ monthDayYearFormat(expense.purchaseDate) }} </v-col>
        </v-row>
        <v-row dense v-if="!isEmpty(expense.reimbursedDate)">
          <v-col cols="5"><b>Reimbursed On:</b></v-col>
          <v-col cols="7"> {{ monthDayYearForm(expense.reimbursedDate) }}</v-col>
        </v-row>
        <v-row dense v-if="!isEmpty(expense.note)">
          <v-col cols="5"><b>Notes:</b></v-col>
          <v-col cols="7" class="notes"> {{ expense.note }}</v-col>
        </v-row>
        <v-row dense v-else>
          <v-col cols="5"><b>Notes:</b></v-col>
          <v-col cols="7">N/A</v-col>
        </v-row>
        <v-row dense v-if="!isEmpty(expense.category)">
          <v-col cols="5"><b>Category:</b></v-col>
          <v-col cols="7"> {{ expense.category }}</v-col>
        </v-row>
        <v-row dense v-else>
          <v-col cols="5"><b>Category:</b></v-col>
          <v-col cols="7">N/A</v-col>
        </v-row>
        <v-row dense>
          <attachment :expense="expense" :mode="'adminExpenseInfo'"></attachment>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import Attachment from '@/components/utils/Attachment.vue';
import ExchangeTrainingHoursCalculatorReverse from '@/components/expenses/ExchangeTrainingHoursCalculatorReverse.vue';
import { isEmpty, convertToMoneyString, monthDayYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sets the expense to display the info for.
 *
 * @param clickedExpense - Expense to show info for
 */
function displayExpense(clickedExpense) {
  if (this.expense == clickedExpense) {
    this.expense = undefined;
  } else {
    this.expense = clickedExpense;
  }
} // displayExpense

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Creates event listeners.
 */
function created() {
  this.emitter.on('expenseClicked', this.displayExpense);
  this.emitter.on('close-exchange-training-hours-calculator-reverse', () => {
    this.showExchangeCalculator = false;
  });
  this.emitter.on('insert-training-hours-cost', () => {
    this.showExchangeCalculator = false;
  });
} // created

/**
 * beforeUnmount lifecycle hook
 */
function beforeUnmount() {
  this.emitter.off('expenseClicked');
  this.emitter.off('close-exchange-training-hours-calculator-reverse');
} //beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  beforeUnmount,
  components: {
    Attachment,
    ExchangeTrainingHoursCalculatorReverse
  },
  data() {
    return {
      expense: undefined, // expense info
      showExchangeCalculator: false
    };
  },
  methods: {
    convertToMoneyString,
    displayExpense,
    isEmpty,
    monthDayYearFormat
  }
};
</script>

<style scoped>
.notes {
  height: 125px;
  max-height: 125px;
  overflow-y: auto;
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
