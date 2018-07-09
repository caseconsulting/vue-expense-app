<template>
  <v-card v-if="expense"raised id="expense-info" class="white--text slide-in-blurred-right ">
    <v-card-title primary-title class="color-change-2x">
      <div class="headline">Expense Info</div>
      <div>
        <p><span>Description:</span> {{ expense.description }}</p>
        <p><span>Employee:</span> {{ expense.employeeName }}</p>
        <p><span>Budget:</span> {{ expense.budgetName }}</p>
        <p><span>Cost:</span> {{ expense.cost }}</p>
        <p><span>Purchased On:</span> {{ expense.purchaseDate }}</p>
        <p><span>Reimbursed On:</span> {{ expense.reimbursedDate}}</p>
      </div>
    </v-card-title>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      expense: undefined
    };
  },
  created() {
    EventBus.$on('clickedExpense', this.displayExepense);
  },
  methods: {
    displayExepense(clickedExpense) {
      this.expense = clickedExpense;
    }
  }
};
</script>
<style>
/* #expense-info {
  background-color: #68caa6;
} */

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
/* @-webkit-keyframes color-change-2x {
  0% {
    background: #19dcea;
  }
  100% {
    background: #b22cff;
  }
}
@keyframes color-change-2x {
  0% {
    background: #19dcea;
  }
  100% {
    background: #b22cff;
  }
} */

/**
 * ----------------------------------------
 * animation color-change-2x
 * ----------------------------------------
 */
@-webkit-keyframes color-change-2x {
  0% {
    background: #02b4cb;
  }
  100% {
    background: #64d48f;
  }
}
@keyframes color-change-2x {
  0% {
    background: #02b4cb;
  }
  100% {
    background: #64d48f;
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
