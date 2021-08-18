<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :filter="customFilter"
            :items="employees"
            label="Search"
            clearable
            @click:clear="
              search = null;
              refreshList();
            "
          ></v-autocomplete>
        </v-col>
        <v-col>
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
        <v-col>
          <v-autocomplete
            v-model="prime"
            :items="primesDropDown"
            label="Search By Prime"
            clearable
            @change="refreshList()"
            @click:clear="prime = null"
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
 * Gets the full name of an employee.
 * @returns String - The employees first name
 */
function getFullName(item) {
  item.fullName = item.firstName + ' ' + item.lastName;
  return item.fullName;
} // getFullName

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
    constructAutoComplete,
    customFilter,
    getFullName,
    isFocus,
    populateDropDowns,
    refreshList,
    searchContract,
    searchPrime
  }
};
</script>

<style>
.notranslate {
  transform: none !important;
}
</style>
