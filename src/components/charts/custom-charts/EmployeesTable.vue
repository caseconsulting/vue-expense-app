<template>
  <div>
    <v-data-table
      v-if="dataReceived"
      :headers="headers"
      :items="tableContents"
      item-key="title"
      :single-expand="true"
      class="elevation-1"
      id="employeesTable"
      hide-default-footer
      hide-default-header
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Employee Statistics</v-toolbar-title>
        </v-toolbar>
      </template>
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
 * Gets the employee data, and sets the chart formatting and data options.
 */
function fillData() {
  // access store
  this.employees = this.$store.getters.employees;

  // filter out inactive and interns if selected
  this.employees = this.employees.filter((emp) => emp.workStatus != 0);
  let contractorEmployeeCount = 0;
  _.forEach(this.employees, (employee) => {
    let isContractor = false;
    if (employee.contracts) {
      _.forEach(employee.contracts, (contract) => {
        _.forEach(contract.projects, (project) => {
          if (!project.endDate && !isContractor) {
            // employee is active on a contract
            contractorEmployeeCount += 1;
            isContractor = true;
          }
        });
      });
    }
  });

  this.tableContents = [
    { title: 'Total Employees', value: this.employees.length - 1 }, // -1 for the info account on prod
    { title: 'Contracting Employees', value: contractorEmployeeCount },
    { title: 'Overhead Employees', value: this.employees.length - contractorEmployeeCount - 1 } // -1 for the info account on prod
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
  background-color: transparent;
}
</style>
