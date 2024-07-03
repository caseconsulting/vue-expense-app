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
      <!-- Reimburse Button -->
      <v-btn
        @click="emitter.emit('reimburse-expenses', isGeneratingGiftCard)"
        id="custom-button-color"
        theme="dark"
        class="reimburse_button mt-5"
        variant="text"
        block
      >
        <template v-slot:prepend><v-icon>mdi-currency-usd</v-icon></template>
        Reimburse
      </v-btn>
    </v-card-text>
  </v-card>
  <!--End of Totals Card-->
</template>

<script setup>
import _ from 'lodash';
import { convertToMoneyString } from '@/utils/utils';
import { ref, onBeforeMount, onBeforeUnmount, computed, inject } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const isGeneratingGiftCard = ref(true);
const selected = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Creates event listeners.
 */
onBeforeMount(() => {
  emitter.on('selectExpense', updateSelected);
  emitter.on('expenseChange', updateSelected);
}); // created

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('selectExpense');
  emitter.off('expenseChange');
}); //beforeUnmount

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
const totals = computed(() => {
  let theTotals = [];
  theTotals = _.map(selected.value, (item) => {
    return {
      name: item.budgetName,
      id: item.expenseTypeId,
      costTotal: 0
    };
  });
  theTotals = _.uniqWith(theTotals, _.isEqual);
  _.forEach(selected.value, (expense) => {
    _.forEach(theTotals, (total) => {
      if (total.id === expense.expenseTypeId) {
        total.costTotal += parseFloat(expense.cost);
      }
    });
  });
  return theTotals;
}); // totals

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
    if (item.length < selected.value.length) {
      // remove items
      selected.value = _.xor(selected.value, _.xor(item, selected.value));
    } else {
      // add items
      selected.value.push(item);
      selected.value = _.flatten(selected.value);
      selected.value = _.uniqWith(selected.value, _.isEqual);
    }
  } else if (item) {
    // item is not an array
    let indexOfItem = _.indexOf(selected.value, item);
    if (indexOfItem > -1) {
      // remove item
      selected.value.splice(indexOfItem, 1);
    } else {
      // add item
      selected.value.push(item);
    }
  }
} // updateSelected
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
