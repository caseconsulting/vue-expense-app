<template>
  <v-card v-if="expense" id="expense-info" class="mt-3 mr-3 slide-in-blurred-right">
    <v-card-title primary-title class="subtitle-2">
      <div class="headline expense_info">Expense Info</div>
    </v-card-title>
    <v-card-text>
      <v-container class="pb-2" fluid>
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
        <v-row>
          <attachment :expense="expense" :mode="'adminExpenseInfo'" class="expense_info"></attachment>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import Attachment from '@/components/Attachment.vue';
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
  window.EventBus.$on('expenseClicked', this.displayExpense);
} // created

/**
 * beforeDestroy lifecycle hook
 */
async function beforeDestroy() { 
  window.EventBus.$off('expenseClicked');
} //beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    Attachment
  },
  created,
  beforeDestroy,
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
p {
  color: #38424d;
}

span {
  font-weight: bold;
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
