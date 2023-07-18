<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12" xl="3" lg="3" md="3" sm="12" class="my-0 py-0">
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :filter="customEmployeeFilter"
            :items="employees"
            label="Search By Employee Name"
            auto-select-first
            clearable
            @change="refreshDropdownItems()"
            @click:clear="
              search = null;
              refreshDropdownItems();
            "
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="contractSearch"
            :items="contractsDropDown"
            :filter="customFilter"
            label="Search By Contract"
            clearable
            auto-select-first
            @change="refreshDropdownItems()"
            @click:clear="contractSearch = null"
          >
          </v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="primeSearch"
            :items="primesDropDown"
            :filter="customFilter"
            label="Search By Prime"
            clearable
            auto-select-first
            @change="refreshDropdownItems()"
            @click:clear="primeSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            class="d-inline-block"
            clearable
            label="Filter by Tag (click to flip)"
            v-model="selectedTags"
            :items="tags"
            multiple
            variant="solo-filled"
            item-color="gray"
            item-text="tagName"
            item-value="id"
            @change="refreshDropdownItems()"
            return-object
          >
            <template v-slot:selection="data">
              <v-chip
                close
                @click="negateTag(data.item)"
                @click:close="removeTag(data.item)"
                :color="chipColor(data.item.id)"
              >
                {{ tagFlip.includes(data.item.id) ? 'NOT ' : '' }}
                {{ data.item.tagName }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-checkbox v-model="showInactiveEmployees" label="Show Inactive Users"></v-checkbox>
        </v-col>
      </v-row>

      <!-- START EMPLOYEE TABLE -->
      <v-data-table
        :headers="headers"
        :items="filteredEmployees"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :items-per-page.sync="itemsPerPage"
        class="elevation-1 row-pointer"
        @click:row="handleClick"
      >
        <!-- Employee Number Slot -->
        <template v-slot:[`item.employeeNumber`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.employeeNumber }}
          </p>
        </template>
        <!-- Full Name Item Slot -->
        <template v-slot:[`item.fullName`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ getFullName(item) }}
          </p>
        </template>
        <!-- Contracts Item Slot -->
        <template v-slot:[`item.contractNames`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.contractNames }}
          </p>
        </template>
        <!-- Prime Item Slot -->
        <template v-slot:[`item.primeNames`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.primeNames }}
          </p>
        </template>
        <!-- Email Name Item Slot -->
        <template v-slot:[`item.email`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.email }}
          </p>
        </template>
        <!-- Alert for no search results -->
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
      <!-- END EMPLOYEE TABLE -->
    </v-container>
  </div>
</template>

<script>
import _ from 'lodash';
import { customEmployeeFilter, getActive, getFullName, populateEmployeesDropdown } from './reports-utils';

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
function created() {
  window.EventBus.$on('get-employees-to-contact', () => {
    window.EventBus.$emit('list-of-employees-to-contact', this.filteredEmployees);
  });

  this.employeesInfo = this.getActive(this.$store.getters.employees); // default to filtered list
  this.tags = this.$store.getters.tags;
  this.filteredEmployees = this.employeesInfo; // this one is shown
  this.populateDropdowns(this.employeesInfo);
  this.buildContractsColumn();
  if (this.$route.params.requestedFilter) {
    this.primeSearch = this.$route.params.requestedFilter;
    this.refreshDropdownItems();
    this.$route.params.requestedFilter = null;
  }
} // created

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
      let contractNames = '';
      let primeNames = '';
      currentEmp.contracts.forEach((currentCon) => {
        // find current contracts
        let current = false;
        if (currentCon.projects) {
          currentCon.projects.forEach((currProj) => {
            if (!currProj.endDate) {
              current = true;
            }
          });
        }
        // add current contracts
        if (current) {
          let contract = this.$store.getters.contracts.find((c) => c.id === currentCon.contractId);
          contractNames += `${contract.contractName} & `;
          primeNames += `${contract.primeName} & `;
        }
      });
      // remove & at the end
      contractNames = contractNames.slice(0, -2);
      primeNames = primeNames.slice(0, -2);
      currentEmp.contractNames = contractNames;
      currentEmp.primeNames = primeNames;
    }
  });
} // buildContractsColumn

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
 * Returns the color that at tag filter chip should be
 *
 * @param id ID of the tag item
 *
 */
