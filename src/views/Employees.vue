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
      :auto-height="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" flat @click="clearStatus">
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
              <h4>Active Employees:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.active" flat mandatory>
                <v-tooltip top>
                  <v-btn value="active" slot="activator" flat>
                    <icon class="mr-1" name="regular/check-circle"></icon>
                  </v-btn>
                  <span>Show Active</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="notActive" slot="activator" flat>
                    <icon name="regular/times-circle"></icon>
                  </v-btn>
                  <span>Hide Active</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn value="both" slot="activator" flat>
                    BOTH
                  </v-btn>
                  <span>Show All</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>
          </fieldset>
          <br />
          <v-data-table
            :headers="headers"
            :items="employeeList"
            :search="search"
            :pagination.sync="pagination"
            :expand="expand"
            item-key="employeeNumber"
            class="elevation-1"
          >
            <template slot="headers" slot-scope="props">
              <tr style="box-shadow: 0px 1.5px #888888;">
                <th
                  class="text-xs-left"
                  v-for="header in props.headers"
                  :key="header.text"
                  :class="[
                    'column sortable',
                    pagination.descending ? 'desc' : 'asc',
                    header.value === pagination.sortBy ? 'active' : ''
                  ]"
                  @click="changeSort(header.value)"
                >
                  {{ header.text }}
                  <v-icon small>arrow_upward</v-icon>
                </th>
              </tr>
            </template>

            <template v-slot:items="props">
              <tr
                :class="{ inactiveStyle: props.item.isInactive, selectFocus: props.expanded }"
                @click="props.expanded = !props.expanded"
              >
                <td class="text-xs-left">{{ props.item.employeeNumber }}</td>
                <td class="text-xs-left">{{ props.item.firstName }}</td>
                <td class="text-xs-left">{{ props.item.lastName }}</td>
                <td class="text-xs-left">{{ props.item.hireDate | dateFormat }}</td>
                <td class="text-xs-left">{{ props.item.email }}</td>

                <!-- action icons -->
                <td class="datatable_btn layout" v-if="userIsAdmin()">
                  <!-- edit button -->
                  <v-tooltip top>
                    <v-btn :disabled="isEditing()" flat icon @click="onSelect(props.item)" slot="activator">
                      <v-icon style="color: #606060">
                        edit
                      </v-icon>
                    </v-btn>
                    <span>Edit</span>
                  </v-tooltip>

                  <!-- delete button -->
                  <v-tooltip top>
                    <v-btn :disabled="isEditing()" flat icon @click="validateDelete(props.item)" slot="activator">
                      <v-icon style="color: #606060">
                        delete
                      </v-icon>
                    </v-btn>
                    <span>Delete</span>
                  </v-tooltip>
                </td>
              </tr>
            </template>

            <template v-slot:expand="props">
              <v-card flat>
                <v-card-text>
                  <div
                    class="expandedInfo"
                    v-if="
                      userIsAdmin() &&
                        isEmpty(props.item.prime) &&
                        isEmpty(props.item.contract) &&
                        isEmpty(props.item.jobRole) &&
                        isEmpty(props.item.github) &&
                        isEmpty(props.item.twitter) &&
                        isEmpty(props.item.birthday) &&
                        isEmpty(props.item.city) &&
                        isEmpty(props.item.st) &&
                        isEmpty(props.item.country) &&
                        isEmpty(props.item.deptDate) &&
                        !props.item.isInactive
                    "
                  >
                    <p>No additional data</p>
                  </div>
                  <div
                    class="expandedInfo"
                    v-else-if="
                      !userIsAdmin() &&
                        isEmpty(props.item.prime) &&
                        isEmpty(props.item.contract) &&
                        isEmpty(props.item.jobRole) &&
                        isEmpty(props.item.github) &&
                        isEmpty(props.item.twitter)
                    "
                  >
                    <p>No additional data</p>
                  </div>
                  <div class="expandedInfo" v-else>
                    <p v-if="!isEmpty(props.item.prime)"><b>Prime: </b> {{ props.item.prime }}</p>
                    <p v-if="!isEmpty(props.item.contract)"><b>Contract: </b>{{ props.item.contract }}</p>
                    <p v-if="!isEmpty(props.item.jobRole)"><b>Job Role: </b>{{ props.item.jobRole }}</p>
                    <p v-if="!isEmpty(props.item.github)">
                      <b>Github: </b
                      ><a :href="'https://github.com/' + props.item.github" target="_blank">{{ props.item.github }}</a>
                    </p>
                    <p v-if="!isEmpty(props.item.twitter)">
                      <b>Twitter: </b
                      ><a :href="'https://twitter.com/' + props.item.twitter" target="_blank">{{
                        props.item.twitter
                      }}</a>
                    </p>
                    <p v-if="userIsAdmin() && !isEmpty(props.item.birthday)">
                      <b>Birthday: </b>{{ props.item.birthday | dateFormat }}
                    </p>
                    <p
                      v-if="
                        userIsAdmin() &&
                          !isEmpty(props.item.city) &&
                          !isEmpty(props.item.st) &&
                          !isEmpty(props.item.country)
                      "
                    >
                      <b>Place of Birth: </b>{{ props.item.city }}, {{ props.item.st }}, {{ props.item.country }}
                    </p>
                    <p v-else-if="userIsAdmin() && !isEmpty(props.item.city) && !isEmpty(props.item.st)">
                      <b>Place of Birth: </b>{{ props.item.city }}, {{ props.item.st }}
                    </p>
                    <p v-else-if="userIsAdmin() && !isEmpty(props.item.city) && !isEmpty(props.item.country)">
                      <b>Place of Birth: </b>{{ props.item.city }}, {{ props.item.country }}
                    </p>
                    <p v-else-if="userIsAdmin() && !isEmpty(props.item.country)">
                      <b>Place of Birth: </b>{{ props.item.country }}
                    </p>
                    <p v-if="userIsAdmin() && !isEmpty(props.item.deptDate)">
                      <b>Departure Date: </b>{{ props.item.deptDate | dateFormat }}
                    </p>
                    <div v-if="userIsAdmin() && props.item.isInactive" class="flagEmp">
                      <p>Inactive:</p>
                      <icon
                        style="padding: 0px;"
                        v-if="props.item.isInactive"
                        id="marks"
                        class="mr-1"
                        name="regular/check-circle"
                      ></icon>
                      <icon v-else class="mr-1" id="marks" name="regular/times-circle"></icon>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              <v-card flat v-if="userIsAdmin()">
                <v-card-text>
                  <employee-home :adminCall="true" :employ="props.item"> </employee-home>
                </v-card-text>
              </v-card>
            </template>

            <v-alert slot="no-results" :value="true" color="error" icon="warning">
              Your search for "{{ search }}" found no results.
            </v-alert>
          </v-data-table>
          <br />
          <convert-employees-to-csv v-if="userIsAdmin()" :employees="getFilteredEmployees()"></convert-employees-to-csv>

          <delete-modal :activate="deleting" :type="'employee'"></delete-modal>
          <delete-error-modal :activate="invalidDelete" type="employee"></delete-error-modal>
        </v-container>
      </v-card>
    </v-flex>

    <v-flex v-if="userIsAdmin()" lg4 md12 sm12>
      <employee-form
        :model="model"
        v-on:add="addModelToTable"
        v-on:update="updateModelInTable"
        v-on:error="displayError"
        style="position: sticky; top: 79px;"
      ></employee-form>
    </v-flex>
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
function isInActive(employee) {
  return employee.isInactive ? 'Not Active' : '';
}

