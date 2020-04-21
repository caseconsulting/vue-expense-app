<template>
  <v-layout row wrap>
    <!-- form submission status message -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      :right="true"
      :timeout="5000"
      :top="true"
      :vertical="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" text @click="clearStatus">
        Close
      </v-btn>
    </v-snackbar>
    <!-- end form submission status message -->

    <v-flex :lg8="userIsAdmin()" :lg12="!userIsAdmin()" md12 sm12>
      <v-card>
        <v-container fluid>
          <v-card-title>
            <h2>Employees</h2>
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
          </v-card-title>

          <fieldset v-if="userIsAdmin()" class="filter_border">
            <legend class="legend_style">Filters</legend>

            <!-- active filter -->
            <div class="flagFilter">
              <h4>Employee Status:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.active" text multiple>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="full" v-on="on" text>
                      <icon class="mr-1" name="clock" color="black"></icon>
                    </v-btn>
                  </template>
                  <span>Full Time</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="part" v-on="on" text>
                      <icon name="regular/clock" color="black"></icon>
                    </v-btn>
                  </template>
                  <span>Part Time</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="inactive" v-on="on" text>
                      <icon name="regular/stop-circle" color="black"></icon>
                    </v-btn>
                  </template>
                  <span>Inactive</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>

            <!-- end active filter -->
          </fieldset>
          <br />
          <!-- employee datatable-->
          <v-data-table
            :headers="headers"
            :items="employeeList"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :expanded.sync="expanded"
            :loading="loading"
            :items-per-page="25"
            :search="search"
            item-key="employeeNumber"
            class="elevation-1"
          >
            <!-- rows in datatable -->
            <template v-slot:item="{ item }">
              <tr :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }" @click="clickedRow(item)">
                <td>{{ item.employeeNumber }}</td>
                <td>{{ item.firstName }}</td>
                <td>{{ item.lastName }}</td>
                <td>{{ item.hireDate | dateFormat }}</td>
                <td>{{ item.email }}</td>

                <!-- action icons -->
                <td class="datatable_btn layout" v-if="userIsAdmin()" @click="clickedRow(item)">
                  <!-- edit button -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        :disabled="isEditing()"
                        text
                        icon
                        @click="
                          toForm();
                          onSelect(item);
                        "
                        v-on="on"
                      >
                        <v-icon style="color: #606060">
                          edit
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Edit</span>
                  </v-tooltip>
                  <!-- end edit button -->
                  <!-- delete button -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn :disabled="isEditing()" text icon @click="validateDelete(item)" v-on="on">
                        <v-icon style="color: #606060">
                          delete
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>
                  <!-- end delete button -->
                </td>
                <!-- end action icons -->
              </tr>
            </template>
            <!-- end rows in datatable -->
            <!-- expanded slot in datatable -->
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" class="pa-0">
                <v-card text>
                  <v-card-text>
                    <div class="expandedInfo" v-if="isDisplayData(item)">
                      <p>No additional data</p>
                    </div>
                    <div class="expandedInfo" v-else>
                      <p v-if="userIsAdmin()">
                        <b>Status: </b>
                        {{ getWorkStatus(item.workStatus) }}
                      </p>
                      <p v-if="!isEmpty(item.prime)"><b>Prime: </b> {{ item.prime }}</p>
                      <p v-if="!isEmpty(item.contract)"><b>Contract: </b>{{ item.contract }}</p>
                      <p v-if="!isEmpty(item.jobRole)"><b>Job Role: </b>{{ item.jobRole }}</p>
                      <p v-if="!isEmpty(item.github)">
                        <b>Github: </b
                        ><a :href="'https://github.com/' + item.github" target="_blank">{{ item.github }}</a>
                      </p>
                      <p v-if="!isEmpty(item.twitter)">
                        <b>Twitter: </b>
                        <a :href="'https://twitter.com/' + item.twitter" target="_blank">{{ item.twitter }}</a>
                      </p>
                      <p v-if="userIsAdmin() && !isEmpty(item.birthday)">
                        <b>Birthday: </b>{{ item.birthday | dateFormat }}
                      </p>
                      <p v-if="userIsAdmin() && !isEmpty(item.city) && !isEmpty(item.st) && !isEmpty(item.country)">
                        <b>Place of Birth: </b>{{ item.city }}, {{ item.st }}, {{ item.country }}
                      </p>
                      <p v-else-if="userIsAdmin() && !isEmpty(item.city) && !isEmpty(item.st)">
                        <b>Place of Birth: </b>{{ item.city }}, {{ item.st }}
                      </p>
                      <p v-else-if="userIsAdmin() && !isEmpty(item.city) && !isEmpty(item.country)">
                        <b>Place of Birth: </b>{{ item.city }}, {{ item.country }}
                      </p>
                      <p v-else-if="userIsAdmin() && !isEmpty(item.country)">
                        <b>Place of Birth: </b>{{ item.country }}
                      </p>
                      <p v-if="userIsAdmin() && !isEmpty(item.deptDate)">
                        <b>Departure Date: </b>{{ item.deptDate | dateFormat }}
                      </p>
                    </div>
                  </v-card-text>
                </v-card>
                <v-card text v-if="userIsAdmin()">
                  <v-card-text>
                    <employee-home :adminCall="true" :employ="item"> </employee-home>
                  </v-card-text>
                </v-card>
              </td>
            </template>
            <!-- end expanded slot in datatable -->
            <!-- alert for no search results -->
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
              Your search for "{{ search }}" found no results.
            </v-alert>
            <!-- end alert for no search results -->
          </v-data-table>
          <!-- end employee datatable -->
          <br />
          <!-- download employee csv button -->
          <convert-employees-to-csv v-if="userIsAdmin()" :employees="getFilteredEmployees()"></convert-employees-to-csv>
          <!-- end download employee csv button -->
          <!-- confirmation modals -->
          <delete-modal :activate="deleting" :type="'employee'"></delete-modal>
          <delete-error-modal :activate="invalidDelete" type="employee"></delete-error-modal>
          <!-- end confirmation modals -->
        </v-container>
      </v-card>
    </v-flex>

    <!-- employee form -->
    <v-flex v-if="userIsAdmin()" lg4 md12 sm12>
      <employee-form
        ref="form"
        :model="model"
        v-on:add="addModelToTable"
        v-on:update="updateModelInTable"
        v-on:error="displayError"
      ></employee-form>
    </v-flex>
    <!-- end employee form -->
  </v-layout>
