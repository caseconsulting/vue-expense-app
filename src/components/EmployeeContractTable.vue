<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="6" xl="3" lg="3" md="6" class="my-0 pb-lg-2 pb-md-0">
          <v-autocomplete
            id="reportsDataType"
            v-model="dataType"
            :items="dataTypes"
            :filter="customFilter"
            label="Type of Data"
            auto-select-first
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="6" class="my-0 pb-0">
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :filter="customEmployeeFilter"
            :items="employees"
            label="Search By Employee Name"
            auto-select-first
            clearable
            @click:clear="
              search = null;
              refreshList();
            "
          ></v-autocomplete>
        </v-col>
        <v-col v-if="dataType === 'Contracts'" cols="6" xl="3" lg="3" md="6" class="my-0 pb-3 pt-xl-3 pt-lg-3 pt-md-0">
          <v-autocomplete
            v-model="contract"
            :items="contractsDropDown"
            :filter="customFilter"
            label="Search By Contract"
            clearable
            auto-select-first
            @change="refreshList()"
            @click:clear="contract = null"
          >
          </v-autocomplete>
        </v-col>
        <v-col v-if="dataType === 'Contracts'" cols="6" xl="3" lg="3" md="6" class="my-0 pb-0 pt-xl-3 pt-lg-3 pt-md-0">
          <v-autocomplete
            v-model="prime"
            :items="primesDropDown"
            :filter="customFilter"
            label="Search By Prime"
            clearable
            auto-select-first
            @change="refreshList()"
            @click:clear="prime = null"
          ></v-autocomplete>
        </v-col>
        <v-col v-else-if="dataType === 'Job Roles'" cols="6" xl="3" lg="3" md="6" class="my-0 pb-3">
          <v-autocomplete
            v-model="dataTypeSearch"
            :items="dataTypeDropDown"
            :label="`Search By ${dataType}`"
            :filter="customFilter"
            clearable
            auto-select-first
            @change="refreshDataTypeList()"
            @click:clear="dataTypeSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-checkbox v-model="showInactiveEmployees" label="Show Inactive Users"></v-checkbox>
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
        @click:row="handleClick"
      >
        <!-- Employee Number Slot -->
        <template v-slot:[`item.employeeNumber`]="{ item }">
          <p :class="{ selectFocus: isFocus(item), inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.employeeNumber }}
          </p>
        </template>
        <!-- Full Name Item Slot -->
        <template v-slot:[`item.fullName`]="{ item }">
          <p :class="{ selectFocus: isFocus(item), inactive: item.workStatus <= 0 }" class="mb-0">
            {{ getFullName(item) }}
          </p>
        </template>
        <!-- Prime/Contracts Item Slot -->
        <template v-slot:[`item.contractNames`]="{ item }">
          <p :class="{ selectFocus: isFocus(item), inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.contractNames }}
          </p>
        </template>
        <!-- Email Name Item Slot -->
        <template v-slot:[`item.email`]="{ item }">
          <p :class="{ selectFocus: isFocus(item), inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.email }}
          </p>
        </template>
        <!-- Clearance Types Slot -->
        <template v-slot:[`item.clearanceType`]="{ item }">
          <p :class="{ selectFocus: isFocus(item), inactive: item.workStatus <= 0 }" class="mb-0">
            {{ getClearanceType(item.clearances, item) }}
          </p>
        </template>
        <!-- Badge Expiration Slot -->
        <template v-slot:[`item.badgeExpiration`]="{ item }">
          <p :class="{ selectFocus: isFocus(item), inactive: item.workStatus <= 0 }" class="mb-0">
            {{ getBadgeExpiration(item.clearances, item) }}
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
import _ from 'lodash';
import moment from 'moment-timezone';

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

  if (this.headers[3].value === 'badgeExpiration') {
    this.headers.splice(3, 1); //remove badge exp column
  }
} // buildContractsColumn

/**
 * Replaces the third column with job role information.
 */
function buildJobRolesColumn() {
  this.headers.splice(2, 1, {
    text: 'Job Role',
    value: 'jobRole'
  });

  if (this.headers[3].value === 'badgeExpiration') {
    this.headers.splice(3, 1); //remove badge exp column
  }
} // buildJobRolesColumn

/**
 * Replaces the third column with clearance type and adds fourth column with security information.
 */
function buildSecurityColumn() {
  this.headers.splice(2, 1, {
    text: 'Clearance Type',
    value: 'clearanceType'
  });
  this.headers.splice(3, 0, {
    text: 'Badge Expiration Date',
    value: 'badgeExpiration'
  });
} // buildSecurityColumn

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
 * Custom filter for contract autocomplete options.
 *
 * @param item - contract object
 * @param queryText - query to use to filter
 * @return string - the filtered contract
 */
function customFilter(item, queryText) {
  const query = queryText ? queryText.trim() : '';
  const contract = item ? item.toLowerCase() : '';
  const queryContainsContract = contract.indexOf(query.toString().toLowerCase()) >= 0;
  return queryContainsContract;
} // customFilter

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item - employee object
 * @param queryText - query to use to filter
 * @return string - the filtered name
 */
function customEmployeeFilter(item, queryText) {
  const query = queryText ? queryText.trim() : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsEmployeeNumber = item.value.toString().indexOf(query.toString()) >= 0;

  return queryContainsNickName || queryContainsFirstName || queryContainsEmployeeNumber;
} // customEmployeeFilter

/**
 * sets midAction boolean to false
 *
 * @param item - the employee
 * @return the path to the employees profile
 */
