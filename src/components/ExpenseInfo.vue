<template>
  <v-card v-if="expense" raised id="expense-info" class="white--text slide-in-blurred-right">
    <v-card-title primary-title class="subtitle-2 color-change-2x">
      <v-flex lg12 class="headline expense_info_title">Expense Info</v-flex>
      <v-flex lg12 class="expense_info">
        <p class="expense_info"><span>Description:</span> {{ expense.description }}</p>
        <p class="expense_info"><span>Employee:</span> {{ expense.employeeName }}</p>
        <p class="expense_info"><span>Budget:</span> {{ expense.budgetName }}</p>
        <p class="expense_info"><span>Cost:</span> {{ expense.cost | moneyValue }}</p>
        <p class="expense_info"><span>Purchased On:</span> {{ expense.purchaseDate | dateFormat }}</p>
        <p class="expense_info" v-if="!isEmpty(expense.reimbursedDate)">
          <span>Reimbursed On:</span>
          {{ expense.reimbursedDate | dateFormat }}
        </p>
        <p class="expense_info" v-if="!isEmpty(expense.note)"><span>Notes:</span> {{ expense.note }}</p>
        <attachment :expense="expense" :mode="'adminExpenseInfo'" class="expense_info"></attachment>
      </v-flex>
    </v-card-title>
  </v-card>
</template>

<script>
import moment from 'moment';
import Attachment from './Attachment.vue';

function isReimbursed(reimburseDate) {
  return reimburseDate && reimburseDate.trim().length > 0;
}

function isEmpty(item) {
  return !item || item.trim().length <= 0;
}

function displayExpense(clickedExpense) {
  if (this.expense == clickedExpense) {
    this.expense = undefined;
  } else {
    this.expense = clickedExpense;
  }
}

export default {
  components: {
    Attachment
  },
  data() {
    return {
      expense: undefined
    };
  },
  created() {
    window.EventBus.$on('expenseClicked', this.displayExpense);
  },
  methods: {
    displayExpense,
    isReimbursed,
    isEmpty
  },
  filters: {
    moneyValue: (value) => {
      return `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)}`;
    },
    dateFormat: (value) => {
      if (isReimbursed(value)) {
        return moment(value).format('MMM Do, YYYY');
      } else {
        return '';
      }
    }
  }
};
</script>
<style>
p {
  color: #38424d;
}

span {
  font-weight: bold;
}

.color-change-2x {
  -webkit-animation: color-change-2x 10s linear infinite alternate both;
  animation: color-change-2x 10s linear infinite alternate both;
}

/**
 * ----------------------------------------
 * animation color-change-2x
 * ----------------------------------------
 */

@-webkit-keyframes color-change-2x {
  0% {
    /* background: #819ca9; */
    background: #83837d;
  }

  100% {
    /* background: #bdbdbd; */
    background: #f5694f;
  }
}

@keyframes color-change-2x {
  0% {
    /* background: #819ca9; */
    background: #83837d;
  }

  100% {
    /* background: #bdbdbd; */
    background: #f5694f;
  }
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
