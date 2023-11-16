<template>
  <v-card v-if="expense" id="reimbursement-expense-details" class="mr-3 my-3 slide-in-blurred-right">
    <v-card-title primary-title class="pb-0 text-h5"> Expense Details </v-card-title>
    <v-card-text>
      <v-container fluid class="px-0 px-md-4 pb-0">
        <v-row dense>
          <v-col> <b>Description:</b></v-col>
          <v-col> {{ expense.description }}</v-col>
        </v-row>
        <v-row dense>
          <v-col> <b>Employee:</b></v-col>
          <v-col>{{ expense.employeeName }}</v-col>
        </v-row>
        <v-row dense>
          <v-col><b>Budget:</b></v-col>
          <v-col>{{ expense.budgetName }}</v-col>
        </v-row>
        <v-row dense>
          <v-col><b>Cost:</b></v-col>
          <v-col>{{ convertToMoneyString(expense.cost) }}</v-col>
        </v-row>
        <v-row dense>
          <v-col><b>Purchased On:</b></v-col>
          <v-col> {{ monthDayYearFormat(expense.purchaseDate) }} </v-col>
        </v-row>
        <v-row dense v-if="!isEmpty(expense.reimbursedDate)">
          <v-col><b>Reimbursed On:</b></v-col>
          <v-col> {{ monthDayYearForm(expense.reimbursedDate) }}</v-col>
        </v-row>
        <v-row dense v-if="!isEmpty(expense.note)">
          <v-col><b>Notes:</b></v-col>
          <v-col> {{ expense.note }}</v-col>
        </v-row>
        <v-row dense v-else>
          <v-col><b>Notes:</b></v-col>
          <v-col>N/A</v-col>
        </v-row>
        <v-row dense v-if="!isEmpty(expense.category)">
          <v-col><b>Category:</b></v-col>
          <v-col> {{ expense.category }}</v-col>
        </v-row>
        <v-row dense v-else>
          <v-col><b>Category:</b></v-col>
          <v-col>N/A</v-col>
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
} // created

/**
 * beforeDestroy lifecycle hook
 */
function beforeDestroy() {
  this.emitter.off('expenseClicked');
} //beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  beforeDestroy,
  components: {
    Attachment
  },
  data() {
    return {
      expense: undefined // expense info
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