function userIsAdmin() {
  return getRole() === 'admin';
}

async function refreshEmployees() {
  this.loading = true;
  this.employees = await api.getItems(api.EMPLOYEES);
  this.filterEmployees();
  this.loading = false;
}

/**
 * Filters the filteredEmployees array.
 */
function filterEmployees() {
  //filter for Active Expense Types (available to admin only)
  if (this.filter.active !== 'both') {
    this.filteredEmployees = _.filter(this.employees, employee => {
      if (this.filter.active == 'active') {
        // display only active employees
        return !employee.isInactive;
      } else {
        // display only inactive employees
        return employee.isInactive;
      }
    });
  } else {
    // display all employees
    this.filteredEmployees = this.employees;
  }
}

/**
 * Returns an array copy of filtered employees.
 */
function getFilteredEmployees() {
  return this.filteredEmployees.slice();
}

function setExpenses(expenses) {
  this.$set(this.model, 'personalExpenses', expenses);
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
  this.$set(this.model, 'isInactive', item.isInactive);

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
  this.$set(this.model, 'isInactive', false);

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

function updateModelInTable() {
  this.refreshEmployees();
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Employee was successfully updated!');
  this.$set(this.status, 'color', 'green');
}

function addModelToTable(newEmployee) {
  let matchingEmployee = _.filter(this.employees, employee => employee.id === newEmployee.id);

  if (!matchingEmployee.length) {
    if (!newEmployee.isInactive) {
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

async function validateDelete(item) {
  let x = await api
    .getAllEmployeeExpenses(item.id)
    .then(result => {
      return result.length <= 0;
    })
    .catch(err => {
      console.log(err);
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

/* computed */
function employeeList() {
  return this.filteredEmployees;
}

// LIFECYCLE HOOKS
async function created() {
  this.refreshEmployees();

  window.EventBus.$on('canceled-delete-employee', () => (this.deleting = false));
  window.EventBus.$on('confirm-delete-employee', this.deleteEmployee);

  window.EventBus.$on('invalid-employee-delete', () => (this.invalidDelete = false));
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
      search: '',
      loading: false,
      deleting: false,
      invalidDelete: false,
      filter: {
        active: 'active' //default only shows active employees
      },
      employees: [],
      filteredEmployees: [],
      errors: [],
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      },
      pagination: {
        sortBy: 'employeeNumber',
        rowsPerPage: -1
      },
      model: {
        id: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '@consultwithcase.com',
        employeeRole: '',
        employeeNumber: null,
        hireDate: null,
        isInactive: false,
        personalExpenses: '',

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
      deleteModel: {
        id: ''
      },
      expand: false,
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
        }
      ]
    };
  },
  components: {
    EmployeeForm,
    EmployeeHome,
    ConvertEmployeesToCsv,
    DeleteModal,
    DeleteErrorModal
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
    isInActive,
    userIsAdmin,
    refreshEmployees,
    setExpenses,
    onSelect,
    clearModel,
    updateModelInTable,
    addModelToTable,
    deleteModelFromTable,
    changeSort,
    clearStatus,
    displayError,
    validateDelete,
    deleteEmployee,
    isEditing,
    isEmpty,
    getFilteredEmployees,
    filterEmployees
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