function chipColor(id) {
  return this.tagFlip.includes(id) ? 'red' : 'gray';
} // chipColor

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(item) {
  this.$router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populate contracts and primes dropdown items that match the searches.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateContractsAndPrimesDropdown(employees) {
  //resets dropdowns after each query
  this.contractsDropDown = [];
  this.primesDropDown = [];

  let origContracts = _.map(employees, (employee) => employee.contracts); // extract contracts
  let employeesContracts = _.compact(origContracts); // remove falsey values

  // if there were any employees without a contract they would have been filtered out
  // and we want to show No Contract as an option in the dropdown
  if (origContracts.length !== employeesContracts.length) {
    this.contractsDropDown.push(this.noContractPlaceholder);
  }

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
            let fullContract = this.$store.getters.contracts.find((c) => c.id === contract.contractId);
            if (this.contract) {
              // limit the prime dropdown to only those that belong to the contract
              if (fullContract.contractName === this.contractSearch) {
                this.contractsDropDown.push(fullContract.contractName);
                this.primesDropDown.push(fullContract.primeName);
              }
            } else if (this.primeSearch) {
              // limit the contract dropdown to only those that belong to the prime
              if (fullContract.primeName === this.primeSearch) {
                this.contractsDropDown.push(fullContract.contractName);
                this.primesDropDown.push(this.primeSearch);
              }
            } else {
              this.contractsDropDown.push(fullContract.contractName); // add contract name
              this.primesDropDown.push(fullContract.primeName); // add contract prime
            }
          }
        });
      });
    });
  });
} // populateContractsAndPrimesDropdown

/**
 * Populate all dropdown items.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(employees) {
  // refresh the employees autocomplete list to be those that match the query
  this.employees = this.populateEmployeesDropdown(employees);
  this.populateContractsAndPrimesDropdown(employees);
} // populateDropdowns

/**
 * negates a tag
 */
function negateTag(item) {
  // try to find the id in the tagFlip array, if it is there then remove it else add it
  const index = this.tagFlip.indexOf(item.id);
  if (index >= 0) {
    this.tagFlip.splice(index, 1);
  } else {
    this.tagFlip.push(item.id);
  }
} // negateTag

/**
 * Refresh the list based on the current queries
 */
function refreshDropdownItems() {
  if (this.contractSearch) {
    this.searchContract();
  }
  if (this.primeSearch) {
    this.searchPrimes();
  }
  if (this.search) {
    this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
      return employee.employeeNumber == this.search;
    });
  }
  if (this.search === null && this.contractSearch === null && this.primeSearch === null) {
    this.filteredEmployees = this.employeesInfo;
  }
  if (this.selectedTags.length > 0) {
    this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
      return this.selectedTagsHasEmployee(employee);
    });
  }

  this.populateDropdowns(this.filteredEmployees);
} // refreshDropdownItems

/**
 * Removes an item from the tag filters's active filters
 *
 * @param item - The filter to remove
 */
function removeTag(item) {
  const selIndex = this.selectedTags.findIndex((t) => t.id === item.id);
  if (selIndex >= 0) {
    this.selectedTags.splice(selIndex, 1);
  }
} // remove

/**
 * Clears the other search forms and searches the table by contract
 */
function searchContract() {
  if (this.contractSearch) {
    if (this.primeSearch) {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.contractNames) {
          return (
            employee.contractNames.split(' & ').findIndex((element) => element.includes(this.contractSearch)) > -1 &&
            employee.primeNames.split(' & ').findIndex((element) => element.includes(this.primeSearch)) > -1
          );
        } else return false;
      });
    } else if (this.contractSearch === this.noContractPlaceholder) {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        return !employee.contractNames;
      });
    } else {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.contractNames) {
          return employee.contractNames.split(' & ').findIndex((element) => element.includes(this.contractSearch)) > -1;
        } else return false;
      });
    }
  }
} // searchContract