</template>

<script>
import { getRole } from '@/utils/auth';
import api from '@/shared/api.js';
import EmployeeForm from '../components/EmployeeForm.vue';
import moment from 'moment';
import _ from 'lodash';
import EmployeeHome from '@/views/EmployeeHome.vue';
import ConvertEmployeesToCsv from '../components/ConvertEmployeesToCsv.vue';
import DeleteModal from '../components/DeleteModal.vue';
import DeleteErrorModal from '../components/DeleteErrorModal.vue';

/* methods */
function isFullTime(employee) {
  return employee.workStatus == 100;
}

function isInactive(employee) {
  return employee.workStatus == 0;
}

function isPartTime(employee) {
  return employee.workStatus > 0 && employee.workStatus < 100;
}

function userIsAdmin() {
  return getRole() === 'admin';
}

async function refreshEmployees() {
  this.loading = true;
  this.employees = await api.getItems(api.EMPLOYEES);
  this.filterEmployees();
  this.expanded = [];
  this.loading = false;
}

/**
 * Filters the filteredEmployees array.
 */
function filterEmployees() {
  //filter for Active Expense Types (available to admin only)
  this.filteredEmployees = _.filter(this.employees, employee => {
    let fullCheck = this.filter.active.includes('full') && this.isFullTime(employee);
    let partCheck = this.filter.active.includes('part') && this.isPartTime(employee);
    let inactiveCheck = this.filter.active.includes('inactive') && this.isInactive(employee);
    return fullCheck || partCheck || inactiveCheck;
  });
}

/**
 * Returns an array copy of filtered employees.
 */
function getFilteredEmployees() {
  return this.filteredEmployees.slice();
}

/**
 * Returns Full Time, Part Time, or Inactive based on the work status
 */
function getWorkStatus(workStatus) {
  if (workStatus == 100) {
    return 'Full Time';
  } else if (workStatus == 0) {
    return 'Inactive';
  } else if (workStatus > 0 && workStatus < 100) {
    return 'Part Time';
  } else {
    return 'Invalid Status';
  }
}

