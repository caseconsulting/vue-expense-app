<template>
  <v-col>
    <v-progress-linear v-if="!filteredTrainings" indeterminate />
    <div v-else>
      <div class="mb-4">
        <strong>Training Hour Conversions:</strong> ${{ trainingHours.pending.toFixed(2) }} pending, ${{ trainingHours.reimbursed.toFixed(2) }} reimbursed
      </div>
      <v-autocomplete
        :items="categories"
        v-model="filters.categories"
        label="Filter by category"
        variant="outlined"
        density="compact"
        multiple
        chips
        closable-chips
      />
      <div>
        <v-row>
          <v-col cols="3" class="font-weight-bold">Purchase Date</v-col>
          <v-col cols="3" class="font-weight-bold">Category</v-col>
          <v-col cols="6" class="font-weight-bold">Description</v-col>
        </v-row>
        <p v-if="filteredTrainings.length === 0" class="mt-4">No trainings found.</p>
        <v-row v-else v-for="training in filteredTrainings" :key="training.id">
          <v-col cols="3">{{ format(training.purchaseDate, null, 'MMM DD, YYYY') }}</v-col>
          <v-col cols="3">{{ training.category ?? 'None' }}</v-col>
          <v-col cols="6"  v-if="editing[training.id]" class="py-1">
            <v-textarea
              v-model="notes.expenses[training.id]"
              variant="outlined"
              density="compact"
              class="pa-0"
              rows="1"
              append-inner-icon="mdi-content-save"
              @click:append-inner="editing[training.id] = false"
              @blur="editing[training.id] = false"
              @keydown.enter="editing[training.id] = false"
              hide-details
              auto-grow
              autofocus
            />
          </v-col>
          <v-col cols="6" v-else @click="editDesc(training)" :class="(getDesc(training)?.modified ? 'font-italic' : '') + ' editable-desc'">
            {{ getDesc(training)?.text }}
          </v-col>
        </v-row>
      </div>
    </div>
  </v-col>
</template>

<script setup>
/**
 * TODO:
 *  - [x] make for employee, not user (oops)
 *  - [x] category filter with auto to what they likely want
 *  - [x] show training hour conversions
 *  - [x] summary of training hours conversions
 *  - [ ] notes section defaulting to desc but editable (do not edit expense, just notes)
 */

 /*

 {
 "id": "aa22c281-f87f-4e93-ab62-83274f38b08a",
 "employeeId": "21769931-4379-4902-ac13-b1f52069cf43",
 "createdAt": "2025-11-14",
 "expenseTypeId": "00670837-e7b9-4198-8ed1-f6146d821bfc",
 "description": "bjnk",
 "purchaseDate": "2025-11-05T05:00:00.000Z",
 "showOnFeed": true,
 "state": "CREATED",
 "cost": 9,
 "category": "Certifications,",
 "receipt": [ "Portal_Report_(Ragnarok_Technologies).xlsx" ]
 }

 */

import { ref, computed, onMounted } from 'vue';
import { format, difference } from '@/shared/dateUtils';
import api from '@/shared/api';
import { EXPENSE_STATES } from '@/shared/expenseUtils';

const props = defineProps(['modelValue', 'user']);
const notes = ref(props.modelValue);
const categories = ref([]);
const filters = ref({
  categories: ['Certifications', 'Certifications,', 'Training', 'Exchange for Training Hours', 'Conferences']
})
let trainings = ref(null);
const trainingHours = ref({ pending: 0, reimbursed: 0 })
const editing = ref({});

onMounted(async () => {
  // fetch all data
  let { id } = props.user;
  let [expenses, expenseTypes] = await Promise.all([api.getAllEmployeeExpenses(id), api.getEmployeeExpenseTypes(id)]);
  // get all training expense type IDs
  let trainingIds = new Set();
  let allCategory = new Set();
  for (let et of expenseTypes) {
    if (et.budgetName.toLowerCase().includes('training')) {
      trainingIds.add(et.id);
      for (let c of et.categories || []) {
        // add to category list
        allCategory.add(c.name);
      }
    }
  }

  // get exchanges for training hours
  for (let e of expenses) {
    if (e.category?.toLowerCase() === 'exchange for training hours') {
      if (e.state === EXPENSE_STATES.REIMBURSED) trainingHours.value.reimbursed += e.cost;
      else trainingHours.value.pending += e.cost
    }
  }
  // get all expenses with a training ET ID
  trainings.value = expenses.filter((e) => trainingIds.has(e.expenseTypeId));
  trainings.value = trainings.value.sort((a, b) => difference(b.purchaseDate, a.purchaseDate, 'day'));

  // Remove non-existant categories from auto-filled categories
  for (let i = 0; i < filters.value.categories.length; i++)
    if (!allCategory.has(filters.value.categories[i]))
      filters.value.categories.splice(i--, 1);

  // get categories
  categories.value = Array.from(allCategory);
});

function editDesc(training) {
  notes.value.expenses[training.id] ??= training.description;
  editing.value[training.id] = true;
}

function getDesc(training) {
  let note = notes.value.expenses[training.id];
  if (note && note !== '') return { text: note, modified: true }; 
  if (!training.description || training.description === '') return { text: 'No description', modified: true };
  return { text: training.description, modifed: false };
}

const filteredTrainings = computed(() => {
  if (!trainings.value) return null;

  let filtered = [];
  let add = (item) => filtered.push(item);
  for (let t of trainings.value) {
    // categories filter
    if (!filters.value.categories?.length) add(t);
    for (let c of filters.value.categories || []) {
      if (t.category === c) {
        add(t);
        continue;
      }
    }
  }

  return filtered;
});
</script>

<style scoped>
.editable-desc:hover {
  cursor: pointer;
  background-color: #eee;
  border-radius: 0.7em;
}
input[type="text"].v-field__input {
  color: red !important;
  padding-left: 0;
}
</style>
