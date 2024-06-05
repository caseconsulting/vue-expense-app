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
      </template>
      <template v-slot:headers></template>
      <template v-slot:bottom></template>
    </v-data-table>
  </div>
</template>

<script>
import _ from 'lodash';
import { storeIsPopulated } from '@/utils/utils.js';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
async function mounted() {
  if (this.storeIsPopulated) await this.fillData();
} // mounted

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
  localStorage.setItem('requestedDataType', 'securityInfo');
  localStorage.setItem('requestedFilter', item.title);
  this.$router.push({
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
  let num = _.reduce(
    this.employees,
    (a, b) => {
      return b.clearances && _.some(b.clearances, (c) => c.type === type && !c.awaitingClearance) ? a + 1 : a + 0;
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
  this.employees = this.$store.getters.employees;

  // filter out inactive and interns if selected
  this.employees = this.employees.filter((emp) => emp.workStatus != 0);

  const CLEARANCE_TYPES = ['TS/SCI - Full Scope', 'TS/SCI - CI Poly', 'TS/SCI - No Poly', 'Top Secret', 'Secret'];
  this.tableContents = _.map(CLEARANCE_TYPES, (type) => ({ title: type, value: this.getClearanceCount(type) }));

  this.headers = [
    {
      text: 'topic',
      align: 'start',
      value: 'title'
    },
    { text: 'val', value: 'value' }
  ];
  this.dataReceived = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    storeIsPopulated
  },
  data() {
    return {
      dataReceived: false,
      employees: null,
      tableContents: null,
      headers: null
    };
  },
  methods: {
    clickedRow,
    getClearanceCount,
    fillData
  },
  mounted,
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) this.fillData();
    }
  }
};
</script>

<style>
#clearancesTable tr:hover {
  cursor: pointer;
  background-color: #e8e8e8;
}
</style>
