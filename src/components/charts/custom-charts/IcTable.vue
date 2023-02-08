<template>
  <div>
    <v-data-table
      v-if="dataReceived"
      :headers="headers"
      :items="tableContents"
      :expanded.sync="expanded"
      item-key="title"
      :single-expand="true"
      @click:row="clickedRow"
      class="elevation-1"
      id="icTable"
      hide-default-footer
      hide-default-header
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Community Statistics</v-toolbar-title>
        </v-toolbar>
      </template>
      <!-- Expanded slot in datatable -->
      <template v-slot:expanded-item="{ headers }">
        <td :colspan="headers.length" class="pa-2 pb-0">
          <div class="roleRow px-16 pt-1" v-for="role in getRoleCounts()" :key="role.role">
            <p>{{ role[0] }}</p>
            <p>{{ role[1] }}</p>
          </div>
        </td>
      </template>
    </v-data-table>
    <v-radio-group row id="radioGroup" v-model="filterSelection" class="ma-0 text-center">
      <v-radio v-for="item in filterItems" :key="item" :label="item" :value="item"></v-radio>
      <v-checkbox v-model="showInterns" :label="`Show Interns`"></v-checkbox>
    </v-radio-group>
  </div>
</template>

<script>
import _ from 'lodash';
import { storeIsPopulated } from '@/utils/utils.js';
import { difference, format, getTodaysDate, isBefore, minimum, maximum } from '@/shared/dateUtils';

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
 * Expands only the total employees row. Adds the row to expanded row when clicked.
 *
 * @param value - row to expand
 */
function clickedRow(value) {
  if (_.isEmpty(this.expanded) && value.title === 'Total Employees') {
    this.expanded = [];
    this.expanded.push(value);
  } else {
    this.expanded = [];
  }
} // clickedRow

/**
 * Gets the IC data, and sets the chart formatting and data options.
 */
function fillData() {
  let ICData = {};
  let totalYears = 0;

  // access store
  this.employees = this.$store.getters.employees;

  // filter out inactive and interns if selected
  if (!this.showInterns) {
    this.employees = this.employees.filter(
      (emp) => emp.workStatus != 0 && (emp.jobRole ? emp.jobRole.toLowerCase() != 'intern' : true)
    );
  }

  // filter out employees based on radio selection
  if (this.filterSelection === 'Full Time') {
    this.employees = this.employees.filter((emp) => emp.workStatus === 100);
  } else if (this.filterSelection === 'Part Time') {
    this.employees = this.employees.filter((emp) => emp.workStatus > 0 && emp.workStatus < 100);
  } else {
    this.employees = this.employees.filter((emp) => emp.workStatus != 0);
  }

  this.employees.forEach((emp) => {
    if (emp.icTimeFrames) {
      // get values from input, convert to array, and then sort them
      let given_ranges = _.mapValues(emp.icTimeFrames, 'range');
      given_ranges = Object.values(given_ranges);
      const durations = given_ranges
        .sort((a, b) => {
          // array has text in format YYYY-MM, so reformat to YYYYMM
          // so that it can be sorted as a regular int
          this.format(a[0], null, 'YYYY-MM') - this.format(b[0], null, 'YYYY-MM');
        })
        .reverse();
      let ranges = [];
      let previousVal, firstStart, lastEnd;
      // combine any dates that overlap, keep separate ones that don't
      durations.forEach((d) => {
        previousVal = ranges[ranges.length - 1];
        if (ranges.length != 0 && this.isBefore(d[0], previousVal[1])) {
          // overlap combination
          firstStart = this.minimum([previousVal[0], d[0]]);
          lastEnd = this.maximum([previousVal[1], d[1]]);
          ranges[ranges.length - 1] = [firstStart, lastEnd];
        } else {
          // no overlap
          ranges.push(d);
        }
      });
      let totalDurationMonths = 0; // total months
      // loop each reach to get total duration in months
      _.forEach(ranges, (range) => {
        let start = this.format(range[0], null, 'YYYY-MM');
        let end = range.length > 1 ? this.format(range[1], null, 'YYYY-MM') : this.getTodaysDate();
        let duration = this.difference(end, start, 'months') + 1; // calculate range duration
        totalDurationMonths += Math.max(duration, 0); // remove negative values
      });
      const totalDurationYears = totalDurationMonths / 12;
      const name = `${emp.nickname || emp.firstName} ${emp.lastName}`;
      ICData[name] = totalDurationYears.toFixed(2);
      totalYears += totalDurationYears;
    }
  });

  let averageYoE = totalYears / (this.employees.length - 1); // -1 for info account on prod

  this.tableContents = [
    { title: 'Total Employees', value: this.employees.length - 1 }, // -1 for info account on prod
    { title: 'Company Wide IC Experience', value: totalYears.toFixed(2) + ' Years' },
    { title: 'Average IC Experience per Employee', value: averageYoE.toFixed(2) + ' Years' }
  ];

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

/**
 * Gets the total number of employees for each role.
 */
function getRoleCounts() {
  let roles = [];

  this.employees.forEach((emp) => {
    if (emp.jobRole && emp.workStatus != 0) {
      if (roles[emp.jobRole]) {
        roles[emp.jobRole] += 1;
      } else {
        roles[emp.jobRole] = 1;
      }
    }
  });
  //sorts contents from most common roles to least
  let sortedRoles = Object.entries(roles);
  sortedRoles = sortedRoles.sort((a, b) => {
    return b[1] - a[1];
  });

  return sortedRoles;
} // getRoleCounts

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
      expanded: [],
      tableContents: null,
      headers: null,
      filterItems: ['All', 'Full Time', 'Part Time'],
      filterSelection: 'All',
      showInterns: true
    };
  },
  methods: {
    clickedRow,
    difference, // dateUtils
    format, // dateUtils
    fillData,
    getRoleCounts,
    getTodaysDate, // dateUtils
    isBefore, // dateUtils
    minimum, // dateUtils
    maximum // dateUtils
  },
  mounted,
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) this.fillData();
    },
    showInterns: function () {
      if (this.storeIsPopulated) this.fillData();
    },
    filterSelection: function () {
      if (this.storeIsPopulated) this.fillData();
    }
  }
};
</script>

<style>
#radioGroup {
  justify-content: center;
}

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