function onSelect(item) {
  this.$set(this.model, 'id', item.id);
  this.$set(this.model, 'firstName', item.firstName);
  this.$set(this.model, 'middleName', item.middleName);
  this.$set(this.model, 'lastName', item.lastName);
  this.$set(this.model, 'email', item.email);
  this.$set(this.model, 'employeeRole', item.employeeRole);
  this.$set(this.model, 'employeeNumber', item.employeeNumber);
  this.$set(this.model, 'hireDate', item.hireDate);
  this.$set(this.model, 'workStatus', item.workStatus);

  // New Fields
  this.$set(this.model, 'birthday', item.birthday);
  this.$set(this.model, 'jobRole', item.jobRole);
  this.$set(this.model, 'prime', item.prime.trim());
  this.$set(this.model, 'contract', item.contract.trim());
  this.$set(this.model, 'github', item.github.trim());
  this.$set(this.model, 'twitter', item.twitter.trim());
  this.$set(this.model, 'city', item.city.trim());
  this.$set(this.model, 'st', item.st.trim());
  this.$set(this.model, 'country', item.country.trim());
  this.$set(this.model, 'deptDate', item.deptDate);
}

function clearModel() {
  this.$set(this.model, 'id', '');
  this.$set(this.model, 'firstName', '');
  this.$set(this.model, 'middleName', '');
  this.$set(this.model, 'lastName', '');
  this.$set(this.model, 'email', '@consultwithcase.com');
  this.$set(this.model, 'employeeRole', '');
  this.$set(this.model, 'employeeNumber', null);
  this.$set(this.model, 'hireDate', null);
  this.$set(this.model, 'workStatus', 100);

  //New Fields
  this.$set(this.model, 'birthday', '');
  this.$set(this.model, 'jobRole', '');
  this.$set(this.model, 'prime', '');
  this.$set(this.model, 'contract', '');
  this.$set(this.model, 'github', '');
  this.$set(this.model, 'twitter', '');
  this.$set(this.model, 'city', '');
  this.$set(this.model, 'st', '');
  this.$set(this.model, 'country', '');
  this.$set(this.model, 'deptDate', '');
}

/*
 * Add employee to expanded row when clicked
 */
function clickedRow(value) {
  if (_.isEmpty(this.expanded) || this.expanded[0].employeeNumber != value.employeeNumber) {
    this.expanded = [];
    this.expanded.push(value);
  } else {
    this.expanded = [];
  }
}

function updateModelInTable() {
  this.refreshEmployees();
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Employee was successfully updated!');
  this.$set(this.status, 'color', 'green');
}

function addModelToTable(newEmployee) {
  let matchingEmployee = _.filter(this.employees, employee => employee.id === newEmployee.id);

  if (!matchingEmployee.length) {
    if (!this.isInactive(newEmployee)) {
      this.filteredEmployees.push(newEmployee);
      this.employees.push(newEmployee);
    } else {
      this.employees.push(newEmployee);
    }
  }

  this.refreshEmployees();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Employee was successfully created!');
  this.$set(this.status, 'color', 'green');
}

function deleteModelFromTable() {
  let modelIndex = _.findIndex(this.employees, employee => employee.id === this.deleteModel.id);
  this.employees.splice(modelIndex, 1);
  modelIndex = _.findIndex(this.filteredEmployees, employee => employee.id === this.deleteModel.id);
  this.filteredEmployees.splice(modelIndex, 1);

  this.refreshEmployees();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Employee was successfully deleted!');
  this.$set(this.status, 'color', 'green');
}

function changeSort(column) {
  if (this.pagination.sortBy === column) {
    this.pagination.descending = !this.pagination.descending;
  } else {
    this.pagination.sortBy = column;
    this.pagination.descending = false;
  }
}

function clearStatus() {
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
}

async function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
}

/**
 * Returns true if there is data about the employee to display
 */
function isDisplayData(item) {
  let valid =
    !this.userIsAdmin() &&
    this.isEmpty(item.prime) &&
    this.isEmpty(item.contract) &&
    this.isEmpty(item.jobRole) &&
    this.isEmpty(item.github) &&
    this.isEmpty(item.twitter);
  return valid;
}

