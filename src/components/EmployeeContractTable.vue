<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="2">
          <v-autocomplete
            id="reportsDataType"
            v-model="dataType"
            :items="dataTypes"
            label="Type of Data"
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :filter="customFilter"
            :items="employees"
            label="Search By Employee Name"
            clearable
            @click:clear="
              search = null;
              refreshList();
            "
          ></v-autocomplete>
        </v-col>
        <v-col v-if="dataType === 'Contracts'">
          <v-autocomplete
            v-model="contract"
            :items="contractsDropDown"
            label="Search By Contract"
            clearable
            @change="refreshList()"
            @click:clear="contract = null"
          >
          </v-autocomplete>
        </v-col>
        <v-col v-if="dataType === 'Contracts'">
          <v-autocomplete
            v-model="prime"
            :items="primesDropDown"
            label="Search By Prime"
            clearable
            @change="refreshList()"
            @click:clear="prime = null"
          ></v-autocomplete>
        </v-col>
        <v-col v-else>
          <v-autocomplete
            v-model="dataTypeSearch"
            :items="dataTypeDropDown"
            :label="`Search By ${dataType}`"
            clearable
            @change="refreshDataTypeList()"
            @click:clear="dataTypeSearch = null"
          ></v-autocomplete>
        </v-col>
      </v-row>

      <!-- NEW DATA TABLE -->
      <v-data-table
        :headers="headers"
        :items="filteredEmployees"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :expanded.sync="expanded"
        :loading="loading"
        :items-per-page.sync="itemsPerPage"
        :search="search"
        class="elevation-1"
      >
        <template v-slot:[`item.employeeNumber`]="{ item }">
          <p :class="{ selectFocus: isFocus(item) }" style="margin-bottom: 0px">
            {{ item.employeeNumber }}
          </p>
        </template>
        <!-- First Name Item Slot -->
        <template v-slot:[`item.fullName`]="{ item }">
          <p :class="{ selectFocus: isFocus(item) }" style="margin-bottom: 0px">
            {{ getFullName(item) }}
          </p>
        </template>
        <!-- Alert for no search results -->
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all of the current contracts and displays the column on the table.
 */
function buildContractsColumn() {
  this.employeesInfo.forEach((currentEmp) => {
    if (currentEmp.contracts) {
      var contractNames = '';
      currentEmp.contracts.forEach((currentCon) => {
        var current = false;
        if (currentCon.projects) {
          currentCon.projects.forEach((currProj) => {
            if (!currProj.endDate) {
              current = true;
            }
          });
        }
        if (current == true) {
          contractNames += `${currentCon.name} - ${currentCon.prime} & `;
        }
      });
      contractNames = contractNames.slice(0, -2);
      currentEmp.contractNames = contractNames;
    }
  });
  this.headers.splice(2, 1, {
    text: 'Current Contract - Prime',
    value: 'contractNames'
  });
} // buildContractsColumn

/**
 * Replaces the third column with job role information.
 */
function buildJobRolesColumn() {
  this.headers.splice(2, 1, {
    text: 'Job Role',
    value: 'jobRole'
  });
} // buildJobRolesColumn

/**
 * Sets a mapping of employee name to employee id of an expense for the autocomplete options.
 *
 * @param empData - The list of employees
 */
function constructAutoComplete(empData) {
  this.employees = _.sortBy(
    _.map(empData, (data) => {
      if (data && data.firstName && data.lastName && data.employeeNumber) {
        return {
          text: data.firstName + ' ' + data.lastName,
          value: data.employeeNumber.toString(),
          nickname: data.nickname,
          firstName: data.firstName,
          lastName: data.lastName
        };
      }
    }).filter((data) => {
      return data != null;
    }),
    (employee) => employee.text.toLowerCase()
  );
} // constructAutoComplete

/**
 * Custom filter for employee autocomplete options.
 *firstName: data.firstName
 * @param item -
 * @param queryText -
 * @return
 */
function customFilter(item, queryText) {
  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsEmployeeNumber = item.value.toString().indexOf(query.toString()) >= 0;

  return queryContainsNickName || queryContainsFirstName || queryContainsEmployeeNumber;
} // customFilter

/**
 * Gets the full name of an employee.
 * @returns String - The employees first name
 */
function getFullName(item) {
  item.fullName = item.firstName + ' ' + item.lastName;
  return item.fullName;
} // getFullName

/**
 * Checks to see if an employee is expanded in the datatable.
 *
 * @param item - employee to check
 * @return boolean - the employee is expanded
 */
function isFocus(item) {
  let expanded = !_.isEmpty(this.expanded) && item.employeeNumber == this.expanded[0].employeeNumber;
  return expanded;
} // isFocus

/**
 * Populates the drop down for the filter based on the data type that is chosen.
 */
