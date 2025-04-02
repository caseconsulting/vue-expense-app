<template>
  <div>
    <v-row class="justify-center">
      <v-icon size="large" class="gold">mdi-trophy</v-icon>
      <template v-slot:activator="{ props }">
        <user-avatar class="pointer mx-3" v-bind="props" :employee="first" :image="first.avatar" />
      </template>
      <span>{{ first?.firstName }}</span>
      <span>{{ first?.billableTimesheet }}</span>
    </v-row>
    <v-row class="justify-space-around">
      <div>
        <v-icon size="large" class="silver">mdi-trophy</v-icon>
        <span>{{ second?.billableTimesheet }}</span>
      </div>
      <div>
        <v-icon size="large" class="bronze">mdi-trophy</v-icon>
        <span>{{ third?.billableTimesheet }}</span>
      </div>
    </v-row>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import api from '@/shared/api';
import { updateStoreTags } from '@/utils/storeUtils';
import { nonBillableTags } from '@/utils/tags';
import { getTimesheets } from '@/utils/timesheets';
import { getTodaysDate, startOf } from '@/shared/dateUtils';
import _sortBy from 'lodash/sortBy';
import _reverse from 'lodash/reverse';
import { loadBasecampAvatars } from '@/utils/basecamp';

const store = useStore();

const first = ref(null);
const second = ref(null);
const third = ref(null);

/**
 * onBeforeMount lifecycle hook
 */
onBeforeMount(async () => {
  let employees = await api.getEmployees();
  if (!store.getters.tags) {
    await updateStoreTags();
  }
  let filteredTags = nonBillableTags(store.getters.tags);
  let nonBillableEmployeeIds = filteredTags.flatMap((tag) => tag.employees);
  let billableEmployees = employees.filter((employee) => !nonBillableEmployeeIds.includes(employee.id));

  let [start, end] = [startOf(getTodaysDate('YYYY-MM-DD'), 'year'), getTodaysDate('YYYY-MM-DD')];

  let timesheetsByEmployeeNumber = await getTimesheets(billableEmployees, start, end);

  let sortedTimesheets = _reverse(_sortBy(timesheetsByEmployeeNumber, 'billableTimesheet'));
  console.log(sortedTimesheets);

  let firstTimesheet = sortedTimesheets[0];
  let firstEmployee = employees.find((e) => e.employeeNumber == firstTimesheet?.employeeNumber);
  first.value = { ...firstEmployee, ...firstTimesheet };
  console.log(first);
  second.value = sortedTimesheets[1];
  console.log(second);
  third.value = sortedTimesheets[2];
  console.log(third);

  loadBasecampAvatars([first]);
});
</script>
