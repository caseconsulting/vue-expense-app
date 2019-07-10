<template>
  <v-layout row wrap>
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
            item-key="empId"
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
                <td class="text-xs-left">{{ props.item.empId }}</td>
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
        </v-container>
      </v-card>
    </v-flex>

    <v-flex v-if="userIsAdmin()" lg4 md12 sm12>
      <employee-form
        :model="model"
        v-on:add="addModelToTable"
        v-on:update="updateModelInTable"
        v-on:delete="deleteModelFromTable"
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
export default {
  filters: {
    dateFormat: value => {
      if (value) {
        return moment(value).format('MMM Do, YYYY');
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
      headers: [
        {
          text: 'Employee ID',
          value: 'empId'
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
      ],
      pagination: {
        sortBy: 'empId',
        rowsPerPage: -1
      },
      model: {
        id: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '@consultwithcase.com',
        employeeRole: 'user',
        empId: null,
        hireDate: null,
        isActive: false
      },
      expand: false
    };
  },
  components: {
    EmployeeForm,
    EmployeeHome
  },
  async created() {
    this.refreshEmployees();
  },

  methods: {
    isInActive(employee) {
      return employee.isActive ? '' : 'Not Active';
    },
    userIsAdmin() {
      return getRole() === 'super-admin';
    },
    async refreshEmployees() {
      this.loading = true;
      this.employees = await api.getItems(api.EMPLOYEES);
      this.filteredEmployees = _.filter(this.employees, employee => {
        return employee.isActive;
      });
      this.loading = false;
    },
    onSelect(item) {
      this.$set(this.model, 'id', item.id);
      this.$set(this.model, 'firstName', item.firstName);
      this.$set(this.model, 'middleName', item.middleName);
      this.$set(this.model, 'lastName', item.lastName);
      this.$set(this.model, 'email', item.email);
      this.$set(this.model, 'employeeRole', item.employeeRole);
      this.$set(this.model, 'empId', item.empId);
      this.$set(this.model, 'hireDate', item.hireDate);
      this.$set(this.model, 'isActive', !item.isActive);
    },
    clearModel() {
      this.$set(this.model, 'id', '');
      this.$set(this.model, 'firstName', '');
      this.$set(this.model, 'middleName', '');
      this.$set(this.model, 'lastName', '');
      this.$set(this.model, 'email', '@consultwithcase.com');
      this.$set(this.model, 'employeeRole', 'user');
      this.$set(this.model, 'empId', null);
      this.$set(this.model, 'hireDate', null);
      this.$set(this.model, 'isActive', false);
    },
    updateModelInTable(updatedEmployee) {
      let matchingEmployeeIndex = _.findIndex(this.employees, employee => employee.id === updatedEmployee.id);
      this.employees.splice(matchingEmployeeIndex, 1, updatedEmployee);

      if (updatedEmployee.isActive) {
        matchingEmployeeIndex = _.findIndex(this.filteredEmployees, employee => employee.id === updatedEmployee.id);
        this.filteredEmployees.splice(matchingEmployeeIndex, 1, updatedEmployee);
      } else {
        this.filteredEmployees = _.remove(this.filteredEmployees, employee => employee.id !== updatedEmployee.id);
      }
    },
    addModelToTable(newEmployee) {
      let matchingEmployee = _.filter(this.employees, employee => employee.id === newEmployee.id);

      if (!matchingEmployee.length) {
        if (newEmployee.isActive) {
          this.filteredEmployees.push(newEmployee);
          this.employees.push(newEmployee);
        } else {
          this.employees.push(newEmployee);
        }
      }
    },
    deleteModelFromTable() {
      let modelIndex = _.findIndex(this.employees, employee => employee.id === this.model.id);
      this.employees.splice(modelIndex, 1);
      modelIndex = _.findIndex(this.filteredEmployees, employee => employee.id === this.model.id);
      this.filteredEmployees.splice(modelIndex, 1);
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    }
  },
  computed: {
    employeeList() {
      return this.showAll ? this.employees : this.filteredEmployees;
    }
  }
};
</script>
