<template>
  <v-card v-if="expense" raised id="expense-info" class="mt-3 mr-3 white--text slide-in-blurred-right followScroll">
    <v-card-title primary-title class="subtitle-2">
      <div class="headline expense_info">Expense Info</div>
      <div class="expense_info">
        <p class="expense_info"><span>Description:</span> {{ expense.description }}</p>
        <p class="expense_info"><span>Employee:</span> {{ expense.employeeName }}</p>
        <p class="expense_info"><span>Budget:</span> {{ expense.budgetName }}</p>
        <p class="expense_info"><span>Cost:</span> {{ convertToMoneyString(expense.cost) }}</p>
        <p class="expense_info"><span>Purchased On:</span> {{ expense.purchaseDate | monthDayYearFormat }}</p>
        <p class="expense_info" v-if="!isEmpty(expense.reimbursedDate)">
          <span>Reimbursed On:</span>
          {{ expense.reimbursedDate | monthDayYearFormat }}
        </p>
        <p class="expense_info" v-if="!isEmpty(expense.note)"><span>Notes:</span> {{ expense.note }}</p>
        <p class="expense_info" v-else><span>Notes:</span> N/A</p>
        <p class="expense_info" v-if="!isEmpty(expense.category)"><span>Category:</span> {{ expense.category }}</p>
        <p class="expense_info" v-else><span>Category:</span> N/A</p>
        <attachment :expense="expense" :mode="'adminExpenseInfo'" class="expense_info"></attachment>
      </div>
    </v-card-title>
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
async function created() {
  window.EventBus.$on('expenseClicked', this.displayExpense);
} // created

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
  data() {
    return {
      expense: undefined // expense info
    };
  },
  methods: {
    convertToMoneyString,
    displayExpense,
    isEmpty
  },
  filters: {
    monthDayYearFormat
  }
};
</script>

<style scoped>
/* .color-change-2x {
  -webkit-animation: color-change-2x 10s linear infinite alternate both;
  animation: color-change-2x 10s linear infinite alternate both;
} */

p {
  color: #38424d;
}

span {
  font-weight: bold;
}

/**
 * ----------------------------------------
 * animation color-change-2x
 * ----------------------------------------
 */

/* @-webkit-keyframes color-change-2x {
  0% {
    background: #83837d;
  }

  100% {
    background: #f5694f;
  }
}

@keyframes color-change-2x {
  0% {
    background: #83837d;
  }

  100% {
    background: #f5694f;
  }
} */

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
