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
      <template v-slot:[`item.title`]="{ item }">
        <span>{{ item.title }}</span>
        <v-avatar v-if="item.info" class="ml-2 nudge-up pointer" size="x-small" density="compact">
          <v-tooltip activator="parent" location="top">{{ item.info }}</v-tooltip>
          <v-icon icon="mdi-information" color="#3f51b5" size="x-small" />
        </v-avatar>
      </template>
      <template v-slot:headers></template>
      <template v-slot:bottom></template>
    </v-data-table>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { updateStoreEmployees } from '@/utils/storeUtils';

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
 * Routes the user to the employees page and autofills the search fields.
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
async function fillData() {
  // filter out inactive employees
  !store.getters.employees ? await updateStoreEmployees() : '';
  employees.value = store.getters.employees.filter((emp) => emp.workStatus != 0);

  // counting vars
  let billableEmployees = { employees: [], awaitingClearance: new Set() };
  let internEmployees = { employees: [], awaitingClearance: new Set() };
  let nonInternEmployees = { employees: [], awaitingClearance: new Set() };
  let overheadEmployees = { employees: [], awaitingClearance: new Set() };

  // quick helper to add employee to above counting vars
  let addEmployee = (array, employee) => {
    array['employees'].push({
      id: employee.id,
      nickname: employee.nickname,
      firstName: employee.firstName,
      lastName: employee.lastName
    });
    if (employee.clearances && employee.clearances.some((c) => c.awaitingClearance)) {
      array['awaitingClearance'].add(employee.id);
    }
  };

  // loop through employees and figure out which array(s) to add them to
  for (let e of employees.value ?? []) {
    // vars to keep track
    let [isBillable, isIntern] = [false, false];
    // maybe add to billable
    if (e.contracts && e.contracts.some((c) => c.projects.some((p) => !p.endDate))) {
      contractLoop: for (let c of e.contracts ?? []) {
        for (let p of c.projects ?? []) {
          if (!p.endDate) {
            addEmployee(billableEmployees, e);
            isBillable = true;
            break contractLoop; // named loops! (this breaks out of both loops)
          }
        }
      }
    }
    // maybe add to interns
    if (e.jobRole === 'Intern') {
      addEmployee(internEmployees, e);
      isIntern = true;
    }
    // maybe add to non-interns
    if (!isIntern) {
      addEmployee(nonInternEmployees, e);
    }
    // maybe add to overhead
    // overhead: isn't on a contract and is not an intern. eg CFO, HR
    if (!isBillable && !isIntern) {
      addEmployee(overheadEmployees, e);
    }
  }

  // quick helper to get text of employee count, optionally including awaiting clearance count
  let getEmployeeCount = (array, showAwaiting) => {
    let count = `${array['employees'].length}`;
    let waitingCount = array['awaitingClearance'].size;
    if (showAwaiting && waitingCount > 0) count += ` (${waitingCount} awaiting clearance)`;
    return count;
  };
  // quick helper to extract names of an array of employees
  let getEmployeeNames = (array) => {
    return array['employees'].map((e) => `${e.nickname || e.firstName} ${e.lastName}`);
  };

  // set table contents
  tableContents.value = [
    {
      title: 'Billable Employees',
      value: getEmployeeCount(billableEmployees, false),
      employeeNames: getEmployeeNames(billableEmployees)
    },
    {
      title: 'Overhead Employees',
      value: getEmployeeCount(overheadEmployees, true),
      employeeNames: getEmployeeNames(overheadEmployees)
    },
    {
      title: 'Interns',
      value: getEmployeeCount(internEmployees, true),
      employeeNames: getEmployeeNames(internEmployees)
    },
    {
      title: 'Total Employees',
      value: getEmployeeCount(nonInternEmployees, false),
      employeeNames: getEmployeeNames(nonInternEmployees),
      info: "Excludes 'Intern' job role"
    }
  ];

  // set data table display
  headers.value = [
    {
      text: 'topic',
      value: 'title',
      align: 'start'
    },
    {
      text: 'val',
      value: 'value'
    }
  ];

  // set loading status
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
