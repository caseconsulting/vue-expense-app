<template>
  <v-col>
    <v-progress-linear v-if="!trainings" indeterminate />
    <p v-else-if="trainings.length === 0">No trainings found for employee.</p>
    <div v-else>
      <v-row>
        <v-col cols="3" class="font-weight-bold">Purchase Date</v-col>
        <v-col cols="3" class="font-weight-bold">Category</v-col>
        <v-col cols="6" class="font-weight-bold">Description</v-col>
      </v-row>
      <v-row v-for="training in trainings" :key="training.id" class="clickable-row" @click="gotoExpense(training.id)">
        <v-col cols="3">{{ format(training.purchaseDate, null, 'MMM DD, YYYY') }}</v-col>
        <v-col cols="3">{{ training.category ?? 'None' }}</v-col>
        <v-col cols="6">{{ training.description }}</v-col>
      </v-row>
    </div>
  </v-col>
</template>

<script setup>
/**
 * TODO:
 *  - [ ] make for employee, not user (oops)
 *  - [ ] button to goto expense in MyExpenses?
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
 "receipt": [ "Portal_Report_(Ragnarok_Technologies).xlsx" ] }

 */

import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { updateStoreUser } from '@/utils/storeUtils';
import { format, difference } from '@/shared/dateUtils';
import api from '@/shared/api';

const props = defineProps(['modelValue', 'user']);
const notes = ref(props.modelValue);
const trainings = ref(null);
const store = useStore();

onMounted(async () => {
  // fetch all data
  let { id } = props.user;
  let [expenses, expenseTypes] = await Promise.all([api.getAllEmployeeExpenses(id), api.getEmployeeExpenseTypes(id)]);
  // get all training expense type IDs
  let trainingIds = new Set();
  for (let et of expenseTypes)
    if (et.budgetName.toLowerCase().includes('training'))
      trainingIds.add(et.id);
  // get all expenses with a training ET ID
  trainings.value = expenses.filter((e) => trainingIds.has(e.expenseTypeId));
  trainings.value = trainings.value.sort((a, b) => difference(b.purchaseDate, a.purchaseDate, 'day'));
});
</script>

<style scoped>
.clickable-row:hover {
  cursor: pointer;
  background-color: #f0f0f0;
  border-radius: 0.7em;
}
</style>
