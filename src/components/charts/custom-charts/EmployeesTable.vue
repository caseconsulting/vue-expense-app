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
      id="employeesTable"
      density="comfortable"
    >
      <template v-slot:top>
        <v-toolbar color="transparent">
          <v-toolbar-title class="font-weight-bold">Employee Statistics</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:headers></template>
      <template v-slot:bottom></template>
    </v-data-table>
  </div>
</template>

<script>
import _ from 'lodash';
import { storeIsPopulated, userRoleIsIntern } from '@/utils/utils.js';

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
 * Routes the user to the reports page and autofills the search fields.
 *
 * @param value - row clicked
 */
function clickedRow(_, { item }) {
  localStorage.setItem('requestedFilter', item.employeeNames.join(', '));
  this.$router.push({
    path: '/employees',
    name: 'employees'
  });
} // clickedRow

/**
 * Gets the employee data, and sets the chart formatting and data options.
 */
function fillData() {
  // access store
  this.employees = this.$store.getters.employees;

  // filter out inactive and interns if selected
  this.employees = this.employees.filter((emp) => emp.workStatus != 0);
  let billableCount = 0;
  let internCount = 0;
  let overheadCount = 0;
  let overheadAwaitingClearanceCount = 0;
  let internsAwaitingClearanceCount = 0;
  let [billableEmployeeNames, internEmployeeNames] = [[], []];
  let overheadEmployeeNames = _.map(this.employees, (e) => {
    return { name: `${e.nickname || e.firstName} ${e.lastName}` };
  });
  // tally up counts
  _.forEach(this.employees, (e) => {
    let name = `${e.nickname || e.firstName} ${e.lastName}`;
    let awaitingClearance = e.clearances && e.clearances.some((c) => c.awaitingClearance);
    if (e.contracts && e.contracts.some((c) => c.projects.some((p) => !p.endDate))) {
      let isBillable = false;
      _.forEach(e.contracts, (contract) => {
        _.forEach(contract.projects, (project) => {
          if (!project.endDate && !isBillable) {
            // employee is active on a contract
            billableEmployeeNames.push(name);
            _.remove(overheadEmployeeNames, (x) => name === x.name);
            billableCount++;
            isBillable = true;
          }
        });
      });
    } else if (e.jobRole === 'Intern') {
      if (awaitingClearance) {
        internsAwaitingClearanceCount++;
      }
      internEmployeeNames.push(name);
      _.remove(overheadEmployeeNames, (x) => name === x.name);
      internCount++;
    } else if (awaitingClearance) {
      overheadAwaitingClearanceCount++;
    }
  });

  overheadCount = this.employees.length - billableCount - internCount;
  overheadEmployeeNames = _.map(overheadEmployeeNames, (x) => {
    return x.name;
  });

  this.tableContents = [
    { title: 'Billable Employees', value: billableCount, employeeNames: billableEmployeeNames },
    {
      title: 'Overhead Employees',
      value: `${overheadCount} (${
        overheadAwaitingClearanceCount == 0 ? 'none' : overheadAwaitingClearanceCount
      } awaiting clearance)`,
      employeeNames: overheadEmployeeNames
    },
    {
      title: 'Interns',
      value: `${internCount} (${
        internsAwaitingClearanceCount == 0 ? 'none' : internsAwaitingClearanceCount
      } awaiting clearance)`,
      employeeNames: internEmployeeNames
    },
    { title: 'Total Employees', value: this.employees.length, employeeNames: [] }
  ];

  // remove 'awaiting clerance' parens if value is zero
  if (overheadCount == 0) {
    this.tableContents[1].value = `${overheadCount}`;
  }
  if (internCount == 0) {
    this.tableContents[2].value = `${internCount}`;
  }

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
    storeIsPopulated,
    userRoleIsIntern
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
#employeesTable tr:hover {
  cursor: pointer;
  background-color: #e8e8e8;
}

#employeesTable tr:last-child {
  font-weight: 600;
}
</style>