function employeePath(item) {
  return `/employee/${item.employeeNumber}`;
} // employeePath

/**
 * Returns the expiration dates for all clearances in natural readable format. The sorting key of item.badgeExpiration
 * is stored just as the int form of the moment to get accurate sorting.
 *
 * @param clearances - the list of employee clearances
 * @param item - the employee
 * @return String - all badge expiration dates
 */
function getBadgeExpiration(clearances, item) {
  let dates = [];
  let fDate = 100000000000000000;

  // used for sorting... only store the lowest date (closest to expire)
  _.forEach(clearances, (clearance) => {
    if (clearance.badgeExpirationDate) {
      let newDate = parseInt(moment(clearance.badgeExpirationDate).format('X')); // seconds timestamp -> int
      if (newDate < fDate) fDate = newDate;
    }
  });

  // used for displaying
  _.forEach(clearances, (clearance) => {
    if (clearance.badgeExpirationDate) {
      dates.push(moment(clearance.badgeExpirationDate).format('MMM Do, YYYY'));
    }
  });

  item.badgeExpiration = fDate;

  dates = _.orderBy(dates);

  return _.join(dates, ' | ');
}

/**
 * Returns the expiration dates for all clearances.
 *
 * @param clearances - the list of employee clearances
 * @param item - the employee
 * @return String - all clearance types
 */
function getClearanceType(clearances, item) {
  let types = [];
  let clearanceList = _.sortBy(clearances, (c) => c.badgeExpirationDate);
  _.forEach(clearanceList, (clearance) => {
    if (clearance.type) {
      types.push(clearance.type);
    }
  });
  item.clearanceType = _.join(types, ' | ');
  return item.clearanceType;
}

/**
 * Gets the full name of an employee.
 *
 * @param item - the employee
 * @return String - The employees first name
 */
function getFullName(item) {
  item.fullName = item.firstName + ' ' + item.lastName;
  return item.fullName;
} // getFullName

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(item) {
  this.$router.push(employeePath(item));
} //handleClick

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
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropDowns(employees) {
  //resets dropdowns after each query
  this.contractsDropDown = [this.noContractPlaceholder];
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
      // loop through projects to test if contract is current
      // (this was added to make sure only current contracts/primes were listed in Reports autocomplete dropdowns)
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
    } else if (this.contract === this.noContractPlaceholder) {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        return !employee.contractNames;
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
 * Checks the filter query with the dropdown data to see if anything matches.
 * Edits the data table based on the selected query.
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

/**
 * Returns a filtered list of the input with all inactive
 * employees removed
 */
function getActive(employees) {
  return _.filter(employees, (e) => {
    return e.workStatus > 0;
  });
} // isActive

/**
 * Swap active/inactive employees and reload the page data (including dropdowns)
 */
function setActiveInactive() {
  this.search = null;
  this.employeesInfo = this.$store.getters.employees;
  if (!this.showInactiveEmployees) this.employeesInfo = getActive(this.employeesInfo);
  this.populateDropDowns(this.employeesInfo);
  this.constructAutoComplete(this.employeesInfo);
  this.buildContractsColumn();
  this.refreshDataTypeList();
  this.refreshList();
} // setActiveInactive

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
  this.allEmployees = this.$store.getters.employees; // get all employees
  this.employeesInfo = getActive(this.allEmployees); // default to filtered list
  this.filteredEmployees = this.employeesInfo; // this one is shown
  this.populateDropDowns(this.employeesInfo);
  this.buildContractsColumn();
  this.constructAutoComplete(this.employeesInfo);
  this.loading = false;
} //created

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for dataType - decides which column to render
 */
function watchDataType() {
  if (this.dataTypes.includes(this.dataType)) {
    // builds the data for the third column based off the data type chosen by the user
    switch (this.dataType) {
      case 'Contracts':
        this.buildContractsColumn();
        break;
      case 'Job Roles':
        this.buildJobRolesColumn();
        break;
      case 'Security Info':
        this.buildSecurityColumn();
        break;
      default:
        this.buildContractsColumn();
    }
  }
  this.dataTypeSearch = null;
  this.populateDataTypeDropDowns();
} // watchDataType

/**
 * Watches the showInactiveUsers to refilter the table as needed
 */
function watchShowInactiveUsers() {
  this.setActiveInactive();
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      contractsDropDown: [],
      contract: null,
      dataType: 'Contracts',
      dataTypes: ['Contracts', 'Job Roles', 'Security Info'],
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
      noContractPlaceholder: ' — No Contract — ',
      prime: null,
      primesDropDown: [],
      search: null, // query text for datatable search field
      showInactiveEmployees: false,
      sortBy: 'firstName', // sort datatable items
      sortDesc: false
    };
  },
  methods: {
    buildContractsColumn,
    buildJobRolesColumn,
    buildSecurityColumn,
    constructAutoComplete,
    customEmployeeFilter,
    customFilter,
    employeePath,
    getBadgeExpiration,
    getClearanceType,
    getFullName,
    getActive,
    handleClick,
    isFocus,
    populateDataTypeDropDowns,
    populateDropDowns,
    refreshDataTypeList,
    refreshList,
    searchContract,
    searchDataType,
    searchPrime,
    setActiveInactive
  },
  watch: {
    dataType: watchDataType,
    showInactiveEmployees: watchShowInactiveUsers
  }
};
</script>
<style lang="scss" scoped>
@import 'src/assets/styles/styles';
.inactive {
  color: $case-red;
}
</style>
