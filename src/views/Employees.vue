<template>
<div>
  <v-layout row wrap>
    <v-flex lg8 md12 sm12>
      <v-card>
        <v-card-title>
          <h2>Employees</h2>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table v-model="selected" :headers="headers" :items="employees" :search="search" :pagination.sync="pagination" item-key="name" class="elevation-1">
          <template slot="headers" slot-scope="props">
            <tr>
              <th class="text-xs-left"
                v-for="header in props.headers"
                :key="header.text"
                :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                @click="changeSort(header.value)"
              >  
                {{ header.text }}
                <v-icon small>arrow_upward</v-icon>
              </th>
            </tr>
          </template>
          <template slot="items" slot-scope="props">
              <tr @click="onSelect(props.item)">
                <td class="text-xs-left">{{ props.item.firstName }}</td>
                <td class="text-xs-left">{{ props.item.middleName }}</td>
                <td class="text-xs-left">{{ props.item.lastName }}</td>
                <td class="text-xs-left">{{ props.item.hireDate | dateFormat }}</td>
                <td class="text-xs-left">{{ props.item.empId }}</td>
              </tr>
            </template>
          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-card>
    </v-flex>
    <v-flex lg4 md12 sm12>
      <employee-form :model="model" v-on:add="addModelToTable" v-on:update="updateModelInTable" v-on:delete="deleteModelFromTable"></employee-form>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import api from '@/shared/api.js';
import EmployeeForm from '../components/EmployeeForm.vue';
export default {
  filters: {
    dateFormat: value => {
      if (value) {
        let date = new Date(value);
        let options = {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
      } else {
        return '';
      }
    }
  },
  data() {
    return {
      search: '',
      loading: false,
      employees: [],
      errors: [],
      headers: [{
          text: 'First Name',
          value: 'firstName'
        },
        {
          text: 'Middle Name',
          value: 'middleName'
        }, //change value to call a function
        {
          text: 'Last Name',
          value: 'lastName'
        },
        {
          text: 'Hire Date',
          value: 'hireDate'
        },
        {
          text: 'Employee ID',
          value: 'empId'
        }
      ],
      pagination: {
        sortBy: 'lastName',
        rowsPerPage: 10
      },
      model: {
        id: '',
        firstName: '',
        middleName: '',
        lastName: '',
        empId: null,
        hireDate: null
      }
    };
  },
  components: {
    EmployeeForm
  },

  async created() {
    this.refreshEmployees();
  },
  methods: {
    async refreshEmployees() {
      this.loading = true;
      this.employees = await api.getItems(api.EMPLOYEES);
      this.loading = false;
    },
    onSelect(item) {
      this.model = {
        id: item.id,
        firstName: item.firstName,
        middleName: item.middleName,
        lastName: item.lastName,
        empId: item.empId,
        hireDate: item.hireDate
      };
    },
    clearModel() {
      this.model = {
        id: '',
        firstName: '',
        middleName: '',
        lastName: '',
        empId: null,
        hireDate: null
      };
    },
    updateModelInTable(updatedEmployee) {
      let matchingEmployeeIndex = _.findIndex(
        this.employees,
        employee => employee.id === updatedEmployee.id
      );
      this.employees.splice(matchingEmployeeIndex, 1, updatedEmployee);
    },
    addModelToTable(newEmployee) {
      let matchingEmployee = _.filter(
        this.employees,
        employee => employee.id === newEmployee.id
      );

      if (!matchingEmployee.length) {
        this.employees.push(newEmployee);
      }
    },
    deleteModelFromTable() {
      let modelIndex = _.findIndex(
        this.employees,
        employee => employee.id === this.model.id
      );
      this.employees.splice(modelIndex, 1);
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    }
  }
};
</script>
