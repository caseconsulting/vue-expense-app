<!-- Confirmation box should only be displayed if the expense exceeds the available budget remaining -->
<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="330">
      <v-card>
        <v-card-text v-if="isCovered" class="font-weight-medium text-h6"
          >You've reached the budget limit for this expense type
        </v-card-text>
        <v-card-text v-else class="font-weight-medium text-h6">
          You've reached the overdraft limit for this expense type
        </v-card-text>
        <v-card-text>
          <!-- Overdraft Allowed start above overdraft and not going over overdraft limit -->
          <p v-if="isOverCovered">
            You are already above the initial budget of {{ convertToMoneyString(expenseRef.budget) }}. However you are
            still within the overdraft limit of {{ convertToMoneyString(expenseRef.budget * 2) }}. You will be
            reimbursed but will be charged next year for an additional {{ convertToMoneyString(expenseRef.cost) }}.
          </p>
          <!-- Overdraft Allowed and Going over initial budget-->
          <p v-else-if="expenseRef.od && isCovered">
            The expense type you are about to submit is covered up to {{ convertToMoneyString(expenseRef.budget) }} but
            allows overdraft. You will be reimbursed but will be charged the following year for
            {{ convertToMoneyString(expenseRef.cost - expenseRef.remaining) }}.
          </p>
          <!-- Overdraft Allowed and going over overdraft budget -->
          <p v-else-if="expenseRef.od && !isCovered">
            The expense type you are about to submit is only covered up to
            {{ convertToMoneyString(expenseRef.budget * 2) }} with overdraft. You will be reimbursed
            {{ convertToMoneyString(expenseRef.remaining) }} of {{ convertToMoneyString(expenseRef.cost) }}.
          </p>
          <!-- Overdraft not allowed and going over budget -->
          <p v-else>
            The expense type you are about to submit is only covered up to
            {{ convertToMoneyString(expenseRef.budget) }} and does not allow overdraft. You will be reimbursed
            {{ convertToMoneyString(expenseRef.remaining) }} of {{ convertToMoneyString(expenseRef.cost) }}.
          </p>
          <p>Do you want to continue?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <div>
            <v-btn color="red" variant="text" @click="emit('canceledSubmit')">No, take me back</v-btn>
            <v-btn color="green-darken-1" variant="text" @click="emit('confirmSubmit', expenseRef)">Yes, submit</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { isEmpty, convertToMoneyString } from '@/utils/utils';
import { inject, ref, watch } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps([
  'expense', // expense to confirm
  'toggleConfirmationBox', // dialog activator
  'isCovered',
  'isOverCovered'
]);
const emitter = inject('emitter');

// props should not be directly written to, so expense needs to be mirrored with a ref
const expenseRef = ref(props.expense);
const activate = ref(false); // dialog activator

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

// watcher for toggleConfirmationBox
watch(
  () => props.toggleConfirmationBox,
  () => {
    activate.value = true;
  }
);

// ensure that changes to expense prop are reflected
watch(
  () => props.expense,
  () => {
    expenseRef.value = props.expense;
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists. Appends adjustment message to the expense note and sets
 * the expense cost to the remaining budget.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    if (!props.isCovered) {
      let adjustNote = '';
      if (!expenseRef.value.od) {
        adjustNote = `Expense type is only covered up to $${
          expenseRef.value.budget
        }. You will be reimbursed $${expenseRef.value.remaining.toFixed(2)} of $${expenseRef.value.cost}`; // added toFixed(2) to resolve decimal issue in notes.
      } else {
        adjustNote = `Expense type is only covered up to $${(2 * expenseRef.value.budget).toFixed(
          2
        )}. You will be reimbursed $${expenseRef.value.remaining} of $${expenseRef.value.cost}`;
      }
      if (!isEmpty(expenseRef.value.note)) {
        // expense has a note
        expenseRef.value.note += `\n\n${adjustNote}`;
      } else {
        // expense does not have a note
        expenseRef.value.note = adjustNote;
      }
      expenseRef.value.cost = expenseRef.value.remaining;
    }
    emitter.emit(msg, data);
  } else {
    // data does not exist
    emitter.emit(msg);
  }
  activate.value = false;
} // emit
</script>
