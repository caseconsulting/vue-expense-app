<template>
  <div>
    <v-data-table
      v-if="dataReceived"
      :headers="headers"
      :items="tableContents"
      :expanded="expanded"
      item-key="title"
      class="elevation-1"
      id="icTable"
      hide-default-footer
      hide-default-header
      expand-on-click
    >
      <template v-slot:top>
        <v-toolbar color="transparent">
          <v-toolbar-title class="font-weight-bold">Community Statistics</v-toolbar-title>
        </v-toolbar>
        <p class="pl-3" style="color: #828282"><i>*Click on row to see employees</i></p>
      </template>
      <template v-slot:headers></template>
      <template v-slot:bottom></template>
      <!-- Expanded slot in datatable -->
      <template v-slot:expanded-row="{ columns, item }">
        <td v-if="item.title === 'Total Employees'" :colspan="columns.length" class="pa-2 pb-0">
          <div class="roleRow px-16 pt-1" v-for="role in getRoleCounts()" :key="role.role">
            <p>{{ role[0] }}</p>
            <p>{{ role[1] }}</p>
          </div>
        </td>
      </template>
    </v-data-table>
    <div class="d-flex justify-center align-center">
      <v-radio-group inline hide-details v-model="filterSelection" class="d-inline-block ma-0 pa-0">
        <v-radio v-for="item in filterItems" :key="item" :label="item" :value="item"></v-radio>
      </v-radio-group>
      <v-checkbox class="d-inline-block" v-model="showInterns" hide-details :label="`Show Interns`"></v-checkbox>
    </div>
  </div>
</template>

<script setup>
import _mapValues from 'lodash/mapValues';
import _forEach from 'lodash/forEach';
import { difference, format, getTodaysDate, isBefore, minimum, maximum } from '@/shared/dateUtils';
import { onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const dataReceived = ref(false);
const employees = ref(null);
const expanded = ref([]);
const filterItems = ['All', 'Full Time', 'Part Time'];
const filterSelection = ref('All');
const headers = ref(null);
const showInterns = ref(true);
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
onMounted(async () => {
  if (store.getters.storeIsPopulated) await fillData();
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the IC data, and sets the chart formatting and data options.
 */
function fillData() {
  let ICData = {};
  let totalYears = 0;

  // access store
  employees.value = store.getters.employees;

  // filter out inactive and interns if selected
  if (!showInterns.value) {
    employees.value = employees.value.filter(
      (emp) => emp.workStatus != 0 && (emp.jobRole ? emp.jobRole.toLowerCase() != 'intern' : true)
    );
  }

  // filter out employees based on radio selection
  if (filterSelection.value === 'Full Time') {
    employees.value = employees.value.filter((emp) => emp.workStatus === 100);
  } else if (filterSelection.value === 'Part Time') {
    employees.value = employees.value.filter((emp) => emp.workStatus > 0 && emp.workStatus < 100);
  } else {
    employees.value = employees.value.filter((emp) => emp.workStatus != 0);
  }

  employees.value.forEach((emp) => {
    if (emp.icTimeFrames) {
      // get values from input, convert to array, and then sort them
      let given_ranges = _mapValues(emp.icTimeFrames, 'range');
      given_ranges = Object.values(given_ranges);
      const durations = given_ranges
        .sort((a, b) => {
          // array has text in format YYYY-MM, so reformat to YYYYMM
          // so that it can be sorted as a regular int
          format(a[0], null, 'YYYY-MM') - format(b[0], null, 'YYYY-MM');
        })
        .reverse();
      let ranges = [];
      let previousVal, firstStart, lastEnd;
      // combine any dates that overlap, keep separate ones that don't
      durations.forEach((d) => {
        previousVal = ranges[ranges.length - 1];
        if (ranges.length != 0 && isBefore(d[0], previousVal[1])) {
          // overlap combination
          firstStart = minimum([previousVal[0], d[0]]);
          lastEnd = maximum([previousVal[1], d[1]]);
          ranges[ranges.length - 1] = [firstStart, lastEnd];
        } else {
          // no overlap
          ranges.push(d);
        }
      });
      let totalDurationMonths = 0; // total months
      // loop each reach to get total duration in months
      _forEach(ranges, (range) => {
        let start = format(range[0], null, 'YYYY-MM');
        let end = range.length > 1 ? format(range[1], null, 'YYYY-MM') : getTodaysDate();
        let duration = difference(end, start, 'months') + 1; // calculate range duration
        totalDurationMonths += Math.max(duration, 0); // remove negative values
      });
      const totalDurationYears = totalDurationMonths / 12;
      const name = `${emp.nickname || emp.firstName} ${emp.lastName}`;
      ICData[name] = totalDurationYears.toFixed(2);
      totalYears += totalDurationYears;
    }
  });

  let averageYoE = totalYears / employees.value.length;

  tableContents.value = [
    { title: 'Total Employees', value: employees.value.length },
    { title: 'Company Wide IC Experience', value: totalYears.toFixed(2) + ' Years' },
    { title: 'Average IC Experience per Employee', value: averageYoE.toFixed(2) + ' Years' }
  ];

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

/**
 * Gets the total number of employees for each role.
 */
function getRoleCounts() {
  let roles = [];
  let unknownJobRoles = 0;
  let unknownJRText = 'Unknown Job Role';

  employees.value.forEach((emp) => {
    if (emp.workStatus != 0) {
      if (emp.jobRole) {
        if (roles[emp.jobRole]) roles[emp.jobRole] += 1;
        else roles[emp.jobRole] = 1;
      } else {
        // -1 to sort at the end of list, real num is added later
        roles[unknownJRText] = -1;
        unknownJobRoles++;
      }
    }
  });

  //sorts contents from most common roles to least
  let sortedRoles = Object.entries(roles);
  sortedRoles = sortedRoles.sort((a, b) => {
    return b[1] - a[1];
  });

  // add unknown jobs roles
  if (unknownJobRoles > 0) {
    sortedRoles[sortedRoles.length - 1] = [unknownJRText, unknownJobRoles];
  }

  return sortedRoles;
} // getRoleCounts

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

watch(showInterns, () => {
  if (store.getters.storeIsPopulated) fillData();
});

watch(filterSelection, () => {
  if (store.getters.storeIsPopulated) fillData();
});
</script>

<style>
#icTable tr:hover {
  background-color: transparent;
}

#icTable tr:first-child:hover {
  cursor: pointer;
  background-color: #e8e8e8;
}

.roleRow {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
