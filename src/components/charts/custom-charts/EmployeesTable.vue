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
        <p class="pl-3" style="color: #828282"><i>*Click on row to see employees</i></p>
      </template>
      <template v-slot:headers></template>
      <template v-slot:bottom></template>
    </v-data-table>
  </div>
</template>

<script setup>
import _map from 'lodash/map';
import _forEach from 'lodash/forEach';
import _remove from 'lodash/remove';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const dataReceived = ref(false);
const employees = ref(null);
const tableContents = ref(null);
const headers = ref(null);
const router = useRouter();
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook.
 */
onMounted(async () => {
  if (store.getters.storeIsPopulated) await fillData();
}); // mounted

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
  item.employeeNames?.length > 0 ? localStorage.setItem('requestedFilter', item.employeeNames.join(', ')) : _;
  if (item.value == 0) {
    localStorage.setItem('requestedFilter', 'none');
  }
  router.push({
    path: '/employees',
    name: 'employees'
  });
} // clickedRow

/**
 * Gets the employee data, and sets the chart formatting and data options.
 */
function fillData() {
  // access store
  employees.value = store.getters.employees;

  // filter out inactive and interns if selected
  employees.value = employees.value.filter((emp) => emp.workStatus != 0);
  let billableCount = 0;
  let internCount = 0;
  let overheadCount = 0;
  let overheadAwaitingClearanceCount = 0;
  let internsAwaitingClearanceCount = 0;
  let [billableEmployeeNames, internEmployeeNames] = [[], []];
  let overheadEmployeeNames = _map(employees.value, (e) => {
    return { name: `${e.nickname || e.firstName} ${e.lastName}` };
  });
  // tally up counts
  _forEach(employees.value, (e) => {
    let name = `${e.nickname || e.firstName} ${e.lastName}`;
    let awaitingClearance = e.clearances && e.clearances.some((c) => c.awaitingClearance);
    if (e.contracts && e.contracts.some((c) => c.projects.some((p) => !p.endDate))) {
      let isBillable = false;
      _forEach(e.contracts, (contract) => {
        _forEach(contract.projects, (project) => {
          if (!project.endDate && !isBillable) {
            // employee is active on a contract
            billableEmployeeNames.push(name);
            _remove(overheadEmployeeNames, (x) => name === x.name);
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
      _remove(overheadEmployeeNames, (x) => name === x.name);
      internCount++;
    } else if (awaitingClearance) {
      overheadAwaitingClearanceCount++;
    }
  });

  overheadCount = employees.value.length - billableCount - internCount;
  overheadEmployeeNames = _map(overheadEmployeeNames, (x) => {
    return x.name;
  });

  tableContents.value = [
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
    { title: 'Total Employees', value: employees.value.length, employeeNames: [] }
  ];

  // remove 'awaiting clearance' parens if value is zero
  if (overheadCount == 0) {
    tableContents.value[1].value = `${overheadCount}`;
  }
  if (internCount == 0) {
    tableContents.value[2].value = `${internCount}`;
  }

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
#employeesTable tr:hover {
  cursor: pointer;
  background-color: #e8e8e8;
}

#employeesTable tr:last-child {
  font-weight: 600;
}
</style>
