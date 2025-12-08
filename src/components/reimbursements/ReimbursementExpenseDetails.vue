<template>
  <v-card
    v-if="expense"
    max-height="300"
    id="reimbursement-expense-details"
    class="details mr-3 my-3 slide-in-blurred-right"
  >
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
        <v-dialog v-model="showExchangeCalculator" :width="isMobile() ? '100%' : '50%'" persistent>
          <ExchangeTrainingHoursCalculatorReverse :cost="expense.cost" />
        </v-dialog>
        <v-row dense v-if="isExchangeForTrainingHours">
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
        <v-row dense v-if="!isEmpty(expense?.rejections?.softRejections)">
          <v-col cols="5" class="text-red"><b>{{ getRevisalsTitle(expense) }}</b></v-col>
          <v-col cols="7" class="revisal-reason">
            <div v-if="!isEmpty(expense?.rejections?.softRejections)">
              <div v-for="(reason, i) in expense.rejections.softRejections.reasons" :key="reason">
                <b>{{ getReasonIntro(reason, i) }}: </b>{{ reason }}
              </div>
              <div>
                <b>Revised: </b>
                {{ expense.rejections.softRejections.revised ? 'Yes' : 'No' }}
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row dense>
          <attachment v-if="expense.receipt" :expense="expense" icon="mdi-cloud-download"></attachment>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup>
import Attachment from '@/components/utils/Attachment.vue';
import { isMobile, isEmpty, convertToMoneyString, monthDayYearFormat } from '@/utils/utils';
import ExchangeTrainingHoursCalculatorReverse from '@/components/expenses/ExchangeTrainingHoursCalculatorReverse.vue';
import { ref, onBeforeMount, onBeforeUnmount, inject, computed } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const expense = ref(undefined); // expense info
const showExchangeCalculator = ref(false);

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
  if (expense.value == clickedExpense) {
    expense.value = undefined;
  } else {
    expense.value = clickedExpense;
  }
} // displayExpense

/**
 * Gets reason text formatted with date if available
 */
function getReasonIntro(reason, index) {
  let text = `Reason ${index + 1}`;
  if (reason.date) text += `, ${monthDayYearFormat(reason.date)}`;
  return text;
}

/**
 * Gets number of revisal requests for an expense
 */
function getRevisalsTitle(expense) {
  let length = expense.rejections.softRejections.reasons.length;
  return `$Revisal${length === 1 ? '' : 's'} (${length}):`
}

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Creates event listeners.
 */
onBeforeMount(() => {
  emitter.on('expenseClicked', displayExpense);
  emitter.on('close-exchange-training-hours-calculator-reverse', () => {
    showExchangeCalculator.value = false;
  });
  emitter.on('insert-training-hours-cost', () => {
    showExchangeCalculator.value = false;
  });
}); // created

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('expenseClicked');
  emitter.off('close-exchange-training-hours-calculator-reverse');
}); //beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

computed(isMobile);

/**
 * Returns true if the category is exchange for training hours
 */
const isExchangeForTrainingHours = computed(() => {
  return expense.value?.category?.toLowerCase() === 'exchange for training hours';
}); // isExchangeForTrainingHours
</script>

<style scoped>
.notes {
  height: 125px;
  max-height: 125px;
  overflow-y: auto;
}

.revisal-reason {
  height: 100px;
  max-height: 100px;
  overflow-y: auto;
}

.details {
  height: 300px;
  max-height: 300px;
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
