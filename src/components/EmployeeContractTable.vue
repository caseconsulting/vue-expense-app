<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-text-field
            id="employeesSearch"
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-col>
        <v-col>
          <v-autocomplete
            v-model="contract"
            :items="contractsDropDown"
            label="Search By Contract"
            @change="searchContract()"
            clearable
            @click:clear="
              contract = null;
              refreshList();
            "
          >
          </v-autocomplete>
        </v-col>
        <v-col>
          <v-autocomplete
            v-model="prime"
            :items="primesDropDown"
            label="Search By Prime"
            @change="searchPrime()"
            clearable
            @click:clear="
              prime = null;
              refreshList();
            "
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
        <template v-slot:[`item.firstName`]="{ item }">
          <p :class="{ selectFocus: isFocus(item) }" style="margin-bottom: 0px">
            {{ item.firstName + ' ' + item.lastName }}
          </p>
        </template>
        <!-- Contracts Item Slot -->
        <!-- <template v-slot:[`item.contracts`]="{ item }">
          <p v-if="item.contracts !== undefined" :class="{ selectFocus: isFocus(item) }" style="margin-bottom: 0px">
            {{
              item.contracts.forEach((current) => {
                current.name;
              })
            }}
          </p> -->
        <!-- </template> -->
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
 * Checks to see if an employee is expanded in the datatable.
 *
 * @param item - employee to check
 * @return boolean - the employee is expanded
 */
function isFocus(item) {
  let expanded = !_.isEmpty(this.expanded) && item.employeeNumber == this.expanded[0].employeeNumber;
  return expanded || this.model.id == item.id;
} // isFocus

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesContracts = _.map(this.employeesInfo, (employee) => employee.contracts); // extract contracts
  employeesContracts = _.compact(employeesContracts); // remove falsey values
  // loop employees
  _.forEach(employeesContracts, (contracts) => {
    // loop contracts
    _.forEach(contracts, (contract) => {
      this.contractsDropDown.push(contract.name); // add contract name
      this.primesDropDown.push(contract.prime); // add contract prime
    });
  });
} // populateDropDowns

/**
 * Refresh the list based on the current queries
 */
function refreshList() {
  if (this.contract) {
    this.searchContract();
  } else if (this.prime) {
    this.searchPrime();
  } else {
    this.filteredEmployees = this.employeesInfo;
  }
} // refreshList

/**
 * Clears the other search forms and searches the table by contract
 */
function searchContract() {
  //this.search = this.contract;
  //this.prime = null;
  if (this.contract) {
    if (this.prime) {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.contractNames) {
          return (
            employee.contractNames.findIndex((element) => element.includes(this.contract)) > -1 &&
            employee.contractNames.findIndex((element) => element.includes(this.prime)) > -1
          );
        } else return false;
      });
    } else {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.contractNames) {
          return employee.contractNames.findIndex((element) => element.includes(this.contract)) > -1;
        } else return false;
      });
    }
  }
} // searchContract

/**
 * Clears the other search forms and searches the table by prime
 */
function searchPrime() {
  //   this.search = this.prime;
  //   this.contract = null;
  if (this.prime) {
    if (this.contract) {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.contractNames) {
          return (
            employee.contractNames.findIndex((element) => element.includes(this.contract)) > -1 &&
            employee.contractNames.findIndex((element) => element.includes(this.prime)) > -1
          );
        } else return false;
      });
    } else {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.contractNames) {
          return employee.contractNames.findIndex((element) => element.includes(this.prime)) > -1;
        } else return false;
      });
    }
  }
} // searchPrime

/**
 * Clears the other search forms and searches the table by prime
 */
// function searchNorm() {
//   this.prime = null;
//   this.contract = null;
// } // searchPrime

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
  this.populateDropDowns();
  this.employeesInfo.forEach((currentEmp) => {
    if (currentEmp.contracts) {
      var contractNames = [];
      currentEmp.contracts.forEach((currentCon) => {
        var current = false;
        //console.log(currentCon);
        if (currentCon.projects) {
          currentCon.projects.forEach((currProj) => {
            if (!currProj.endDate) {
              current = true;
            }
          });
        }
        if (current == true) {
          contractNames.push(' ' + currentCon.name + ' - ' + currentCon.prime);
        }
      });
      currentEmp.contractNames = contractNames;
    }
  });
  this.filteredEmployees = this.employeesInfo;
  this.loading = false;
} //created
export default {
  created,
  data() {
    return {
      contractsDropDown: [],
      contract: null,
      employeesInfo: [],
      expanded: [],
      filteredEmployees: [],
      headers: [
        {
          text: 'Employee #',
          value: 'employeeNumber'
        },
        {
          text: 'Name',
          value: 'firstName'
        },
        {
          text: 'Current Contract and Prime',
          value: 'contractNames'
        },
        {
          text: 'Email',
          value: 'email'
        }
      ], // datatable headers
      itemsPerPage: -1,
      loading: false,
      model: {
        id: null,
        firstName: null,
        middleName: null,
        lastName: null,
        nickname: null,
        email: '@consultwithcase.com',
        employeeRole: null,
        employeeNumber: null,
        hireDate: null,
        workStatus: 100,
        birthday: null,
        birthdayFeed: false,
        jobRole: null,
        prime: null,
        contract: null,
        contracts: [],
        contractNames: [],
        github: null,
        twitter: null,
        phoneNumber: null,
        city: null,
        st: null,
        country: null,
        deptDate: null,
        currentCity: null,
        currentState: null,
        currentStreet: null,
        currentZIP: null
      }, // selected employee
      prime: null,
      primesDropDown: [],
      search: null, // query text for datatable search field
      sortBy: 'firstName', // sort datatable items
      sortDesc: false
    };
  },
  methods: {
    isFocus,
    populateDropDowns,
    refreshList,
    searchContract,
    searchPrime
  }
};
</script>

<style></style>
