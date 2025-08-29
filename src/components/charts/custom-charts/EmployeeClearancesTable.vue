<template>
  <div>
    <v-data-table
      v-if="dataReceived"
      :headers="headers"
      :items="tableContents"
      item-key="title"
      :single-expand="true"
      @click:row="clickedRow"
      class="elevation-1"
      id="clearancesTable"
      density="comfortable"
    >
      <template v-slot:top>
        <v-toolbar color="transparent">
          <v-toolbar-title class="font-weight-bold">Employee Clearances</v-toolbar-title>
        </v-toolbar>
        <p class="pl-3" style="color: #828282"><i>*Click on row to see employees</i></p>
      </template>
      <template v-slot:headers></template>
      <template v-slot:bottom></template>
    </v-data-table>
  </div>
</template>

<script setup>
import _reduce from 'lodash/reduce';
import _some from 'lodash/some';
import _map from 'lodash/map';
import { onBeforeMount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const dataReceived = ref(false);
const employees = ref(null);
const headers = ref(null);
const router = useRouter();
const store = useStore();
const tableContents = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
onBeforeMount(async () => {
  if (store.getters.storeIsPopulated) {
    await fillData();
  }
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Routes user to reports page and autofills their clearance search.
 *
 * @param value - item clicked
 */
function clickedRow(_, { item }) {
  localStorage.setItem(
    'requestedFilter',
    JSON.stringify({ type: 'securityInfo', search: item.title })
  );
  router.push({
    path: '/reports',
    name: 'reports'
  });
} // clickedRow

/**
 * Gets the number of employees that hold a clearance of the type passed.
 * @param type String - The type of clearance
 * @returns Number - The total amount of users that actively hold that type of clearance
 */
function getClearanceCount(type) {
  let num = _reduce(
    employees.value,
    (a, b) => {
      return b.clearances && _some(b.clearances, (c) => c.type === type && !c.awaitingClearance) ? a + 1 : a + 0;
    },
    0
  );
  return num;
} // getClearanceCount

/**
 * Gets the employee data, and sets the chart formatting and data options.
 */
function fillData() {
  // access store
  employees.value = store.getters.employees;

  // filter out inactive and interns if selected
  employees.value = employees.value.filter((emp) => emp.workStatus != 0);

  const CLEARANCE_TYPES = ['TS/SCI - Full Scope', 'TS/SCI - CI Poly', 'TS/SCI - No Poly', 'Top Secret', 'Secret'];
  tableContents.value = _map(CLEARANCE_TYPES, (type) => ({ title: type, value: getClearanceCount(type) }));

  headers.value = [
    {
      text: 'topic',
      align: 'start',
      value: 'title'
    },
    { text: 'val', value: 'value' }
  ];
  dataReceived.value = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => store.getters.storeIsPopulated,
  () => {
    fillData();
  }
);
</script>

<style>
#clearancesTable tr:hover {
  cursor: pointer;
  background-color: #e8e8e8;
}
</style>