async function validateDelete(item) {
  let x = await api
    .getAllEmployeeExpenses(item.id)
    .then(result => {
      return result.length <= 0;
    })
    .catch(err => {
      this.displayError(err);
    });
  if (x) {
    this.$set(this.deleteModel, 'id', item.id);
    this.deleting = true;
  } else {
    this.invalidDelete = true;
  }
}

function isEditing() {
  return !!this.model.id;
}

async function deleteEmployee() {
  this.deleting = false;
  let e = await api.deleteItem(api.EMPLOYEES, this.deleteModel.id);
  if (e.id) {
    this.deleteModelFromTable();
  } else {
    this.displayError(e.response.data.message);
  }
}

function isEmpty(item) {
  return !item || item.trim().length <= 0;
}

function isFocus(item) {
  let expanded = !_.isEmpty(this.expanded) && item.employeeNumber == this.expanded[0].employeeNumber;
  return expanded || this.model.id == item.id;
}

/* computed */
function employeeList() {
  return this.filteredEmployees;
}

/*
 * scrolls window back to the top of the form
 */
function toForm() {
  this.$vuetify.goTo(this.$refs.form.$el.offsetTop + 50);
}

// LIFECYCLE HOOKS
async function created() {
  this.refreshEmployees();

  window.EventBus.$on('canceled-delete-employee', () => (this.deleting = false));
  window.EventBus.$on('confirm-delete-employee', this.deleteEmployee);
  window.EventBus.$on('invalid-employee-delete', () => (this.invalidDelete = false));

  // if user, remove employee action button header
  if (!this.userIsAdmin()) {
    this.headers.pop();
  }
}

export default {
  filters: {
    dateFormat: value => {
      if (value && value != ' ') {
        return moment(value).format('MMM Do, YYYY');
      } else {
        return '';
      }
    },
    dateFormatNoYear: value => {
      if (value) {
        return moment(value).format('MMM Do');
      } else {
        return '';
      }
    }
  },
  data() {
    return {
      deleteModel: {
        id: ''
      },
      deleting: false,
      employees: [],
      errors: [],
      expanded: [], // database expanded
      filter: {
        active: ['full', 'part'] //default only shows full and part time employees
      },
      filteredEmployees: [],
      headers: [
        {
          text: 'Employee #',
          value: 'employeeNumber'
        },
        {
          text: 'First Name',
          value: 'firstName'
        },
        {
          text: 'Last Name',
          value: 'lastName'
        },
        {
          text: 'Hire Date',
          value: 'hireDate'
        },
        {
          text: 'Email',
          value: 'email'
        },
        {
          value: 'actions',
          sortable: false
        }
      ],
      invalidDelete: false,
      loading: false,
      model: {
        id: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '@consultwithcase.com',
        employeeRole: '',
        employeeNumber: null,
        hireDate: null,
        workStatus: 100,

        //New Fields
        birthday: '',
        jobRole: '',
        prime: '',
        contract: '',
        github: '',
        twitter: '',
        city: '',
        st: '',
        country: '',
        deptDate: ''
      },
      search: '', // query text for datatable search field
      sortBy: 'employeeNumber', // sort datatable items
      sortDesc: false, // sort datatable items
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }
    };
  },
  components: {
    ConvertEmployeesToCsv,
    DeleteErrorModal,
    DeleteModal,
    EmployeeForm,
    EmployeeHome
  },
  created,
  watch: {
    'filter.active': function() {
      this.filterEmployees();
    }
    // ,
    // employee: function() {
    //   this.filterExpense();
    // }
  },
  methods: {
    addModelToTable,
    changeSort,
    clearModel,
    clearStatus,
    clickedRow,
    deleteEmployee,
    deleteModelFromTable,
    displayError,
    filterEmployees,
    getFilteredEmployees,
    getWorkStatus,
    isDisplayData,
    isEditing,
    isEmpty,
    isFocus,
    isFullTime,
    isInactive,
    isPartTime,
    onSelect,
    refreshEmployees,
    toForm,
    updateModelInTable,
    userIsAdmin,
    validateDelete
  },
  computed: {
    employeeList
  }
};
</script>

<style>
.flagEmp p {
  font-weight: bold;
  width: 75px;
  display: inline-block;
}

.expandedInfo {
  border: 1px solid black;
  font-size: 14px;
  padding: 20px;
}

.expandedInfo a {
  font-size: 14px;
  color: blue;
}

.expandedInfo a:hover {
  color: #0cf;
}
</style>