function populateDataTypeDropDowns() {
  // reset dropdowwn after each query
  this.dataTypeDropDown = [];
  if (this.dataType === 'Job Roles') {
    let employeeJobRoles = _.map(this.employeesInfo, (employee) => employee.jobRole);
    employeeJobRoles = _.compact(employeeJobRoles);
    _.forEach(employeeJobRoles, (jobRole) => this.dataTypeDropDown.push(jobRole));
  } else {
    this.filteredEmployees = this.employeesInfo;
  }
} // populateDataTypeDropDowns

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns(employees) {
  //resets dropdowns after each query
  this.contractsDropDown = [];
  this.primesDropDown = [];
  this.employeeNames = [];
  //creates list of employee names for dropdown
  _.forEach(employees, (emp) => {
    this.employeeNames.push(`${emp.firstName} ${emp.lastName}`);
    emp.fullName = `${emp.firstName} ${emp.lastName}`;
  });
  let employeesContracts = _.map(employees, (employee) => employee.contracts); // extract contracts
  employeesContracts = _.compact(employeesContracts); // remove falsey values
  // loop employees
  _.forEach(employeesContracts, (contracts) => {
    // loop contracts
    _.forEach(contracts, (contract) => {
      // loop through projects to test if contract is current (this was added to make sure only current contracts/primes were listed in Reports autocomplete dropdowns)
      _.forEach(contract, (projects) => {
        // loop project
        _.forEach(projects, (project) => {
          if (project.presentDate) {
            this.contractsDropDown.push(contract.name); // add contract name
            this.primesDropDown.push(contract.prime); // add contract prime
          }
        });
      });
    });
  });
} // populateDropDowns

/**
 * Refresh the filter dropdown to display matched data to the search.
 */
function refreshDataTypeList() {
  if (this.dataTypeSearch) {
    this.searchDataType();
  } else {
    this.filteredEmployees = this.employeesInfo;
  }
  this.populateDataTypeDropDowns();
} // refreshDataTypeList

/**
 * Refresh the list based on the current queries
 */
function refreshList() {
  if (this.contract) {
    this.searchContract();
  }
  if (this.prime) {
    this.searchPrime();
  }
  if (this.search) {
    this.filteredEmployees = _.filter(this.filteredEmployees, (employee) => {
      return employee.fullName.includes(this.search);
    });
  }
  if (this.search === null && this.contract === null && this.prime === null) {
    this.filteredEmployees = this.employeesInfo;
  }
  this.populateDropDowns(this.filteredEmployees);
} // refreshList

/**
 * Clears the other search forms and searches the table by contract
 */
function searchContract() {
  if (this.contract) {
    if (this.prime) {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.contractNames) {
          return (
            employee.contractNames.split(' & ').findIndex((element) => element.includes(this.contract)) > -1 &&
            employee.contractNames.split(' & ').findIndex((element) => element.includes(this.prime)) > -1
          );
        } else return false;
      });
    } else {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.contractNames) {
          return employee.contractNames.split(' & ').findIndex((element) => element.includes(this.contract)) > -1;
        } else return false;
      });
    }
  }
} // searchContract

/**
 * Checks the filter query with the dropdown data to see if anything matches. Edits the data table based on the selected query.
 */
function searchDataType() {
  if (this.dataType === 'Job Roles') {
    if (this.dataTypeSearch) {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.jobRole) {
          return employee.jobRole.includes(this.dataTypeSearch);
        } else {
          return false;
        }
      });
    }
  }
} // searchDataType

/**
 * Clears the other search forms and searches the table by prime
 */
function searchPrime() {
  if (this.prime) {
    if (this.contract) {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.contractNames) {
          return (
            employee.contractNames.split(' & ').findIndex((element) => element.includes(this.contract)) > -1 &&
            employee.contractNames.split(' & ').findIndex((element) => element.includes(this.prime)) > -1
          );
        } else return false;
      });
    } else {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.contractNames) {
          return employee.contractNames.split(' & ').findIndex((element) => element.includes(this.prime)) > -1;
        } else return false;
      });
    }
  }
} // searchPrime

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Gets the employees info for the table.
 */
async function created() {
  this.loading = true; // set loading status to true
  this.employeesInfo = await api.getItems(api.EMPLOYEES); // get all employees
  this.populateDropDowns(this.employeesInfo);
  this.buildContractsColumn();
  this.filteredEmployees = this.employeesInfo;
  this.constructAutoComplete(this.filteredEmployees);
  this.loading = false;
} //created

export default {
  created,
  data() {
    return {
      contractsDropDown: [],
      contract: null,
      dataType: 'Contracts',
      dataTypes: ['Contracts', 'Job Roles'],
      dataTypeDropDown: [],
      dataTypeSearch: null,
      employees: [],
      employeesInfo: [],
      employeeNames: [],
      expanded: [],
      filteredEmployees: [],
      headers: [
        {
          text: 'Employee #',
          value: 'employeeNumber'
        },
        {
          text: 'Name',
          value: 'fullName'
        },
        {
          text: 'Current Contract - Prime',
          value: 'contractNames'
        },
        {
          text: 'Email',
          value: 'email'
        }
      ], // datatable headers
      itemsPerPage: -1,
      loading: false,
      prime: null,
      primesDropDown: [],
      search: null, // query text for datatable search field
      sortBy: 'firstName', // sort datatable items
      sortDesc: false
    };
  },
  methods: {
    buildContractsColumn,
    buildJobRolesColumn,
    constructAutoComplete,
    customFilter,
    getFullName,
    isFocus,
    populateDataTypeDropDowns,
    populateDropDowns,
    refreshDataTypeList,
    refreshList,
    searchContract,
    searchDataType,
    searchPrime
  },
  watch: {
    dataType: function () {
      if (this.dataTypes.includes(this.dataType)) {
        // builds the data for the third column based off the data type chosen by the user
        switch (this.dataType) {
          case 'Contracts':
            this.buildContractsColumn();
            break;
          case 'Job Roles':
            this.buildJobRolesColumn();
            break;
          default:
            this.buildContractsColumn();
        }
      }
      this.dataTypeSearch = null;
      this.populateDataTypeDropDowns();
    }
  }
};
</script>

<style>
.notranslate {
  transform: none !important;
}
</style>