/**
 * Clears the other search forms and searches the table by prime
 */
function searchPrimes() {
  if (this.primeSearch) {
    if (this.contractSearch) {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.primeNames) {
          return (
            employee.contractNames.split(' & ').findIndex((element) => element.includes(this.contractSearch)) > -1 &&
            employee.primeNames.split(' & ').findIndex((element) => element.includes(this.primeSearch)) > -1
          );
        } else return false;
      });
    } else {
      this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
        if (employee.primeNames) {
          return employee.primeNames.split(' & ').findIndex((element) => element.includes(this.primeSearch)) > -1;
        } else return false;
      });
    }
  }
} // searchPrimes

/**
 * helper function: return true if any selected tag has employee listed under it.
 *
 * @param e - the employee
 * @return true if the employee has a tag selected in filters
 */
function selectedTagsHasEmployee(e) {
  let inTag, tagFlipped;
  for (let i = 0; i < this.selectedTags.length; i++) {
    inTag = this.selectedTags[i].employees.includes(e.id);
    tagFlipped = this.tagFlip.includes(this.selectedTags[i].id);
    if (inTag != tagFlipped) {
      return true;
    }
  }
  return false;
} // selectedTagsHasEmployee

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watches the showInactiveUsers to refilter the table as needed
 */
function watchShowInactiveUsers() {
  this.search = null;
  this.employeesInfo = this.$store.getters.employees;
  if (!this.showInactiveEmployees) this.employeesInfo = this.getActive(this.employeesInfo);
  this.populateDropdowns(this.employeesInfo);
  this.buildContractsColumn();
  this.refreshDropdownItems();
} // watchShowInactiveUsers

/**
 * In the case that the page has been force reloaded (and the store cleared)
 * this watcher will be activated when the store is populated again.
 */
function watchTagFlip() {
  this.refreshDropdownItems();
} // watchTagFlip

/**
 * Remove items from tagFlip array when they are removed from the selected
 * tags
 */
function watchSelectedTags() {
  let negatedTagRemoved = true;
  // use normal for loop to have the index
  for (let i = 0; i < this.tagFlip.length; i++) {
    // try to find the current tag in the selectedTags
    _.forEach(this.selectedTags, (t) => {
      if (t.id === this.tagFlip[i]) negatedTagRemoved = false;
    });
    // if it isn't there, remove it from tagFlip too
    if (negatedTagRemoved) {
      this.tagFlip.splice(i, 1);
    }
  }
} // watchSelectedTags

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
      contractSearch: null,
      employees: [],
      employeesInfo: [],
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
          text: 'Current Contract',
          value: 'contractNames'
        },
        {
          text: 'Current Prime',
          value: 'primeNames'
        },
        {
          text: 'Email',
          value: 'email'
        }
      ], // datatable headers
      itemsPerPage: -1,
      noContractPlaceholder: ' — No Contract — ',
      primeSearch: null,
      primesDropDown: [],
      search: null, // query text for datatable search field
      selectedTags: [],
      showInactiveEmployees: false,
      sortBy: 'firstName', // sort datatable items
      sortDesc: false,
      tags: [],
      tagFlip: [],
      tagSearchString: ''
    };
  },
  methods: {
    buildContractsColumn,
    customEmployeeFilter,
    customFilter,
    chipColor,
    getActive,
    getFullName,
    handleClick,
    negateTag,
    populateContractsAndPrimesDropdown,
    populateDropdowns,
    populateEmployeesDropdown,
    refreshDropdownItems,
    removeTag,
    searchContract,
    searchPrimes,
    selectedTagsHasEmployee
  },
  watch: {
    showInactiveEmployees: watchShowInactiveUsers,
    tagFlip: watchTagFlip,
    selectedTags: watchSelectedTags
  }
};
</script>

<style lang="css" scoped>
.row-pointer :deep(tbody tr :hover) {
  cursor: pointer;
}
</style>

<style lang="scss" scoped>
@import 'src/assets/styles/styles';
.inactive {
  color: $case-red;
}
</style>
