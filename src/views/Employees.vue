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
                @click="
                  onSelect(props.item);
                  props.expanded = !props.expanded;
                "
              >
                <td class="text-xs-left">{{ props.item.employeeNumber }}</td>
                <td class="text-xs-left">{{ props.item.firstName }}</td>
                <td class="text-xs-left">{{ props.item.lastName }}</td>
                <td class="text-xs-left">{{ props.item.hireDate | dateFormat }}</td>
                <td class="text-xs-left">{{ props.item.email }}</td>
                <td class="text-xs-left">{{ isInActive(props.item) }}</td>
              </tr>
            </template>

            <template v-slot:expand="props">
              <v-card flat>
                <v-card-text>
                  <div class="expandedInfo">
                    <p><b>Prime: </b> {{ props.item.prime }}</p>
                    <p><b>Contract: </b>{{ props.item.contract }}</p>
                    <p><b>Job Role: </b>{{ props.item.jobRole }}</p>
                    <p>
                      <b>Github: </b><a :href="props.item.employeeNumber" target="_blank">{{ props.item.github }}</a>
                    </p>
                    <p>
                      <b>Twitter: </b><a :href="props.item.employeeNumber" target="_blank">{{ props.item.twitter }}</a>
                    </p>
                    <p v-if="userIsAdmin()"><b>Birthday: </b>{{ props.item.birthday | dateFormat }}</p>
                  </div>
                </v-card-text>
              </v-card>
              <v-card flat v-if="userIsAdmin()">
                <v-card-text>
                  <employee-home :employ="props.item"> </employee-home>
                </v-card-text>
              </v-card>
            </template>

            <v-alert slot="no-results" :value="true" color="error" icon="warning">
              Your search for "{{ search }}" found no results.
            </v-alert>
          </v-data-table>

          <v-card-actions v-show="userIsAdmin()">
            <v-checkbox :label="'Show Inactive Employees'" v-model="showAll"></v-checkbox>
          </v-card-actions>
          <convert-employees-to-esv v-if="userIsAdmin" :employees="this.employees"></convert-employees-to-esv>
        </v-container>
      </v-card>
    </v-flex>

    <v-flex v-if="userIsAdmin()" lg4 md12 sm12>
      <employee-form
        :model="model"
        v-on:add="addModelToTable"
        v-on:update="updateModelInTable"
        v-on:delete="deleteModelFromTable"
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
import ConvertEmployeesToEsv from '../components/ConvertEmployeesToEsv.vue';

/* methods */
function isInActive(employee) {
  return employee.isActive ? '' : 'Not Active';
}

function userIsAdmin() {
  return getRole() === 'super-admin' || getRole() === 'admin';
}

async function refreshEmployees() {
  this.loading = true;
  this.employees = await api.getItems(api.EMPLOYEES);
  this.filteredEmployees = _.filter(this.employees, employee => {
    return employee.isActive;
  });
  this.loading = false;
}

function getAllExpenses(id) {
  api
    .getAllEmployeeExpenses(id)
    .then(result => {
      this.$set(this.model, 'personalExpenses', result);
    })
    .catch(err => {
      console.log(err);
    });
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
  this.$set(this.model, 'isActive', !item.isActive);

  //New Fields
  this.$set(this.model, 'birthday', item.birthday);
  this.$set(this.model, 'jobRole', item.jobRole);
  this.$set(this.model, 'prime', item.prime);
  this.$set(this.model, 'contract', item.contract);
  this.$set(this.model, 'github', item.github);
  this.$set(this.model, 'twitter', item.twitter);

  this.getAllExpenses(item.id);
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
  this.$set(this.model, 'isActive', false);

  //New Fields
  this.$set(this.model, 'birthday', '');
  this.$set(this.model, 'jobRole', '');
  this.$set(this.model, 'prime', '');
  this.$set(this.model, 'contract', '');
  this.$set(this.model, 'github', '');
  this.$set(this.model, 'twitter', '');
}

function updateModelInTable(updatedEmployee) {
  console.log(updatedEmployee);
  let matchingEmployeeIndex = _.findIndex(this.employees, employee => employee.id === updatedEmployee.id);
  this.employees.splice(matchingEmployeeIndex, 1, updatedEmployee);

  if (updatedEmployee.isActive) {
    matchingEmployeeIndex = _.findIndex(this.filteredEmployees, employee => employee.id === updatedEmployee.id);
    this.filteredEmployees.splice(matchingEmployeeIndex, 1, updatedEmployee);
  } else {
    this.filteredEmployees = _.remove(this.filteredEmployees, employee => employee.id !== updatedEmployee.id);
  }
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Employee was successfully updated!');
  this.$set(this.status, 'color', 'green');
}

function addModelToTable(newEmployee) {
  let matchingEmployee = _.filter(this.employees, employee => employee.id === newEmployee.id);

  if (!matchingEmployee.length) {
    if (newEmployee.isActive) {
      this.filteredEmployees.push(newEmployee);
      this.employees.push(newEmployee);
    } else {
      this.employees.push(newEmployee);
    }
  }
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Employee was successfully created!');
  this.$set(this.status, 'color', 'green');
}

function deleteModelFromTable() {
  let modelIndex = _.findIndex(this.employees, employee => employee.id === this.model.id);
  this.employees.splice(modelIndex, 1);
  modelIndex = _.findIndex(this.filteredEmployees, employee => employee.id === this.model.id);
  this.filteredEmployees.splice(modelIndex, 1);
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

/* computed */
function employeeList() {
  return this.showAll ? this.employees : this.filteredEmployees;
}

// LIFECYCLE HOOKS
async function created() {
  this.refreshEmployees();
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
      showAll: false,
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
        isActive: false,
        personalExpenses: '',

        // New Fields
        birthday: '',
        jobRole: '',
        prime: '',
        contract: '',
        github: '',
        twitter: ''
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
        },
        {
          text: ''
        }
      ]
    };
  },
  components: {
    EmployeeForm,
    EmployeeHome,
    ConvertEmployeesToEsv
  },
  created,
  methods: {
    isInActive,
    userIsAdmin,
    refreshEmployees,
    getAllExpenses,
    setExpenses,
    onSelect,
    clearModel,
    updateModelInTable,
    addModelToTable,
    deleteModelFromTable,
    changeSort,
    clearStatus,
    displayError
  },
  computed: {
    employeeList
  }
};
</script>

<style>
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
