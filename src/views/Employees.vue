<template>
<div>
  <v-layout row wrap>
    <v-flex lg8 md12 sm12>
      <v-card>
        <v-card-title>
          <h2>Expenses</h2>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="employees" :search="search" item-key="name" class="elevation-1">
          <template slot="items" slot-scope="props">
              <tr @click="onSelect(props.item)">
                <td class="text-xs-left">{{ props.item.firstName }}</td>
                <td class="text-xs-left">{{ props.item.middleName }}</td>
                <td class="text-xs-left">{{ props.item.lastName }}</td>
                <td class="text-xs-left">{{ props.item.hireDate }}</td>
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
      <employee-form :model="model" v-on:submit-form="refreshEmployees"></employee-form>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import api from '@/shared/api.js';
import EmployeeForm from '../components/EmployeeForm.vue';
export default {
  data() {
    return {
      search: '',
      loading: false,
      employees: [],
      errors: [],
      headers: [
        {
          text: 'First Name',
          value: 'firstName'
        },
        { text: 'Middle Name', value: 'middleName' }, //change value to call a function
        { text: 'Last Name', value: 'lastName' },
        { text: 'Hire Date', value: 'hireDate' },
        { text: 'Employee ID', value: 'empId' }
      ],
      model: {
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
    async deleteExpense(employee) {
      if (confirm('Are you sure you want to delete this employee?')) {
        if (this.model.id === employee.id) {
          this.model = {};
        }
        await api.deleteItem(api.EMPLOYEES, employee.id);
        await this.refreshEmployees();
      }
    },
    onSelect(item) {
      this.model.firstName = item.firstName;
      this.model.middleName = item.middleName;
      this.model.lastName = item.lastName;
      this.model.empId = item.empId;
      this.model.hireDate = item.hireDate;
    }
  }
};
</script>
